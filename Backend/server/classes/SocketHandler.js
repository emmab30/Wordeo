var app = require('../server');
var log = require('fancy-log');
var moment = require('moment');
var io = require('socket.io')
var BotUser = new require('./BotUser')
var _ = require('lodash');
var schedule = require('node-schedule');

const TIME_BEFORE_ROUND_STARTS  = 10 * 1000;
const INTERVAL_BOT_CHECKER_EMPTY_ROOMS  = 60 * 1000; //80 seconds
const INTERVAL_BOT_CREATION_ROOMS  = 10 * 1000;
const INTERVAL_CHANGE_STATUS_BOTS = 300 * 1000;

var SocketHandler = function(app, io){
    this.app = app;
    this.socket = null;
    this.io = io;
    //this.players = [];

    return this;
}

SocketHandler.prototype.onInitializedBootstrap = function() {
    //This function determines when bootstrap has been initialized

    log("Smart bot system initialized..");
    var dataSource = this.app.dataSources.mysql.connector;

    //Setting cronjob
    var job = schedule.scheduleJob('*/10 * * * *', () => {
        var query = "SELECT * FROM Room WHERE isActive = TRUE AND hasStarted = FALSE AND (name = 'Sala bonus' OR name = 'Sala libre') ORDER BY RAND() LIMIT 4";
        dataSource.query(query, (err, rooms) => {
            for(var idx in rooms) {
                BotUser.removeRandomRoom(this, rooms[idx].id);
            }
        });
    });

    //Set online the bots
    BotUser.setRandomStatuses(this);
    let intervalStatusBots = setInterval(() => {
        BotUser.setRandomStatuses(this)
    }, INTERVAL_CHANGE_STATUS_BOTS);

    let context = this;
    let interval = setInterval(() => {
        let query = "SELECT Room.*, COUNT(RoomUser.id) as users_connected FROM Room " +
            "LEFT JOIN RoomUser ON RoomUser.roomId = Room.id " +
            "LEFT JOIN Account ON Room.userId = Account.id " +
            "WHERE Room.isActive = TRUE AND Room.hasStarted = FALSE AND Room.isProtected = FALSE AND Account.isBot = false " +
            "AND Room.createdAt > (now() - INTERVAL 150 SECOND) " +
            "GROUP BY Room.id, Room.players " +
            "HAVING COUNT(RoomUser.id) < Room.players";

        dataSource.query(query, (err1, rooms) => {
            for(var idx in rooms) {
                const room = rooms[idx];
                context.getDetailsForRoom(room.id, (data) => {
                    if(data.accounts.length < room.players) {
                        BotUser.assignRandomBotToRoom(context, room.id, (success) => {
                            //Do nothing
                        });
                    }
                });
            }
        });
    }, INTERVAL_BOT_CHECKER_EMPTY_ROOMS);

    let intervalCreationRooms = setInterval(() => {
        this.app.models.Room.count({ isActive : true }, (err, activeRooms) => {
            if(activeRooms < 15) {
                BotUser.generateRandomRoom(context);
            }
        });
    }, INTERVAL_BOT_CREATION_ROOMS);
}

SocketHandler.prototype.onPlayerConnected = function(sId, account){
    log("Player connected [" + account.id + ", " + account.email + "]");
    this.app.models.Account.upsertWithWhere({id: account.id}, { isOnline: true, socketId: sId }, (err, result) => {
        if(this.io) {
            const sockets = this.io.sockets;
        }
    });
}

SocketHandler.prototype.onPlayerDisconnected = function(socket){
    this.app.models.Account.findOne({ where : { socketId : socket.id }}, (err, user) => {
        if(user) {
            log("Player disconnected [" + user.id + ", " + user.email + "]");
            //Check if the user is playing
            this.app.models.RoomUser.findOne({ where : { userId : user.id }}, (err, roomUser) => {
                if(!err && roomUser) {
                    this.onLeaveRoom({
                        roomId: roomUser.roomId,
                        userId: roomUser.userId
                    }, socket);
                }
            })
        } else {
            log("Player disconnected [Socket ID=" + socket.id + "]");
        }

        this.app.models.Account.upsertWithWhere({socketId: socket.id}, { isOnline: false }, (err, result) => {
            /* if(this.io) {
                const sockets = this.io.sockets;

                this.app.models.Account.count({ isOnline : true }, function(err, count) {
                    if(!err) {
                        sockets.to('General').emit('onStatisticsUsers', { online : count });
                    }
                });
            } */
        });
    });
}

SocketHandler.prototype.onRoomRemoved = function(roomId){
    this.app.models.Room.upsertWithWhere({ id : roomId}, { isActive : false });
    //this.app.models.RoomUser.destroyAll({roomId: roomId});

    this.io.sockets.to('General').emit('onRoomRemoved', { id : roomId });
}

/*
*   This will be triggered from Room after remote webhook.
*/
SocketHandler.prototype.onRoomCreated = function(room, isCreatedByBot = false){
    let context = this;
    const roomName = 'Room=' + room.id;

    this.app.models.Account.findOne({ include: 'profile', where : { id: room.userId }}, (err, user) => {
        var _fn = () => {
            context.app.models.RoomUser.create({
                roomId: room.id,
                userId: room.userId
            }, (error, bot) => {
                this.io.sockets.to('General').emit('onRoomCreated', room);
                if(!error) {
                    context.getDetailsForRoom(room.id, (data) => {
                        let promises = [];
                        for(var idx in data.accounts) {
                            let account = data.accounts[idx];
                            promises.push(new Promise((resolve, reject) => {
                                context.app.models.Character.getCharacterByUserId(account.id, (character) => {
                                    context.app.models.Account.getRankingByUserId(account.id, (rank) => {
                                        account.avatar = character;
                                        account.rank = rank;
                                        resolve(account);
                                    });
                                });
                            }));
                        }
                        Promise.all(promises).then((values) => {
                            setTimeout(() => {
                                context.io.sockets.to(roomName).emit('onRoomActivity', {
                                    accounts: values
                                });
                                context.onJoinedToRoom(room, room.userId, isCreatedByBot);
                            }, 2000);
                        });
                    });
                }
            });
        }
        if(isCreatedByBot) {
            _fn();
        } else {
            context.io.of('/').adapter.remoteJoin(user.socketId, roomName, (err) => {
                _fn();
            });
        }
    })
}

SocketHandler.prototype.onPlayerFinishedRound = function(data, socket){
    let context = this;
    const roomName = 'Room=' + data.roomId;

    this.app.models.Profile.findOne({ where : { accountId : data.userId }}, (err, profile) => {
        profile.totalGames += 1;
        profile.save();
    });

    this.app.models.RoomUser.upsertWithWhere({roomId: data.roomId, userId: data.userId}, { roomId: data.roomId, userId: data.userId, hasFinished: true }, (err, result) => {
        this.app.models.RoomUser.count({ roomId: data.roomId, hasFinished: 0 }, (err, count) => {
            if(count == 0) { //If there are no results, means that every player has finished
                context.io.sockets.to(roomName).emit('onFinishedRound', {
                    roundTerminatedWithSuccess: true
                });

                //Get the winner
                this.app.models.RoomUser.find({ order: 'points DESC', where : { roomId : data.roomId } }, (err, roomUser) => {
                    for(var idx in roomUser) {
                        this.app.models.Profile.findOne({ where : { accountId : roomUser.userId }}, (err, p) => {
                            if(idx == 0) {
                                p.totalWins += 1;
                                p.save();
                            } else {
                                p.totalLost += 1;
                                p.save();
                            }
                        });
                    }
                });

                //Disconnect all the sockets from this room since it's terminated.
                let sockets = context.io.sockets.adapter.rooms[roomName];
                if(sockets != null) {
                    sockets = sockets.sockets;
                    if(sockets != null) {
                        for(var socketId in sockets) {
                            var socket = context.io.sockets.connected[socketId];
                            socket.leave(roomName);
                        }
                    }
                }
            }
        })
    });
}

SocketHandler.prototype.onJoinedToRoom = function(room, userId, isBot = false) {
    let context = this;
    const roomName = 'Room=' + room.id;

    this.app.models.Account.findOne({ where : { id: userId }}, (err, user) => {

        var fn = () => {
            context.getDetailsForRoom(room.id, (data) => {
                let promises = [];
                for(var idx in data.accounts) {
                    let account = data.accounts[idx];
                    promises.push(new Promise((resolve, reject) => {
                        context.app.models.Character.getCharacterByUserId(account.id, (character) => {
                            context.app.models.Account.getRankingByUserId(account.id, (rank) => {
                                account.avatar = character;
                                account.rank = rank;
                                resolve(account);
                            });
                        });
                    }));
                }
                Promise.all(promises).then((values) => {
                    setTimeout(() => {
                        context.io.sockets.to(roomName).emit('onRoomActivity', {
                            accounts: values
                        });

                        if(room.players == data.accounts.length) {

                            //Check this room as started!

                            room.hasStarted = true;
                            room.isActive = true;
                            room.save();

                            context.io.sockets.to(roomName).emit('onStartRound');

                            //Start simulating stats for bots in that room only for bots there.
                            for(var idx in data.accounts) {
                                const account = data.accounts[idx];
                                if(account.isBot) {
                                    setTimeout(() => {
                                        log('Starting simulation of stats for bot ' + account.id + ' in room ' + roomName);
                                        BotUser.startSimulatingStats(context, room.id, account.id);
                                    }, TIME_BEFORE_ROUND_STARTS);
                                }
                            }
                        }
                    }, 2000);
                })
            });
        }

        if(isBot) {
            fn();
        } else {
            //log("Joining user " + userId + " to " + roomName, user);
            context.io.of('/').adapter.remoteJoin(user.socketId, roomName, (err) => {
                if(!err) {
                    fn();
                }
            });
        }
    });
}

SocketHandler.prototype.onSendRoundStats = function(roomId) {
    var roomName = 'Room=' + roomId;
    this.getDetailsForRoom(roomId, (data) => {
        this.io.sockets.to(roomName).emit('onRoundStats', data);
    });
}

SocketHandler.prototype.onLeaveRoom = function(data, socket) {
    let context = this;
    if(data.roomId) {
        socket.leave('Room=' + data.roomId);

        context.getDetailsForRoom(data.roomId, (roomData) => {

            //Check if there is any user who is not a real user (not a bot)
            if(roomData.accounts.length > 1 && _.some(roomData.accounts, { isBot: false })){

                //There are real users still in the room so don't stop the simulation of the bots (if there are)
                context.app.models.RoomUser.destroyAll({
                    userId: data.userId,
                    roomId: data.roomId
                }, function() {

                    //Check if there is any other user in the room
                    context.app.models.Room.findOne({ where : { id : data.roomId }}, function(err, room) {
                        if(room) {
                            if(data.userId == room.userId) {
                                context.io.sockets.to('Room=' + room.id).emit('onFinishedRound', {
                                    isOwnerDisconnected: true
                                }); //Finish round if the owner leaves it.
                                context.onRoomRemoved(room.id);
                            } else {
                                //Success
                                context.getDetailsForRoom(data.roomId, (details) => {
                                    context.io.sockets.to('Room=' + data.roomId).emit('onRoomActivity', details);
                                    if(details.accounts.length == 1) {
                                        context.io.sockets.to('Room=' + data.roomId).emit('onFinishedRound', {
                                            allUsersDisconnected: true
                                        });
                                        context.onRoomRemoved(room.id);
                                    }
                                });
                            }
                        }
                    });
                });
            } else {
                log("Someone left the room " + data.roomId + " but there are no more real users so this room will be closed.");

                //Delete the room, all the members from it and stop the simulation for user.
                let stoppedBots = BotUser.stopSimulatingStats(data.roomId);
                context.app.models.RoomUser.destroyAll({ id : data.roomId });
                context.app.models.Room.destroyAll({ id : data.roomId });
            }
        });
    }
}

/*
* Get socket instance by Player ID.
* Null means that there is no socket available for given user.
*/
SocketHandler.prototype.getSocketByPlayerId = function(playerId) {
    let socket = this.sockets.find((e) => { return e.playerId == playerId });
    return socket;
}

SocketHandler.prototype.getDetailsForRoom = function(roomId, callback) {
    let context = this;
    context.app.models.Room.findOne({ where : { id : roomId }}, function(err, room) {
        let userIds = [];
        //userIds.push(room.userId);
        context.app.models.RoomUser.find({ where : { roomId : roomId }}, function(err, roomUsers) {
            userIds = userIds.concat(roomUsers.map((e) => { return e.userId }));

            context.app.models.Account.find({ include: 'profile', where : { id : { inq: userIds }}}, function(err, accounts) {

                let acc = accounts;
                for(var idx in acc) {
                    acc[idx].stats = roomUsers.find((e) => { return e.userId == acc[idx].id });
                }

                //Send information about room activity (like new connections, or disconnections)
                callback({
                    accounts : acc
                });
            })
        })
    });
}

SocketHandler.prototype.getSocketForAccount = function(accountId) {
    context.app.models.Account.findOne( { where : { id: accountId }}, (err, result) => {
        if(!err && result) {
            var socket = context.io.sockets.connected[socketId];
            callback(socket);
        } else {
            callback(null);
        }
    });
}

module.exports = SocketHandler;
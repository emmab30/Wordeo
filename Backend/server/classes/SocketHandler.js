var app = require('../server');
var log = require('fancy-log');
var moment = require('moment');
var io = require('socket.io')
var BotUser = new require('./BotUser')
var vCompare = require('./VersionCompare')
var _ = require('lodash');
var schedule = require('node-schedule');

const TIME_BEFORE_ROUND_STARTS  = 10 * 1000;
const INTERVAL_BOT_CHECKER_EMPTY_ROOMS  = 80 * 1000;
const INTERVAL_BOT_CREATION_ROOMS  = 10 * 1000;
const INTERVAL_CHANGE_STATUS_BOTS = 300 * 1000;
const MESSAGE_ROOM_X5 = 'Hay una Sala Bonus x5 disponible. ¡Jugá ya antes que otro usuario la ocupe!';

var SocketHandler = function(app, io){
    this.app = app;
    this.socket = null;
    this.io = io;
    this.botUser = null;
    //this.players = [];

    return this;
}

SocketHandler.prototype.onInitializedBootstrap = function() {
    //This function determines when bootstrap has been initialized

    log("Smart bot system initialized..");

    var dataSource = this.app.dataSources.mysql.connector;

    var jobLifes = schedule.scheduleJob('*/1 * * * *', () => { //Every 40 minutes we reduce the life of the monster
        //Delete expired rooms and renegerate new ones

        var query = "UPDATE UserCharacter SET life = life - 1 WHERE life > 0";
        dataSource.query(query, (err, updated) => {
            var query2 = "SELECT Account.*, UserCharacter.life FROM UserCharacter " +
                "INNER JOIN Profile ON Profile.id = UserCharacter.profileId " +
                "INNER JOIN Account ON Account.id = Profile.accountId " +
                "WHERE UserCharacter.life <= 15 AND UserCharacter.life > 0 AND UserCharacter.isDead = FALSE";
            dataSource.query(query2, (err, aboutToExpire) => {
                if(aboutToExpire && aboutToExpire.length > 0) {
                    for(var idx in aboutToExpire) {
                        const account = aboutToExpire[idx];

                        if(account.notificationId != null) {
                            context.app.models.Notification.send({
                                userId: account.id,
                                title: '¡' + account.life + '% de vida.',
                                message: '¡Tu monstruo necesita comida! Tan solo tiene ' + account.life + '% de vida.',
                                category: 2,
                                options: {
                                    data: {
                                        email: account.email,
                                        date: new Date()
                                    }
                                }
                            }, (response) => {
                                //Do nothing
                            });
                        }
                    }
                }

                var query3 = "SELECT Account.*, UserCharacter.life, UserCharacter.id as monster_id FROM UserCharacter " +
                    "INNER JOIN Profile ON Profile.id = UserCharacter.profileId " +
                    "INNER JOIN Account ON Account.id = Profile.accountId " +
                    "WHERE UserCharacter.life = 0 AND UserCharacter.isDead = FALSE";
                dataSource.query(query3, (err, deads) => {
                    if(deads && deads.length > 0) {
                        for(var idx in deads) {
                            const account = deads[idx];

                            if(account.notificationId != null) {
                                context.app.models.Notification.send({
                                    userId: account.id,
                                    title: '¡' + account.life + '% de vida.',
                                    message: '¡Tu monstruo ha muerto, lo siento!',
                                    category: 2,
                                    options: {
                                        data: {
                                            email: account.email,
                                            date: new Date()
                                        }
                                    }
                                }, (response) => {
                                    //Do nothing
                                });
                            }

                            dataSource.query("DELETE FROM UserCharacter WHERE id = " + account.monster_id, (err, results) => {});
                        }
                    }
                });
            });
        });
    });

    //Setting cronjob
    BotUser.setRandomStatuses(this);
    var job = schedule.scheduleJob('*/10 * * * *', () => {
        //Delete expired rooms and renegerate new ones

        var query = "SELECT Room.* FROM Room " +
            "INNER JOIN Account ON Account.id = Room.userId " +
            "WHERE ((CONVERT_TZ(Room.createdAt, '+00:00', '-03:00') < (now() - INTERVAL 420 SECOND) AND Account.isBot = true) OR " +
            "(CONVERT_TZ(Room.createdAt, '+00:00', '-03:00') < (now() - INTERVAL 600 SECOND) AND Account.isBot = false AND Room.hasStarted = true)) " +
            "AND deletedAt IS NULL";
        dataSource.query(query, (err, rooms) => {
            for(var idx in rooms) {
                BotUser.removeRandomRoom(this, rooms[idx].id);
            }
        });

        //Set random statuses
        BotUser.setRandomStatuses(this);

        this.botUser = BotUser;
    });

    let context = this;
    let interval = setInterval(() => {
        let query = "SELECT Room.*, COUNT(RoomUser.id) as users_connected FROM Room " +
            "LEFT JOIN RoomUser ON RoomUser.roomId = Room.id " +
            "LEFT JOIN Account ON Room.userId = Account.id " +
            "WHERE Room.isActive = TRUE AND Room.hasStarted = FALSE AND Room.isProtected = FALSE AND Account.isBot = false " +
            "AND CONVERT_TZ(Room.createdAt, '+00:00', '-03:00') > (now() - INTERVAL 150 SECOND) AND deletedAt IS NULL " +
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
        this.app.models.Room.count({ isActive : true, deletedAt: null }, (err, activeRooms) => {
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
            this.app.models.RoomUser.updateAll({ userId : user.id }, { hasFinished : true });
            this.app.models.RoomUser.findOne({ order: 'id DESC', where : { userId : user.id }}, (err, roomUser) => {
                if(!err && roomUser) {
                    this.onLeaveRoom({
                        roomId: roomUser.roomId,
                        userId: roomUser.userId
                    }, socket);
                }
            })

            this.app.models.Account.upsertWithWhere({socketId: socket.id}, { isOnline: false });
        } else {
            //log("Player disconnected [Socket ID=" + socket.id + "]");
        }
    });
}

SocketHandler.prototype.onRoomRemoved = function(roomId){
    let current = new Date();
    this.app.models.Room.upsertWithWhere({ id : roomId}, { isActive : false, deletedAt: current });

    this.io.sockets.to('General').emit('onRoomsUpdated');
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
                this.io.sockets.to('General').emit('onRoomsUpdated');
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
                            context.io.sockets.to(roomName).emit('onRoomActivity', {
                                accounts: values
                            });
                            context.onJoinedToRoom(room, room.userId, isCreatedByBot);
                        });
                    });
                }
            });
        }

        if(isCreatedByBot) {

            //Check if it's multiplier x5, then send notifications to everyone
            if(room.multiplierExp == 5) {
                context.app.models.Account.find({ where : { isBot : false, notificationId: { neq : null } }}, (err, accounts) => {

                    //Check if date is recommended to send notifications
                    var currentTime= moment();
                    var startTime = moment('01:00 am', "HH:mm a");
                    var endTime = moment('09:00 am', "HH:mm a");
                    let isBetween = currentTime.isBetween(startTime, endTime);

                    if(!isBetween) {
                        for(var idx in accounts) {
                            const account = accounts[idx];
                            context.app.models.Notification.send({
                                userId: account.id,
                                templateId: 'a52156ac-cfa0-4ace-ae8a-27c6911712d8', //Located in onesignal
                                message: 'Hay una Sala Bonus x5 disponible. ¡Entra ahora antes que otro usuario la ocupe!',
                                category: 1,
                                options: {
                                    buttons: [
                                        {id: "Now", text: "¡Entrar ya!"},
                                        {id: "Delete", text: "Eliminar notificación"}
                                    ],
                                    data: {
                                        email: account.email,
                                        roomId: room.id,
                                        date: new Date()
                                    }
                                }
                            }, (response) => {
                                //Do nothing
                            });
                        }
                    }
                });
            }

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

    this.io.sockets.to('General').emit('onRoomsUpdated');
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

                            var simulateStats = true;
                            if(user && user.appVersion) {
                                let appVersionUser = user.appVersion;
                                let expectedVersion = '1.0.0.17';
                                let comparison = vCompare.compare(appVersionUser, expectedVersion);
                                if(comparison >= 0) {
                                    simulateStats = false;
                                }
                            }

                            if(simulateStats) {
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
                        }
                    }, 0);
                })
            });
        }

        if(isBot) {
            fn();
        } else {
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
                /* context.app.models.RoomUser.destroyAll({
                    userId: data.userId,
                    roomId: data.roomId
                }, function() {

                }); */

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
            } else {
                log("Someone " + data.userId + " left the room " + data.roomId + " but there are no more real users so this room will be closed.");

                //Delete the room, all the members from it and stop the simulation for user.
                context.app.models.Account.findOne({ where : { id : data.userId }}, (err, account) => {
                    if(account && !account.isOnline) {
                        let stoppedBots = BotUser.stopSimulatingStats(context, data.roomId);
                        context.app.models.Room.upsertWithWhere({ id : data.roomId }, { deletedAt : new Date() });
                    }
                });
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
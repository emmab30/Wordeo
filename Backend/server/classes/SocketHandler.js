var app = require('../server');
var log = require('fancy-log');
var moment = require('moment');
var io = require('socket.io')
var BotUser = new require('./BotUser')

const TIMEOUT_AFTER_PLAYER_DISCONNECTED  = 60; //In seconds
const TIMEOUT_INSERT_BOT_AFTER_ROOM_CREATION  = 20000; //In seconds

var SocketHandler = function(app, io){
    this.app = app;
    this.socket = null;
    this.io = io;
    //this.players = [];

    return this;
}

SocketHandler.prototype.onInitializedBootstrap = function() {
    //This function determines when bootstrap has been initialized

    log('Initializing bots system.');
    setTimeout(() => {
        BotUser.generateRoom(this);
    }, 5000);
    setInterval(() => {
        BotUser.generateRoom(this);
        log('Generating room from a Bot user type');
    }, 50000);
}

SocketHandler.prototype.onPlayerConnected = function(sId, account){
    this.app.models.Account.upsertWithWhere({id: account.id}, { isOnline: true, socketId: sId }, (err, result) => {
        if(this.io) {
            const sockets = this.io.sockets;

            this.app.models.Account.count({ isOnline : true }, function(err, count) {
                if(!err) {
                    sockets.to('General').emit('onStatisticsUsers', { online : count });
                }
            });
        }
    });
}

SocketHandler.prototype.onPlayerDisconnected = function(socket){
    this.app.models.Account.findOne({ where : { socketId : socket.id }}, (err, user) => {
        if(user) {
            //Check if the user is playing
            this.app.models.RoomUser.findOne({ where : { userId : user.id }}, (err, roomUser) => {
                if(!err && roomUser) {
                    log('The user will leave the room ' + roomUser.id);
                    this.onLeaveRoom({
                        roomId: roomUser.roomId,
                        userId: roomUser.userId
                    }, socket);
                } else {
                    log('The user is not playing in any room.');
                    this.app.models.Room.destroyAll({ userId : user.id });
                    this.app.models.RoomUser.destroyAll({ roomId: roomUser.roomId });
                }
            })
        }
        this.app.models.Account.upsertWithWhere({socketId: socket.id}, { isOnline: false, socketId: null }, (err, result) => {
            if(this.io) {
                const sockets = this.io.sockets;

                this.app.models.Account.count({ isOnline : true }, function(err, count) {
                    if(!err) {
                        sockets.to('General').emit('onStatisticsUsers', { online : count });
                    }
                });
            }
        });
    });
}

SocketHandler.prototype.onRoomRemoved = function(roomId){
    this.app.models.Room.destroyAll({roomId: roomId});
    this.app.models.RoomUser.destroyAll({roomId: roomId});

    this.io.sockets.to('General').emit('onRoomRemoved', { id : roomId });
}

/*
*   This will be triggered from Room after remote webhook.
*/
SocketHandler.prototype.onRoomCreated = function(room){
    let context = this;
    const roomName = 'Room=' + room.id;

    this.app.models.Account.findOne({ include: 'profile', where : { id: room.userId }}, (err, user) => {
        context.io.of('/').adapter.remoteJoin(user.socketId, roomName, (err) => {
            log(err);
            //We'll suppose that the user is connected to that room now.
            context.app.models.RoomUser.create({
                roomId: room.id,
                userId: room.userId
            }, (error, bot) => {
                this.io.sockets.to('General').emit('onRoomCreated', room);
                if(!error) {
                    context.getDetailsForRoom(room.id, (data) => {
                        setTimeout(() => {
                            context.io.sockets.to(roomName).emit('onRoomActivity', data);
                            context.onJoinedToRoom(room, room.userId);

                            if(room.userId > 1) {
                                setTimeout(() => {
                                    context.getDetailsForRoom(room.id, (data) => {
                                        if(data.accounts.length < room.players) {
                                            context.app.models.RoomUser.create({
                                                roomId: room.id,
                                                userId: 1
                                            }, (err, bot) => {
                                                context.onJoinedToRoom(room, 1, true);
                                            });
                                        }
                                    });
                                }, TIMEOUT_INSERT_BOT_AFTER_ROOM_CREATION);
                            }
                        }, 1000);
                    });
                }
            });
        });
    })
}

SocketHandler.prototype.onPlayerFinishedRound = function(data, socket){
    let context = this;
    const roomName = 'Room=' + data.roomId;

    this.app.models.RoomUser.upsertWithWhere({roomId: data.roomId, userId: data.userId}, { roomId: data.roomId, userId: data.userId, hasFinished: true }, (err, result) => {
        this.app.models.RoomUser.count({ roomId: data.roomId, hasFinished: 0 }, function(err, count){
            if(count == 0) { //If there are no results, means that every player has finished
                context.io.sockets.to(roomName).emit('onFinishedRound', {
                    roundTerminatedWithSuccess: true
                });

                //Disconnect all the sockets from this room since it's terminated.
                const sockets = context.io.sockets.adapter.rooms[roomName].sockets;
                for(var socketId in sockets) {
                    var socket = context.io.sockets.connected[socketId];
                    socket.leave(roomName);
                }
            }
        })
    });
}

SocketHandler.prototype.onJoinedToRoom = function(room, userId, isBot = false) {
    let context = this;
    const roomName = 'Room=' + room.id;

    this.app.models.Account.findOne({ where : { id: userId }}, function(err, user) {

        var fn = () => {
            context.getDetailsForRoom(room.id, (data) => {
                setTimeout(() => {
                    context.io.sockets.to(roomName).emit('onRoomActivity', data);

                    if(room.players == data.accounts.length) {
                        context.io.sockets.to(roomName).emit('onStartRound');
                    }
                }, 2000);
            });
        }

        if(isBot) {
            fn();
            BotUser.simulateStats(room.id, context);
        } else {
            context.io.of('/').adapter.remoteJoin(user.socketId, roomName, (err) => {
                //We'll suppose that the user is connected to that room now.
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
                            }
                        });
                    }
                }
            });
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
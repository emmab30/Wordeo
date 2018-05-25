'use strict';

const app = require('../../server/server');
const loopbackContext = require("loopback-context");
const log = require('fancy-log');
const _ = require('lodash')
var vCompare = require('../../server/classes/VersionCompare')

let COMMON_RATE_TULS = 17.5;

module.exports = function(Room) {

    Room.join = join;
    Room.invite = invite;
    Room.getRoomStats = getRoomStats;
    Room.getQuestionStats = getQuestionStats;
    Room.postStats = postStats;
    Room.getPeopleBy = getPeopleBy;

    function join(data, next) {

        let error = new Error();
        let ctx = loopbackContext.getCurrentContext();
        let accessToken = ctx && ctx.get('accessToken');

        //Check availability of room and check if the password is correct.
        app.models.Room.findById(data.roomId, function(err, room) {
            if(err) {
                error.status = 401;
                error.message = 'La sala ya ha empezado o ha expirado. ¡Intenta unirte a otra sala o prueba creando un juego nuevo!';
                error.code = 'INVALID_ROOM';
                next(error)
            } else {

                if(room == null || !room.isActive || room.hasStarted){
                    error.status = 401;
                    error.message = 'La sala ya ha empezado o ha expirado. ¡Intenta unirte a otra sala o prueba creando un juego nuevo!';
                    error.code = 'INVALID_ROOM';
                    next(error)
                } else {
                    let isRoomFull = (connectedUsersLength) => {
                        return room.players == connectedUsersLength;
                    }

                    //Check availability for room
                    app.models.RoomUser.count({ roomId : room.id }, function(err, count) {

                        //Check the players connected to this room.
                        if(room.isProtected && !data.isInvited) {
                            if(room.password != data.password) {
                                error.status = 401;
                                error.message = 'La contraseña es invalida.';
                                error.code = 'INVALID_ROOM_PASSWORD';
                                next(error);
                            } else {
                                if(isRoomFull(count)) {
                                    //Check if the room is available.
                                    error.status = 401;
                                    error.message = 'La sala ya está completa.';
                                    error.code = 'ROOM_COMPLETED';
                                    next(error);
                                } else {
                                    app.models.RoomUser.upsertWithWhere({ userId : accessToken.userId, roomId : room.id }, { userId : accessToken.userId, roomId : room.id });
                                    if(app.socketHandler != null) {
                                        app.socketHandler.onJoinedToRoom(room, accessToken.userId);
                                    }
                                    next();
                                }
                            }
                        } else if(isRoomFull(count)) {
                            //Check if the room is available.
                            error.status = 401;
                            error.message = 'La sala ya está completa.';
                            error.code = 'ROOM_COMPLETED';
                            next(error);
                        } else {
                            app.models.RoomUser.upsertWithWhere({ userId : accessToken.userId, roomId : room.id }, { userId : accessToken.userId, roomId : room.id });
                            if(app.socketHandler != null) {
                                setTimeout(() => {
                                    app.socketHandler.onJoinedToRoom(room, accessToken.userId);
                                }, 2000);
                                next(null, room);
                            }
                        }
                    });
                }
            }
        })
    }

    function invite(data, next) {

        let ctx = loopbackContext.getCurrentContext();
        let accessToken = ctx && ctx.get('accessToken');

        let error = new Error();
        error.status = 401;
        error.code = 'INVALID_INVITE_CRITERIA';

        //Check availability of room and check if the password is correct.
        app.models.Room.findById(data.roomId, function(err, room) {
            app.models.Profile.findOne({ where : { accountId : accessToken.userId }}, (err, sender) => {
                app.models.Account.findOne({ where : { or : [{ email: data.email }, { username: data.email }] }}, (err, account) => {
                    if(!account) {
                        error.message = '¡El usuario ' + data.email + ' aún no juega Wordeo! Compártele el link de la aplicación para poder jugar juntos.'
                        next(error);
                    } else {
                        if(account.isOnline) {
                            next(null, {
                                message: '¡Tu amigo se encuentra en linea jugando Wordeo! La invitación se ha enviado así que es probable que la acepte en un momento.'
                            });
                        } else {
                            next(null, {
                                message: '¡Tu amigo no se encuentra en linea! De todas maneras le hemos enviado una invitación para conectarse.'
                            });
                        }

                        app.models.Notification.send({
                            userId: account.id,
                            message: sender.name + " te desafía a una partida Wordeo. ¿Aceptas?",
                            category: 1,
                            options: {
                                buttons: [
                                    {id: "Now", text: "¡Jugar ahora!"},
                                    {id: "Delete", text: "Eliminar notificación"}
                                ],
                                data: {
                                    roomId: data.roomId,
                                    date: new Date()
                                }
                            }
                        }, (response) => {
                            //Do nothing
                        });
                    }
                });
            });
        })
    }

    function getRoomStats(roomId, next) {
        let ctx = loopbackContext.getCurrentContext();
        let accessToken = ctx && ctx.get('accessToken');

        app.models.RoomUser.find({ where: { roomId: roomId }}, (err, userRooms) => {
            let userIds = [];
            for(var idx in userRooms) {
                userIds.push(userRooms[idx].userId);
            }

            app.models.Account.find({ include: 'profile', where : { id : { inq: userIds }}}, function(err, accounts) {
                let objects = [];

                app.models.Configuration.findOne({ where : { name : 'TULS_RATE' }}, (err, value) => {
                    if(accounts && accounts.length > 0) {
                        for(var idx in accounts) {
                            objects[idx] = accounts[idx];

                            const userRoom = userRooms.find((e) => { return e.userId == accounts[idx].id });
                            objects[idx].stats = userRoom;
                            objects[idx].stats.tulsProfit = (userRoom.points * parseFloat(value.value)) / 100;
                        }

                        objects.sort((a, b) => {
                            return parseInt(b.stats.points) - parseInt(a.stats.points);
                        });
                        objects[0].isWinner = true;
                    }

                    next(null, objects);
                });
            });
        });
    }

    function getQuestionStats(roomId, next) {
        let ctx = loopbackContext.getCurrentContext();
        let accessToken = ctx && ctx.get('accessToken');

        var promises = [];
        app.models.RoomUserQuestion.find({ where : { roomId: roomId, userId : accessToken.userId }}, (err, replies) => {
            for(var idx in replies) {
                const reply = replies[idx];
                promises.push(new Promise((resolve, reject) => {
                    app.models.Question.findOne({ include: [
                        {
                            relation: "category",
                            "scope": {
                                "fields": {
                                    name: true
                                }
                            }
                        },
                        {
                            relation: "options",
                            "scope": {
                                fields: {
                                    isCorrect: true,
                                    name: true,
                                    id: true
                                }
                            }
                        }
                    ], where : { id : reply.questionId }}, (err, question) => {
                        question.selectedOption = reply.optionId;
                        resolve(question);
                    });
                }));
            }

            Promise.all(promises).then((values) => {
                next(null, values);
            });
        });
    }

    function postStats(data, next) {

        if(COMMON_RATE_TULS == 17.5) {
            app.models.Configuration.findOne({ where : { name : 'TULS_RATE' }}, (err, value) => {
                COMMON_RATE_TULS = value.value;
            });
        }

        let ctx = loopbackContext.getCurrentContext();
        let accessToken = ctx && ctx.get('accessToken');

        if(accessToken && accessToken.userId > -1) {
            app.models.Room.findOne({ where : { id : data.roomId }}, (err, room) => {
                app.models.RoomUser.findOne({ where: { roomId: data.roomId, userId: accessToken.userId }}, (err, userRoom) => {

                    //Save the reply on database
                    if(data.questionId && data.optionId){
                        app.models.RoomUserQuestion.create({
                            userId: accessToken.userId,
                            roomId: data.roomId,
                            questionId: data.questionId,
                            optionId: data.optionId
                        });
                    }

                    app.models.Account.findOne({ where : { id : accessToken.userId }}, (err, account) => {
                        app.models.Question.findOne({ where : { id : data.questionId }}, (err, question) => {
                            if(question) {
                                if(userRoom) {
                                    userRoom.totalQuestions += 1;
                                    if(data.isCorrect) {
                                        var sumExp = question.profitExp;
                                        var sumTuls = (question.profitExp * COMMON_RATE_TULS) / 100;

                                        //Streak correct answers
                                        if(data.isStreakReward) {
                                            sumExp += 100;
                                            sumTuls += COMMON_RATE_TULS;
                                        }

                                        //Only for updated applications

                                        if(room && room.multiplierExp > 1) {
                                            let appVersionUser = account.appVersion;
                                            let expectedVersion = '1.0.0.14';
                                            let comparison = vCompare.compare(appVersionUser, expectedVersion);
                                            if(comparison >= 0) {
                                                sumExp *= room.multiplierExp;
                                                sumTuls *= room.multiplierExp;
                                            }
                                        }

                                        app.models.Profile.findOne({ where : { accountId : accessToken.userId } }, (err, profile) => {

                                            if(profile) {
                                                profile.experience_points = profile.experience_points + sumExp;
                                                profile.balance_tuls = profile.balance_tuls sumTuls;

                                                profile.save();
                                            } else {
                                                console.log("Nada que hacer.");
                                            }
                                        });

                                        //Append the points to the user room
                                        userRoom.totalCorrect += 1;
                                        userRoom.points += sumExp;
                                        userRoom.save();
                                    } else {
                                        userRoom.totalIncorrect += 1;
                                        userRoom.save();
                                    }

                                    if(app.socketHandler != null) {
                                        app.socketHandler.onSendRoundStats(data.roomId);
                                    }

                                    next(null, userRoom);
                                }
                            }
                        });
                    });
                });
            });
        }
    }

    function getPeopleBy(data, next) {
        if(data.pattern != null) {
            var dataSource = app.dataSources.mysql.connector;
            var query = "SELECT Profile.*, Account.username, Account.isOnline, " +
                "(SELECT count(id) FROM Profile f WHERE f.experience_points > Profile.experience_points) + 1 as rank " +
                "FROM Profile " +
                "INNER JOIN Account ON Account.id = Profile.accountId " +
                "WHERE Account.isBot = FALSE AND (Account.username LIKE '%" + data.pattern + "%' " +
                "OR Account.email LIKE '%" + data.pattern + "%' " +
                "OR Profile.name LIKE '%" + data.pattern + "%' " +
                "OR Profile.lastName LIKE '%" + data.pattern + "%') " +
                "LIMIT 30";
            dataSource.query(query, (err1, users) => {
                next(null, users);
            });
        }
    }

    /* Remote hooks */
    Room.afterRemote('create', function(ctx, result, next) {
        if(app.socketHandler != null) {
            app.socketHandler.onRoomCreated(result);
        }

        if(result.challengeTo !== undefined) {
            app.models.Account.findOne({ where : { facebookId : result.challengeTo }}, (err, account) => {
                Room.invite({
                    roomId: result.id,
                    email: account.email
                }, (response) => {
                    //Do nothing
                });
            });
        }

        next();
    });

    Room.beforeRemote('create', function(context, result, next) {
        var ctx = loopbackContext.getCurrentContext();
        var accessToken = ctx && ctx.get('accessToken');
        if(accessToken != null && accessToken.userId > -1) {
            app.models.Profile.findOne({ where : { accountId : accessToken.userId }}, (err, profile) => {

                var roomCode = (profile.name.toUpperCase().substr(0, 4) + profile.lastName.toUpperCase().substr(0, 4) + _.random(0, 10000).toString());

                //Append owner ID to the room
                context.args.data.userId = accessToken.userId;
                //Append the code
                context.args.data.code = roomCode;
                next();
            });
        }
    });
};
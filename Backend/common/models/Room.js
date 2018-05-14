'use strict';

const app = require('../../server/server');
const loopbackContext = require("loopback-context");
const log = require('fancy-log');

const COMMON_RATE_TULS = 17.5;

module.exports = function(Room) {

    Room.join = join;
    Room.getRoomStats = getRoomStats;
    Room.getQuestionStats = getQuestionStats;
    Room.postStats = postStats;

    function join(data, next) {

        let error = new Error();
        let ctx = loopbackContext.getCurrentContext();
        let accessToken = ctx && ctx.get('accessToken');

        //Check availability of room and check if the password is correct.
        app.models.Room.findById(data.roomId, function(err, room) {
            if(err) {
                error.status = 401;
                error.message = 'La sala no está disponible.';
                error.code = 'INVALID_ROOM';
                next(error)
            } else {

                let isRoomFull = (connectedUsersLength) => {
                    return room.players == connectedUsersLength;
                }

                //Check availability for room
                app.models.RoomUser.count({ where : { roomId : room.id }}, function(err, count) {

                    //Check the players connected to this room.
                    if(room.isProtected) {
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
                    } else if(isRoomFull(count)) { //This is because there are already 1 user (the owner of the room)
                        //Check if the room is available.
                        error.status = 401;
                        error.message = 'La sala ya está completa.';
                        error.code = 'ROOM_COMPLETED';
                        next(error);
                    } else {
                        app.models.RoomUser.upsertWithWhere({ userId : accessToken.userId, roomId : room.id }, { userId : accessToken.userId, roomId : room.id });
                        if(app.socketHandler != null) {
                            log('Joining player to room');
                            app.socketHandler.onJoinedToRoom(room, accessToken.userId);
                        }
                        next();
                    }
                });
            }
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

                if(accounts && accounts.length > 0) {
                    for(var idx in accounts) {
                        objects[idx] = accounts[idx];
                        objects[idx].stats = userRooms.find((e) => { return e.userId == accounts[idx].id });
                    }

                    objects.sort((a, b) => {
                        return parseInt(b.stats.points) - parseInt(a.stats.points);
                    });
                    objects[0].isWinner = true;
                }

                next(null, objects);
            });
        });
    }

    function getQuestionStats(roomId, next) {
        let ctx = loopbackContext.getCurrentContext();
        let accessToken = ctx && ctx.get('accessToken');

        var promises = [];
        app.models.RoomUserQuestion.find({ where : { roomId: roomId, accountId : accessToken.userId }}, (err, replies) => {
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
        let ctx = loopbackContext.getCurrentContext();
        let accessToken = ctx && ctx.get('accessToken');

        if(accessToken && accessToken.userId > -1) {
            app.models.RoomUser.findOne({ where: { roomId: data.roomId, userId: accessToken.userId }}, (err, userRoom) => {

                //Save the reply on database
                if(data.questionId && data.optionId){
                    app.models.RoomUserQuestion.create({
                        accountId: accessToken.userId,
                        roomId: data.roomId,
                        questionId: data.questionId,
                        optionId: data.optionId
                    });
                }

                app.models.Question.findOne({ where : { id : data.questionId }}, (err, question) => {
                    if(question) {
                        if(userRoom) {
                            userRoom.totalQuestions += 1;
                            if(data.isCorrect) {
                                userRoom.totalCorrect += 1;
                                userRoom.points += question.profitExp;

                                app.models.Profile.findOne({ where : { accountId : accessToken.userId } }, (err, profile) => {
                                    profile.experience_points += question.profitExp;
                                    profile.balance_tuls += (question.profitExp * COMMON_RATE_TULS) / 100;

                                    //Streak correct answers
                                    if(data.isStreakReward) {
                                        profile.experience_points += 100;
                                        profile.balance_tuls += COMMON_RATE_TULS;
                                    }

                                    profile.save();
                                })
                            } else {
                                userRoom.totalIncorrect += 1;
                            }

                            userRoom.save();

                            if(app.socketHandler != null) {
                                app.socketHandler.onSendRoundStats(data.roomId);
                            }

                            next(null, userRoom);
                        }
                    }
                });
            });
        }
    }

    /* Remote hooks */
    Room.afterRemote('create', function(ctx, result, next) {
        if(app.socketHandler != null) {
            app.socketHandler.onRoomCreated(result);
        }
        next();
    });

    Room.beforeRemote('create', function(context, result, next) {
        var ctx = loopbackContext.getCurrentContext();
        var accessToken = ctx && ctx.get('accessToken');
        if(accessToken != null && accessToken.userId > -1) {
            //Append owner ID to the room
            context.args.data.userId = accessToken.userId;
            next();
        }
    });
};
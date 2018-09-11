'use strict';

const app = require('../../server/server');
const loopbackContext = require("loopback-context");
const log = require('fancy-log');
const _ = require('lodash')
var vCompare = require('../../server/classes/VersionCompare')
var BotUser = require('../../server/classes/BotUser');

let COMMON_RATE_TULS = 17.5;

module.exports = function(Room) {

    Room.finish = finish;
    Room.join = join;
    Room.pair = pair;
    Room.invite = invite;
    Room.getRooms = getRooms;
    Room.getRoomStats = getRoomStats;
    Room.getQuestionStats = getQuestionStats;
    Room.postStats = postStats;
    Room.getPeopleBy = getPeopleBy;

    function getRooms(data, next) {
        var filter = {
            where: {
                isActive: true,
                hasStarted: false
            },
            include: 'users'
        };
        Room.find(filter, (err, rooms) => {
            next(null, {
                success: true,
                data: rooms
            });
        });
    }

    function pair(data, next) {
        let error = new Error();
        let ctx = loopbackContext.getCurrentContext();
        let accessToken = ctx && ctx.get('accessToken');

        app.models.Account.findOne({ where : { id : accessToken.userId }}, (err, user) => {
            //Create the room
            app.models.Room.create({
                name: 'Generada por ' + user.id,
                multiplierExp: 1,
                code: null,
                userId: user.id,
                players: 2,
                isProtected: false,
                password: null,
                duration: 60,
                isActive: true,
                hasStarted: true
            }, (err, room) => {
                if(room != null) {
                    //Get random bot and assign it to the current room.
                    app.models.Account.find({ include: 'profile', where : { isBot : true }}, function(err, bot) {
                        console.log(bot);
                        if(bot != null) {
                            app.models.RoomUser.upsertWithWhere({ userId : accessToken.userId, roomId : room.id }, { userId : accessToken.userId, roomId : room.id }, (err, roomUser) => {
                                app.models.RoomUser.upsertWithWhere({ userId : bot.id, roomId : room.id }, { userId : bot.id, roomId : room.id }, (err, roomUserBot) => {
                                    console.log(err);
                                    if(app.socketHandler != null) {
                                        setTimeout(() => {
                                            app.socketHandler.onJoinedToRoom(room, bot.id, true);
                                            app.socketHandler.onJoinedToRoom(room, accessToken.userId);

                                            app.socketHandler.getDetailsForRoom(room.id, (data) => {
                                                next(null, {
                                                    room: room,
                                                    players: data,
                                                    startNow: false
                                                });
                                            });
                                        }, 2000);
                                    }
                                });
                            });
                        }
                    });
                }
            });
        });
    }

    function join(data, next) {

        let error = new Error();
        let ctx = loopbackContext.getCurrentContext();
        let accessToken = ctx && ctx.get('accessToken');

        //Check availability of room and check if the password is correct.
        app.models.Room.findById(parseInt(data.roomId), function(err, room) {
            if(err) {
                error.status = 401;
                error.message = 'La sala ha expirado u otro usuario la ha tomado. ¡Intenta unirte a otra sala o prueba creando un juego nuevo!';
                error.code = 'INVALID_ROOM';
                next(error)
            } else {

                if(room == null || !room.isActive || room.hasStarted){
                    error.status = 401;
                    error.message = 'La sala ha expirado u otro usuario la ha tomado. ¡Intenta unirte a otra sala o prueba creando un juego nuevo!';
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

                            if(process.env.GAME_VERSION) {

                                console.log(count);
                                console.log("asking for room " , room);
                                app.models.RoomUser.find({ where : { roomId : room.id }}, (err, roomUsers) => {
                                    console.log(roomUsers);
                                    let some = _.some(roomUsers, { userId : accessToken.userId });
                                    if(some) {
                                        //New version implementation
                                        app.socketHandler.getDetailsForRoom(room.id, (data) => {
                                            console.log(data);
                                            next(null, {
                                                room: room,
                                                players: data.accounts,
                                                startNow: true
                                            });
                                        });
                                    } else {
                                        //Check if the room is available.
                                        error.status = 401;
                                        error.message = 'La sala ya está completa.';
                                        error.code = 'ROOM_COMPLETED';
                                        next(error);
                                    }
                                });
                            } else {
                                //Check if the room is available.
                                error.status = 401;
                                error.message = 'La sala ya está completa.';
                                error.code = 'ROOM_COMPLETED';
                                next(error);
                            }
                        } else {
                            app.models.RoomUser.upsertWithWhere({ userId : accessToken.userId, roomId : room.id }, { userId : accessToken.userId, roomId : room.id });
                            if(app.socketHandler != null) {
                                setTimeout(() => {
                                    app.socketHandler.onJoinedToRoom(room, accessToken.userId);
                                }, 2000);

                                if(process.env.GAME_VERSION) {
                                    app.socketHandler.getDetailsForRoom(room.id, (data) => {
                                        next(null, {
                                            room: room,
                                            players: data,
                                            startNow: false
                                        });
                                    });
                                } else {
                                    next(null, room);
                                }
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

                app.models.RoomUser.find({
                    where: {
                        roomId: data.roomId
                    },
                    include: {
                        relation: 'user',
                        scope: {
                            where: {
                                isBot : true
                            }
                        }
                    }
                }, (err, accounts) => {

                    for(var idx in accounts) {
                        const account = accounts[idx];
                        const probabilityCorrectAnswer = _.random(0, 10) >= 5;

                        account.user.get().then((user) => {
                            if(user && user.isBot == true && probabilityCorrectAnswer) {
                                account.points += _.random(0, 50);
                                account.save();
                            }
                        });
                    }

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
                                            var sumExp = parseFloat(question.profitExp);
                                            var sumTuls = parseFloat(question.profitExp * COMMON_RATE_TULS) / 100;

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
                                                    sumExp = parseFloat(sumExp) * parseFloat(room.multiplierExp);
                                                    sumTuls = parseFloat(sumTuls) * parseFloat(room.multiplierExp);
                                                }
                                            }

                                            app.models.Profile.findOne({ where : { accountId : accessToken.userId } }, (err, profile) => {

                                                if(profile) {
                                                    profile.experience_points = parseFloat(profile.experience_points) + parseFloat(sumExp);
                                                    profile.balance_tuls = parseFloat(profile.balance_tuls) + parseFloat(sumTuls);

                                                    //Generate rewards based on the level from the user
                                                    if(profile.experience_points >= 35000 && profile.level == 1) {
                                                        app.models.Reward.create({
                                                            userId: profile.accountId,
                                                            title: '¡Pasaste a nivel 2!',
                                                            text: '¡Felicitaciones ' + profile.name + '! Tu premio por alcanzar el nivel 2 es de 1.500 tuls. El próximo cambio de nivel es a los 70.000 puntos de experiencia.. ¡Sigue así!',
                                                            profitTuls: 1500,
                                                            profitExp: 0,
                                                            wasNotified: false
                                                        });
                                                        profile.level = 2;
                                                        profile.balance_tuls = parseFloat(profile.balance_tuls) + 1500;
                                                    } else if(profile.experience_points >= 70000 && profile.level == 2) {
                                                        app.models.Reward.create({
                                                            userId: profile.accountId,
                                                            title: '¡Pasaste a nivel 3!',
                                                            text: '¡Felicitaciones ' + profile.name + '! Tu premio por alcanzar el nivel 3 es de 3.000 tuls. El próximo cambio de nivel es a los 120.000 puntos de experiencia.. ¡Sigue así!',
                                                            profitTuls: 3000,
                                                            profitExp: 0,
                                                            wasNotified: false
                                                        });
                                                        profile.level = 3;
                                                        profile.balance_tuls = parseFloat(profile.balance_tuls) + 3000;
                                                    } else if(profile.experience_points >= 120000 && profile.level == 3) {
                                                        app.models.Reward.create({
                                                            userId: profile.accountId,
                                                            title: '¡Pasaste a nivel 4!',
                                                            text: '¡Felicitaciones ' + profile.name + '! Tu premio por alcanzar el nivel 4 es de 4.500 tuls. El próximo cambio de nivel es a los 160.000 puntos de experiencia.. ¡Sigue así!',
                                                            profitTuls: 5000,
                                                            profitExp: 0,
                                                            wasNotified: false
                                                        });
                                                        profile.level = 4;
                                                        profile.balance_tuls = parseFloat(profile.balance_tuls) + 4500;
                                                    } else if(profile.experience_points >= 160000 && profile.level == 4) {
                                                        app.models.Reward.create({
                                                            userId: profile.accountId,
                                                            title: '¡Pasaste a nivel 5!',
                                                            text: '¡Felicitaciones ' + profile.name + '! Tu premio por alcanzar el nivel 5 es de 7.500 tuls. El próximo cambio de nivel es a los 220.000 puntos de experiencia.. ¡Sigue así!',
                                                            profitTuls: 7500,
                                                            profitExp: 0,
                                                            wasNotified: false
                                                        });
                                                        profile.level = 5;
                                                        profile.balance_tuls = parseFloat(profile.balance_tuls) + 7500;
                                                    } else if(profile.experience_points >= 220000 && profile.level == 5) {
                                                        app.models.Reward.create({
                                                            userId: profile.accountId,
                                                            title: '¡Pasaste a nivel 6!',
                                                            text: '¡Felicitaciones ' + profile.name + '! Tu premio por alcanzar el nivel 6 es de 10.000 tuls. El próximo cambio de nivel es a los 300.000 puntos de experiencia.. ¡Sigue así!',
                                                            profitTuls: 10000,
                                                            profitExp: 0,
                                                            wasNotified: false
                                                        });
                                                        profile.level = 6;
                                                        profile.balance_tuls = parseFloat(profile.balance_tuls) + 10000;
                                                    } else if(profile.experience_points >= 300000 && profile.level == 6) {
                                                        app.models.Reward.create({
                                                            userId: profile.accountId,
                                                            title: '¡Pasaste a nivel 7!',
                                                            text: '¡Felicitaciones ' + profile.name + '! Tu premio por alcanzar el nivel 7 es de 15.000 tuls. El próximo cambio de nivel es a los 450.000 puntos de experiencia.. ¡Sigue así!',
                                                            profitTuls: 15000,
                                                            profitExp: 0,
                                                            wasNotified: false
                                                        });
                                                        profile.level = 7;
                                                        profile.balance_tuls = parseFloat(profile.balance_tuls) + 15000;
                                                    } else if(profile.experience_points >= 450000 && profile.level == 7) {
                                                        app.models.Reward.create({
                                                            userId: profile.accountId,
                                                            title: '¡Pasaste a nivel 8!',
                                                            text: '¡Felicitaciones ' + profile.name + '! Tu premio por alcanzar el nivel 8 es de 25.000 tuls. El próximo cambio de nivel es a los 600.000 puntos de experiencia.. ¡Sigue así!',
                                                            profitTuls: 25000,
                                                            profitExp: 0,
                                                            wasNotified: false
                                                        });
                                                        profile.level = 8;
                                                        profile.balance_tuls = parseFloat(profile.balance_tuls) + 25000;
                                                    } else if(profile.experience_points >= 600000 && profile.level == 5) {
                                                        app.models.Reward.create({
                                                            userId: profile.accountId,
                                                            title: '¡Pasaste a nivel 9!',
                                                            text: '¡Felicitaciones ' + profile.name + '! Tu premio por alcanzar el nivel 9 es de 35.000 tuls. El próximo cambio de nivel es al millon de experiencia.. ¡Sigue así! El millón se festeja con un gran premio..',
                                                            profitTuls: 35000,
                                                            profitExp: 0,
                                                            wasNotified: false
                                                        });
                                                        profile.level = 6;
                                                        profile.balance_tuls = parseFloat(profile.balance_tuls) + 35000;
                                                    }

                                                    profile.save();
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

                                        /* if(app.socketHandler != null) {
                                            app.socketHandler.onSendRoundStats(data.roomId);
                                        } */

                                        userRoom.gainedTuls = sumTuls;
                                        next(null, userRoom);
                                    }
                                }
                            });
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

    function finish(data, next) {
        let ctx = loopbackContext.getCurrentContext();
        let accessToken = ctx && ctx.get('accessToken');

        if(accessToken && accessToken.userId > -1) {
            app.models.RoomUser.find({ include: 'user', where : { roomId: data.roomId, hasFinished : false }}, (err, users) => {
                if(!err) {
                    var totalTerminated = 0;

                    //Every player has finished (so the users length will be zero)
                    if(users.length == 0){
                        next(null, {
                            finished: true
                        })
                    } else {
                        for(var idx in users) {
                            const user = users[idx];
                            const userEntity = user.user.get().then((account) => {

                                var retVal = true;
                                if(account.isBot){
                                    user.hasFinished = true;
                                    user.save();
                                } else if(account.id == accessToken.userId) {
                                    user.hasFinished = true;
                                    user.save();
                                } else if(!account.isOnline) {
                                    user.hasFinished = true;
                                    user.save();
                                } else {
                                    retVal = false;
                                }

                                return retVal;
                            }).then((value) => {
                                if(value) {
                                    totalTerminated++;
                                    if(totalTerminated == users.length) {
                                        next(null, {
                                            finished: true
                                        })
                                    }
                                }
                            });
                        }
                    }
                } else {
                    next(null, {
                        code: 0,
                        message: 'Ha surgido un error finalizando la ronda. De todas maneras no te preocupes: ¡los tuls que haz ganado no se perderán!'
                    });
                }
            });
        }
    }

    /* Remote hooks */
    Room.afterRemote('create', function(ctx, result, next) {

        /* if(result.challengeTo !== undefined) {
            app.models.Account.findOne({ where : { id : result.challengeTo }}, (err, account) => {
                Room.invite({
                    roomId: result.id,
                    email: account.email
                }, (response) => {
                    //Do nothing
                });
            });
        } else {
            if(app.socketHandler != null) {
                app.socketHandler.onRoomCreated(result, false); //Created by an user
            }
        } */

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
var app = require('../server');
var log = require('fancy-log');
var moment = require('moment');
var io = require('socket.io')
var persistedBots = [];
var persistedRooms = [];
var botsOnline = 0;

function BotUser() {}

BotUser.setRandomStatuses = (socketHandler) => {
    console.log("Setting random statuses for bots.");
    botsOnline = false;
    socketHandler.app.models.Account.find({ where : { isBot : true }}, (err, bots) => {
        for(var idx in bots) {
            const bot = bots[idx];
            const randomBoolean = Math.random() >= 0.5;
            if(randomBoolean) {
                bot.isOnline = true;
                botsOnline += 1;
                bot.save();
            } else {
                bot.isOnline = false;
                bot.save();
            }
        }
    });
}

BotUser.generateRandomRoom = (socketHandler) => {

    let query = "SELECT * FROM Account WHERE isBot = true ORDER BY RAND() LIMIT 1";

    //const players = [2,3,4,5,6];
    const players = [2];
    const durations = [60];
    //const durations = [60, 90, 120, 160];

    var dataSource = socketHandler.app.dataSources.mysql.connector;
    dataSource.query(query, (err1, bots) => {
        if(bots) {
            let bot = bots[0];
            const room = {
                name: 'Sala libre',
                userId: bot.id,
                players: players[Math.floor(Math.random()*players.length)],
                duration: durations[Math.floor(Math.random()*durations.length)],
                isActive: true,
                isCreatedByBot: true
            };

            socketHandler.app.models.Room.create(room, (err, createdRoom) => {
                if(!err) {
                    persistedRooms.push(room);
                    persistedBots.push({
                        roomId: createdRoom.id,
                        accountId: bot.id
                    });

                    socketHandler.onRoomCreated(createdRoom, true);
                }
            });
        }
    });
}

BotUser.assignRandomBotToRoom = (socketHandler, roomId, success, error) => {

    //Get random bot
    var dataSource = socketHandler.app.dataSources.mysql.connector;
    let query = "SELECT * FROM Account WHERE isBot = true ORDER BY RAND() LIMIT 1";
    dataSource.query(query, (err1, bots) => {
        if(bots) {
            let bot = bots[0];
            socketHandler.app.models.Room.findOne({ where : { id : roomId }}, (err1, room) => {
                if(!err1 && room) {
                    socketHandler.app.models.RoomUser.create({
                        roomId: roomId,
                        userId: bot.id
                    }, (err, userRoomBot) => {
                        success();
                        persistedBots.push({
                            roomId: roomId,
                            accountId: bot.id
                        });
                        socketHandler.onJoinedToRoom(room, bot.id, true);
                    });
                }
            })
        }
    });
}

BotUser.simulateStats = (socketHandler, roomId, botId) => {
    let POINTS_SUM = 0;
    let TOTAL_QUESTIONS = 0;
    let TOTAL_CORRECT = 0;
    let TOTAL_INCORRECT = 0;

    socketHandler.app.models.Room.findOne({ where : { id : roomId }}, (err, room) => {

        let RANDOM_TIME_RESPONSE = getRandomInt(7, 12);
        let fn = () => {
            RANDOM_TIME_RESPONSE = getRandomInt(7, 12);

            TOTAL_QUESTIONS += 1;

            if(Math.random() <= 0.6) { //60% of chance that the bot will lost
                TOTAL_INCORRECT += 1;
            } else {
                TOTAL_CORRECT += 1;

                const RANDOM_POINTS_GAINED = getRandomInt(10, 70);
                POINTS_SUM += RANDOM_POINTS_GAINED;
                socketHandler.app.models.RoomUser.upsertWithWhere({ roomId: room.id, userId: botId }, {
                    points: POINTS_SUM,
                    roomId: room.id,
                    userId: botId,
                    totalQuestions: TOTAL_QUESTIONS,
                    totalCorrect: TOTAL_CORRECT,
                    totalIncorrect: TOTAL_INCORRECT
                });
            }

            socketHandler.getDetailsForRoom(room.id, (details) => {
                socketHandler.io.sockets.to('Room=' + room.id).emit('onRoundStats', details);
            });

            socketHandler.app.models.RoomUser.count({ roomId: roomId, hasFinished: true }, (err, count) => {
                if(count > 0) {

                    //Finish automatically this bot.
                    let botObject = getBotFromRoom(roomId, botId);
                    if(botObject) {
                        clearInterval(botObject.interval);

                        const idxCurrentBot = persistedBots.indexOf(botObject);
                        if(idxCurrentBot > -1) {
                            persistedBots.splice(persistedBots.indexOf(botObject), 1);

                            socketHandler.app.models.RoomUser.upsertWithWhere({ userId : botId, roomId: roomId }, {
                                userId: botId,
                                roomId: roomId,
                                hasFinished: true
                            });

                            socketHandler.app.models.Profile.findOne({ where : { accountId : botId }}, (err, p) => {
                                p.totalGames += 1;
                                p.save();
                            });
                        }
                    }

                    //Get the winner
                    socketHandler.app.models.RoomUser.findOne({ order: 'points DESC', where : { roomId : room.id } }, (err, roomUser) => {
                        socketHandler.app.models.Profile.findOne({ where : { accountId : roomUser.userId }}, (err, p) => {
                            p.totalWins += 1;
                            p.save();
                        });
                    });

                    //Count + 1 because the player already finished
                    if(count == (room.players - 1)) {
                        socketHandler.io.sockets.to('Room=' + room.id).emit('onFinishedRound', {
                            roundTerminatedWithSuccess: true
                        });
                    }
                }
            });
        };

        fn();

        let botObject = getBotFromRoom(roomId, botId);
        if(botObject) {
            botObject.interval = setInterval(() => {
                fn();
            }, RANDOM_TIME_RESPONSE * 1000);
        }
    })
}

function getBotFromRoom(roomId, botId) {
    let botObject = persistedBots.find((e) => {
        return e.roomId == roomId && e.accountId == botId
    });

    return botObject;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = BotUser;
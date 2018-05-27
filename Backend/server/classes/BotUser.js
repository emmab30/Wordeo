var app = require('../server');
var log = require('fancy-log');
var moment = require('moment');
var io = require('socket.io')
var log = require('fancy-log');
var _ = require('lodash');

//On execution parameters
var persistedBots = [];
var persistedRooms = [];
var botsOnline = 0;

function BotUser() {}

BotUser.setRandomStatuses = (socketHandler) => {
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

BotUser.removeRandomRoom = (socketHandler, id) => {
    //socketHandler.app.models.Room.destroyById(id);
    socketHandler.app.models.Room.upsertWithWhere({ id: id }, { isDeleted : true });
    var room = _.find(persistedRooms, { id : id });
    if(room) {
        persistedRooms.splice(persistedRooms.indexOf(room), 1);
    }
};

BotUser.generateRandomRoom = (socketHandler) => {

    let query = "SELECT * FROM Account WHERE isBot = true ORDER BY RAND() LIMIT 1";

    const players = [2];
    const durations = [60];

    var dataSource = socketHandler.app.dataSources.mysql.connector;
    dataSource.query(query, (err1, bots) => {
        if(bots) {
            let bot = bots[0];

            socketHandler.app.models.Room.find({}, (err, rooms) => {

                //Percentages for multiplier exp rooms
                let multiplierExp = 1;
                if(!_.some(rooms, _.conforms({ 'multiplierExp' : (e) => { return e > 1 } }))) {
                    let randomNumber = _.random(0, 100);
                    if(randomNumber <= 3) { //3% of creating rooms x5
                        multiplierExp = 5;
                    } else if(randomNumber <= 10) { //10% of creating rooms x4
                        multiplierExp = 4;
                    } else if(randomNumber <= 20) { //20% of creating rooms x3
                        multiplierExp = 3;
                    } else if(randomNumber <= 80) { //80% of creating rooms x2
                        multiplierExp = 2;
                    }
                }
                const room = {
                    name: (multiplierExp > 1 ? 'Sala bonus' : 'Sala libre'),
                    userId: bot.id,
                    players: players[Math.floor(Math.random()*players.length)],
                    duration: (multiplierExp > 1) ? 45 : durations[Math.floor(Math.random()*durations.length)],
                    isActive: true,
                    isCreatedByBot: true,
                    multiplierExp: multiplierExp
                };

                socketHandler.app.models.Room.create(room, (err, createdRoom) => {
                    if(!err) {
                        room.id = createdRoom.id;
                        persistedRooms.push(room);
                        persistedBots.push({
                            roomId: createdRoom.id,
                            accountId: bot.id,
                            multiplierExp: createdRoom.multiplierExp
                        });

                        socketHandler.onRoomCreated(createdRoom, true);
                    }
                });

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

BotUser.startSimulatingStats = (socketHandler, roomId, botId, callback) => {
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
                if(!_.some(details.accounts, { isBot: false })){
                    console.log("The user disconnected but we'll retry before stopping the simulation for bot.");
                    setTimeout(() => {
                        socketHandler.getDetailsForRoom(room.id, (detailsRetry) => {
                            if(!_.some(detailsRetry.accounts, { isBot: false })){
                                console.log("The user keeps being disconnected. This sucks.");
                                BotUser.stopSimulatingStats(socketHandler, room.id);
                            }
                        });
                    }, 15000);
                }
                socketHandler.io.sockets.to('Room=' + room.id).emit('onRoundStats', details);
            });

            socketHandler.app.models.RoomUser.count({ roomId: roomId, hasFinished: true }, (err, count) => {
                if(count > 0) {

                    //Finish automatically this bot.
                    let botObject = getBotFromRoom(roomId, botId);
                    if(botObject) {
                        log('The simulating stats has finished for bot ' + botId + ' in room ' + roomId);
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
                    } else {
                        log('The bot cannot be find in the persisted bots');
                        log(persistedBots);
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
                log("Number of current persisted bots: " + persistedBots.length);
                log("Number of current persisted bots simulating stats: " + _.sumBy(persistedBots, (e) => { return (e.interval !== undefined) ? 1 : 0 }));
                fn();
            }, RANDOM_TIME_RESPONSE * 1000);
        } else {
            log("The bot object cannot be find");
            log(persistedBots);
        }
    })
}

BotUser.stopSimulatingStats = function(roomId) {
    let stoppedBots = [];

    let bots = _.filter(persistedBots, (e) => { return e.roomId == roomId });
    let rooms = _.filter(persistedRooms, (e) => { return e.id == roomId });
    if(bots != null && bots.length > 0) {
        for(var idx in bots) {
            const bot = bots[idx];
            if(bot) {
                log("Cleared interval of simulation for stats, for bot " + bot.accountId + " in Room=" + roomId);

                clearInterval(bot.interval);
                stoppedBots.push(bot);
                persistedBots.splice(persistedBots.indexOf(bot), 1);
            }
        }
    }

    return stoppedBots;
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
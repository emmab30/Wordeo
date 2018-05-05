var app = require('../server');
var log = require('fancy-log');
var moment = require('moment');
var io = require('socket.io')
var bots = [];

function BotUser() {}

BotUser.generateRoom = (socketHandler) => {
    let room = {
        name: 'Entra aqui ' + bots.length,
        userId: 1,
        players: 2,
        isProtected: false,
        duration: 30,
        isActive: true
    };
    socketHandler.app.models.Room.create(room, (err, createdRoom) => {
        socketHandler.app.models.RoomUser.create({ userId: 1, roomId: createdRoom.id }, (err, createdRoomUser) => {
            if(!err) {
                socketHandler.onRoomCreated(createdRoom);
                bots.push(createdRoom);
            }
        });
    });
}

BotUser.simulateStats = (roomId, socketHandler) => {
    let POINTS_SUM = 0;
    let TOTAL_QUESTIONS = 0;
    let TOTAL_CORRECT = 0;
    let TOTAL_INCORRECT = 0;

    socketHandler.app.models.Room.findOne({ where : { id : roomId }}, (err, room) => {

        let RANDOM_TIME_RESPONSE = getRandomInt(5, 15);
        let fn = () => {
            RANDOM_TIME_RESPONSE = getRandomInt(5, 15);

            TOTAL_QUESTIONS += 1;

            if(Math.random() <= 0.5) {
                TOTAL_INCORRECT += 1;
            } else {
                TOTAL_CORRECT += 1;

                const RANDOM_POINTS_GAINED = getRandomInt(10, 100);
                POINTS_SUM += RANDOM_POINTS_GAINED;
                socketHandler.app.models.RoomUser.upsertWithWhere({ roomId: room.id, userId: 1 }, {
                    points: POINTS_SUM,
                    roomId: room.id,
                    userId: 1,
                    totalQuestions: TOTAL_QUESTIONS,
                    totalCorrect: TOTAL_CORRECT,
                    totalIncorrect: TOTAL_INCORRECT
                });
            }

            socketHandler.getDetailsForRoom(room.id, (details) => {
                socketHandler.io.sockets.to('Room=' + room.id).emit('onRoundStats', details);
            });

            socketHandler.app.models.RoomUser.count({ roomId: roomId, hasFinished: true }, (err, count) => {
                if(count == (room.players - 1)) {
                    socketHandler.io.sockets.to('Room=' + room.id).emit('onFinishedRound', {
                        roundTerminatedWithSuccess: true
                    });
                }
            });
        };

        fn();
        let interval = setInterval(() => {
            fn();
        }, RANDOM_TIME_RESPONSE * 1000);
    })
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

module.exports = BotUser;
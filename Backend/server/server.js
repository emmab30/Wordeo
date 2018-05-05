'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var SocketHandler = require('./classes/SocketHandler');
var log = require('fancy-log');

var app = module.exports = loopback();

app.start = function() {
    // start the web server
    return app.listen(function() {
        app.emit('started');
        var baseUrl = app.get('url').replace(/\/$/, '');
        if (process.env.pm_id == undefined || process.env.pm_id == 0) {
            console.log('Web server listening at: %s', baseUrl);
            if (app.get('loopback-component-explorer')) {
                var explorerPath = app.get('loopback-component-explorer').mountPath;
                console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
                console.log('Environment: ' + process.env.NODE_ENV);
            }
        }
    });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
    if (err) throw err;

    // start the server if `$ node server.js`
    if (require.main === module){
        //app.start();
        app.io = require('socket.io')(app.start());//(app.start());

        /** Use redis **/
        const redis = require('socket.io-redis');
        app.io.adapter(redis({
            host: 'localhost',
            port: 6379,
            requestsTimeout: 30000
        }));

        //This is to make sure that we only have one instance for socket handler
        SocketHandler = new SocketHandler(app, app.io);
        app.socketHandler = SocketHandler;

        if (process.env.pm_id == undefined || process.env.pm_id == 0) {
            log('Initialized socket.io');
            log('Initialized redis on port 6379');
            log('Initializing socket handler');
            app.socketHandler.onInitializedBootstrap();

        }

        // etc.
        require('socketio-auth')(app.io, {
            authenticate: function (socket, value, callback) {

                var AccessToken = app.models.AccessToken;
                var Account = app.models.Account;
                var currentUser = null;

                var token = AccessToken.find({
                    where:{
                        and: [{ userId: value.userId }, { id: value.id }]
                    }
                })
                .then(function(tokenDetail){
                    if(tokenDetail.length){
                        return Account.findById(tokenDetail[0].userId);
                    } else {
                        callback(null, false);
                    }
                })
                .then(function(user){
                    currentUser = user;
                    if(user !== undefined) {
                        var filterRoleMapping = {
                            where: {
                                principalId: user.id
                            },
                            include: 'role'
                        }
                        return Account.app.models.RoleMapping.find(filterRoleMapping);
                    }
                    else {
                        callback(null, false);
                    }
                })
                .then(function(role){
                    if(role !== undefined && role[0].role !== undefined) {
                        var r = role[0].toJSON();
                        if(r.role.name === 'Player') {
                            socket.join('General');
                            //Set the last instance from the socket
                            SocketHandler.onPlayerConnected(socket.id, currentUser);
                            return callback(null, true);
                        } else {
                            return callback(null, false);
                        }
                    } else {
                        return callback(null, false);
                    }
                })
                .catch(function(err){
                    throw err;
                });
            },
            postAuthenticate: postAuthenticate,
            timeout: 'none'
        });

        function postAuthenticate(socket, data){
            socket.on('disconnect', function(){
                SocketHandler.onPlayerDisconnected(socket);
            });

            socket.on('onLeaveRoom', function(info) {
                if(info.roomId) {
                    info.userId = data.userId;
                    SocketHandler.onLeaveRoom(info, socket);
                }
            });

            socket.on('onPlayerFinishedRound', function(info) {
                if(info.roomId) {
                    info.userId = data.userId;
                    SocketHandler.onPlayerFinishedRound(info, socket);
                }
            });

            socket.on('requestJoinToRoom', function(info){
                if(info.roomId) {
                    socket.join('Room=' + info.roomId);
                    log('User joined to Room=' + info.roomId);
                }
            });

            socket.on('message', function(data){

                /*log("[debug] new incoming message on cluster ID " + process.env.pm_id);

                var message = {
                    userId: data.userId,
                    roomId: data.roomId,
                    message: data.message,
                    image: data.image,
                    doc: data.doc,
                    voice: data.voice,
                    gif: data.gif,
                    seen: (data.seen || false),
                    video: (data.video || false),
                    error: false,
                    retries: 0,
                    activityId: (data.activityId != null ? data.activityId : null),
                    internalId: (data.internalId != null ? data.internalId : null),
                    isReplyCorrect: (data.isReplyCorrect || false),
                    isReplyIncorrect: (data.isReplyIncorrect || false),
                    isHidden: (data.isHidden || false),
                    topicName: (data.topicName ? data.topicName : null),
                    isInternalMessage: (data.isInternalMessage || false)
                };

                if(data.payload != null) {
                    message.payload = data.payload;
                }

                ISocket.onNewStudentMessage(message, function(){
                    //Success callback
                }, function(error, entity, user){
                    //Error callback (communication with botmaker)
                    log.error("Failed sending message from " + message.userId + " [roomId: " + data.roomId + "] " + ". Details: " + error.message);
                    socket.emit('message-sending-error', entity);
                });*/
                log('New message');
            });
        }
    }
});

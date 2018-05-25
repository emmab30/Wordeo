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
            log('Wordeo server listening at: %s', baseUrl);
            if (app.get('loopback-component-explorer')) {
                var explorerPath = app.get('loopback-component-explorer').mountPath;
                log('Browse your REST API at %s%s', baseUrl, explorerPath);
                if(process.env.NODE_ENV == undefined) {
                    process.env.NODE_ENV = 'development';
                }
                log('Environment: ' + process.env.NODE_ENV);
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

            socket.on('onSendRoomEmoticon', function(info) {
                if(info.roomId && info.emoticonKey) {
                    console.log("Received emoticon");
                    app.io.sockets.to('Room=' + info.roomId).emit('onReceivedEmoticon', {
                        emoticonKey: info.emoticonKey,
                        roomId: info.roomId
                    });
                }
            });

            socket.on('onPlayerFinishedRound', function(info) {
                if(info.roomId) {
                    info.userId = data.userId;
                    SocketHandler.onPlayerFinishedRound(info, socket);
                }
            });

            socket.on('message', function(data){
                log('New message');
            });
        }
    }
});

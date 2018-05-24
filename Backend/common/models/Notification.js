'use strict';

var loopback = require('loopback');
var request = require('request');
var app = require('../../server/server');
const loopbackContext = require("loopback-context");

module.exports = function(Notification) {

    //Header for OneSignal requests, always including the authorization token (obtained through OneSignal website)
    var appId = "326392db-dd25-431b-9e26-8892f287a31a";
    var headersOS = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic MzczMWE0ZDUtOTBhMi00NDZjLTkxMWYtZDRiYTYzZTE5MjU5"
    };

    Notification.deleteNotification = deleteNotification;
    Notification.me = me;
    Notification.send = send;
    Notification.cancel = cancel;
    Notification.updateTagsDevice = updateTagsDevice;

    function me(next) {
        var ctx = loopbackContext.getCurrentContext();
        var accessToken = ctx && ctx.get('accessToken');
        var userId = accessToken.userId;

        app.models.Notification.find({ where : { userId : userId }, order: 'createdAt DESC' }, (err, notifications) => {
            next(null, notifications);
        })
    }

    function deleteNotification(data, next) {
        var ctx = loopbackContext.getCurrentContext();
        var accessToken = ctx && ctx.get('accessToken');
        var userId = accessToken.userId;

        var filter = {
            where : {
                id: data.notificationId
            }
        };
        app.models.Notification.findOne(filter, (err, notification) => {
            if(notification) {
                if(notification.userId == userId) {
                    app.models.Notification.destroyAll({ id : data.notificationId })
                }
            }

            next();
        })
    }

    function send(data, next) {
        if(data && data.userId != undefined) {
            var filter = {
                where: {
                    id: data.userId
                }
            };
            app.models.Account.findOne(filter, (err, user) => {
                var retValue = {
                    code: 400,
                    message: "The user doesn't have any associated device."
                };

                if(user !== null &&
                    user.notificationId !== undefined &&
                    user.notificationId !== null) {
                    var bodyRequest = Object.assign(data.options || {}, {
                        app_id: appId,
                        include_player_ids: [user.notificationId],
                        android_accent_color: '#222222', //Blue color
                        large_icon: 'https://s3-sa-east-1.amazonaws.com/wordeo/common/logo.png',
                        ttl: 30,
                        //android_sound: 'push_nsound',
                        contents: {
                            en: data.message
                        }
                    });

                    if(data.scheduled_at != undefined && data.scheduled_at != null) {
                        body.send_after = data.scheduled_at;
                    }

                    request.post({
                        url: 'https://onesignal.com/api/v1/notifications',
                        method: 'POST',
                        headers: headersOS,
                        body: JSON.stringify(bodyRequest),
                        timeout: 5000
                    }, function(err, response) {
                        if(response != undefined) {
                            let body = JSON.parse(response.body);
                            if(body !== undefined &&
                                body.id !== undefined) {

                                if(next !== undefined) {
                                    retValue = {
                                        code: 200,
                                        message: 'The push notification has been sent succesfully.'
                                    };

                                    next(err, retValue);
                                }
                            } else {
                                if(next !== undefined) {
                                    retValue = {
                                        code: 400,
                                        message: 'The push notification cannot be sent at this moment.'
                                    };
                                    next(err, retValue);
                                }
                            }
                        } else {
                            console.log("Creating notification unless OneSignal cannot be sent.");
                            let obj = {
                                userId: user.id,
                                category: data.category,
                                message: data.message,
                                osPlayerId: (body.id === undefined || body.id === '') ? 'noPlayerId' : body.id,
                                payload: JSON.stringify(bodyRequest)
                            };
                            app.models.Notification.create(obj, (success, err) => {
                                //console.log(success, err);
                            });
                        }
                    });

                } else {
                    console.log("Creating notification unless OneSignal cannot be sent.");
                    let obj = {
                        userId: user.id,
                        category: data.category,
                        message: data.message,
                        osPlayerId: 'noPlayerId',
                        payload: JSON.stringify(bodyRequest)
                    };
                    app.models.Notification.create(obj, (success, err) => {
                        //console.log(success, err);
                    });

                    if(next !== undefined) {
                        next(null, retValue);
                    }
                }
            });
        } else {
            next();
        }
	}

    function cancel(data, options, next) {
        var filter = {
            where: {
                id: data.id
            }
        };
        app.models.Notification.findOne(filter, function(err, notification) {
            var retValue = {
                code: 400,
                message: "The notification does not exist."
            };

            if(notification !== null &&
                notification.osNotificationId !== undefined &&
                notification.osNotificationId !== null) {
                request.delete({
                    url: 'https://onesignal.com/api/v1/notifications/' + notification.osNotificationId + '?app_id=' + appId,
                    method: 'DELETE',
                    headers: headersOS
                }, function(err, response) {
                    let body = JSON.parse(response.body);
                    if(body !== undefined && body.success) {
                        //Destroy the local notification.
                        notification.destroy();

                        if(next !== undefined) {
                            retValue = {
                                code: 200,
                                message: 'The push notification has been deleted succesfully.'
                            };

                            next(err, retValue);
                        }
                    } else {
                        if(next !== undefined) {
                            retValue = {
                                code: 400,
                                message: 'The push notification cannot be deleted at this moment.'
                            };
                            next(err, retValue);
                        }
                    }
                });

            } else {
                if(next !== undefined) {
                    next(null, retValue);
                }
            }
        });
	}

    /*
    * Internal function to edit a device from OneSignal with the data from the user
    */
    function updateTagsDevice(userId, callback){
        var filter = {
            include: 'profile',
            where: {
                id: userId
            }
        };
        app.models.Account.findOne(filter, function(err, user){
            user.profile.get().then((profile) => {
                if(user !== null &&
                    user.notificationId !== undefined &&
                    user.notificationId !== null &&
                    !user.isBot) {

                    var body = {
                        app_id: appId,
                        tags: {
                            accountId: user.id,
                            name: profile.name,
                            lastName: profile.lastName,
                            totalWins: profile.totalWins,
                            totalGames: profile.totalGames,
                            totalLost: profile.totalLost,
                            appVersion: user.appVersion,
                            email: user.email,
                            expPoints: profile.balance_tuls,
                            tuls: profile.tuls
                        }
                    };

                    request.put({
                        url: 'https://onesignal.com/api/v1/players/' + user.notificationId,
                        method: 'PUT',
                        headers: headersOS,
                        body: JSON.stringify(body),
                        timeout: 5000
                    }, function(err, response) {
                        try {
                            let body = JSON.parse(response.body);
                            if(body !== undefined &&
                                body.success == true) {
                                if(callback)
                                    callback(true);
                            } else {
                                if(callback)
                                    callback(true);
                            }
                        } catch (e) {
                            callback(false);
                        }
                    });
                } else {
                    if(callback)
                        callback(false);
                }
            });
        });
    }
};

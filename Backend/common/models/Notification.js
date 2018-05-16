'use strict';

var loopback = require('loopback');
var request = require('request');
var app = require('../../server/server');

module.exports = function(Notification) {

    //Header for OneSignal requests, always including the authorization token (obtained through OneSignal website)
    var appId = "326392db-dd25-431b-9e26-8892f287a31a";
    var headersOS = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Basic MzczMWE0ZDUtOTBhMi00NDZjLTkxMWYtZDRiYTYzZTE5MjU5"
    };

    Notification.send = send;
    Notification.cancel = cancel;
    Notification.updateTagsDevice = updateTagsDevice;

    function send(data, options, next) {
        var filter = {
            where: {
                id: data.userId
            }
        };
        app.models.Account.findOne(filter, function(err, user){
            var retValue = {
                code: 400,
                message: "The user doesn't have any associated device."
            };

            if(user !== null &&
                user.notificationId !== undefined &&
                user.notificationId !== null) {
                var body = {
                    app_id: appId,
                    include_player_ids: [user.notificationId],
                    android_accent_color: '#222222', //Blue color
                    //android_sound: 'push_nsound',
                    contents: {
                        en: data.message
                    }
                };

                if(data.scheduled_at != undefined && data.scheduled_at != null) {
                    body.send_after = data.scheduled_at;
                }

                request.post({
                    url: 'https://onesignal.com/api/v1/notifications',
                    method: 'POST',
                    headers: headersOS,
                    body: JSON.stringify(body)
                }, function(err, response) {
                    let body = JSON.parse(response.body);
                    if(body !== undefined &&
                        body.id !== undefined) {

                        if(next !== undefined) {
                            retValue = {
                                code: 200,
                                message: 'The push notification has been sent succesfully.'
                            };

                            //Create the notification in database.
                            app.models.Notification.create({
                                userId: user.id,
                                message: data.message,
                                osPlayerId: body.id
                            });

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
                });

            } else {
                if(next !== undefined) {
                    next(null, retValue);
                }
            }
        });
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
                        body: JSON.stringify(body)
                    }, function(err, response) {
                        let body = JSON.parse(response.body);
                        if(body !== undefined &&
                            body.success == true) {
                            if(callback)
                                callback(true);
                        } else {
                            if(callback)
                                callback(true);
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

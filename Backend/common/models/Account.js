'use strict';
const app = require('../../server/server');
const graph = require('fbgraph');
const loopbackContext = require("loopback-context");
const multiparty = require('multiparty');
const { join, extname } = require('path');
const { readFileSync } = require('fs');
const AWS = require('aws-sdk');
var Canvas = require('canvas');
var _ = require('lodash');
const s3 = new AWS.S3({
    "accessKeyId": "AKIAISFXWZONKBC5R5WQ",
    "secretAccessKey": "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"
});

module.exports = function(Account) {
    Account.loginAdmin = loginAdmin;
    Account.loginFacebook = loginFacebook;
    Account.loginWithCredentials = loginWithCredentials;
    Account.signupWithCredentials = signupWithCredentials;
    Account.getFriends = getFriends;
    Account.getPeople = getPeople;
    Account.me = getMe;
    Account.updateMe = updateMe;
    Account.uploadAvatar = uploadAvatar;
    Account.getRankingByUserId = getRankingByUserId;
    Account.getUserStatus = getUserStatus;

    function loginAdmin(data, next) {

        const ctx = this;

        if(data.email == 'admin@admin.com' && data.password == 'iloveyou30') {
            app.models.Account.findOne({ where : { email : 'admin@admin.com' } }, (err, account) => {
                account.createAccessToken(12096000, function (error, token) {
                    let obj = {
                        session: token,
                        user: account
                    };
                    next(null, obj);
                });
            });
        };
    }

    function loginFacebook(data, next) {

        const ctx = this;

        var onCheckLastVersion = (callback) => {
            app.models.Configuration.findOne({ where : { name : 'LAST_VERSION' }}, (err, value) => {
                if(value.value != data.appVersion) {
                    callback(false, {
                        message: 'Parece que no estás usando la última versión del juego. Recuerda actualizarla del PlayStore para poder ver todas nuestras últimas funcionalidades y disfrutar de ellas. ¡Además puedes tener premios por mantener actualizado tu juego!',
                        force: false
                    })
                } else {
                    callback(true);
                }
            });
        }

        const debugMode = false;
        if(debugMode) {
            Account.findOne({ where : { email : 'eabuslaiman@gmail.com'}}, function(err, account) {
                account.createAccessToken(12096000, function (error, token) {
                    let obj = {
                        session: token,
                        user: account
                    };
                    next(null, obj);
                });
            });
            return;
        }

        //Data contains the access token for the user, so if it's not already registered in the system, it will be registered automatically.
        graph.setAccessToken(data.accessToken);
        let parameters = {
            fields: 'email,name,first_name,middle_name,last_name,picture,gender,age_range'
        };

        graph.get('/me', parameters, function(err, dataGraph) {
            if(!err) {
                //Check if there is any user with that information
                let filter = {
                    where: {
                        email : dataGraph.email
                    }
                };
                Account.findOne(filter, function(err, account) {
                    if(account == null) {

                        let user = new Account;
                        user.email = dataGraph.email;
                        user.password = 'Wordeo2018EA3011!';
                        user.appVersion = data.appVersion;
                        user.notificationId = data.notificationId;
                        user.platform = data.platform;
                        user.lastLogin = new Date();
                        user.facebookId = dataGraph.id;
                        var username = (dataGraph.name.toUpperCase().substr(0, 4) + dataGraph.last_name.toUpperCase().substr(0, 4) + _.random(0, 2000).toString());
                        user.username = username;
                        user.facebookAccessToken = data.accessToken;

                        let profile = new app.models.Profile;
                        if(dataGraph.first_name) profile.name = dataGraph.first_name;
                        if(dataGraph.last_name) profile.lastName = dataGraph.last_name;
                        profile.avatar = dataGraph.picture.data.url;
                        profile.birthday = '2018/01/01';
                        profile.createdAt = new Date();
                        profile.lastModifiedAt = new Date();
                        profile.level = 1;
                        profile.experience_points = 0;

                        onCheckLastVersion((result, extraData) => {
                            user.save({}, function(err, userCreated) {
                                profile.accountId = userCreated.id;
                                profile.save({}, function(err, profile) {
                                    app.models.Notification.updateTagsDevice(userCreated.id);
                                    onUserCreated(userCreated, function(){
                                         Account.findOne(filter, function(err, user) {
                                            user.createAccessToken(12096000, function (error, token) {
                                                let obj = {
                                                    session: token,
                                                    user: user
                                                };
                                                if(!result) {
                                                    obj.version = {
                                                        isOldVersion: true,
                                                        message: extraData.message,
                                                        force: extraData.force
                                                    };
                                                } else {
                                                    obj.version = {
                                                        isOldVersion: false,
                                                    };
                                                }
                                                next(null, obj);
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    } else {
                        //The user already exists so update optional values like notificationId or platform.
                        if(data.notificationId || data.platform) {
                            account.notificationId = data.notificationId;
                            account.platform = data.platform;
                        }

                        if(data.appVersion) {
                            account.appVersion = data.appVersion;
                        }

                        account.facebookId = dataGraph.id;
                        account.lastLogin = new Date();
                        account.facebookAccessToken = data.accessToken;
                        account.save();

                        app.models.Notification.updateTagsDevice(account.id);

                        onCheckLastVersion((result, extraData) => {
                            account.createAccessToken(12096000, function (error, token) {
                                let obj = {
                                    session: token,
                                    user: account
                                };
                                if(!result) {
                                    obj.version = {
                                        isOldVersion: true,
                                        message: extraData.message,
                                        force: extraData.force
                                    };
                                } else {
                                    obj.version = {
                                        isOldVersion: false,
                                    };
                                }
                                next(null, obj);
                            });
                        });
                    }
                });
            } else {
                var error = new Error();
                error.status = 401;
                error.message = 'Your login account seems to be not valid.';
                error.code = 'AUTH_UNAUTHORIZED';
                next(error);
            }
        });
    }

    function loginWithCredentials(data, next) {
        let email = data.email;
        let password = data.password;

        console.log("Login with [email=" + email + ", password=" + password + "]");

        Account.login({ email : data.email, password: data.password }, function(err, token) {
            if(!err) {
                Account.findOne({ where : { email : data.email }}, function(err, account) {
                    let obj = {
                        session: token,
                        user: account,
                        success: true
                    };

                    next(null, obj);
                });
            } else {
                next(null, {
                    success: false,
                    message: 'La cuenta ingresada no es correcta'
                });
            }
        });
    }

    function signupWithCredentials(data, next) {

        //Validate data
        if(!data.username || !data.email || !data.password || !data.name) {
            next(null, {
                success: false,
                message: 'Parece que falta información. Por favor, completa toda la información disponible.'
            });
            return;
        } else if(data.name.split(' ').length < 2) {
            next(null, {
                success: false,
                message: 'Tu nombre completo debe tener nombre y apellido :)'
            });
            return;
        }

        //If everything is ok, login the user
        let user = new Account;
        user.email = data.email;
        user.password = data.password;
        /*user.appVersion = data.appVersion;
        user.notificationId = data.notificationId;*/
        user.platform = 'ios';
        user.lastLogin = new Date();
        //user.facebookId = dataGraph.id;
        //var username = (dataGraph.name.toUpperCase().substr(0, 4) + dataGraph.last_name.toUpperCase().substr(0, 4) + _.random(0, 2000).toString());
        user.username = data.email;
        //user.facebookAccessToken = data.accessToken;

        let profile = new app.models.Profile;
        profile.name = data.name.split(' ')[0];
        profile.lastName = data.name.split(' ')[1];
        //profile.avatar = dataGraph.picture.data.url;
        profile.birthday = '2019/01/01';
        profile.createdAt = new Date();
        profile.lastModifiedAt = new Date();
        profile.level = 1;
        profile.experience_points = 0;

        user.save({}, function(err, userCreated) {
            if(err) {
                console.log("Error 1");
                console.log(err);
                next(null, {
                    success: false,
                    message: 'La cuenta ya parece estar registrada. Intenta con otro nombre de usuario y otro e-mail.'
                });
            } else {
                profile.accountId = userCreated.id;
                profile.save({}, function(err, profile) {
                    if(err) {
                        console.log("Error 2");
                        console.log(err);
                        next(null, {
                            success: false,
                            message: 'Error al crear el perfil de usuario. Inténtalo nuevamente.'
                        });
                    } else {
                        //app.models.Notification.updateTagsDevice(userCreated.id);
                        onUserCreated(userCreated, function(){
                            Account.findOne({ where : { email : userCreated.email } }, function(err, user) {
                                user.createAccessToken(12096000, function (error, token) {
                                    let obj = {
                                        session: token,
                                        user: user,
                                        success: true
                                    };
                                    obj.version = {
                                        isOldVersion: false,
                                    };

                                    next(null, obj);
                                });
                            });
                        });
                    }
                });
            }
        });
    }

    function getFriends(next) {
        var ctx = loopbackContext.getCurrentContext();
        // Get the current access token
        var accessToken = ctx && ctx.get('accessToken');
        if(accessToken != null && accessToken.userId > -1) {
            app.models.Account.findOne({ where : { id : accessToken.userId } }, (err, result) => {
                graph.setAccessToken(result.facebookAccessToken);
                graph.batch([
                    { method: "GET", relative_url: "me/friends?limit=10" }
                ], function(err, res) {
                    var friends = [];
                    var promises = [];
                    var results = res[0];
                    results = JSON.parse(results.body);

                    for(var idx in results.data) {
                        const result = results.data[idx];
                        promises.push(new Promise((resolve, reject) => {
                            app.models.Account.findOne({ fields: {id: true, facebookId: true, username: true, isOnline: true}, include: 'profile', where : { facebookId : result.id }}, (err, account) => {
                                if(account) {
                                    Account.getRankingByUserId(account.id, (rank) => {
                                        account.rank = rank;
                                        app.models.Character.getCharacterByUserId(account.id, (character) => {
                                            account.character = character;
                                            resolve(account);
                                        });
                                    });
                                }
                            });
                        }));
                    }

                    Promise.all(promises).then((values) => {
                        next(null, values);
                    });
                });
            });
        }
    }

    function getPeople(data, next) {
        var ctx = loopbackContext.getCurrentContext();
        // Get the current access token
        var accessToken = ctx && ctx.get('accessToken');
        var dataSource = app.dataSources.mysql.connector;
        var query = "SELECT *, (SELECT createdAt FROM RoomUserQuestion WHERE RoomUserQuestion.userId = Account.id ORDER BY createdAt DESC LIMIT 1) as lastReplyTime FROM Account " +
            "WHERE id NOT IN (" + accessToken.userId + ") AND isBot = FALSE " +
            "ORDER BY Account.isBot ASC, Account.isOnline DESC, lastReplyTime DESC " +
            "LIMIT 7;";
        dataSource.query(query, (err, accounts) => {
            var promises = [];

            for(var idx in accounts) {
                let account = accounts[idx];

                promises.push(new Promise((resolve, reject) => {
                    Account.getUserStatus({ userId : account.id, includeCurrentStats: true }, (err, response) => {
                        if(response) {
                            account.status = response;
                        } else {
                            account.status = null;
                        }
                        dataSource.query("SELECT * FROM Profile WHERE accountId = " + account.id, (err, profile) => {
                            if(profile && profile.length > 0) {
                                account.profile = profile[0];
                                app.models.Character.getCharacterByUserId(account.id, (character) => {
                                    account.profile.character = character;
                                    resolve(account);
                                });
                            } else {
                                resolve(null);
                            }
                        });
                    });
                }));
            }

            Promise.all(promises).then((values) => {
                var filtered = _.filter(values, (e) => { return e != null && e.username != null });
                next(null, {
                    success: true,
                    data: filtered
                });
            })
        });
    }

    function getMe(next) {
        var ctx = loopbackContext.getCurrentContext();
        // Get the current access token
        var accessToken = ctx && ctx.get('accessToken');
        if(accessToken != null && accessToken.userId > -1) {
            app.models.Account.findOne({ include: 'profile', where : { id : accessToken.userId  }}, function(err, user) {

                next(null, {
                    success: true,
                    data: user
                });
            })
        } else {
            next(null, {
                success: false,
                errorMessage: 'Lamentablemente no pudimos obtener tu perfil.'
            });
        }
    }

    function updateMe(data, next) {
        var ctx = loopbackContext.getCurrentContext();
        // Get the current access token
        var accessToken = ctx && ctx.get('accessToken');
        if(accessToken != null && accessToken.userId > -1) {
            app.models.Account.findOne({ include: 'profile', where : { id : accessToken.userId  }}, function(err, user) {

                user.profile.get().then((profile) => {
                    profile.name = data.name;
                    profile.lastName = data.lastName;
                    profile.save({}, (err, profile) => {
                        next(null, {
                            success: true,
                            data: profile
                        })
                    });
                });
            })
        } else {
            next();
        }
    }

    function uploadAvatar(data, next) {

        var ctx = loopbackContext.getCurrentContext();
        // Get the current access token
        var accessToken = ctx && ctx.get('accessToken');
        if(accessToken != null && accessToken.userId > -1) {
            app.models.Account.findOne({ include: 'profile', where : { id : accessToken.userId  }}, function(err, user) {

                user.profile.getAsync(function(err, profile) {
                    //Upload avatar
                    getFileFromRequest(data).then((file) => {
                        var options = {};
                        const buffer = readFileSync(file.path);
                        const fileName = options.name || String(Date.now());
                        const extension = extname(file.path);
                        return new Promise((resolve, reject) => {
                            return s3.upload({
                                Bucket: 'wordeo',
                                ACL: 'public-read',
                                Body: buffer,
                                Key: 'avatars/' + file.originalFilename
                            }, (err, result) => {
                                if (err) reject(err);
                                else resolve(result);
                            });
                        }).then((value) => {
                            profile.avatar = 'https://s3-sa-east-1.amazonaws.com/wordeo/' + value.key;
                            profile.save();

                            next();
                        });
                    });
                });
            })
        }
    }

    function onUserCreated(user, callback) {

        const userId = user.id;
        var filterRole = {
            where: { name: 'Player' }
        };

        Account.app.models.Role.find(filterRole).then(function(role){
            role[0].principals.create({
              principalType: Account.app.models.RoleMapping.USER,
              principalId: userId
            }, function(err, principal) {
                //Do nothing!
                callback();
            });
        });

        //Do something like welcome email
        //Welcome email only for students.
        /* app.models.Email.send({
            to: result.email,
            from: 'chat@openenglish.com',
            template: {
                //name: 'chat-by-oe-email-user-registers-for-app',
                name: 'welcome-email-chat-by-oe-april',
                content: [
                    { name: 'name', content: result.name }
                ]
            }
        }); */
    }

    function getRankingByUserId(userId, callback) {
        var dataSource = app.dataSources.mysql.connector;
        var query = "SELECT id, isBot, (SELECT count(id) FROM Profile f WHERE f.experience_points > Profile.experience_points) + 1 as rank " +
            "FROM Profile " +
            "WHERE accountId = " + userId + " " +
            "ORDER BY experience_points;";
        dataSource.query(query, (err1, rank) => {
            if(rank && rank.length > 0) {
                if(rank[0].isBot) {
                    callback(_.random(25, 120));
                } else {
                    callback(rank[0].rank);
                }
            } else {
                callback(-1);
            }
        });
    }

    function getUserStatus(data, next) {
        app.models.Account.findOne({ include: 'profile', where : { id: data.userId }}, (err, account) => {
            if(account) {
                var status = {
                    isOnline: account.isOnline
                };

                app.models.RoomUser.findOne({ order: 'id DESC', where : { userId : account.id, hasFinished: false } }, (err, roomUser) => {
                    status.isPlaying = roomUser != null;

                    //If this flag is active then returns the current room status
                    if(status.isPlaying && data.includeCurrentStats) {
                        app.models.RoomUser.find({ where : { roomId: roomUser.roomId }}, (err, stats) => {
                            if(!err && stats) {
                                let currentUser = _.find(stats, (e) => { return e.userId == data.userId });
                                let max = _.maxBy(stats, (e) => { return e.points });
                                if(max && max.userId == currentUser.userId) {
                                    status.statusRoundString = "Ganando (" + max.points + " p)";
                                } else {
                                    status.statusRoundString = "Perdiendo (" + max.points + " p)";
                                }
                                next(null, status);
                            } else {
                                next(null, status);
                            }
                        });
                    } else {
                        next(null, status);
                    }
                })
            } else {
                next();
            }
        });
    }

    /* HELPER FUNCTIONS */

    /**
    * Helper method which takes the request object and returns a promise with a file.
     */
    const getFileFromRequest = (req) => new Promise((resolve, reject) => {
        const form = new multiparty.Form();
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            const file = files['file'][0]; // get the file from the returned files object
            if (!file) Promise.reject('File was not found in form data.');
            else resolve(file);
        });
    });
};
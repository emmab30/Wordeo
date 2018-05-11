'use strict';
const app = require('../../server/server');
const graph = require('fbgraph');
const loopbackContext = require("loopback-context");
const multiparty = require('multiparty');
const { join, extname } = require('path');
const { readFileSync } = require('fs');
const AWS = require('aws-sdk');
var mergeImages = require('merge-images');
var Canvas = require('canvas');
const s3 = new AWS.S3({
    "accessKeyId": "AKIAISFXWZONKBC5R5WQ",
    "secretAccessKey": "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"
});

module.exports = function(Account) {
    Account.loginFacebook = loginFacebook;
    Account.me = getMe;
    Account.uploadAvatar = uploadAvatar;

    function loginFacebook(data, next) {

        const ctx = this;

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

        /*//Only debug mode!
        if(data.accessToken == 'EAAMwIke40cQBACib6NlcIewCGhco4CmxSRr4YyYogI5ZBrW6pt8QGGUrZAGHq9jsRMHQK6gUOcOF0ZCpc523mhULbiMXZAvphM2VtZBJgvSyALOWhJeTuG49FZBZBS3MyCIZAqUrsnehTCTGLKY0b1FILENyA0bagP8zp6nZAvzGVIKAXqXVTfek4ZB2N3zH3qq2FENsE4gk9OYsCVF3av8Gv1x0d6ZCzfwJM8ZD')  {
            Account.findOne({ where : { email : 'eabuslaiman@gmail.com'}}, function(err, account) {
                account.createAccessToken(12096000, function (error, token) {
                    let obj = {
                        session: token,
                        user: account
                    };
                    next(null, obj);
                });
            });
        } else {
            Account.findOne({ where : { email : 'jburalkmpy_1524744240@tfbnw.net'}}, function(err, account) {
                account.createAccessToken(12096000, function (error, token) {
                    let obj = {
                        session: token,
                        user: account
                    };
                    next(null, obj);
                });
            });
        }
        return;*/

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
                        user.lastLogin = new Date();

                        let profile = new app.models.Profile;
                        if(dataGraph.first_name) profile.name = dataGraph.first_name;
                        if(dataGraph.last_name) profile.lastName = dataGraph.last_name;
                        profile.avatar = dataGraph.picture.data.url;
                        profile.birthday = '2018/01/01';
                        profile.createdAt = new Date();
                        profile.lastModifiedAt = new Date();
                        profile.level = 1;
                        profile.experience_points = 0;

                        user.save({}, function(err, userCreated) {
                            profile.accountId = userCreated.id;
                            profile.save({}, function(err, profile) {
                                onUserCreated(userCreated, function(){
                                     Account.findOne(filter, function(err, user) {
                                        user.createAccessToken(12096000, function (error, token) {
                                            let obj = {
                                                session: token,
                                                user: user
                                            };
                                            next(null, obj);
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

                        account.lastLogin = new Date();
                        account.save();

                        account.createAccessToken(12096000, function (error, token) {
                            let obj = {
                                session: token,
                                user: account
                            };
                            next(null, obj);
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
        })
    }

    function getMe(next) {
        var ctx = loopbackContext.getCurrentContext();
        // Get the current access token
        var accessToken = ctx && ctx.get('accessToken');
        if(accessToken != null && accessToken.userId > -1) {
            app.models.Account.findOne({ include: 'profile', where : { id : accessToken.userId  }}, function(err, user) {

                var fnNext = (character = null, characterId = -1) => {
                    user.profile.get().then((profile) => {
                        if(character){
                            user.__data.profile.characterId = characterId;
                            user.__data.profile.character = character;
                        }

                        if(err) {
                            next(null, {
                                result: false,
                                error: err
                            });
                        } else {
                            if(user) {
                                next(null, {
                                    result: true,
                                    user: user
                                });
                            } else {
                                next(null, {
                                    result: false,
                                    user: null
                                });
                            }
                        }
                    });
                }

                user.profile.get().then((profile) => {

                    //Get characters for user
                    app.models.UserCharacter.find({ include : 'character', where : { profileId: profile.id }, order: 'createdAt DESC' }, (err, userCharacters) => {
                        if(userCharacters != null && userCharacters.length > 0) {
                            const userCharacter = userCharacters[0];
                            userCharacter.character.get().then((character) => {
                                //Load accesories for character!

                                app.models.UserCharacterAccesory.find({ where : { userCharacterId : userCharacter.id }}, (err, userCharacterAccesories) => {
                                    var promises = [];

                                    if(!err && userCharacterAccesories) {
                                        for(var idx in userCharacterAccesories) {
                                            promises.push(new Promise((resolve, reject) => {
                                                app.models.CharacterAccesory.findOne({ where : { id : userCharacterAccesories[idx].accesoryId }}, (e, result) => {
                                                    if(!err && result) {
                                                        resolve(result);
                                                    }
                                                })
                                            }));
                                        }

                                        Promise.all(promises).then((value) => {
                                            let arr = [];
                                            arr.push({
                                                src: (__dirname + '/../../assets/images/character_set/monster_' + userCharacter.characterId + '.png'),
                                                zIndex: 0
                                            });

                                            for(var idx in value) {
                                                arr.push({
                                                    src: __dirname + '/../../assets/images/character_set/' + value[idx].image,
                                                    x: 0,
                                                    y: 0,
                                                    zIndex: value[idx].zIndex
                                                });
                                            }

                                            arr.sort((a,b) => {
                                                return a.zIndex > b.zIndex;
                                            });
                                            mergeImages(arr, {
                                                Canvas: Canvas
                                            }).then((b64) => {
                                                fnNext(b64, userCharacter.characterId);
                                            });
                                        })
                                    }
                                });
                            });
                        } else {
                            mergeImages([__dirname + '/../../assets/images/character_set/monster_default.png'], {
                                Canvas: Canvas
                            }).then((b64) => {
                                fnNext(b64);
                            });
                        }
                    })

                    //Check if the user has any available character
                    /* if(profile.character) {
                        const character = JSON.parse(profile.character);
                        var promises = [];
                        for(var idx in character.accesories) {
                            const accesoryId = character.accesories[idx];
                            promises.push(new Promise((resolve, reject) => {
                                app.models.CharacterAccesory.findOne({ where : { id : accesoryId }}, (e, result) => {
                                    if(!err && result) {
                                        resolve(result.image);
                                    }
                                })
                            }));
                        }

                        Promise.all(promises).then((value) => {
                            let arr = [];
                            arr.push(__dirname + '/../../assets/images/character_set/monster_' + character.characterId + '.png');

                            for(var idx in value) {
                                arr.push({
                                    src: __dirname + '/../../assets/images/character_set/' + value[idx],
                                    x: 0,
                                    y: 0
                                });
                            }
                            mergeImages(arr, {
                                Canvas: Canvas
                            }).then((b64) => {
                                fnNext(b64);
                            });
                        })
                    } else {
                        fnNext();
                    } */
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
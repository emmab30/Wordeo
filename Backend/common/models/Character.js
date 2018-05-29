'use strict';

const app = require('../../server/server');
const mergeImages = require('merge-images');
const Canvas = require('canvas');
const loopbackContext = require("loopback-context");

module.exports = function(Character) {

    Character.availableCharacters = availableCharacters;
    Character.getRankingTopPlayers = getRankingTopPlayers;
    Character.make = make;
    Character.getMyCharacters = getMyCharacters;
    Character.buyAccesories = buyAccesories;
    Character.buyCharacter = buyCharacter;
    Character.getCharacterByUserId = getCharacterByUserId;

    function getMyCharacters(next) {
        //Do nothing
    }

    function availableCharacters(next) {
        var ctx = loopbackContext.getCurrentContext();
        var accessToken = ctx && ctx.get('accessToken');
        var promises = [];

        if(accessToken.userId > -1) {
            app.models.Profile.findOne({ where : { accountId : accessToken.userId }}, (err, profile) => {
                app.models.Character.find({ order : 'price ASC' }, (err, characters) => {
                    for(var idx in characters) {
                        const character = characters[idx];
                        promises.push(new Promise((resolve, reject) => {
                            app.models.UserCharacter.count({ characterId : character.id, profileId : profile.id }, (err, count) => {
                                let mergedItems = [
                                    (__dirname + '/../../assets/images/character_set/monster_' + character.id + '.png')
                                ];
                                mergeImages(mergedItems, {
                                    Canvas: Canvas
                                }).then((b64) => {
                                    if(count > 0) {
                                        character.isBought = true;
                                    }
                                    resolve(Object.assign(character, { imageb64 : b64 }));
                                });
                            });
                        }));
                    }

                    Promise.all(promises).then((values) => {
                        next(null, values);
                    });
                });
            })
        }
    }

    function getRankingTopPlayers(next) {

        var ctx = loopbackContext.getCurrentContext();
        var accessToken = ctx && ctx.get('accessToken');

        //Check my position
        app.models.Profile.find({ limit: 10, where : { isBot : false }, fields: { accountId: true }, order: ['experience_points DESC', 'totalWins DESC'] }, (err, profiles) => {
            let promises = [];
            for(var idx in profiles) {
                let profile = profiles[idx];
                promises.push(new Promise((resolve, reject) => {
                    Character.getCharacterByUserId(profiles[idx].accountId, (character) => {
                        profile.character = character;
                        resolve(profile)
                    })
                }));
            }

            Promise.all(promises).then((values) => {
                app.models.Account.getRankingByUserId(accessToken.userId, (rank) => {
                    next(null, {
                        myPosition: rank,
                        players: values
                    });
                });
            });
        });
    }

    function make(data, next) {

        var ctx = loopbackContext.getCurrentContext();
        var accessToken = ctx && ctx.get('accessToken');

        if(accessToken.userId > -1) {
            app.models.Profile.findOne({ where : { accountId : accessToken.userId }}, (err, profile) => {
                if(profile) {
                    app.models.UserCharacter.find({ where : { profileId : profile.id }, order: 'createdAt DESC' }, (err, results) => {
                        let characterId = data.characterId;
                        /* if(results.length > 0) {
                            characterId = results[0].characterId;
                        } */

                        let accesories = data.accesories;
                        let mergedItems = [];
                        mergedItems.push({
                            src: __dirname + '/../../assets/images/character_set/monster_' + characterId + '.png',
                            zIndex: 0
                        });

                        let promises = [];
                        for(var idx in accesories) {
                            const accesoryId = accesories[idx];
                            promises.push(new Promise((resolve, reject) => {
                                app.models.CharacterAccesory.findOne({ where : { id : accesoryId }}, (err, result) => {
                                    if(!err && result) {
                                        resolve(result);
                                    }
                                })
                            }));
                        }

                        Promise.all(promises).then((value) => {
                            for(var idx in value) {
                                mergedItems.push({
                                    src: __dirname + '/../../assets/images/character_set/' + value[idx].image,
                                    x: 0,
                                    y: 0,
                                    zIndex: value[idx].zIndex
                                });
                            }

                            mergedItems.sort((a,b) => {
                                return a.zIndex > b.zIndex;
                            });
                            mergeImages(mergedItems, {
                                Canvas: Canvas
                            }).then((b64) => {
                                next(null, b64);
                            });
                        });
                    });
                }
            })
        }

        //ToDo - Improve this. Since this is only testing against certain character
        /* var ctx = loopbackContext.getCurrentContext();
        var accessToken = ctx && ctx.get('accessToken');

        if(accessToken.userId > -1) {

            app.models.Profile.findOne({ where : { accountId : accessToken.userId }}, (err, profile) => {
                if(profile != null) {
                    app.models.UserCharacter.find({ include : 'character', where : { profileId: profile.id }}, (err, userCharacters) => {
                        if(userCharacters.length > 0) {
                            app.models.UserCharacterAccesory.find({ where : { userCharacterId : userCharacters[0].id }}, (err, accesories) => {
                                let characterId = userCharacters[0].characterId;
                                accesories = accesories.map((e) => { return e.id }).concat(data.accesories);

                                let mergedItems = [];
                                mergedItems.push(__dirname + '/../../assets/images/character_set/monster_' + characterId + '.png');

                                let promises = [];
                                for(var idx in accesories) {
                                    const accesoryId = accesories[idx];
                                    promises.push(new Promise((resolve, reject) => {
                                        app.models.CharacterAccesory.findOne({ where : { id : accesoryId }}, (err, result) => {
                                            if(!err && result) {
                                                resolve(result.image);
                                            }
                                        })
                                    }));
                                }

                                Promise.all(promises).then((value) => {
                                    for(var idx in value) {
                                        mergedItems.push({
                                            src: __dirname + '/../../assets/images/character_set/' + value[idx],
                                            x: 0,
                                            y: 0
                                        });
                                    }
                                    mergeImages(mergedItems, {
                                        Canvas: Canvas
                                    }).then((b64) => {
                                        next(null, b64);
                                    });
                                });
                            });
                        }
                    });
                }
            });
        } */
    }

    function buyCharacter(data, next) {
        var ctx = loopbackContext.getCurrentContext();
        var accessToken = ctx && ctx.get('accessToken');

        if(accessToken.userId > -1) {
            app.models.Character.findOne({ where : { id : data.characterId }}, (err, character) => {
                if(character) {
                    app.models.Profile.findOne({ where : { accountId : accessToken.userId }}, (err, profile) => {
                    if(profile.balance_tuls >= character.price) {

                        //Discount from the balance
                        profile.balance_tuls -= character.price;
                        profile.save((err, profile) => {
                            if(!err) {
                                app.models.UserCharacter.create({
                                    userId: accessToken.userId,
                                    characterId: character.id,
                                    profileId: profile.id
                                }, (err, created) => {
                                    if(!err && created) {
                                        next(null, {
                                            code: 0,
                                            message: 'Tu compra se ha realizado con éxito! Comienza a comprar items para tu nuevo personaje!'
                                        });
                                    }
                                });
                            } else {
                                error.message = 'No tienes los tuls suficientes para comprar este personaje.';
                                error.code = 'UNSUFFICIENT_FOUNDS';
                                next(error);
                            }
                        });
                    } else {
                        error.message = 'No tienes los tuls suficientes para comprar este personaje.';
                        error.code = 'UNSUFFICIENT_FOUNDS';
                        next(error);
                    }
                });
                }
            });
        }
    }

    function buyAccesories(data, next) {
        var ctx = loopbackContext.getCurrentContext();
        var accessToken = ctx && ctx.get('accessToken');

        if(accessToken != null && accessToken.userId > -1) {
            app.models.Profile.findOne({ where : { accountId : accessToken.userId }}, (err, profile) => {
                app.models.UserCharacter.findOne({ where : { profileId : profile.id }, order: 'createdAt DESC'}, (err, userCharacter) => {
                    app.models.CharacterAccesory.find({ where : { id: { inq : data.accesories } }}, (err, accesories) => {
                        var totalAmount = 0;
                        for(var idx in accesories) {
                            const accesory = accesories[idx];
                            totalAmount += accesory.price;
                        }

                        var error = new Error();
                        error.status = 401;
                        if(profile.balance_tuls >= totalAmount) {

                            //Discount from the balance
                            profile.balance_tuls -= totalAmount;

                            let promises = [];
                            for(var idx in accesories) {
                                const accesory = accesories[idx];
                                //Create item
                                promises.push(new Promise((resolve, reject) => {
                                    app.models.UserCharacterAccesory.create({
                                        userCharacterId: userCharacter.id,
                                        accesoryId: accesory.id,
                                        isEquipped: true
                                    }, (err, result) => {
                                        resolve();
                                    });
                                }));
                            }

                            Promise.all(promises).then((data) => {
                                profile.save({}, (err, saved) => {
                                    if(!err && saved) {
                                        next(null, {
                                            code: 0,
                                            message: 'Tu compra se ha realizado con éxito!'
                                        });
                                    }
                                });
                            });
                        } else {
                            error.message = 'No tienes los tuls suficientes para realizar esta compra.';
                            error.code = 'UNSUFFICIENT_FOUNDS';
                            next(error);
                        }
                    });
                });
            });
        }
    }

    function getCharacterByUserId(userId, callback) {
        app.models.Profile.findOne({ where : { accountId : userId }}, (err, profile) => {
            if(profile) {
                app.models.UserCharacter.find({ where : { profileId : profile.id }, order: 'createdAt DESC' }, (err, results) => {
                    if(results.length > 0) {
                        app.models.UserCharacterAccesory.find({ where : { userCharacterId : results[0].id }}, (err, accesories) => {
                            let characterId = 1;
                            if(results.length > 0) {
                                characterId = results[0].characterId;
                            } else {
                                characterId = 'default';
                            }

                            let mergedItems = [];
                            mergedItems.push({
                                src: __dirname + '/../../assets/images/character_set/monster_' + characterId + '.png',
                                zIndex: 0
                            });

                            let promises = [];
                            for(var idx in accesories) {
                                const accesoryId = accesories[idx].accesoryId;
                                promises.push(new Promise((resolve, reject) => {
                                    app.models.CharacterAccesory.findOne({ where : { id : accesoryId }}, (err, result) => {
                                        if(!err && result) {
                                            resolve(result);
                                        }
                                    })
                                }));
                            }

                            Promise.all(promises).then((value) => {
                                for(var idx in value) {
                                    mergedItems.push({
                                        src: __dirname + '/../../assets/images/character_set/' + value[idx].image,
                                        x: 0,
                                        y: 0,
                                        zIndex: value[idx].zIndex
                                    });
                                }

                                mergedItems.sort((a,b) => {
                                    return a.zIndex > b.zIndex;
                                });
                                mergeImages(mergedItems, {
                                    Canvas: Canvas
                                }).then((b64) => {
                                    callback(b64);
                                });
                            });
                        });
                    } else {
                        let mergedItems = [];
                        mergedItems.push({
                            src: __dirname + '/../../assets/images/character_set/monster_default.png',
                            zIndex: 0
                        });
                        mergeImages(mergedItems, {
                            Canvas: Canvas
                        }).then((b64) => {
                            callback(b64);
                        });
                    }
                });
            } else {
                callback(null);
            }
        })
    }
};
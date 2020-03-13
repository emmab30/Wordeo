'use strict';

const app = require('../../server/server');
const loopbackContext = require("loopback-context");
const log = require('fancy-log');

module.exports = function(CharacterAccesory) {

    CharacterAccesory.availableAccesories = availableAccesories;

    function availableAccesories(next) {
        let error = new Error();
        let ctx = loopbackContext.getCurrentContext();
        let accessToken = ctx && ctx.get('accessToken');

        if(accessToken != null && accessToken.userId) {
            app.models.UserCharacter.findOne({ accountId : accessToken.userId}, (e, userCharacter) => {
                if(userCharacter) {
                    app.models.CharacterAccesory.find({}, (e, accesories) => {

                        //Check items if they are buyables by the current user
                        app.models.Profile.findOne({ where : { accountId : accessToken.userId }}, (err, profile) => {

                            var promises = [];
                            for(const idx in accesories) {
                                promises.push(new Promise((resolve, reject) => {
                                    let accesory = accesories[idx];
                                    app.models.UserCharacterAccesory.count({ accesoryId: accesory.id, userCharacterId: userCharacter.id }, (err, acc) => {
                                        accesory.isBuyable = accesory.price <= profile.balance_tuls;
                                        if(acc > 0) {
                                            accesory.isEquipped = true;
                                        } else {
                                            accesory.isEquipped = false;
                                        }
                                        resolve(accesory);
                                    });
                                }));
                            }

                            Promise.all(promises).then((data) => {
                                next(null, {
                                    success: true,
                                    data: data
                                });
                            });
                        });
                    });
                }
            });
        }
    }
};
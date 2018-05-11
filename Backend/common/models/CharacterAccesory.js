'use strict';

const app = require('../../server/server');
const mergeImages = require('merge-images');
const Canvas = require('canvas');

module.exports = function(CharacterAccesory) {

    CharacterAccesory.availableAccesories = getAvailableAccesories;

    function getAvailableAccesories(characterId, next) {
        var query = {
            order: 'price ASC'
        };
        if(characterId != null && characterId > -1) {
            query.where = {
                or: [
                    { characterId : -1 },
                    { characterId : characterId }
                ]
            }
        };
        app.models.CharacterAccesory.find(query, (e, accesories) => {
            var promises = [];
            for(var idx in accesories) {
                const accesory = accesories[idx];
                promises.push(new Promise((resolve, reject) => {
                    mergeImages([__dirname + '/../../assets/images/character_set/' + accesory.image_placeholder], {
                        Canvas: Canvas
                    }).then((b64) => {
                        resolve(Object.assign(accesory, { imageb64: b64 }));
                    });
                }));
            }

            Promise.all(promises).then((values) => {
                next(null, values);
            })
        });
    }
};
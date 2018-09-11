'use strict';

const app = require('../../server/server');
const Canvas = require('canvas');

module.exports = function(ElementalLifeAccesory) {

    ElementalLifeAccesory.availableElements = getAvailableElements;

    function getAvailableElements(next) {
        /* app.models.ElementalLifeAccesory.find({ order : 'price ASC' }, (e, accesories) => {
            var promises = [];
            for(var idx in accesories) {
                const accesory = accesories[idx];
                promises.push(new Promise((resolve, reject) => {
                    mergeImages([__dirname + '/../../assets/images/life_persistence/' + accesory.image], {
                        Canvas: Canvas
                    }).then((b64) => {
                        resolve(Object.assign(accesory, { imageb64: b64 }));
                    });
                }));
            }

            Promise.all(promises).then((values) => {
                next(null, values);
            })
        }); */
    }

};
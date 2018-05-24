'use strict';

const app = require('../../server/server');
const loopbackContext = require("loopback-context");
const log = require('fancy-log');

module.exports = function(Configuration) {
    Configuration.userStatistics = getUserStatistics;
    Configuration.getLastVersion = getLastVersion;

    function getUserStatistics(next) {
        Configuration.app.models.Account.count({ isOnline : true }, function(err, count) {
            if(!err) {
                next(null, {
                    usersStatistics: {
                        online: count
                    }
                })
            }
        });
    }

    function getLastVersion(data, next) {
        Configuration.findOne({ where : { name : 'LAST_VERSION' }}, (err, value) => {
            if(value.value != data.version) {
                next(null, {
                    message: 'Pareces no estar usando la última versión de la aplicación. Recuerda actualizarla del PlayStore para poder ver todas nuestras últimas funcionalidades y disfrutar de ellas.',
                    force: false
                })
            } else {
                next(null, {
                    success: true
                });
            }
        });
    }
};
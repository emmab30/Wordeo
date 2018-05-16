'use strict';

const app = require('../../server/server');
const loopbackContext = require("loopback-context");
const log = require('fancy-log');

module.exports = function(Configuration) {
    Configuration.userStatistics = getUserStatistics;

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
};
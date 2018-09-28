'use strict';

const app = require('../../server/server');
const loopbackContext = require("loopback-context");
const log = require('fancy-log');

module.exports = function(Reward) {

    Reward.me = me;

    function me(next) {
        var ctx = loopbackContext.getCurrentContext();
        var accessToken = ctx && ctx.get('accessToken');
        if(accessToken != null && accessToken.userId > -1) {
            Reward.findOne({ where : { userId : accessToken.userId, wasNotified: false }}, (err, result) => {
                if(result != null) {
                    next(null, {
                        success: true,
                        data: [result]
                    })

                    result.wasNotified = true;
                    result.save();
                } else {
                    next(null, {
                        success: true,
                        data: []
                    })
                }
            });
        }
    }

};

'use strict';

const app = require('../../server/server');
const loopbackContext = require("loopback-context");
const log = require('fancy-log');
var _ = require('lodash');

module.exports = function(News) {

    News.me = me;
    News.onTapButton = onTapButton;

    function me(next) {
        //Get news for me
        var ctx = loopbackContext.getCurrentContext();
        var accessToken = ctx && ctx.get('accessToken');
        if(accessToken != null && accessToken.userId > -1) {

            News.find({ where : { isActive : true }}, (err, results) => {
                const newsIds = _.map(results, (e) => { return e.id });

                app.models.NewsUser.find({ fields: { newsId: true }, where : { newsId: { inq : newsIds } }}, (err, toSend) => {
                    if(err) {
                        next(null, []);
                    } else {
                        if(toSend) {
                            const sentIds = _.map(toSend, (e) => e.newsId);
                            next(null, _.filter(results, (e) => { return sentIds.indexOf(e.id) == -1 }))
                        } else {
                            next(null, []);
                        }
                    }
                });
            });

        }
    }

    function onTapButton(data, next) {
        //Get news for me
        var ctx = loopbackContext.getCurrentContext();
        var accessToken = ctx && ctx.get('accessToken');

        //Exception for buttons
        if(data.buttonId == 'next') {
            app.models.NewsUser.create({
                userId: accessToken.userId,
                newsId: data.newsId
            }, (err, created) => {
                if(!err && created) {
                    next();
                }
            });
        } else if(data.buttonId == 'claim_tuls') {
            app.models.NewsUser.create({
                userId: accessToken.userId,
                newsId: data.newsId
            }, (err, created) => {
                if(!err && created) {
                    app.models.Profile.findOne({ where : { accountId : accessToken.userId } }, (err, profile) => {
                        profile.balance_tuls += 300;
                        profile.save();

                        next(null, {
                            message: 'Te hemos sumado 300 tuls a tu cuenta! ¡Gracias y que disfrutes del juego'
                        });
                    });
                }
            });
        }
    }

};

'use strict';

const app = require('../../server/server');
const Canvas = require('canvas');
const loopbackContext = require("loopback-context");

module.exports = function(Contact) {

    Contact.send = send;

    function send(data, next) {
        var ctx = loopbackContext.getCurrentContext();
        var accessToken = ctx && ctx.get('accessToken');
        var userId = accessToken.userId;

        var response = new Error();
        response.status = 401;
        response.code = 'INVALID_BODY'
        var hasError = true;

        if(!data.message || data.message.trim() == '') {
            response.message = 'Por favor coloca un mensaje detallándonos el motivo de tu contacto.';
        } else if(!data.subject || data.subject.trim() == '') {
            response.message = 'Por favor selecciona el motivo de tu mensaje.';
        } else {
            hasError = false;
        }

        if(!hasError) {
            Contact.create({
                accountId: userId,
                subject: data.subject,
                message: data.message
            }, (err, result) => {
                if(!err && result) {
                    next(null, {
                        message: '¡Muchas gracias por tu contacto! Te responderemos a tu casilla de correo.'
                    });
                }
            })
        } else {
            next(response);
        }
    }
};
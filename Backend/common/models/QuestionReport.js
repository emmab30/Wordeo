'use strict';

const loopbackContext = require("loopback-context");

module.exports = function(QuestionReport) {
    QuestionReport.create = create;

    function create(data, next) {
        var ctx = loopbackContext.getCurrentContext();
        var accessToken = ctx && ctx.get('accessToken');

        var response = new Error();
        response.status = 401;
        response.code = 'INVALID_BODY';
        response.message = '¡Disculpa! Tu reporte no ha podido ser enviado a nuestro equipo. ¿Podrías volver a intentarlo?';

        QuestionReport.create({
            questionId: data.questionId,
            accountId: accessToken.userId
        }, (err, reported) => {
            if(!err && reported) {
                next(null, {
                    message: '¡Muchas gracias por reportar esta pregunta! Verificaremos que la pregunta sea correcta. ¡Quizás en pocos días recibas un premio de agradecimiento!'
                });
            } else {
                next(response);
            }
        })
    }
};

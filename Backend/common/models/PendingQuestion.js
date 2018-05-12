'use strict';

var loopbackContext = require("loopback-context");

module.exports = function(PendingQuestion) {

    PendingQuestion.addPendingQuestion = addPendingQuestion;
    PendingQuestion.getMyPendingQuestions = getMyPendingQuestions;

    function addPendingQuestion(data, next) {

        var response = new Error();
        var hasError = true;
        response.status = 401;
        response.code = 'INVALID_BODY';
        if(!data.question || data.question.trim() == '') {
            response.message = 'Debes completar la pregunta. Recuerda que ganarás mas tuls si la pregunta está bien redactada y con los correctos signos de puntuación.';
        } else if((!data.option1 || data.option1.trim() == '') || (!data.option2 || data.option2.trim() == '') || (!data.option3 || data.option3.trim() == '') || (!data.option4 || data.option4.trim() == '')) {
            response.message = 'La pregunta debe contener cuatro opciones y la primer opción debe ser la correcta.';
        } else {
            hasError = false;
        }

        if(hasError) {
            next(response);
        } else {

            var ctx = loopbackContext.getCurrentContext();
            var accessToken = ctx && ctx.get('accessToken');

            PendingQuestion.create({
                accountId: accessToken.userId,
                question: data.question,
                option1: data.option1,
                option2: data.option2,
                option3: data.option3,
                option4: data.option4,
            }, (err, result) => {
                if(result) {
                    next(null, {
                        message: '¡Felicitaciones! Tu pregunta ha sido enviada. Estaremos validándola y avisándote en caso de que haya sido aceptada. Además te notificaremos cuantos tuls te haz ganado por tu carga. ¡Muchas gracias!'
                    });
                } else {
                    response.message = 'Ocurrió un problema interno al enviar la pregunta. El error ya ha sido reportado y estamos solucionándolo! Gracias por tu paciencia.'
                    next(response);
                }
            });
        }
    }

    function getMyPendingQuestions(next) {
        var ctx = loopbackContext.getCurrentContext();
        var accessToken = ctx && ctx.get('accessToken');
        PendingQuestion.find({ where : { accountId : accessToken.userId }, order: 'createdAt DESC'}, (err, results) => {
            next(null, results);
        });
    }

};

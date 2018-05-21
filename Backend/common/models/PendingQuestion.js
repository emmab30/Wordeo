'use strict';

const app = require('../../server/server');
var loopbackContext = require("loopback-context");

module.exports = function(PendingQuestion) {

    PendingQuestion.addPendingQuestion = addPendingQuestion;
    PendingQuestion.getMyPendingQuestions = getMyPendingQuestions;
    PendingQuestion.changeQuestionStatus = changeQuestionStatus;

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

    function changeQuestionStatus(data, next) {
        if(data.status == 'approve') {

            //Create question and options
            PendingQuestion.findOne({ where : { id : data.id }}, (err, result) => {

                app.models.Question.create({
                    question: result.question,
                    questionCategoryId: data.categoryId,
                    profitExp: data.profitExp,
                    createdAt: new Date(),
                    lastModifiedAt: new Date()
                }, (err, createdQuestion) => {
                    //Create options
                    var options = [result.option1, result.option2, result.option3, result.option4];
                    var promises = [];
                    for(var idx in options) {
                        promises.push(new Promise((resolve, reject) => {
                            const option = options[idx];
                            app.models.QuestionOption.create({
                                questionId: createdQuestion.id,
                                name: option,
                                profitExp: (idx == 0 ? data.profitExp : null),
                                isCorrect: (idx == 0 ? 1 : 0)
                            }, (err, createdOption) => {
                                resolve();
                            });
                        }));
                    }

                    Promise.all(promises).then((values) => {
                        if(result.accountId != null) {
                            app.models.QuestionCategory.findOne({ where : { id : data.categoryId }}, (err2, category) => {
                                if(!err2 && category) {
                                    app.models.Notification.send({
                                        userId: result.accountId,
                                        message: "¡Tu pregunta '" + result.question + "' ha sido aceptada dentro de la categoria " + category.name + "! Te otorgamos " + data.profitTuls + " tuls por tu voluntad. ¡Gracias!",
                                        category: 2,
                                        options: {
                                            buttons: [
                                                {id: "Delete", text: "Eliminar notificación"}
                                            ],
                                            data: {
                                                roomId: -1,
                                                date: new Date()
                                            }
                                        }
                                    }, (err, notification) => {
                                        result.isApproved = true;
                                        result.save();

                                        app.models.Profile.findOne({ where : { accountId : result.accountId } }, (err, profile) => {
                                            if(profile) {
                                                profile.balance_tuls = parseFloat(profile.balance_tuls) + parseFloat(data.profitTuls);
                                                profile.save();
                                            }

                                            next();
                                        });
                                    });
                                }
                            });
                        }
                    });
                })
            });

        } else if(data.status == 'reject') {

            PendingQuestion.findOne({ where : { id : data.id }}, (err, result) => {
                if(result.accountId != null) {
                    app.models.Notification.send({
                        userId: result.accountId,
                        message: "¡No hemos podido aceptar tu pregunta '" + result.question + "'. No consideramos que sea una pregunta adecuada. Recuerda que la respuesta correcta debe ir en primer lugar.",
                        category: 2,
                        options: {
                            buttons: [
                                {id: "Delete", text: "Eliminar notificación"}
                            ],
                            data: {
                                roomId: -1,
                                date: new Date()
                            }
                        }
                    }, (err, result) => {
                        next();
                    });
                }
            });

        }
    }

};

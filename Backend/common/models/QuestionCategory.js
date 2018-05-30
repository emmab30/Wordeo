'use strict';

const app = require('../../server/server');
const loopbackContext = require("loopback-context");
const log = require('fancy-log');

module.exports = function(QuestionCategory) {

    QuestionCategory.randomQuestions = getRandomQuestions;

    function getRandomQuestions(data, next) {

        var ctx = loopbackContext.getCurrentContext();
        // Get the current access token
        var accessToken = ctx && ctx.get('accessToken');
        if(accessToken != null && accessToken.userId > -1) {
            //Get random questions
            var dataSource = app.dataSources.mysql.connector;

            if(data.categoryId) { //Only fetch random question for just 1 category
                let query;
                if(data.desiredPoints) {
                    //query = "SELECT *, ABS(Question.profitExp - " + data.desiredPoints + ") as difference FROM Question WHERE questionCategoryId = " + data.categoryId + " ORDER BY difference LIMIT 1";
                    query = "SELECT Question.*, ABS(Question.profitExp - " + data.desiredPoints + ") as difference, count(RoomUserQuestion.id) as times " +
                        "FROM Question " +
                        "LEFT JOIN RoomUserQuestion ON RoomUserQuestion.questionId = Question.id AND RoomUserQuestion.userId = " + accessToken.userId + " " +
                        "WHERE Question.questionCategoryId = " + data.categoryId + " " +
                        "GROUP BY Question.question, Question.id " +
                        "ORDER BY times, difference " +
                        "LIMIT 1;"
                } else {
                    query = "SELECT * FROM Question WHERE questionCategoryId = " + data.categoryId + " ORDER BY RAND() LIMIT 1";
                }
                dataSource.query(query, (err1, questions) => {
                    if(questions && questions.length == 1) {
                        var question = questions[0];
                        const queryOptions = "SELECT * FROM QuestionOption WHERE questionId = " + question.id + " ORDER BY RAND()";
                        dataSource.query(queryOptions, (err2, options) => {
                            question.options = options;
                            next(null, question);
                        })
                    }
                });
            } else {
                QuestionCategory.find({}, (err, results) => {
                    var promises = new Array();
                    var promisesQuestions = new Array();
                    if(!err) {
                        for(const idx in results) {
                            const questionCat = results[idx];
                            promises.push(new Promise((resolve, reject) => {
                                const query = "SELECT * FROM Question WHERE questionCategoryId = " + questionCat.id + " ORDER BY RAND() LIMIT 1";
                                dataSource.query(query, (err1, questions) => {

                                    for(var idx1 in questions) {
                                        promisesQuestions.push(new Promise((resolve1, reject1) => {
                                            const question = questions[idx1];
                                            const queryOptions = "SELECT * FROM QuestionOption WHERE questionId = " + question.id + " ORDER BY RAND()";
                                            dataSource.query(queryOptions, (err2, options) => {
                                                var obj = Object.assign({}, question);
                                                obj.options = options;
                                                resolve1(obj);
                                            })
                                        }));
                                    }

                                    Promise.all(promisesQuestions).then((questions) => {
                                        if(questions.length > 0) {
                                            questionCat.questions = questions.filter((e) => { return e.questionCategoryId == questionCat.id });
                                        }
                                        resolve(questionCat);
                                    });
                                });
                            }));
                        }
                    }
                    Promise.all(promises).then((results) => {
                        next(null, results);
                    });
                })
            }
        }
    }
};

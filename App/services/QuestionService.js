import { ApiService } from './BaseService.js';
import { AsyncStorage } from 'react-native';

var QuestionService = {
    getCategories: function(data, success, error) {
        ApiService().get('/QuestionCategories', data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    getCategoriesWithRandomQuestions: function(data, success, error) {
        ApiService().post('/QuestionCategories/random_questions', data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    getRandomQuestionForCategory: function(data, success, error) {
        ApiService().post('/QuestionCategories/random_questions', data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    addQuestionToRevision: function(data, success, error) {
        ApiService().post('/PendingQuestions/add_pending_question', data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    getSentQuestions: function(data, success, error) {
        ApiService().get('/PendingQuestions/me')
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    },
    reportQuestion: function(data, success, error) {
        ApiService().post('/QuestionReports/create', data)
        .then(function (response) {
            success(response.data);
        })
        .catch(function (err) {
            error(err);
        });
    }
};

export { QuestionService as default };
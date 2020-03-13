import { Platform, AsyncStorage } from 'react-native';
import { ApiService } from './BaseService.js';
var _ = require('lodash');

//Localization
import { strings } from '../components/localization/strings'

GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest; //To debug requests in Chrome

var NewsService = {
    getNews: function(success, error){
        ApiService().get('/News/me')
        .then(function (response) {
            if(success) {
                success(response.data);
            }
        })
        .catch(function (err) {
            if(error) {
                error(err);
            }
        });
    },
    onTapNewsButton: function(data, success, error) {
        ApiService().post('/News/tap_button', data)
        .then(function (response) {
            if(success) {
                success(response.data);
            }
        })
        .catch(function (err) {
            if(error) {
                error(err);
            }
        });
    }
};

export { NewsService as default };
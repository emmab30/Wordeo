import { Platform, AsyncStorage } from 'react-native';
import { ApiService } from './BaseService.js';
var _ = require('lodash');

//Localization
import { strings } from '../components/localization/strings'

GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest; //To debug requests in Chrome

var RewardService = {
    getMyRewards: function(success, error){
        ApiService().get('/rewards/me')
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

export { RewardService as default };
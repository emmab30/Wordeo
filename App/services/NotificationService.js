import { Platform, AsyncStorage } from 'react-native';
import { ApiService } from './BaseService.js';
var _ = require('lodash');

//Localization
import { strings } from '../components/localization/strings'

GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest; //To debug requests in Chrome

var NotificationServiceQueue = {
    CATEGORIES: {
        INVITATION: 1,
        ADVERTISING: 2,
        MISC: 3
    },
    getNotifications: function(success, error){
        ApiService().get('/notifications/me')
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
    deleteNotificationById: function(id, success, error){
        ApiService().post('/notifications/deleteNotification', {notificationId : id})
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

export { NotificationServiceQueue as default };

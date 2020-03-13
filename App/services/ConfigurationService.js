import { ApiService } from './BaseService.js';
import { AsyncStorage, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

var ConfigurationService = {
    tulsRate: 0,
    getTulsRate: function(success, error){
        ApiService().get('/Configurations/findOne?filter=%7B%22where%22%3A%7B%22name%22%3A%22TULS_RATE%22%7D%7D')
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
    getUserStatistics: function(success, error) {
        ApiService().get('/Configurations/user_statistics')
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
    getLastVersion: function(success, error) {
        var data = {
            platform: Platform.OS,
            version: DeviceInfo.getReadableVersion()
        };
        ApiService().post('/Configurations/last_version', data)
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

export { ConfigurationService as default };
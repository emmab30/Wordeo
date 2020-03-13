import { ApiService } from './BaseService.js';
import { AsyncStorage } from 'react-native';

var ContactService = {
    send: function(data, success, error){
        ApiService().post('/Contacts/send', data)
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

export { ContactService as default };
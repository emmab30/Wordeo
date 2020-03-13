import { ApiService } from './BaseService.js';
import { AsyncStorage } from 'react-native';

var PreferencesService = {
    preferences: {},
    getPreferences: function() {
        return PreferencesService.preferences;
    },
    getPreferenceByKey: function(key, callback) {
        this.loadPreferences((value) => {
            if(callback)
                callback(value[key]);
        });
    },
    setPreferenceByKey: function(key, value, callback) {
        PreferencesService.savePreferenceKey(key, value, (newValue) => {
            if(callback)
                callback(newValue)
        });
    },
    loadPreferences : function(callback){
        AsyncStorage.getItem('preferences').then((value) => {
            let val = null;
            if(value == null) {
                val = {
                    soundEnabled: true,
                    showTutorial: true
                }
                AsyncStorage.setItem('preferences', JSON.stringify(val));
            } else {
                val = JSON.parse(value);
            }

            PreferencesService.preferences = val;
            if(callback)
                callback(val);
        });
    },
    savePreferenceKey: function (key, value, callback) {
        this.loadPreferences((json) => {
            json[key] = value;
            AsyncStorage.setItem('preferences', JSON.stringify(json));
            if(callback)
                callback(value);
        });
    }
};

export { PreferencesService as default };

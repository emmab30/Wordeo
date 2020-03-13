import { AsyncStorage } from 'react-native';
import Config from 'react-native-config'

const Helper = {
    isTelcelFlow: function() {
        return false;
        return Config.TELCEL_FLOW == 'true';
    },
    isDebugMode: function(){
        return Config.DEBUG_MODE == 'true';
    },
    isStaging: function(){
        return Config.API_URL != null && Config.API_URL.indexOf('megachat') > -1;
    },
    isProduction: function(){
        return Config.API_URL != null && Config.API_URL.indexOf('chat.openenglish.com:12003') > -1;
    },
    isAnalyticsEnabled: function(){
        return Config.ANALYTICS_ENABLED == 'true';
    },
    getPrototype: function(){
        return -1;
        var prototype = parseInt(Config.PROTOTYPE);
        return prototype;
    },
    isFirstLaunch: function(callback) {
        AsyncStorage.getItem('Launched').then((value) => {
            AsyncStorage.setItem('Launched', 'true');
            callback(value == null);
        });
    }
};

export default Helper;
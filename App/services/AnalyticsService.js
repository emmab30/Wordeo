import axios from 'axios';
import Config from 'react-native-config'
import Helper from '../components/common/Helper'
import firebase from 'react-native-firebase';
const FBSDK = require('react-native-fbsdk');
const {
  AppEventsLogger,
} = FBSDK;

var trackingId = 'UA-2777546-34'; //Open English key
//var trackingId= 'UA-105999562-1'; //Emma key for testing purposes

var AnalyticsService = {
    initialized: false,
    configure: function(){
        firebase.analytics().setAnalyticsCollectionEnabled(true);
        AnalyticsService.initialized = true;
    },
    setUser: function(userId){
        if(AnalyticsService.initialized && Helper.isAnalyticsEnabled()) {
            if(userId != null && userId.toString() != null) {
                console.log("[Firebase] Setting user ID for tracker " + userId);
                firebase.analytics().setUserId(userId.toString());
            }
        }
    },
    trackError: function(category, screen, error) {
        if(AnalyticsService.initialized && Helper.isAnalyticsEnabled()) {
            console.log("[Firebase] Tracking error " + category + " [screen="+ screen +", error="+error+"]");
            firebase.analytics().logEvent(category, {
                screen: screen,
                error: error
            })
        }
    },
    trackEvent: function(category, params, extraParams) {
        if(AnalyticsService.initialized && Helper.isAnalyticsEnabled()) {
            console.log("[Firebase] Tracking event " + category + " [action=" + params + "]");
            if(!params) {
                params = {};
            } else if(typeof params == 'string') {
                console.log("[Firebase] Tracking event " + category + " [action=" + params + "]")
                params = {
                    event: params
                }
            } else {
                console.log("[Firebase] Tracking event " + category + " [action=" + JSON.stringify(params) + "]")
            }

            firebase.analytics().logEvent(category, params)
            //AnalyticsService.tracker.trackEvent(category, action);
        }
    },
    trackScreenView: function(screenView) {
        if(AnalyticsService.initialized && Helper.isAnalyticsEnabled()) {
            console.log("[Firebase] Tracking view " + screenView);
            firebase.analytics().setCurrentScreen(screenView, screenView);
        }
    },
    trackInstallation: function() {
        if(Config.GLOBAL_POSTBACK_ENABLED == 'true' || Config.GLOBAL_POSTBACK_ENABLED == true) {
            var packageName = "com.openenglish.chatbyoe.silentinstall";
            var referrer = 'INSTALLATION';
            var url = "http://convs.appia.com/v2/installAd.jsp?packageName=" + packageName + "&referrer=" + referrer;

            axios.get(url).then(function(response) {
                //Do nothing
            }).catch(function(err) {
                //Do nothing
            })
        }
    },
    trackEventFacebook: function(event){
        if(Helper.isAnalyticsEnabled()) {
            AppEventsLogger.logEvent(event);
        }
    }
}

export { AnalyticsService as default };

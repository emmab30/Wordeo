/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  AsyncStorage,
  Dimensions,
  TouchableOpacity
} from 'react-native';

import Helper from './components/common/Helper'

/** Account **/
import Login from './screens/account/login';

/** Dashboard **/
import Home from './screens/dashboard/home';
import Shop from './screens/dashboard/shop';
import Round from './screens/dashboard/round';
import InRoundCategories from './screens/dashboard/in_round_categories';
import InRoundQuestion from './screens/dashboard/in_round_question';
import Profile from './screens/dashboard/profile';
import Ranking from './screens/dashboard/ranking'
import AddQuestion from './screens/dashboard/add_question'
import FacebookFriends from './screens/dashboard/facebook_friends'
import Contact from './screens/dashboard/contact'
import Demo from './screens/tutorial/demo'

import { Navigation } from 'react-native-navigation';
import { Global } from './components/common/global';
import { strings } from './components/localization/strings'

//Socket & analytics services
import { SocketService, AnalyticsService, NotificationService } from './services/Services'

//Plugins
import OneSignal from 'react-native-onesignal';

console.disableYellowBox = true;

registerScreens();

//Configure analytics
AnalyticsService.configure();

AsyncStorage.getItem('Language').then((value) => {
    if(value == 'es') {
        strings.setLanguage('es');
    } else {
        if(value == 'en') {
            strings.setLanguage('en');
        }
    }
}).done();

let initialScreen = Object.assign({}, Global.Screen.Login);
Navigation.startSingleScreenApp({
    screen: initialScreen,
    appStyle: {
        orientation: 'portrait'
    },
    passProps: {},
    animationType: 'slide-down'
});

export default class Wordeo extends Component {

    render() {
        return (
            <View style={styles.container}></View>
        );
    }
}

// register all screens of the app (including internal ones)
export function registerScreens() {
    //Wordeo
    Navigation.registerComponent('OpenEnglish.Login', () => Login);
    Navigation.registerComponent('OpenEnglish.Dashboard.Home', () => Home);
    Navigation.registerComponent('OpenEnglish.Dashboard.Shop', () => Shop);
    Navigation.registerComponent('OpenEnglish.Dashboard.Round', () => Round);
    Navigation.registerComponent('OpenEnglish.Dashboard.InRoundCategories', () => InRoundCategories);
    Navigation.registerComponent('OpenEnglish.Dashboard.InRoundQuestion', () => InRoundQuestion);
    Navigation.registerComponent('OpenEnglish.Dashboard.Profile', () => Profile);
    Navigation.registerComponent('OpenEnglish.Dashboard.Ranking', () => Ranking);
    Navigation.registerComponent('OpenEnglish.Dashboard.AddQuestion', () => AddQuestion);
    Navigation.registerComponent('OpenEnglish.Dashboard.Contact', () => Contact);
    Navigation.registerComponent('OpenEnglish.Dashboard.FacebookFriends', () => FacebookFriends);
    Navigation.registerComponent('OpenEnglish.Demo', () => Demo);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('OpenEnglish', () => OpenEnglish);

//Root navigator.
export var rootNavigator = null;
export var currentScreen = '';

if (!__DEV__) {
  console.log = () => {};
}
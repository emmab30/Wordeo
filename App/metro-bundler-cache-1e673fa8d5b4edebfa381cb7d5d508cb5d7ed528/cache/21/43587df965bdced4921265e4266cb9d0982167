
'use strict';

var LoginManager = require('react-native').NativeModules.FBLoginManager;


module.exports = {
  logInWithReadPermissions: function logInWithReadPermissions(permissions) {
    return LoginManager.logInWithReadPermissions(permissions);
  },
  logInWithPublishPermissions: function logInWithPublishPermissions(permissions) {
    return LoginManager.logInWithPublishPermissions(permissions);
  },
  getLoginBehavior: function getLoginBehavior() {
    return LoginManager.getLoginBehavior();
  },
  setLoginBehavior: function setLoginBehavior(loginBehavior) {
    LoginManager.setLoginBehavior(loginBehavior);
  },
  getDefaultAudience: function getDefaultAudience() {
    return LoginManager.getDefaultAudience();
  },
  setDefaultAudience: function setDefaultAudience(defaultAudience) {
    LoginManager.setDefaultAudience(defaultAudience);
  },
  logOut: function logOut() {
    LoginManager.logOut();
  }
};
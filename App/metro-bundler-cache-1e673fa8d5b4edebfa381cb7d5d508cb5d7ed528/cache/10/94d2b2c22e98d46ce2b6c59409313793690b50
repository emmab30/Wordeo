
'use strict';

var ShareApi = require('react-native').NativeModules.FBShareApi;
var ShareOpenGraphObject = require('./models/FBShareOpenGraphObject');

module.exports = {
  canShare: function canShare(shareContent) {
    return ShareApi.canShare(shareContent);
  },
  createOpenGraphObject: function createOpenGraphObject(openGraphObject) {
    return ShareApi.createOpenGraphObject(openGraphObject);
  },
  share: function share(shareContent, graphNode, message) {
    return ShareApi.share(shareContent, graphNode, message);
  }
};
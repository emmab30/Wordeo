
'use strict';

var ShareDialog = require('react-native').NativeModules.FBShareDialog;


module.exports = {
  canShow: function canShow(shareContent) {
    return ShareDialog.canShow(shareContent);
  },
  show: function show(shareContent) {
    return ShareDialog.show(shareContent);
  },
  setMode: function setMode(mode) {
    ShareDialog.setMode(mode);
  },
  setShouldFailOnDataError: function setShouldFailOnDataError(shouldFailOnDataError) {
    ShareDialog.setShouldFailOnDataError(shouldFailOnDataError);
  }
};
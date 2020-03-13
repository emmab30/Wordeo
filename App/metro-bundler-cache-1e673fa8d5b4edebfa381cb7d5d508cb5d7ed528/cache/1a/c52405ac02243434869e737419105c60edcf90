

'use strict';

var MessageDialog = require('react-native').NativeModules.FBMessageDialog;


module.exports = {
  canShow: function canShow(shareContent) {
    return MessageDialog.canShow(shareContent);
  },
  show: function show(shareContent) {
    return MessageDialog.show(shareContent);
  },
  setShouldFailOnDataError: function setShouldFailOnDataError(shouldFailOnDataError) {
    MessageDialog.setShouldFailOnDataError(shouldFailOnDataError);
  }
};
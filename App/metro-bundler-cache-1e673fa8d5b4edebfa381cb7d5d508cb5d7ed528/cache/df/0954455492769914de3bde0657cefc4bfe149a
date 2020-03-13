Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GoogleTagManager = exports.GoogleAnalyticsSettings = exports.GoogleAnalyticsTracker = undefined;

var _GoogleAnalyticsBackwardsCompability = require('./src/GoogleAnalyticsBackwardsCompability');

var _GoogleAnalyticsTracker = require('./src/GoogleAnalyticsTracker');

var _GoogleAnalyticsSettings = require('./src/GoogleAnalyticsSettings');

var _GoogleTagManager = require('./src/GoogleTagManager');

var _NativeBridges = require('./src/NativeBridges');

exports.GoogleAnalyticsTracker = _GoogleAnalyticsTracker.GoogleAnalyticsTracker;
exports.GoogleAnalyticsSettings = _GoogleAnalyticsSettings.GoogleAnalyticsSettings;
exports.GoogleTagManager = _GoogleTagManager.GoogleTagManager;
exports.default = new _GoogleAnalyticsBackwardsCompability.GoogleAnalyticsBackwardsCompability(_NativeBridges.GoogleAnalyticsBridge ? _NativeBridges.GoogleAnalyticsBridge.nativeTrackerId : null);
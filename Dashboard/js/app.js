// Default colors
var brandPrimary =  '#20a8d8';
var brandSuccess =  '#4dbd74';
var brandInfo =     '#63c2de';
var brandWarning =  '#f8cb00';
var brandDanger =   '#f86c6b';

var grayDark =      '#2a2c36';
var gray =          '#55595c';
var grayLight =     '#818a91';
var grayLighter =   '#d1d4d7';
var grayLightest =  '#f8f9fa';

angular
.module('app', [
    'app.factories',
    'ui.router',
    'oc.lazyLoad',
    'ncy-angular-breadcrumb',
    'angular-loading-bar',
    'ngResource',
    'angularMoment',
    'moment-picker',
    'ngSanitize',
    'ngCsv',
    'datatables',
    'daterangepicker'
])
.config(['cfpLoadingBarProvider', '$httpProvider', function(cfpLoadingBarProvider, $httpProvider) {
  cfpLoadingBarProvider.includeSpinner = false;
  cfpLoadingBarProvider.latencyThreshold = 1;

  $httpProvider.interceptors.push(function($q) {
      return {
          'request': function(config) {

              var session = window.localStorage.getItem('Authorization');
              if(session != undefined && session != 'undefined'){
                  session = JSON.parse(session);

                  if(session.session != null &&
                  session.session != 'undefined') {
                      config.headers['Authorization'] = session.session.id;
                  }
              }

              return config;
          }
      };
  });
}])
.run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams) {
  $rootScope.$on('$stateChangeSuccess',function(){
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  });
  $rootScope.$state = $state;
  return $rootScope.$stateParams = $stateParams;
}]);

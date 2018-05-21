//chart.js
angular
.module('app')
.controller('DashboardCtrl', DashboardCtrl)

DashboardCtrl.$inject = ['$scope', '$state'];
function DashboardCtrl($scope, $state) {
    var admin = window.localStorage.getItem('Authorization');
    admin = JSON.parse(admin);
    $scope.admin = admin.user;
}

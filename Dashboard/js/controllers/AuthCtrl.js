//chart.js
angular
.module('app')
.controller('AuthCtrl', AuthCtrl)

AuthCtrl.$inject = ['$scope', '$state', 'Account'];
function AuthCtrl($scope, $state, Account) {

    $scope.credentials = {
        email: '',
        password: ''
    };

    $scope.login = function(){
        Account.loginAdmin($scope.credentials, function(result) {
            window.localStorage.setItem('Authorization', JSON.stringify(result));
            $state.go('app.main');
        }, function(err) {
            alert("Authentication error.");
        })
    }

}

//main.js
angular
.module('app')
.controller('MainCtrl', MainCtrl);

MainCtrl.$inject = ['$scope', '$interval', 'Account'];
function MainCtrl($scope, $interval, Account) {

    updateStatistics();
    $scope.fetchingStatistics = $interval(function(){
        updateStatistics();
    }, 7500);

    $scope.$on('$destroy', function() {
        $interval.cancel($scope.fetchingStatistics);
    });

    function updateStatistics() {
        getActiveUsersCount();
    }

    function getActiveUsersCount() {
        var filter = {
            where: {
                isOnline: 1,
                isBot: 0
            }
        };
        Account.count(filter, function(result) {
            $scope.connectedStudents = result.count;
        });
    }
}

//chart.js
angular
.module('app')
.controller('PlayersCtrl', PlayersCtrl)

PlayersCtrl.$inject = ['$scope', '$state', '$q', 'Account', 'Reward', 'Profile'];
function PlayersCtrl($scope, $state, $q, Account, Reward, Profile) {

    $scope.isGivingReward = false;
    $scope.reward = {
        userId: null,
        profitExp: null,
        profitTuls: null,
        text: null,
        title: null
    };

    $scope.list = function(){
        var filter = {
            filter: {
                include: 'profile',
                where: {
                    isBot: false
                }
            }
        };
        Account.find(filter, (results, err) => {
            $scope.players = results;
        });
    }

    $scope.sendReward = function(){
        Reward.create($scope.reward, (reward, err) => {
            Profile.findOne({ filter : { where : { accountId : reward.userId }}}, (result) => {
                if(reward.profitExp > 0) {
                    result.experience_points = parseInt(result.experience_points) + parseInt(reward.profitExp)
                }
                if(reward.profitTuls > 0) {
                    result.balance_tuls = parseInt(result.balance_tuls) + parseInt(reward.profitTuls)
                }
                result.$save();

                alert("Tu premio se ha otorgado correctamente");
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            });
        });
    }

    $scope.giveReward = function(id) {
        $scope.reward.userId = id;
        $scope.isGivingReward = true;
    }

    //List all players
    $scope.list();
}

//chart.js
angular
.module('app')
.controller('BadgeCtrl', BadgeCtrl)

BadgeCtrl.$inject = ['$scope', '$state', '$q', 'Badge', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile'];
function BadgeCtrl($scope, $state, $q, Badge, DTOptionsBuilder, DTColumnBuilder, $compile) {

    var routeListBadges = $state.is('app.badges.list');
    var routeCreateBadge = $state.is('app.badges.add');
    var routeEditBadge = $state.is('app.badges.edit');

    $scope.queryTest = {
        userId: 0,
        query: ''
    };

    $scope.listBadges = function(){
        Badge.find({}, function(results, err) {
            $scope.badges = results;
        });
    }

    $scope.delete = function(id){
        let selectedBadge = $scope.badges.find((e) => { return e.id == id });
        if(selectedBadge != null) {
            if(!confirm('Are you sure you want to delete the badge ' + selectedBadge.name + '?'))
                return;

            Badge.deleteById({ id: selectedBadge.id }, function(result, err) {
                if(result && result.count > 0) {
                    $scope.listBadges();
                } else {
                    alert("Technical error. Contact to administrator.");
                }
            });
        } else {
            alert("Technical error. Contact to administrator.");
        }
    }

    $scope.edit = function(id) {
        $state.go('app.badges.edit', {id : id});
    }

    $scope.update = function() {
        Badge.updateAll({where: { id: $scope.badge.id } }, $scope.badge, function(result) {
            $state.go('app.badges.list')
        }, function(err) {
            alert(err.data.error.message)
        });
    }

    $scope.evaluateCondition = function() {
        var data = {
            userId: $scope.queryTest.userId,
            condition: $scope.badge.condition,
            replacements: $scope.badge.condition_replacements
        };
        Badge.evaluateCondition(data, function(err, results) {
            console.log(results);
            console.log(err);
        });
    }

    //Route specific functions
    if(routeListBadges) {
        $scope.listBadges();
    } else if(routeCreateBadge) {
        $scope.isCreating = true;
        $scope.badge = {
            name: '',
            image: '',
            created_at: new Date()
        };

        $scope.save = function(){
            Badge.create($scope.badge, function(results, err) {
                $state.go('app.badges.list');
            })
        }
    } else if(routeEditBadge) {
        let filter = {
            filter: {
                where: {
                    id: parseInt($state.params.id)
                }
            }
        }
        Badge.findOne(filter, function(result, err) {
            $scope.badge = result;
        });
    }
}
//chart.js
angular
.module('app')
.controller('TopicsCtrl', TopicsCtrl)

TopicsCtrl.$inject = ['$scope', '$state', '$q', 'Topic', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'DifficultyStage'];
function TopicsCtrl($scope, $state, $q, Topic, DTOptionsBuilder, DTColumnBuilder, $compile, DifficultyStage) {

    var routeListTopics = $state.is('app.topics.list');
    var routeCreateTopic = $state.is('app.topics.add');
    var routeEditTopic = $state.is('app.topics.edit');

    //Define datatable
    /* $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('createdRow', createdRow);
    $scope.dtColumns = [
        DTColumnBuilder.newColumn('id').notSortable().withTitle('ID'),
        DTColumnBuilder.newColumn('name').notSortable().withTitle('Name'),
        DTColumnBuilder.newColumn('image').notSortable().withTitle('Image').renderWith(function(data, type, full, meta) {
            return '<a href="' + full.image + '" target="_blank" style="max-width: 150px;"><img src="' + full.image + '" style="max-width: 150px;" /></a>'
        }),
        DTColumnBuilder.newColumn('actions').notSortable().withTitle('Actions').renderWith(function(data, type, full, meta) {
            let html = '<a ng-click="edit(' + full.id + ')" href="#">[ Edit ]</a>';
            html += '<a ng-click="delete(' + full.id + ')" href="#">[ Delete ]</a>';
            return html;
        })
    ];
    $scope.table = {
        dtInstance: null
    };

    function createdRow(row, data, dataIndex) {
        $compile(angular.element(row).contents())($scope);
    } */

    /** Common scope functions **/
    $scope.listTopics = function(){
        let filter = {
            filter: {
                include: 'difficultyStage'
            }
        }
        Topic.find(filter, function(results, err) {
            $scope.topics = results;
        });
    }

    $scope.delete = function(id){
        let selectedTopic = $scope.topics.find((e) => { return e.id == id });
        if(selectedTopic != null) {
            if(!confirm('Are you sure you want to delete the topic ' + selectedTopic.name + '?'))
                return;

            Topic.deleteById({ id: selectedTopic.id }, function(result, err) {
                if(result && result.count > 0) {
                    $scope.listTopics();
                } else {
                    alert("Technical error. Contact to administrator.");
                }
            });
        } else {
            alert("Technical error. Contact to administrator.");
        }
    }

    $scope.edit = function(id) {
        $state.go('app.topics.edit', {id : id});
    }

    $scope.update = function() {
        Topic.updateAll({where: { id: $scope.topic.id } }, $scope.topic, function(result) {
            $state.go('app.topics.list')
        }, function(err) {
            alert(err.data.error.message)
        });
    }

    //Route specific functions
    if(routeListTopics) {
        $scope.listTopics();
    } else if(routeCreateTopic) {
        $scope.isCreating = true;
        $scope.topic = {
            name: '',
            description: '',
            image: '',
            created_at: new Date()
        };

        //Get difficulty stages
        DifficultyStage.find({}, function(results, err) {
            $scope.difficultyStages = results;
        });

        $scope.save = function(){
            Topic.create($scope.topic, function(results) {
                $state.go('app.topics.list');
            }, function(err) {
                alert(err.data.error.message)
            })
        }
    } else if(routeEditTopic) {
        let filter = {
            filter: {
                where: {
                    id: parseInt($state.params.id)
                }
            }
        }

        //Get difficulty stages
        DifficultyStage.find({}, function(results, err) {
            $scope.difficultyStages = results;
        });

        Topic.findOne(filter, function(result, err) {
            $scope.topic = result;
        });
    }
}
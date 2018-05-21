//chart.js
angular
.module('app')
.controller('ConfigurationCtrl', ConfigurationCtrl)

ConfigurationCtrl.$inject = ['$scope', '$state', '$q', 'Configuration'];
function ConfigurationCtrl($scope, $state, $q, Configuration) {

    $scope.configuration = {
        MAX_STUDENTS_PER_TEACHER: 0,
        INACTIVITY_TIME_STUDENT_GO_IDLE: 0,
        WELCOME_MESSAGE_STUDENT: ''
    };

    //Fetch configuration. If exists, set it.
    Configuration.find({}, function(params){
        for(var idx in params) {
            if(params[idx].name !== undefined) {
                if(!isNaN(params[idx].value)) {
                    $scope.configuration[params[idx].name] = parseInt(params[idx].value);
                } else {
                    $scope.configuration[params[idx].name] = params[idx].value;
                }
            }

            if(params[idx].name == 'TEACHER_GENDERS_TABLE' && params[idx].value != null) {
                console.log("Analyzing genders..");
                var lines = params[idx].value.split('\n');
                for(var i=0; i < lines.length; i++) {
                    console.log(lines[i]);
                }
            }
        }
    });

    $scope.save = function(){
        var promises = new Array();
        for(var idx in $scope.configuration) {
            var d = $q.defer();

            var where = {
                where: {
                    name: idx
                }
            }
            d.resolve(Configuration.upsertWithWhere(where, {value: $scope.configuration[idx]}));

            promises.push(d.promise);
        }

        $q.all(promises).then(function(data) {
            $scope.success = true;
        });
    }

}

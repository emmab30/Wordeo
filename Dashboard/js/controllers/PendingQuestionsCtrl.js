//chart.js
angular
.module('app')
.controller('PendingQuestionsCtrl', PendingQuestionsCtrl)

PendingQuestionsCtrl.$inject = ['$scope', '$state', '$q', 'PendingQuestion', 'Account', 'QuestionCategory'];
function PendingQuestionsCtrl($scope, $state, $q, PendingQuestion, Account, QuestionCategory) {

    $scope.isApproving = false;
    $scope.approvement = {
        id: -1,
        categoryId: 1,
        profitTuls: 10,
        profitExp: 50
    };

    $scope.list = function(){
        var filter = {
            filter: {
                where: {
                    isApproved: false
                }
            }
        };
        QuestionCategory.find({}, (results, err) => {
            $scope.categories = results;
        });

        PendingQuestion.find(filter, (results, err) => {
            $scope.pendingQuestions = results;
        });
    }

    $scope.sendApprovement = function() {
        if($scope.approvement.profitTuls == null) {
            alert("Debes colocar los tuls de ganancia para darle al usuario.");
            return;
        } else if($scope.approvement.id <= 0) {
            alert("Debes seleccionar la pregunta");
            return;
        }

        PendingQuestion.changeQuestionStatus({
            id : $scope.approvement.id,
            profitTuls: $scope.approvement.profitTuls,
            profitExp: $scope.approvement.profitExp,
            status: 'approve',
            categoryId: $scope.approvement.categoryId
        }, function(result, err) {
            window.location.reload();
        });
    }

    $scope.approve = function(id) {
        $scope.isApproving = true;
        $scope.approvement.id = id;
    }

    $scope.reject = function(id) {
        $scope.isApproving = false;
        PendingQuestion.changeQuestionStatus({ id : id, status: 'reject' }, function(result, err) {
            window.location.reload();
        });
    }

    //List all pending questions
    $scope.list();
}

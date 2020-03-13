//chart.js
angular
.module('app')
.controller('NewsCtrl', NewsCtrl)

NewsCtrl.$inject = ['$scope', '$state', '$q', 'Account', 'News', 'NewsUser'];
function NewsCtrl($scope, $state, $q, Account, News, NewsUser) {

    $scope.list = function(){
        var filter = {};
        News.find({}, (results, err) => {

            var promises = [];
            for(var idx in results) {
                let result = results[idx];
                promises.push(new Promise((resolve, reject) => {
                    var json = '{}';
                    try {
                        json = JSON.parse(result.payload.replace(/[\n\r]+/g, ''));
                    } catch(e) {}
                    result.payload = json;

                    NewsUser.count({ where : { newsId : result.id }}, (count) => {
                        result.viewBy = count.count;
                        resolve(result);
                    })
                }));
            }

            Promise.all(promises).then((values) => {
                var items = [];
                for(var idx in values) {
                    if(Array.isArray(values) && values[idx] != true)
                        items.push(values[idx]);
                }
                $scope.news = items;
            });
        });
    }

    //List all pending questions
    $scope.list();
}

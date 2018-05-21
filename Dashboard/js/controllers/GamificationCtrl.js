//chart.js
angular
.module('app')
.controller('GamificationCtrl', GamificationCtrl)

GamificationCtrl.$inject = ['$scope', '$state', '$stateParams', '$q', 'moment', 'AppUser', 'Admin', 'Notification', 'FilterFactory', 'ReportFactory', 'Chat', 'BaseService', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'Report', 'Reward', 'UserBadge', 'Badge', 'UserDailyTime'];
function GamificationCtrl($scope, $state, $stateParams, $q, moment, AppUser, Admin, Notification, FilterFactory, ReportFactory, Chat, BaseService, DTOptionsBuilder, DTColumnBuilder, $compile, Report, Reward, UserBadge, Badge, UserDailyTime) {

    var routeGamificationIndex = $state.is('app.gamification.index');
    var routeReportsStudents = $state.is('app.students.reports');
    var routeViewChat = $state.is('app.students.view_chat');
    var routeSendPushNotification = $state.is('app.students.send_push_notification');
    var routeListingScheduledNotifications = $state.is('app.students.scheduled');

    if(routeGamificationIndex) {
        $scope.dtOptions = { paging: false, searching: false, bInfo : false };
        $scope.students = [];
        $scope.today = moment().format('YYYY-MM-DD').toString()
        $scope.pagesNumber = 0;

        $scope.pagination = {};
        $scope.filters = {
            page: 0,
            rowsLimit: 10,
            pattern: null
        };

        $scope.getPagination = function(){
            var pagination = {
                currentPage: $scope.filters.page,
                totalPages : $scope.pagesNumber,
            };

            var pages = [];
            var min, max;

            if($scope.filters.page < 3) {
                min = 0;
                max = 4;
            } else if($scope.filters.page > 3) {
                min = $scope.filters.page - 2;
                max = $scope.filters.page + 2;
            }

            for(var i=min; i < max; i++) {
                pages.push(i);
            }
            pagination.pages = pages;
            $scope.pagination = pagination;
        }
        $scope.getPagination();

        $scope.goToPage = function(page){
            $scope.filters.page = page;
            $scope.reloadData();
        }

        $scope.reloadData = function(){
            Badge.find({}, function(badges) {
                $scope.badges = badges;

                let filter = {
                    filter : {
                        limit: $scope.filters.rowsLimit,
                        offset: ($scope.filters.page * $scope.filters.rowsLimit),
                        where: {
                            id: { neq : 1 }
                        }
                    }
                };

                if($scope.filters.pattern != null) {
                    filter.filter.where.or = [
                        { email : { like: '%' + $scope.filters.pattern + '%' } },
                        { name : { like: '%' + $scope.filters.pattern + '%' } },
                        { lastname : { like: '%' + $scope.filters.pattern + '%' } },
                        { id : { like: '%' + $scope.filters.pattern + '%' } }
                    ];
                }

                AppUser.find(filter, function(results) {
                    //Find points for every user
                    let promises = [];

                    for(var idx in results) {
                        const student = results[idx];
                        if(student.id != undefined) {
                            promises.push(new Promise(function(resolve, reject) {
                                //Search for points
                                Reward.find({ filter : { where: { user_id: student.id } }}, function(reward, err) {
                                    var points = reward.reduce(function(last, d) {return d.points + last},0);
                                    student.points = points;

                                    //Search for badges
                                    UserBadge.find({ filter : { where : { userId : student.id }} }, function(badges, err) {
                                        //student.badges = badges;
                                        if(badges.length > 0) {
                                            let ids = badges.map((e) => { return e.badgeId });
                                            student.badges = $scope.badges.filter((e) => {
                                                return ids.indexOf(e.id) > -1;
                                            });
                                        }

                                        //Get spent time today
                                        UserDailyTime.find({ filter: { where : { userId : student.id, date: moment().format('YYYY-MM-DD').toString() }}}, function(userDaily, err) {
                                            if(userDaily != null && userDaily.length > 0) {
                                                userDaily = userDaily[0];
                                                student.daily = userDaily;
                                                student.dailyInMinutes = parseInt(userDaily.timeInSeconds / 60);
                                            }
                                            resolve(student);
                                        })
                                    })
                                });
                            }));
                        }
                    }

                    Promise.all(promises).then((results) => {
                        $scope.students = results;
                    })
                });
            })
        }
        $scope.reloadData();

        $scope.filter = function(data) {
            $scope.reloadData();
        }
    }
}
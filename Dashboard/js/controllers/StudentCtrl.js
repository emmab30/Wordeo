//chart.js
angular
.module('app')
.controller('StudentCtrl', StudentCtrl)

StudentCtrl.$inject = ['$scope', '$state', '$stateParams', '$q', 'moment', 'AppUser', 'Admin', 'Notification', 'FilterFactory', 'ReportFactory', 'Chat', 'BaseService', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'Report', 'Reward'];
function StudentCtrl($scope, $state, $stateParams, $q, moment, AppUser, Admin, Notification, FilterFactory, ReportFactory, Chat, BaseService, DTOptionsBuilder, DTColumnBuilder, $compile, Report, Reward) {

    var routeListStudents = $state.is('app.students.list');
    var routeReportsStudents = $state.is('app.students.reports');
    var routeViewChat = $state.is('app.students.view_chat');
    var routeSendPushNotification = $state.is('app.students.send_push_notification');
    var routeListingScheduledNotifications = $state.is('app.students.scheduled');

    if(routeListStudents) {

        //Define filters for Listing
        $scope.statuses = FilterFactory.getStatuses();
        //$scope.memberships = FilterFactory.getMemberships();
        $scope.memberships = [];
        $scope.blockedUnblockedStatus = FilterFactory.getBlockedUnblockedStatus();
        $scope.currentPage = 1;
        $scope.totalStudents = 0;
        $scope.showModalDetails = false;
        $scope.showModalReportUser = false;
        $scope.reportUserText = {
            text: ''
        };
        $scope.filters = {
            status: $scope.statuses.All,
            pattern: null,
            membership: $scope.memberships.All,
            blockedUnblockedStatus: $scope.blockedUnblockedStatus.All,
            creationDate: {
                from: null,
                to: null
            }
        };
        $scope.order = {
            sign: '-',
            field: 'status',
            getOrder: function(){
                return $scope.order.sign + $scope.order.field;
            }
        };
        $scope.pagination = null;
        $scope.selectedStudents = [];

        $scope.getStudents = function(){

            var filters = {
                status: $scope.filters.status.id,
                pattern: $scope.filters.pattern,
                currentPage: $scope.currentPage
            };

            Admin.getStudents({filter: filters}, function(result, err) {
                $scope.pagination = result.pagination;
                $scope.students = result.users;

                for(var key in $scope.students) {
                    if($scope.students[key].created_at != null && $scope.students[key].created_at != '') {
                        $scope.students[key].created_at = moment($scope.students[key].created_at).format('MM/DD/YYYY H:mm');
                        if($scope.students[key].lastInteractionDate != null) {
                            $scope.students[key].lastInteractionDate = moment($scope.students[key].lastInteractionDate).format('MM/DD/YYYY H:mm');
                        }

                        if($scope.students[key].lastLogin != null) {
                            $scope.students[key].lastLogin = moment($scope.students[key].lastLogin).format('MM/DD/YYYY H:mm');
                        }
                    }
                }

                $scope.filtering = $scope.students;
            });
        }

        var filter = {
            filter: {
                where: {
                    id: 7086
                }
            }
        }

        AppUser.findOne(filter, function(result) {
            console.log(result);
        });

        /** Data range picker */
        $scope.date = {
            startDate: moment('2017-01-01'),
            endDate: moment()
        };
        $scope.opts = {
            locale: {
                applyClass: 'btn-green',
                applyLabel: "Použít",
                fromLabel: "Od",
                toLabel: "Do",
                cancelLabel: 'Zrušit',
                customRangeLabel: 'Vlastní rozsah',
                daysOfWeek: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'],
                firstDay: 1,
                monthNames: ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září',
                    'Říjen', 'Listopad', 'Prosinec'
                ]
            },
            ranges: {
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()]
            }
        };
        $scope.setStartDate = function () {
            $scope.date.startDate = moment().subtract(4, "days");
        };
        $scope.setRange = function () {
            $scope.date = {
                startDate: moment().subtract(5, "days"),
                endDate: moment()
            };
        };
        //Watch for date changes
        $scope.$watch('date', function(newDate) {
            $scope.filters.creationDate.from = newDate.startDate.format('YYYY-MM-DD') + 'T00:00:00.000Z',
            $scope.filters.creationDate.to = newDate.endDate.format('YYYY-MM-DD') + 'T23:59:59.000Z'

            if($scope.dtInstance != null) {
                $scope.dtInstance.reloadData();
            }
        }, false);

        //Client side filtering (to mantain the checkbox selection states.)
        $scope.filter = function(){

            $scope.dtInstance.reloadData();

            /** $scope.filtering = $scope.students;

            if($scope.filters.status.id > -1) {
                $scope.filtering = $scope.filtering.filter(function(e) { return e.status == $scope.filters.status.id});
            }

            if($scope.filters.membership.id > -1) {
                if($scope.filters.membership.id == $scope.memberships.Expired.id) {
                    $scope.filtering = $scope.filtering.filter(function(e) { return e.subscription.code == 0 });
                } else if($scope.filters.membership.id == $scope.memberships.FreeTrial.id) {
                    $scope.filtering = $scope.filtering.filter(function(e) { return e.subscription.code == 1 && e.subscription.message.freeTrialPeriod });
                } else if($scope.filters.membership.id == $scope.memberships.Premium.id) {
                    $scope.filtering = $scope.filtering.filter(function(e) { return e.subscription.code == 1 && !e.subscription.message.freeTrialPeriod });
                }
            }

            if($scope.filters.blockedUnblockedStatus.id > -1) {
                if($scope.filters.blockedUnblockedStatus.id == $scope.blockedUnblockedStatus.Blocked.id) {
                    $scope.filtering = $scope.filtering.filter(function(e) { return e.isBlocked });
                } else if($scope.filters.blockedUnblockedStatus.id == $scope.blockedUnblockedStatus.Unblocked.id) {
                    $scope.filtering = $scope.filtering.filter(function(e) { return !e.isBlocked });
                }
            }

            if($scope.filters.pattern != null) {
                $scope.filtering = $scope.filtering.filter(function(e) {
                    var pattern = $scope.filters.pattern.toLowerCase();
                    return (e.name.toLowerCase().indexOf(pattern) > -1 ||
                        e.email.toLowerCase().indexOf(pattern) > -1 ||
                        e.lastname.toLowerCase().indexOf(pattern) > -1);
                });
            } **/
        }

        $scope.selectStudent = function(id){

            var student = $scope.students.find(function(e) {
                return e.id == id;
            });
            if(student == null || student == undefined) {
                student = $scope.selectedStudents.find(function(e) {
                    return e.id == id;
                });
            }

            if($scope.selectedStudents.find(function(e) { return e.id == student.id })) {
                var toDelete = $scope.selectedStudents.find(function(e) { return e.id == student.id });
                $scope.selectedStudents.splice($scope.selectedStudents.indexOf(toDelete), 1);
            } else {
                $scope.selectedStudents.push(student);
            }
        }

        $scope.isCheckedStudent = function(id) {
            if($scope.selectedStudents != null && $scope.selectedStudents.length > 0) {
                var student = $scope.selectedStudents.find(function(e) {
                    return e.id == id;
                });

                return student != null && student != undefined;
            }

            return false;
        }

        $scope.selectAllStudents = function(){

            var filter = {
                filter: {
                    where: {
                        not: {
                            email: 'admin@admin.com',
                        }
                    }
                }
            };
            if(!$scope.selectedAll) {
                /** $scope.selectedAll = true;
                $scope.selectedStudents = Object.assign([], $scope.filtering); **/

                AppUser.find(filter, function(results, err) {
                    $scope.selectedAll = true;
                    $scope.selectedStudents = results;
                    $scope.$applyAsync();
                    $scope.dtInstance.reloadData();
                });
            } else {
                $scope.selectedAll = false;
                $scope.selectedStudents = [];
            }

            $scope.dtInstance.reloadData();
        }

        $scope.orderBy = function(field) {
            $scope.order.sign = ($scope.order.sign == '-' ? '+' : '-');
            $scope.order.field = field;
        }

        $scope.sendMultiplePushNotification = function(){
            var ids = $scope.selectedStudents.map(function(e) { return e.id });
            $state.go('app.students.send_push_notification', {id: ids.join('-').toString()});
        }

        $scope.formatDate = function(date) {
            return moment(date).format('MM/DD/YYYY hh:mm a');
        }

        $scope.exportToCSV = function(){

            //Delete certain fields from the student
            var students = [];
            for(var idx in $scope.selectedStudents){
                var student = $scope.selectedStudents[idx];
                //delete student.country;
                delete student.subscription;
                delete student.room;
                delete student.roomId;
                delete student.teacherId;
                delete student.referralCode;
                delete student.status;
                delete student.userStatus;
                delete student.socketSessionId;
                delete student.realm;
                delete student.username;
                delete student.emailVerified;
                delete student.$$hashKey;
                delete student.level;

                students.push(student);
            }

            var args = {
                data: students,
                columnDelimiter: ';'
            };

            var csv = ReportFactory.generateCSV(args);

            if (csv == null) return;
            filename = args.filename || 'export.csv';

            /* if (!csv.match(/^data:text\/csv/i)) {
                csv = 'data:text/csv;charset=utf-8,' + csv;
            } */
            //data = encodeURI(csv);
            csvData = new Blob([csv], { type: 'text/csv' });
            var csvUrl = URL.createObjectURL(csvData);
            window.open(csvUrl);
            //a.href =  csvUrl;
            /* console.log(data);
            console.log(filename);

            link = document.createElement('a');
            link.setAttribute('href', data);
            link.setAttribute('download', filename);
            setTimeout(() => {
                link.click();
            }, 5000); */
        }

        $scope.viewStudentDetails = function(id) {
            $scope.student = $scope.students.find(function(e) {
                return e.id == id;
            });

            Reward.getTotalPointsForUser({ userId : id }, function(result, err) {
                if(result && result.message != null) {
                    $scope.student.points = result.message.total_points;
                }
            })

            $scope.showModalDetails = true;

            //Get report details
            var filter = {
                filter: {
                    where: {
                        userToId: $scope.student.id
                    }
                }
            };
            Report.find(filter, function(results, err) {
                if(results != null && results.length > 0) {
                    $scope.student.reports = results;
                }
            })
        }

        $scope.openReportUser = function(id) {
            var student = $scope.students.find(function(e) {
                return e.id == id;
            });

            $scope.student = student;
            $scope.showModalReportUser = true;
        }

        $scope.submitReportUser = function(){
            Report.create({userFromId: -1, userToId: $scope.student.id, reasonId: -1, extraData: $scope.reportUserText.text}, function(result, err) {
                if(result) {
                    $scope.reportUserText.text = '';
                    $scope.showModalReportUser = false;
                    alert("Report generated with success for " + $scope.student.email);
                    $scope.student = null;
                } else {
                    alert("Error creating the report for the user " + $scope.student.email);
                }
            })
        }

        $scope.blockUnblock = function(id) {
            var student = $scope.students.find(function(e) {
                return e.id == id;
            });

            if(student.isBlocked) {
                AppUser.unblock({id: student.id}, function(err, res){
                    student.isBlocked = !student.isBlocked;
                    $scope.dtInstance.reloadData()
                });
            } else {
                AppUser.block({id: student.id}, function(err, res) {
                    student.isBlocked = !student.isBlocked;
                    $scope.dtInstance.reloadData()
                });
            }
        }

        $scope.removeStudent = function(id) {
            var filter = {
                filter: {
                    where: {
                        id: id
                    }
                }
            };
            AppUser.findOne(filter, function(result, err) {
                var prompt = window.confirm('Are you sure you want to remove the account for ' + result.email + '?');
                if(prompt) {
                    AppUser.deleteById({id: id}, function(err, results) {
                        //Delete all the information from the user
                        $scope.dtInstance.reloadData();
                    })
                }
            });
        }

        /** Sorting criteria for datatable **/
        $scope.dtInstance = null;
        $.fn.dataTable.ext.order['dom-span'] = function  ( settings, col ) {
            return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
                return $('span', td).text();
            })
        }

        $scope.dtColumns = [
            DTColumnBuilder
                .newColumn('id')
                .notSortable()
                .withTitle('#')
                .renderWith(function(data, type, full, meta) {
                    var selectedStudent = $scope.selectedStudents.filter(function(e) {
                        return e.id == full.id;
                    });

                    if(selectedStudent.length > 0 || $scope.selectedAll) {
                        return '<input type="checkbox" ng-click="selectStudent(' + full.id + ')" checked>';
                    }

                    return '<input type="checkbox" ng-checked="isCheckedStudent(' + full.id + ')" ng-click="selectStudent(' + full.id + ')">';
                }),
            DTColumnBuilder
                .newColumn('id')
                .withTitle('ID'),
            DTColumnBuilder
                .newColumn('name')
                .withTitle('Name'),
            DTColumnBuilder
                .newColumn('email')
                .withTitle('Email'),
            /** DTColumnBuilder
                .newColumn('id')
                .withTitle('Membership')
                .withOption('orderDataType', 'dom-span')
                .renderWith(function(data, type, full, meta) {
                    var html = '';
                    if(full.subscription.code == 1 && !full.subscription.message.freeTrialPeriod) {
                        html = '<span class="badge badge-success">Premium</span>';
                    } else if(full.subscription.code == 1 && full.subscription.message.freeTrialPeriod) {
                        html = '<span class="badge badge-primary">Free Trial</span>';
                    } else if(full.subscription.code == 0) {
                        html = '<span class="badge badge-light">Expired</span>';
                    }

                    return html;
                }), **/
            DTColumnBuilder
                .newColumn('status')
                .withTitle('Status')
                .withOption('orderDataType', 'dom-span')
                .renderWith(function(data, type, full, meta) {
                    var html = '';
                    if(data == 1) {
                        html = '<span class="badge badge-success">Online</span>';
                    } else {
                        html = '<span class="badge badge-light">Offline</span>';
                    }

                    if(full.isBlocked) {
                        html += '<span class="badge badge-danger">Blocked</span>';
                    }

                    return html;
                }),
            DTColumnBuilder
                .newColumn('created_at')
                .withTitle('Creation date')
                .renderWith(function(data, type, full, meta) {
                    return $scope.formatDate(data);
                }),
            DTColumnBuilder
                .newColumn('lastInteractionDate')
                .withTitle('Last interaction date')
                .renderWith(function(data, type, full, meta) {
                    if(data != '-') {
                        return $scope.formatDate(data);
                    }
                    return '-';
                }),
            DTColumnBuilder
                .newColumn('lastLogin')
                .withTitle('Last login')
                .renderWith(function(data, type, full, meta) {
                    if(data != null) {
                        return $scope.formatDate(data);
                    }
                    return '-';
                }),
            DTColumnBuilder
                .newColumn('appReferrer')
                .withTitle('Bundle'),
            DTColumnBuilder
                .newColumn('platform')
                .withTitle('Platform')
                .renderWith(function(data, type, full, meta) {
                    if(data == null || data == '') {
                        //return '<span class="badge badge-danger">No detected</span>';
                        return 'android';
                    }

                    return data;
                }),
            DTColumnBuilder
                .newColumn('id')
                .withTitle('Quick actions')
                .notSortable()
                .renderWith(function(data, type, full, meta) {
                    var html = '';
                    if(full.notificationId != null && full.notificationId != '') {
                        html += '<a ui-sref="app.students.send_push_notification({id: ' + full.id + '})" href="#">[Send Push Notification]&nbsp;&nbsp;</a>';
                    }

                    html += '<a ng-click="openReportUser(' + full.id + ')" href="#">[Report user]&nbsp;&nbsp;</a>';
                    html += '<a ng-click="viewStudentDetails(' + full.id + ')" href="#">[Full details]&nbsp;&nbsp;</a>';

                    if(full.isBlocked) {
                        html += '<a ng-click="blockUnblock(' + full.id + ')" href="#">[Unblock]&nbsp;&nbsp;</a>';
                    } else {
                        html += '<a ng-click="blockUnblock(' + full.id + ')" href="#">[Block]&nbsp;&nbsp;</a>';
                    }

                    html += '<a style="color: red;" ng-click="removeStudent(' + full.id + ')" href="#">[Remove user]&nbsp;&nbsp;</a>';
                    return html;
                }),
        ];

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
                url: BaseService.apiUrl() + '/admin/students/get',
                type: 'POST',
                data: function(e){
                    if($scope.filters.blockedUnblockedStatus.id > -1) {
                        if($scope.filters.blockedUnblockedStatus.id == $scope.blockedUnblockedStatus.Blocked.id) {
                            e.onlyBlocked = true;
                        } else {
                            e.onlyActives = true;
                        }
                    }

                    if($scope.filters.status.id > -1) {
                        e.filterByStatus = $scope.filters.status.id;
                    }

                    if($scope.filters.creationDate != null) {
                        if($scope.filters.creationDate.from != null && $scope.filters.creationDate.to != null) {
                            e.creationDate = {
                                from: $scope.filters.creationDate.from,
                                to: $scope.filters.creationDate.to,
                            }
                        }
                    }

                    return e;
                },
                complete: function(d, e) {
                    if(e == 'success') {
                        var data = d.responseJSON.data;
                        $scope.totalStudents = d.responseJSON.recordsFiltered;
                        $scope.students = data;
                        $scope.$applyAsync();
                    }
                }
            })
            .withDataProp('data')
            .withOption('serverSide', true)
            .withOption('processing', true)
            .withOption('createdRow', createdRow)
            .withPaginationType('full_numbers');

        function createdRow(row, data, dataIndex) {
            // Recompiling so we can bind Angular directive to the DT
            $compile(angular.element(row).contents())($scope);
        }

    } else if(routeSendPushNotification) {

        $scope.notification = {
            message: '',
            scheduled: false,
            scheduled_at: null
        };

        $scope.sendingMultiples = $stateParams.id.toString().split('-').length > 1;

        if($scope.sendingMultiples) {
            var ids = $stateParams.id.toString().split('-');
            for(var idx in ids) {
                var filter = {
                    filter: {
                        where: {
                            id: {
                                inq: ids
                            }
                        }
                    }
                };
                AppUser.find(filter, function(result) {
                    $scope.students = result;
                });
            }
        } else {
            getUserById($stateParams.id, function(user) {
                $scope.students = [user];
            });
        }

        $scope.sendPushNotification = function(){
            var promises = new Array();
            var d = $q.defer();

            $scope.statusMessage = {
                show: true,
                done: false,
                text: 'Sending notifications..'
            };

            for(var idx in $scope.students) {
                //Send push notification
                var data = {
                    userId: $scope.students[idx].id,
                    message: $scope.notification.message,
                    scheduled: $scope.notification.scheduled,
                    scheduled_at: ($scope.notification.scheduled && $scope.notification.scheduled_at != null) ? $scope.notification.scheduled_at : null
                };

                d.resolve(Notification.send(data));

                promises.push(d.promise);
            }

            $q.all(promises).then(function(data) {
                $scope.statusMessage.done = true;
                $scope.statusMessage.text = 'Done!';
                $scope.$applyAsync();
            })
        }
    } else if(routeListingScheduledNotifications) {

        //Filter by scheduled notifications.
        var filter = {
            filter: {
                where: {
                    is_scheduled: true,
                    scheduled_at: {
                        gt: new Date().getTime()
                    }
                },
                include: 'user',
                order: ['scheduled_at DESC']
            }
        };

        $scope.getScheduled = function(){
            Notification.find(filter, function(notifications) {
                $scope.notifications = notifications;
                for(var idx in $scope.notifications) {
                    $scope.notifications[idx].scheduled_at = moment($scope.notifications[idx].scheduled_at);

                    $scope.notifications[idx].diffDays = moment($scope.notifications[idx].scheduled_at).diff(moment(), 'days');
                    $scope.notifications[idx].diffHours = moment($scope.notifications[idx].scheduled_at).diff(moment(), 'hours');
                    $scope.notifications[idx].diffMinutes = moment($scope.notifications[idx].scheduled_at).diff(moment(), 'minutes');
                }
            });
        }
        $scope.getScheduled();

        $scope.cancel = function(notification) {
            Notification.cancel({id: notification.id}, function(result) {
                if(result.code == 200) {
                    $scope.getScheduled();
                }
            })
        }
    } else if(routeViewChat) {
        getUserById($stateParams.id, function(user) {
            $scope.student = user;
            $scope.getChats();
        });

        $scope.getChats = function(){
            //Get messages for student
            var filter = {
                filter: {
                    where: {
                        roomId: $scope.student.roomId
                    },
                    include: 'user',
                    order: 'created ASC'
                }
            };
            Chat.find(filter, function(results, err) {
                $scope.messages = results;

                setTimeout(function(){
                    $("#chat-zone").animate({ scrollTop: $('#chat-zone')[0].scrollHeight}, 1000);
                }, 1500);
            })
        }

        $scope.refresh = function(){
            $scope.getChats();
        }

        $scope.formatDate = function(date) {
            return moment(date).format('M/D/YYYY hh:mm a');
        }

        $scope.apiUrl = BaseService.apiUrl();
    } else if(routeReportsStudents) {

        var filters = {
            status: -1,
            pattern: '',
            currentPage: -1
        };

        Admin.getStudents({filter: filters}, function(result, err) {
            $scope.pagination = result.pagination;
            $scope.students = result.users;
            $scope.filtering = $scope.students;

            $scope.students.sort(function(a, b) {
                return a.subscription.code < b.subscription.code;
            })

            $scope.getReportPerMembership = function(){
                var headers = ['Student', 'Email', 'Membership type', 'Date start', 'Expiration date'];
                var data = new Array();

                for(var idx in $scope.students) {
                    var student = $scope.students[idx];
                    var membershipType = 'Expired';
                    var fromSubscriptionDate = null;
                    var expirationDate = null;
                    if(student.subscription.code == 1) {
                        fromSubscriptionDate = moment(student.subscription.message.from).format('DD/MM/YYYY HH:mm');
                        expirationDate = student.subscription.message.validUntil;
                        membershipType = 'Premium';
                        if(student.subscription.message.freeTrialPeriod) {
                            membershipType = 'Free Trial';
                        }
                    }

                    data.push([student.name + ' ' + student.lastname, student.email, membershipType, fromSubscriptionDate == null ? '-' : fromSubscriptionDate, expirationDate == null ? '-' : expirationDate]);
                }

                var reportName = "Memberships report";
                ReportFactory.tableWithHeaderAndData(reportName, headers, data, function(pdf) {
                    pdf.open();
                });
            }
        })

    }

    function getUserById(id, callback) {
        var filter = {
            filter: {
                where: {
                    id: id
                }
            }
        };
        AppUser.findOne(filter, function(result) {
            if(result != null) {
                callback(result);
            }
        });
    }
}
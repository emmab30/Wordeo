//chart.js
angular
.module('app')
.controller('TeacherCtrl', TeacherCtrl)

TeacherCtrl.$inject = ['$scope', '$q', '$state', '$stateParams', 'FilterFactory', 'ReportFactory', 'moment', 'Admin', 'AppUser', 'Reporting', 'Report', 'moment'];
function TeacherCtrl($scope, $q, $state, $stateParams, FilterFactory, ReportFactory, moment, Admin, AppUser, Reporting, Report, moment) {

    var routeSendSMS = $state.is('app.teachers.send_sms');
    var routeListTeachers = $state.is('app.teachers.list');
    var routeAssignedStudents = $state.is('app.teachers.assigned_students');
    var routeEditTeacher = $state.is('app.teachers.edit');
    var routeComplaintsTeacher = $state.is('app.teachers.complaints');
    var routeCreateTeacher = $state.is('app.teachers.new');

    $scope.isEditing = routeEditTeacher;
    $scope.isCreating = routeCreateTeacher;

    if(routeListTeachers) { //Listing all teachers

        //Define filters for Listing
        $scope.statuses = FilterFactory.getStatuses();
        $scope.currentPage = 1;
        $scope.filters = {
            status: $scope.statuses.All,
            pattern: null
        };
        $scope.order = {
            sign: '-',
            field: 'status',
            getOrder: function(){
                return $scope.order.sign + $scope.order.field;
            }
        };
        $scope.pagination = null;
        $scope.selectedTeachers = [];

        $scope.getTeachers = function(){

            var filters = {
                status: $scope.filters.status.id,
                pattern: $scope.filters.pattern,
                currentPage: $scope.currentPage
            };

            Admin.getTeachers({filter: filters}, function(result, err) {
                $scope.pagination = result.pagination;
                $scope.teachers = result.users;
                $scope.filtering = $scope.teachers;
            })
        }
        $scope.getTeachers();

        //Client side filtering (to mantain the checkbox selection states.)
        $scope.filter = function(){
            $scope.filtering = $scope.teachers;

            if($scope.filters.status.id > -1) {
                $scope.filtering = $scope.filtering.filter(function(e) { return e.status == $scope.filters.status.id});
            }

            if($scope.filters.pattern != null) {
                $scope.filtering = $scope.filtering.filter(function(e) {
                    var pattern = $scope.filters.pattern.toLowerCase();
                    return (e.name.toLowerCase().indexOf(pattern) > -1 ||
                        e.lastname.toLowerCase().indexOf(pattern) > -1 ||
                        e.email.toLowerCase().indexOf(pattern) > -1 ||
                        e.teacherId.toLowerCase().indexOf(pattern) > -1);
                });
            }
        }

        $scope.selectTeacher = function(user){
            if($scope.selectedTeachers.indexOf(user) > -1) {
                $scope.selectedTeachers.splice($scope.selectedTeachers.indexOf(user), 1);
            } else {
                $scope.selectedTeachers.push(user);
            }
        }

        $scope.selectAllTeachers = function(){
            if(!$scope.selectedAll) {
                $scope.selectedAll = true;
                $scope.selectedTeachers = Object.assign([], $scope.filtering);
            } else {
                $scope.selectedAll = false;
                $scope.selectedTeachers = [];
            }
        }

        $scope.sendMultipleSMS = function() {
            var ids = $scope.selectedTeachers.map(function(e) { return e.id });
            $state.go('app.teachers.send_sms', {id: ids.join('-').toString()});
        }

        $scope.orderBy = function(field) {
            $scope.order.sign = ($scope.order.sign == '-' ? '+' : '-');
            $scope.order.field = field;
        }

        $scope.generateReport = function(teacher){
            var headers = ['Student', 'Starting Conversation', 'Message Sent', 'Message Receive', 'Closing conversation', 'Reason'];
            var data = new Array();

            Reporting.getTeacherReport({id: teacher.id}, function(report) {
                var students = report.students;
                if(students != undefined) {
                    for(var idx=0; idx < students.length; idx++) {
                        var report = students[idx];
                        var studentName = report.student.name + " " + report.student.lastname;
                        var startingConversation = moment(report.starting).format('MM/DD/YYYY HH:mm');
                        var closingConversation = moment(report.closing).format('MM/DD/YYYY HH:mm');
                        var sentMessages = report.sentMessages;
                        var receivedMessages = report.receivedMessages;

                        data.push([studentName, startingConversation, sentMessages, receivedMessages, closingConversation, report.closingReason]);
                    }

                    var reportName = "Report for " + (teacher.name + " " + teacher.lastname);
                    ReportFactory.tableWithHeaderAndData(reportName, headers, data, function(pdf) {
                        pdf.open();
                    });
                }
            });
        }

        $scope.generateCSV = function(teacher){
            var deferred = $q.defer();
            Report.getTeacherReport({id: teacher.id}, function(report) {
                var data = [];
                var students = report.students;
                if(students != undefined) {
                    for(var idx=0; idx < students.length; idx++) {
                        var report = students[idx];
                        var studentName = report.student.name + " " + report.student.lastname;
                        var startingConversation = moment(report.starting).format('MM/DD/YYYY HH:mm');
                        var closingConversation = moment(report.closing).format('MM/DD/YYYY HH:mm');
                        var sentMessages = report.sentMessages;
                        var receivedMessages = report.receivedMessages;

                        data.push([studentName, startingConversation, sentMessages, receivedMessages, closingConversation, report.closingReason]);
                    }
                }

                console.log(data);
                deferred.resolve(data);
            });

            return deferred.promise;
        }

        $scope.generateCSVHeader = function(){
            return ['Student', 'Starting Conversation', 'Message Sent', 'Message Receive', 'Closing conversation', 'Reason'];
        }

    } else if(routeCreateTeacher) { //Creating new teacher

        $scope.save = function(){
            var teacher = new AppUser;
            teacher.teacherId = $scope.teacher.teacherId;
            teacher.name = $scope.teacher.name;
            teacher.lastname = $scope.teacher.lastname;
            teacher.email = $scope.teacher.email;
            teacher.password = $scope.teacher.password;
            teacher.phone = $scope.teacher.phone;
            teacher.age = 0;
            teacher.userType = 'teacher';
            teacher.created_at = new Date();
            AppUser.create(teacher, function(result) {
                $scope.successOperation = true;
                setTimeout(function(){
                    $state.go('app.teachers.list');
                }, 1500);
            }, function(err){
                alert(err.data.error.message)
            });
        }

    } else if(routeEditTeacher) {

        getTeacherById($stateParams.id, function(teacher) {
            $scope.teacher = teacher;
        });

        $scope.update = function(){
            AppUser.upsert($scope.teacher, function(result) {
                $scope.successOperation = true;
                setTimeout(function(){
                    $state.go('app.teachers.list');
                }, 1500);
            }, function(err) {
                alert(err.data.error.message)
            });
        };

    } else if(routeSendSMS) {

        $scope.sendingMultiples = $stateParams.id.split('-').length > 1;

        if($scope.sendingMultiples) {
            var ids = $stateParams.id.split('-');
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
                    $scope.teachers = result;
                });
            }
        } else {
            getTeacherById($stateParams.id, function(user) {
                $scope.teachers = [user];
            });
        }

        $scope.sendSMS = function(id) {
            $scope.statusMessage = {
                show: true,
                done: false,
                text: 'Sending message..'
            };

            for(var idx in $scope.teachers) {
                if($scope.teachers[idx].id == undefined)
                    continue;


                var isLastOne = ($scope.teachers.length - 1) == idx;

                //Send the message through Twilio.
                var data = {
                    teacherId: $scope.teachers[idx].id,
                    message: $scope.message
                };

                Admin.sendSMS(data, function(result) {
                    if(isLastOne) {
                        //The message is already sent, so set the timeout to display the alert
                        setTimeout(function() {
                            $scope.statusMessage.done = true;
                            $scope.statusMessage.text = 'Messages sent!';
                            $scope.$applyAsync();
                        }, 1500);
                    }
                }, function(err) {
                    $scope.statusMessage.text = 'Unexpected error.';
                    alert("Unexpected error. Please try again later.");
                })
            }
        }
    } else if(routeAssignedStudents) {
        getTeacherById($stateParams.id, function(teacher) {
            $scope.teacher = teacher;

            Admin.getStudentsForTeacher({id: $scope.teacher.id}, function(results) {
                $scope.students = results;
                console.log($scope.students);
            })
        });
    } else if(routeComplaintsTeacher) {
        var teacherId = $stateParams.id;

        var filter = {
            filter: {
                where: {
                    userToId: teacherId
                },
                include: ['reason', 'userFrom'],
                order: 'created DESC'
            }
        };
        Report.find(filter, function(results, err) {
            for(var idx in results) {
                results[idx].created = moment(results[idx].created).format('MM/DD/YYYY hh:MM a');
            }
            $scope.complaints = results;
        })
    }

    function getTeacherById(id, callback) {
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

    $scope.range = function(min, max, step) {
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) {
            input.push(i);
        }
        return input;
    };
}

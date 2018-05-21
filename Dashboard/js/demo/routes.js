angular
.module('app')
.config(['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', '$breadcrumbProvider', function($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $breadcrumbProvider) {
    $stateProvider

    //Teachers
    .state('app.teachers', {
        url: "/teachers",
        abstract: true,
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: {
            label: 'Teachers'
        }
    })
    .state('app.teachers.list', {
        url: '/list',
        templateUrl: 'views/teachers/list.html',
        ncyBreadcrumb: {
            label: 'List teachers'
        },
        controller: 'TeacherCtrl',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                // you can lazy load controllers
                return $ocLazyLoad.load({
                    files: ['js/controllers/TeacherCtrl.js', 'js/services/api.js']
                });
            }]
        }
    })
    .state('app.teachers.complaints', {
        url: '/:id/complaints',
        templateUrl: 'views/teachers/complaints.html',
        ncyBreadcrumb: {
            label: 'View reported for teacher'
        },
        controller: 'TeacherCtrl',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                // you can lazy load controllers
                return $ocLazyLoad.load({
                    files: ['js/controllers/TeacherCtrl.js', 'js/services/api.js']
                });
            }]
        }
    })
    .state('app.teachers.new', {
        url: '/new',
        templateUrl: 'views/teachers/create.html',
        ncyBreadcrumb: {
            label: 'Create a new teacher'
        },
        controller: 'TeacherCtrl',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                // you can lazy load controllers
                return $ocLazyLoad.load({
                    files: ['js/controllers/TeacherCtrl.js', 'js/services/api.js']
                });
            }]
        }
    })
    .state('app.teachers.edit', {
        url: '/:id/edit',
        templateUrl: 'views/teachers/create.html',
        ncyBreadcrumb: {
            label: 'Edit teacher'
        },
        controller: 'TeacherCtrl',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                // you can lazy load controllers
                return $ocLazyLoad.load({
                    files: ['js/controllers/TeacherCtrl.js', 'js/services/api.js']
                });
            }]
        }
    })
    .state('app.teachers.send_sms', {
        url: '/:id/send_sms',
        templateUrl: 'views/teachers/send_sms.html',
        ncyBreadcrumb: {
            label: 'Send sms to teacher'
        },
        controller: 'TeacherCtrl',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                // you can lazy load controllers
                return $ocLazyLoad.load({
                    files: ['js/controllers/TeacherCtrl.js', 'js/services/api.js']
                });
            }]
        }
    })
    .state('app.teachers.assigned_students', {
        url: '/:id/assigned_students',
        templateUrl: 'views/teachers/assigned_students.html',
        ncyBreadcrumb: {
            label: 'Assigned students for teacher'
        },
        controller: 'TeacherCtrl',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                // you can lazy load controllers
                return $ocLazyLoad.load({
                    files: ['js/controllers/TeacherCtrl.js', 'js/services/api.js']
                });
            }]
        }
    })

    //Students
    .state('app.students', {
        url: "/students",
        abstract: true,
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: {
            label: 'Students'
        }
    })
    .state('app.students.list', {
        url: '/list',
        templateUrl: 'views/students/list.html',
        ncyBreadcrumb: {
            label: 'List students'
        },
        controller: 'StudentCtrl',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                // you can lazy load controllers
                return $ocLazyLoad.load({
                    files: ['js/controllers/StudentCtrl.js', 'js/services/api.js']
                });
            }]
        }
    })
    .state('app.students.reports', {
        url: '/reports',
        templateUrl: 'views/students/reports.html',
        ncyBreadcrumb: {
            label: 'Reports for students'
        },
        controller: 'StudentCtrl',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                // you can lazy load controllers
                return $ocLazyLoad.load({
                    files: ['js/controllers/StudentCtrl.js', 'js/services/api.js']
                });
            }]
        }
    })
    .state('app.students.send_push_notification', {
        url: '/send_push_notification',
        templateUrl: 'views/students/send_push_notification.html',
        ncyBreadcrumb: {
            label: 'Send push notification to student'
        },
        controller: 'StudentCtrl',
        params: {
          id: {
            value: null
          },
          id: null
        },
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                // you can lazy load controllers
                return $ocLazyLoad.load({
                    files: ['js/controllers/StudentCtrl.js', 'js/services/api.js']
                });
            }]
        }
    })
    .state('app.students.view_chat', {
        url: '/:id/chat',
        templateUrl: 'views/students/view_chat.html',
        ncyBreadcrumb: {
            label: 'View chat of student'
        },
        controller: 'StudentCtrl',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                // you can lazy load controllers
                return $ocLazyLoad.load({
                    files: ['js/controllers/StudentCtrl.js', 'js/services/api.js', 'js/factories/Factories.js']
                });
            }]
        }
    })
    .state('app.students.scheduled', {
        url: '/scheduled',
        templateUrl: 'views/students/view_scheduled.html',
        ncyBreadcrumb: {
            label: 'List scheduled notifications'
        },
        controller: 'StudentCtrl',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                // you can lazy load controllers
                return $ocLazyLoad.load({
                    files: ['js/controllers/StudentCtrl.js', 'js/services/api.js']
                });
            }]
        }
    })

    //Configuration
    .state('app.configuration', {
        url: "/configuration",
        abstract: true,
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: {
            label: 'Configuration'
        }
    })
    .state('app.configuration.list', {
        url: '/list',
        templateUrl: 'views/configuration/list.html',
        ncyBreadcrumb: {
            label: 'List configurations'
        },
        controller: 'ConfigurationCtrl',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                // you can lazy load controllers
                return $ocLazyLoad.load({
                    files: ['js/controllers/ConfigurationCtrl.js', 'js/services/api.js']
                });
            }]
        }
    })
    //Topics
    .state('app.topics', {
        url: "/topics",
        abstract: true,
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: {
            label: 'Configuration'
        }
    })
    .state('app.topics.list', {
        url: '/list',
        templateUrl: 'views/topics/list.html',
        ncyBreadcrumb: {
            label: 'List topics'
        },
        controller: 'TopicsCtrl',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                // you can lazy load controllers
                return $ocLazyLoad.load({
                    files: ['js/controllers/TopicsCtrl.js', 'js/services/api.js']
                });
            }]
        }
    })
    .state('app.topics.add', {
        url: '/add',
        templateUrl: 'views/topics/add.html',
        ncyBreadcrumb: {
            label: 'Add Topic'
        },
        controller: 'TopicsCtrl',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                // you can lazy load controllers
                return $ocLazyLoad.load({
                    files: ['js/controllers/TopicsCtrl.js', 'js/services/api.js']
                });
            }]
        }
    })
    .state('app.topics.edit', {
        url: '/edit/:id',
        templateUrl: 'views/topics/add.html',
        ncyBreadcrumb: {
            label: 'Edit Topic'
        },
        controller: 'TopicsCtrl',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                // you can lazy load controllers
                return $ocLazyLoad.load({
                    files: ['js/controllers/TopicsCtrl.js', 'js/services/api.js']
                });
            }]
        }
    })
    //Badges
    .state('app.badges', {
        url: "/badges",
        abstract: true,
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: {
            label: 'Badges'
        }
    })
    .state('app.badges.list', {
        url: '/list',
        templateUrl: 'views/badges/list.html',
        ncyBreadcrumb: {
            label: 'List badges'
        },
        controller: 'BadgeCtrl',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                // you can lazy load controllers
                return $ocLazyLoad.load({
                    files: ['js/controllers/BadgeCtrl.js', 'js/services/api.js']
                });
            }]
        }
    })
    .state('app.badges.add', {
        url: '/add',
        templateUrl: 'views/badges/add.html',
        ncyBreadcrumb: {
            label: 'Add Badge'
        },
        controller: 'BadgeCtrl',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                // you can lazy load controllers
                return $ocLazyLoad.load({
                    files: ['js/controllers/BadgeCtrl.js', 'js/services/api.js']
                });
            }]
        }
    })
    .state('app.badges.edit', {
        url: '/edit/:id',
        templateUrl: 'views/badges/add.html',
        ncyBreadcrumb: {
            label: 'Edit Badge'
        },
        controller: 'BadgeCtrl',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                // you can lazy load controllers
                return $ocLazyLoad.load({
                    files: ['js/controllers/BadgeCtrl.js', 'js/services/api.js']
                });
            }]
        }
    })
    //Gamification
    .state('app.gamification', {
        url: "/gamification",
        abstract: true,
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: {
            label: 'Gamification'
        }
    })
    .state('app.gamification.index', {
        url: '/index',
        templateUrl: 'views/gamification/index.html',
        ncyBreadcrumb: {
            label: 'Gamification'
        },
        controller: 'GamificationCtrl',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                // you can lazy load controllers
                return $ocLazyLoad.load({
                    files: ['js/controllers/GamificationCtrl.js', 'js/services/api.js']
                });
            }]
        }
    })
    //Gamification
    .state('app.pendingQuestions', {
        url: "/pending_questions",
        abstract: true,
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: {
            label: 'Preguntas pendientes'
        }
    })
    .state('app.pendingQuestions.list', {
        url: '/list',
        templateUrl: 'views/pendingQuestions/list.html',
        ncyBreadcrumb: {
            label: 'PendingQuestions'
        },
        controller: 'PendingQuestionsCtrl',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                // you can lazy load controllers
                return $ocLazyLoad.load({
                    files: ['js/controllers/PendingQuestionsCtrl.js', 'js/services/api.js']
                });
            }]
        }
    })

    /** //Reports
    .state('app.reports.dates', {
    url: '/font-awesome',
    templateUrl: 'views/icons/font-awesome.html',
    ncyBreadcrumb: {
    label: 'Font Awesome'
}
})

.state('app.reports.messages_per_hour', {
url: '/font-awesome',
templateUrl: 'views/icons/font-awesome.html',
ncyBreadcrumb: {
label: 'Font Awesome'
}
})

.state('app.reports.teachers_per_status', {
url: '/font-awesome',
templateUrl: 'views/icons/font-awesome.html',
ncyBreadcrumb: {
label: 'Font Awesome'
}
})

.state('app.reports.teachers_per_hour', {
url: '/font-awesome',
templateUrl: 'views/icons/font-awesome.html',
ncyBreadcrumb: {
label: 'Font Awesome'
}
}) **/

.state('app.icons', {
    url: "/icons",
    abstract: true,
    template: '<ui-view></ui-view>',
    ncyBreadcrumb: {
        label: 'Icons'
    }
})
.state('app.icons.fontawesome', {
    url: '/font-awesome',
    templateUrl: 'views/icons/font-awesome.html',
    ncyBreadcrumb: {
        label: 'Font Awesome'
    }
})
.state('app.icons.simplelineicons', {
    url: '/simple-line-icons',
    templateUrl: 'views/icons/simple-line-icons.html',
    ncyBreadcrumb: {
        label: 'Simple Line Icons'
    }
})
.state('app.components', {
    url: "/components",
    abstract: true,
    template: '<ui-view></ui-view>',
    ncyBreadcrumb: {
        label: 'Components'
    }
})
.state('app.components.buttons', {
    url: '/buttons',
    templateUrl: 'views/components/buttons.html',
    ncyBreadcrumb: {
        label: 'Buttons'
    }
})
.state('app.components.social-buttons', {
    url: '/social-buttons',
    templateUrl: 'views/components/social-buttons.html',
    ncyBreadcrumb: {
        label: 'Social Buttons'
    }
})
.state('app.components.cards', {
    url: '/cards',
    templateUrl: 'views/components/cards.html',
    ncyBreadcrumb: {
        label: 'Cards'
    }
})
.state('app.components.forms', {
    url: '/forms',
    templateUrl: 'views/components/forms.html',
    ncyBreadcrumb: {
        label: 'Forms'
    }
})
.state('app.components.switches', {
    url: '/switches',
    templateUrl: 'views/components/switches.html',
    ncyBreadcrumb: {
        label: 'Switches'
    }
})
.state('app.components.tables', {
    url: '/tables',
    templateUrl: 'views/components/tables.html',
    ncyBreadcrumb: {
        label: 'Tables'
    }
})
.state('app.forms', {
    url: '/forms',
    templateUrl: 'views/forms.html',
    ncyBreadcrumb: {
        label: 'Forms'
    },
    resolve: {
        loadPlugin: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load([
                {
                    serie: true,
                    files: ['js/libs/moment.min.js']
                },
                {
                    serie: true,
                    files: ['js/libs/daterangepicker.min.js', 'js/libs/angular-daterangepicker.min.js']
                },
                {
                    files: ['js/libs/mask.min.js']
                },
                {
                    files: ['js/libs/select.min.js']
                }
            ]);
        }],
        loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load files for an existing module
            return $ocLazyLoad.load({
                files: ['js/controllers/forms.js']
            });
        }]
    }
})
.state('app.widgets', {
    url: '/widgets',
    templateUrl: 'views/widgets.html',
    ncyBreadcrumb: {
        label: 'Widgets'
    },
    resolve: {
        loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load controllers
            return $ocLazyLoad.load({
                files: ['js/controllers/widgets.js']
            });
        }]
    }
})
.state('app.charts', {
    url: '/charts',
    templateUrl: 'views/charts.html',
    ncyBreadcrumb: {
        label: 'Charts'
    },
    resolve: {
        // Plugins loaded before
        // loadPlugin: ['$ocLazyLoad', function ($ocLazyLoad) {
        //     return $ocLazyLoad.load([
        //         {
        //             serial: true,
        //             files: ['js/libs/Chart.min.js', 'js/libs/angular-chart.min.js']
        //         }
        //     ]);
        // }],
        loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load files for an existing module
            return $ocLazyLoad.load({
                files: ['js/controllers/charts.js']
            });
        }]
    }
})
}]);

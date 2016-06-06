var app = angular.module('indexApp', ['ui.router', 'pascalprecht.translate', 'ngSanitize'])

.factory('globalAJAXErrorHandling', ['$q', '$injector', '$rootScope', function ($q, $injector, $rootScope) {

    return {

        'requestError': function (rejection) {

            $injector.get('$state').go('errorLog', {

                error: rejection,
                code: rejection.status,
                back: null
            }, { reload: true });
            return $q.reject(rejection);
        },

        'responseError': function (rejection) {

            $injector.get('$state').go('errorLog', {

                error: rejection,
                code: rejection.status,
                back: null
            }, { reload: true });
            return $q.reject(rejection);
        }
    }
}])

.config(['$httpProvider', function ($httpProvider) {

    $httpProvider.interceptors.push('globalAJAXErrorHandling');
}])

.config(['$stateProvider', function ($stateProvider) {

    $stateProvider

            .state('root', {
                url: '',
                templateUrl: 'Static/root.html',
                controller: 'rootCtrl'
            })

            .state('app', {

                url: '/:locale',
                templateUrl: 'Static/index.html',
                controller: 'indexCtrl',
                resolve: {
                    roles: function (indexService) {

                        return indexService.getInfo('v_Roles')
                                    .then(function (responce) {

                                        return responce.data.value;
                                    })
                                    .catch(function (a, b) {

                                        throw { code: 'no_roles', accessError: true };
                                    });
                    },
                    user: function (indexService) {

                        return indexService.getInfo('v_System_User')
                                    .then(function (responce) {

                                        return responce.data.value[0].SYSTEM_USER;
                                    })
                                    .catch(function () {

                                        throw { code: 'no_user_info', accessError: true };
                                    })
                    }
                }
            })

            .state('app.welcome', {

                url: '/welcome',
                templateUrl: 'Static/welcome.html',
                controller: 'welcomeCtrl'
            })

            .state('app.Marker', {

                url: '/marker',
                templateUrl: 'Static/marker.html',
                controller: 'markerCtrl',
                onEnter: function ($state, roles) {

                    if (!vmIsAuthorized('Marker', roles))
                        $state.go('app.error', { code: 'unauthorized' });
                }
            })

            .state('app.Market', {

                url: '/market',
                templateUrl: 'Static/market/index.html',
                controller: 'marketCtrl',
                onEnter: function ($state, roles) {

                    if (!vmIsAuthorized('Market', roles))
                        $state.go('app.error', { code: 'unauthorized' });
                }
            })

            .state('app.PA', {

                url: '/pa',
                templateUrl: 'Static/pa/index.html',
                controller: 'PACtrl',
                onEnter: function ($state, roles) {

                    if (!vmIsAuthorized('PA', roles))
                        $state.go('app.error', { code: 'unauthorized' });
                }
            })

            .state('app.WorkshopSpecs', {

                url: '/workshopspecs',
                templateUrl: 'Static/workshopspecs.html',
                controller: 'WorkshopSpecsCtrl',
                onEnter: function ($state, roles) {

                    if (!vmIsAuthorized('WorkshopSpecs', roles))
                        $state.go('app.error', { code: 'unauthorized' });
                }
            })

            .state('accessError', {

                url: '/accesserror/:code?',
                templateUrl: 'Static/access_error.html',
                controller: 'errorCtrl'
            })

            .state('app.error', {

                url: '/error/:code?',
                templateUrl: 'Static/error.html',
                controller: 'errorCtrl'
            })

            .state('errorLog', {

                url: '/errorlog/:code?',
                templateUrl: 'Static/errorlog.html',
                controller: 'errorLogCtrl',
                params: {

                    type: null,
                    error: null,
                    back: null
                }
            });

    // check if user has required role
    function vmIsAuthorized(roleName, roles) {

        // check if user roles contain required one
        return roles.filter(function (role) { return role.RoleName == roleName }).length > 0;            
    }
    
}])

.config(function ($translateProvider) {
    
    // include translations
    $translateProvider.translations('en', translations.en);
    $translateProvider.translations('ru', translations.ru);
    $translateProvider.translations('ua', translations.ua);

    $translateProvider.useSanitizeValueStrategy('sanitizeParameters');    
})

.value('serviceUrl', serviceUrl)

.value('withCredentials', true)

.run(function ($rootScope, $state) {

    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {

        // preevnt default workflow
        event.preventDefault();

        // open errors depending on type
        // access or app
        if (error.accessError)
            $state.go('accessError', { code: error.code });
        else
            $state.go('app.error', { code: error.code });
    });
    
})

.controller('rootCtrl', ['$scope', '$state', function ($scope, $state) {

    // just open rool state
    // in case empty URL was provided
    $state.go('app');
}])

.controller('indexCtrl', ['$scope', '$state', '$translate', 'roles', 'user', function ($scope, $state, $translate, roles, user) {

    $scope.user = user;
    $scope.roles = roles;

    // check if locale specified    
    if (!$state.params.locale) {

        // get system language ( for IE "browserLanguage" )
        // get first two letters - language code
        var language = navigator.language || navigator.browserLanguage;
        var locale = language.substr(0, 2);

        // reload state
        // with locale specified
        $state.go($state.current.name, { locale: locale }, { reload: true });
        
    } else {

        // set interface language
        $scope.language = $state.params.locale;
        $translate.use($scope.language);

        // if on root state
        // than open welcome screen
        if ($state.current.name == 'app')
            $state.go('app.welcome');
    }

    // change language
    $scope.changeLanguage = function (key) {

        // change locale
        // and reload current state
        $state.params.locale = key;
        $state.go($state.current.name, $state.params, { reload: true});
    };

    $(document).on('ajaxError', function (e, params) {

        $state.go('errorLog', {

            error: params,
            code: params.status,
            back: $state.current.name
        
        }, { reload: true });
    });
  
}])

.controller('welcomeCtrl', ['$scope', 'roles', function ($scope, roles) {

    // check if user
    // has any roles assigned
    $scope.hasRoles = roles.length > 0;

    // throw main tab change
    $scope.$emit('mainTabChange', 'welcome');

}])

.controller('errorCtrl', ['$scope', '$state', '$translate', function ($scope, $state, $translate) {

    // throw main tab change
    $scope.$emit('mainTabChange', 'error');

    // show message
    // depending on error code
    switch ($state.params.code)
    {
        case 'no_roles':
            $scope.message = 'Service unavailable or failed to load user roles';
            break;
        case 'no_user_info':
            $scope.message = 'Service unavailable or failed to load user info';
            break;
        case 'unauthorized':
            $scope.message = 'error.Unauthorized';
            break;
        default:
            $scope.message = 'Oops something is broken';
    }

}])

.controller('errorLogCtrl', ['$scope', '$state', '$translate', 'indexService', function ($scope, $state, $translate, indexService) {

    // throw main tab change
    $scope.$emit('mainTabChange', 'error');

    $scope.errorCode = '';
    $scope.errorDescription = '';   
    $scope.back = $state.params.back;

    $scope.sendError = vmSendError;
    $scope.cancel = vmCancel;

    var error = $state.params.error;
    $scope.errorCode = error.status + error.statusText;

    function vmSendError() {

        indexService.sendInfo('ErrorLog', {

            ERROR_DETAILS: $scope.errorCode,
            ERROR_MESSAGE: $scope.errorDescription
        }).then(function (responce) {

            alert('sended!');
        })
    };

    function vmCancel() {

        $state.go($scope.back);
    };

}])

.service('indexService', ['$http', 'serviceUrl', 'withCredentials', function ($http, serviceUrl, withCredentials) {

    this.getInfo = function (url) {

        var request = $http({

            method: 'get',
            url: serviceUrl + url,
            withCredentials: withCredentials

        });

        return request;
    };

    this.sendInfo = function (url, data) {

        var request = $http({

            method: 'post',
            url: serviceUrl + url,
            data: data,
            withCredentials: withCredentials

        });

        return request;
    }

}])
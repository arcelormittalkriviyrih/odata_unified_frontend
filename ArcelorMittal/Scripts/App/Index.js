var app = angular.module('indexApp', ['ui.router', 'pascalprecht.translate', 'ngSanitize'])

.config(['$stateProvider', function ($stateProvider) {

    $stateProvider

            .state('root', {
                url: '',
                template: '<ui-view></ui-view>',
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
                    },
                    user: function (indexService) {

                        return indexService.getInfo('v_System_User')
                                    .then(function (responce) {

                                        return responce.data.value[0].SYSTEM_USER;
                                    });

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

            .state('app.error', {

                url: '/error/:code?',
                templateUrl: 'Static/error.html',
                controller: 'errorCtrl'
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

.value('defaultLocale', 'ua')

.value('serviceUrl', serviceUrl)

.value('withCredentials', true)

.controller('rootCtrl', ['$scope', '$state', 'defaultLocale', function ($scope, $state, defaultLocale) {

    // if locale not specified
    // select default one
    if (!$state.params.locale)
        $state.go('app', { locale: defaultLocale });
}])

.controller('indexCtrl', ['$scope', '$state', '$translate', 'roles', 'user', function ($scope, $state, $translate, roles, user) {

    $scope.user = user;
    $scope.roles = roles;

    // set interface language
    $scope.language = $state.params.locale;
    $translate.use($scope.language);

    // watch for library tab changed
    $scope.$on('mainTabChange', function (event, data) {

        $scope.activeTab = data;
    });

    // change language
    $scope.changeLanguage = function (key) {

        // change locale
        // and reload current state
        $state.params.locale = key;
        $state.go($state.current.name, $state.params, { reload: true});
    };

    // if on root state
    // than open welcome screen
    if ($state.current.name == 'app')
        $state.go('app.welcome');
}])

.controller('welcomeCtrl', ['$scope', 'roles', function ($scope, roles) {

    // check if user
    // has any roles assigned
    $scope.hasRoles = roles.length > 0;

    // throw main tab change
    $scope.$emit('mainTabChange', 'welcome');

}])

.controller('errorCtrl', ['$scope', '$state', function ($scope, $state) {

    // throw main tab change
    $scope.$emit('mainTabChange', 'error');

    // show message
    // depending on error code
    switch ($state.params.code)
    {
        case 'unauthorized':
            $scope.message = 'This role is unavailable for you!';
            break;
    }

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

}])
var app = angular.module('indexApp', ["ui.router"])

.config(['$stateProvider', function ($stateProvider) {

    $stateProvider
            .state('app', {

                url: '',
                templateUrl: 'Static/index.html',
                controller: 'indexCtrl',
                resolve: {
                    roles: function (indexService) {

                        return indexService.getInfo(serviceUrl + 'v_Roles')
                                    .then(function (responce) {

                                        return responce.data.value;
                                    })
                    },
                    user: function (indexService) {

                        return indexService.getInfo(serviceUrl + 'v_System_User')
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
                params: {
                    authorize: 'Marker'
                }
            })

            .state('app.Market', {

                url: '/market',
                templateUrl: 'Static/market.html',
                controller: 'marketCtrl',
                params: {
                    authorize: 'Market'
                }
            })

            .state('app.PA', {

                url: '/pa',
                templateUrl: 'Static/pa.html',
                controller: 'PACtrl',
                params: {
                    authorize: 'PA'
                }
            })

            .state('app.WorkshopSpecs', {

                url: '/workshopspecs',
                templateUrl: 'Static/workshopspecs.html',
                controller: 'WorkshopSpecsCtrl',
                params: {
                    authorize: 'WorkshopSpecs'
                }
            })

            .state('app.error', {

                url: '/error/:code?',
                templateUrl: 'Static/error.html',
                controller: 'errorCtrl'
            })

}])

.controller('indexCtrl', ['$scope', 'indexService', '$state', 'roles', 'user', function ($scope, indexService, $state, roles, user) {

    $scope.user = user;
    $scope.roles = roles;

    // watch for library tab changed
    $scope.$on('mainTabChange', function (event, data) {
        $scope.activeTab = data;
    });

    // if on root state
    // than open welcome screen
    if ($state.current.name == 'app')
        $state.go('app.welcome');
}])

.controller('welcomeCtrl', ['$scope', 'roles', function ($scope, roles) {

    $scope.roles = roles;

    // throw main tab change
    $scope.$emit('mainTabChange', 'welcome');

}])

.controller('errorCtrl', ['$scope', '$state', function ($scope, $state) {

    switch ($state.params.code)
    {
        case 'unauthorized':
            $scope.message = 'This role is unavailable for you!';
            break;
    }

}])

.service('indexService', ['$http', function ($http) {

    this.getInfo = function (url) {

        var request = $http({

            method: 'get',
            url: url,

        });

        return request;
    };

}])
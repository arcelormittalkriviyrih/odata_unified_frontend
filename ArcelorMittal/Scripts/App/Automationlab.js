angular.module('indexApp')

.config(['$stateProvider', function ($stateProvider) {

    $stateProvider
        .state('app.AutomationLab.Acceptance', {

            url: '/acceptance',
            templateUrl: 'Static/automationlab/acceptance.html',
            controller: 'AutomationLabacceptanceCtrl'
        })

        .state('app.AutomationLab.Repair', {

            url: '/repair',
            templateUrl: 'Static/automationlab/repair.html',
            controller: 'AutomationLabrepairCtrl'
        })


}])

.controller('AutomationlabCtrl', ['$scope', 'indexService', '$state', 'roles', function ($scope, indexService, $state, roles) {

}])

.controller('AutomationLabacceptanceCtrl', ['$scope', '$translate', 'indexService', '$q', function ($scope, $translate, indexService, $q) {

}])

.controller('AutomationLabrepairCtrl', ['$scope', '$translate', 'indexService', '$q', function ($scope, $translate, indexService, $q) {

}])

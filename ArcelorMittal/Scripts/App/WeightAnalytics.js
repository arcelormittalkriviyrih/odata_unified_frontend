angular.module('indexApp')

.config(['$stateProvider', function ($stateProvider) {

    $stateProvider
        .state('app.WeightAnalytics.Kopr4', {

            url: '/kopr_4',
            templateUrl: 'Static/weightanalytics/kopr_4.html',
            controller: 'WeightAnalyticsKopr4Ctrl'
        })

        .state('app.WeightAnalytics.Link2', {

            url: '/link2',
            templateUrl: 'Static/weightanalytics/link2.html',
            controller: 'WeightAnalyticsLink2Ctrl',

        })

}])



.controller('WeightAnalyticsCtrl', ['$scope', 'indexService', '$state', 'roles', function ($scope, indexService, $state, roles) {

}])

.controller('WeightAnalyticsKopr4Ctrl', ['$scope', '$translate', 'indexService', '$q', function ($scope, $translate, indexService, $q) {

}])

.controller('WeightAnalyticsLink2Ctrl', ['$scope', '$translate', 'indexService', '$state', function ($scope, $translate, indexService, $state) {

}]);


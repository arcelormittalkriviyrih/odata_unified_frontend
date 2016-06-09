angular.module('indexApp')

app.controller('markerCtrl', ['$scope', '$rootScope', 'indexService', '$state', 'roles', '$q', '$translate', 'scalesRefresh', '$interval', function ($scope, $rootScope, indexService, $state, roles, $q, $translate, scalesRefresh, $interval) {
    
    vmGetCurrentScales();

    function vmGetCurrentScales() {

        indexService.getInfo('v_AvailableScales').then(function (response) {

            $scope.scales = response.data.value;
            vmGetCurrentScalesInfo();
            
            //create interval for autorefresh scales
            //this interval must be clear on activity exit
            //so I create rootScope variable and set interval there
            //it will be called in $state onExit handler
            $rootScope.intervalScales = $interval(vmGetCurrentScalesInfo, scalesRefresh);
        })
    }

    function vmGetCurrentScalesInfo() {

        indexService.getInfo('v_ScalesShortInfo')
                       .then(function (response) {

                           var scalesInfo = response.data.value;

                           $scope.scales.forEach(function (scale) {

                               var data = scalesInfo.filter(function (item) {

                                   if (item.ID == scale.ID)
                                       return item;
                               })

                               scale.data = data[0];
                           });

                       })
    }


}]);
angular.module('indexApp')

app.controller('markerCtrl', ['$scope', '$rootScope', 'indexService', '$state', 'roles', '$q', '$translate', 'scalesRefresh', '$interval', function ($scope, $rootScope, indexService, $state, roles, $q, $translate, scalesRefresh, $interval) {
    
    $scope.filter = [];
    $scope.scalesDetailsInfo = null;
    $scope.currentScaleID = null;

    $scope.showScaleInfo = vmShowScaleInfo;
    

    vmGetCurrentScales();

    function vmGetCurrentScales() {

        indexService.getInfo('v_AvailableScales').then(function (response) {

            $scope.scales = response.data.value;

            $scope.scales.sort(function (a, b) {

                if (a.Description < b.Description)
                    return -1;
                else if (a.Description > b.Description)
                    return 1;
                else
                    return 0;
            })

            if ($scope.scales.length > 0){

                $scope.scales.forEach(function (scale) {

                    $scope.filter.push('ID eq {0}'.format(scale.ID));
                });

                $scope.groups = vmGetChunks($scope.scales, 4);
                $scope.filter = $scope.filter.join(' or ');
            }
            
            
            vmGetCurrentScalesInfo();
            
            //create interval for autorefresh scales
            //this interval must be clear on activity exit
            //so I create rootScope variable and set interval there
            //it will be called in $state onExit handler
            $rootScope.intervalScales = $interval(function () {

                vmGetCurrentScalesInfo();

                if ($scope.currentScaleID)
                    vmShowScaleInfo($scope.currentScaleID);
            }, scalesRefresh);
        })
    }

    function vmGetCurrentScalesInfo() {

        var path = 'v_ScalesShortInfo';
        if ($scope.filter.length > 0)
            path += '?$filter={0}'.format($scope.filter);

        indexService.getInfo(path)
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

    function vmShowScaleInfo(id) {

        $scope.currentScaleID = id;
        $scope.scalesDetailsInfo = null;

        var path = 'v_ScalesDetailInfo?$filter=ID eq {0}'.format(id);


        indexService.getInfo(path)
                       .then(function (response) {

                           $scope.scalesDetailsInfo = response.data.value[0];
                       });
    }

   

}]);
angular.module('indexApp')

app.controller('markerCtrl', ['$scope', 'indexService', '$state', 'roles', '$q', '$translate', 'scalesRefresh', function ($scope, indexService, $state, roles, $q, $translate, scalesRefresh) {

    vmGetCurrentScales();

    function vmGetCurrentScales() {

        $q.all([indexService.getInfo('v_AvailableScales'), indexService.getInfo('v_ScalesShortInfo')])
                       .then(function (responses) {

                           var scales = responses[0].data.value;
                           var scalesInfo = responses[1].data.value;

                           scales.forEach(function (scale) {

                               var data = scalesInfo.filter(function (item) {

                                   if (item.ID == scale.ID)
                                       return item;
                               })

                               scale.data = data[0];
                           });

                           $scope.scales = scales;

                           setTimeout(function () {

                               vmGetCurrentScales();
                           }, scalesRefresh)
                       })
    }

    
}])




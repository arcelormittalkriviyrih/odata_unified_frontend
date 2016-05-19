app.controller('PACtrl', ['$scope', 'indexService', '$state', 'roles', function ($scope, indexService, $state, roles) {

    // throw main tab change
    $scope.$emit('mainTabChange', 'PA');

}])
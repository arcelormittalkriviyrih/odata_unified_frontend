app.controller('markerCtrl', ['$scope', 'indexService', '$state', 'roles', function ($scope, indexService, $state, roles) {

    if (roles.filter(function (role) { return role.RoleName == $state.params.authorize }).length == 0)
        $state.go('app.error', { code: 'unauthorized' });

    // throw main tab change
    $scope.$emit('mainTabChange', 'Marker');

}])



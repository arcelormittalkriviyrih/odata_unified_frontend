app.controller('marketCtrl', ['$scope', 'indexService', '$state', 'roles', function ($scope, indexService, $state, roles) {

    if (roles.filter(function (role) { return role.RoleName == $state.params.authorize }).length == 0)
        $state.go('app.error', { code: 'unauthorized' });

    // throw main tab change
    $scope.$emit('mainTabChange', 'Market');

    $(function () {

        $('div#files').jsGrid({
            height: "500px",
            width: "950px",

            sorting: false,
            paging: true,
            editing: false,
            filtering: true,
            autoload: true,
            pageLoading: true,
            inserting: true,
            pageIndex: 1,
            pageSize: 10,

        })
        .jsGrid('initOdata', {
            serviceUrl: serviceUrl,
            table: 'Files',

            fields: [{
                id: 'ID',
                name: 'ID',
                title: 'ID',
                order: 1
            }, {
                id: 'FileName',
                name: 'FileName',
                title: 'FileName',
                order: 2
            }, {
                id: 'Encoding',
                name: 'Encoding',
                title: 'Encoding',
                order: 3
            }, {
                id: 'FileType',
                name: 'FileType',
                title: 'FileType',
                order: 4
            }, {
                id: 'Data',
                name: 'Data',
                title: 'Data',
                order: 5
            }]
        })
        .jsGrid('loadOdata', {});
    });

}])



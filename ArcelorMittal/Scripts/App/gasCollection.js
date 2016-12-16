angular.module('indexApp')
  
// angular.module('indexAppDaf')

  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider

      .state('app.gasCollection.Report', {
        name: 'gasCollection.reports',
        url: '/reports',
        controller: 'gasCollectionReportsCtrl',
        templateUrl: 'Static/gascollection/reports.html'
      })

      .state('app.gasCollection.Trends', {
        name: 'gasCollection.trends',
        url: '/trends',
        controller: 'gasCollectionTrendsCtrl',
        templateUrl: 'Static/gascollection/trends.html'
      })

      .state('app.gasCollection.Balance', {
        name: 'gasCollection.balance',
        url: '/balance',
        controller: 'gasCollectionBalanceCtrl',
        templateUrl: 'Static/gascollection/balance.html'
      });

  }])

  .controller('gasCollectionCtrl', ['$scope', 'indexService', '$state', 'roles', function ($scope, indexService, $state, roles) {

  }])

  .controller('gasCollectionReportsCtrl', ['$scope', 'indexService', '$state', '$http', function ($scope, indexService, $state, $http) {


    $scope.equipmentlist = getEquipmentList();
    $scope.equipmentlist.selected = $scope.equipmentlist[0];

    $scope.typeOfReport = [
      {description: "Почасовой за сутки", id: 0},
      {description: "Посуточный за месяц", id: 1},
      {description: "Помесячный за год", id: 2}
    ];
    $scope.typeOfReport.selected = $scope.typeOfReport[0];
     

  }])

  .controller('gasCollectionTrendsCtrl', ['$scope', 'indexService', '$state', '$http', function ($scope, indexService, $state, $http) {
    $scope.typeOfReport = [
     { description: "Почасовой за сутки", id: 0 },
     { description: "Посуточный за месяц", id: 1 },
     { description: "Помесячный за год", id: 2 }
    ];
    $scope.typeOfReport.selected = $scope.typeOfReport[0];
  }])

  .controller('gasCollectionBalanceCtrl', ['$scope', 'indexService', '$state', '$http', function ($scope, indexService, $state, $http) {

}]);
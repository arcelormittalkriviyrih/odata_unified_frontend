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
      })

  }])

  .controller('gasCollectionCtrl', ['$scope', 'indexService', '$state', 'roles', function ($scope, indexService, $state, roles) {

  }])

  .controller('gasCollectionReportsCtrl', ['$scope', 'indexService', '$state', '$http', function ($scope, indexService, $state, $http) {

//temporary variable
    $scope.ttt = '---';
    $scope.selectedQuery = '';
    $scope.selectedQueryTable = 'v_GasCollectionData';
    $scope.onlineData = false;
    $scope.errorReceiveData = false;

      // variable for label of table
    $scope.typeLabelOfTable = 1;
    $scope.showFullData = true;

    $scope.equipmentlist = getEquipmentList();
    $scope.equipmentlist.selected = $scope.equipmentlist[0];

    $scope.typeOfReport = [
      {description: "Почасовой за сутки", id: 0},
      {description: "Посуточный за месяц", id: 1},
      {description: "Помесячный за год", id: 2}
    ];
    $scope.typeOfReport.selected = $scope.typeOfReport[0];
     
    var date = getTimeToUpdate();
    //$scope.dateStart = $scope.dateEnd = '{0}.{1}.{2}'.format(date.day, date.month, date.year);
    $scope.dateStart = $scope.dateEnd = '08.{0}.{1}'.format(date.month, date.year);

    $('#statistics-date-start').datepicker({
        defaultDate: new Date($scope.dateStart),
        dateFormat: 'dd.mm.yy',
        controlType: dateTimePickerControl
    });

    $('#statistics-date-end').datepicker({
        defaultDate: new Date($scope.dateEnd),
        dateFormat: 'dd.mm.yy',
        controlType: dateTimePickerControl
    });
    
    $scope.getGasDataClick = function () {
      var dateStartForOData = $scope.dateStart.split('.').reverse().join('-') + 'T00:00:00.000Z';
      var dateEndForOData = $scope.dateEnd.split('.').reverse().join('-') + 'T23:59:59.999Z';
      $scope.typeLabelOfTable = $scope.typeOfReport.id;
      $scope.queryStringForGetInfo = "v_GasCollectionData?$filter=IDeq eq {0} and type eq '{1}' and dtStart ge {2} and dtEnd le {3}&$orderby=dtStart".format($scope.equipmentlist.selected.id, $scope.typeOfReport.selected.id + 1, dateStartForOData, dateEndForOData);

      indexService.getInfo($scope.queryStringForGetInfo)
        .then(function (response) {
          $scope.getInfoData = response.data;
          $scope.dataDaily = gasCollectionTableData($scope.getInfoData);
          //$scope.typeLabelOfTable = $scope.typeOfReport.id;
        });
    };
      
    $scope.getAllGasDataClick = function() {
      var queryGasCollection = '';
      var gasCollectionData = getGasCollectionData($scope.onlineData, queryGasCollection);
      $scope.ttt = gasCollectionData;
    };

    $scope.getSelectedGasDataClick = function() {
      var gasCollectionData = getGasCollectionData($scope.onlineData, $scope.selectedQuery, $scope.selectedQueryTable);
      $scope.ttt = gasCollectionData;
    };

    $scope.getSelectedGasDataForGetInfoClick = function () {
      $scope.queryStringForGetInfo = $scope.selectedQueryTable + $scope.selectedQuery;
      //$scope.ttt = gasCollectionData;
      //indexService.getInfo("v_GasCollectionData")
      indexService.getInfo($scope.queryStringForGetInfo)
        .then(function (response) {
          $scope.getInfoData = response.data;
          $scope.dataDaily = gasCollectionTableData($scope.getInfoData);
        });
    };
    /**/

  }])

  .controller('gasCollectionTrendsCtrl', ['$scope', 'indexService', '$state', '$http', function ($scope, indexService, $state, $http) {
    // now is blank
  }])

  .controller('gasCollectionBalanceCtrl', ['$scope', 'indexService', '$state', '$http', function ($scope, indexService, $state, $http) {

}]);
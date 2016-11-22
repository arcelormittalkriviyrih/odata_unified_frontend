angular.module('indexApp')
//angular.module('indexAppDaf')

  .config(['$stateProvider', function ($stateProvider) {
    $stateProvider

      .state('app.gasCollection.Report', {
        name: 'gasCollection.reports',
        url: '/reports',
        controller: 'gasCollectionReportsCtrl',
        //template: '<h3>It is area for reports</h3>'
        templateUrl: 'Static/gascollection/reports.html'
      })

      .state('app.gasCollection.Trends', {
        name: 'gasCollection.trends',
        url: '/trends',
        // template: '<h3>It is area for trends</h3>'
        templateUrl: 'Static/gascollection/trends.html'
      });
  }])

  .controller('gasCollectionCtrl', ['$scope', 'indexService', '$state', 'roles', function ($scope, indexService, $state, roles) {

  }])

  .controller('gasCollectionReportsCtrl', ['$scope', '$state', function ($scope, $state) {
    $scope.typeOfReport = [
      {description: "Почасовой за сутки", id: 0},
      {description: "Посуточный за месяц", id: 1},
      {description: "Помесячный за год", id: 2},
    ];
    $scope.typeOfReport.selected = $scope.typeOfReport[0];

    $scope.showFullData = false;

    $scope.dataDaily = [
      {datetime: '01:00', valPE: 12.2, valTE: 22, valQE: 0.66, val: 105, sumVal: 105 },
      {datetime: '02:00', valPE: 7.6 , valTE: 20, valQE: 0.69, val: 120, sumVal: 225 },
      {datetime: '03:00', valPE: 8.3 , valTE: 21, valQE: 0.75, val: 101, sumVal: 326 },
      {datetime: '04:00', valPE: 7.2 ,  valTE: 19,  valQE: 0.8 ,  val: 93, sumVal:  419 },
      {datetime: '05:00', valPE: 10.9,  valTE: 22,  valQE: 0.8 ,  val: 84, sumVal:  503 },
      {datetime: '06:00', valPE: 7.5 ,  valTE: 21,  valQE: 0.85,  val: 94, sumVal:  597 },
      {datetime: '07:00', valPE: 8.7 ,  valTE: 20,  valQE: 0.76,  val: 88, sumVal:  685 },
      {datetime: '08:00', valPE: 9.0 ,  valTE: 20,  valQE: 0.77,  val: 98, sumVal:  783 },
      {datetime: '09:00', valPE: 12.8, valTE: 19, valQE: 0.82, val: 107, sumVal: 890 },
      {datetime: '10:00', valPE: 8.9 ,  valTE: 18,  valQE: 0.85,  val: 89, sumVal:  979 },
      {datetime: '11:00', valPE: 11.4, valTE: 19, valQE: 0.68, val: 109, sumVal: 1088 },
      {datetime: '12:00', valPE: 8.1 ,  valTE: 19,  valQE: 0.73,  val: 98, sumVal:  1186 },
      {datetime: '13:00', valPE: 9.0 , valTE: 22, valQE: 0.84, val: 103, sumVal: 1289 },
      {datetime: '14:00', valPE: 13.1,  valTE: 22,  valQE: 0.83,  val: 94, sumVal:  1383 },
      {datetime: '15:00', valPE: 12.9, valTE: 20, valQE: 0.86, val: 115, sumVal: 1498 },
      {datetime: '16:00', valPE: 13.7, valTE: 19, valQE: 0.62, val: 100, sumVal: 1598 },
      {datetime: '17:00', valPE: 12.7, valTE: 21, valQE: 0.62, val: 120, sumVal: 1718 },
      {datetime: '18:00', valPE: 13.9,  valTE: 21,  valQE: 0.6 ,  val: 93, sumVal:  1811 },
      {datetime: '19:00', valPE: 11.1, valTE: 22, valQE: 0.9 , val: 100, sumVal: 1911 },
      {datetime: '20:00', valPE: 8.5 , valTE: 19, valQE: 0.68, val: 108, sumVal: 2019 },
      {datetime: '21:00', valPE: 8.2 , valTE: 21, valQE: 0.84, val: 100, sumVal: 2119 },
      {datetime: '22:00', valPE: 10.1, valTE: 20, valQE: 0.78, val: 106, sumVal: 2225 },
      {datetime: '23:00', valPE: 8.4 , valTE: 18, valQE: 0.66, val: 105, sumVal: 2330 },
      {datetime: '23:59', valPE: 11.4, valTE: 19, valQE: 0.86, val: 109, sumVal: 2439 }
    ];

    $scope.dataMonth = [
      {datetime: '01', valPE: 12.2, valTE: 22, valQE: 0.66, val: 105, sumVal: 105 },
      {datetime: '02', valPE: 7.6 , valTE: 20, valQE: 0.69, val: 120, sumVal: 225 },
      {datetime: '03', valPE: 8.3 , valTE: 21, valQE: 0.75, val: 101, sumVal: 326 },
      {datetime: '04', valPE: 7.2 ,  valTE: 19,  valQE: 0.8 ,  val: 93, sumVal:  419 },
      {datetime: '05', valPE: 10.9,  valTE: 22,  valQE: 0.8 ,  val: 84, sumVal:  503 },
      {datetime: '06', valPE: 7.5 ,  valTE: 21,  valQE: 0.85,  val: 94, sumVal:  597 },
      {datetime: '07', valPE: 8.7 ,  valTE: 20,  valQE: 0.76,  val: 88, sumVal:  685 },
      {datetime: '08', valPE: 9.0 ,  valTE: 20,  valQE: 0.77,  val: 98, sumVal:  783 },
      {datetime: '09', valPE: 12.8, valTE: 19, valQE: 0.82, val: 107, sumVal: 890 },
      {datetime: '10', valPE: 8.9 ,  valTE: 18,  valQE: 0.85,  val: 89, sumVal:  979 },
      {datetime: '11', valPE: 11.4, valTE: 19, valQE: 0.68, val: 109, sumVal: 1088 },
      {datetime: '12', valPE: 8.1 ,  valTE: 19,  valQE: 0.73,  val: 98, sumVal:  1186 },
      {datetime: '13', valPE: 9.0 , valTE: 22, valQE: 0.84, val: 103, sumVal: 1289 },
      {datetime: '14', valPE: 13.1,  valTE: 22,  valQE: 0.83,  val: 94, sumVal:  1383 },
      {datetime: '15', valPE: 12.9, valTE: 20, valQE: 0.86, val: 115, sumVal: 1498 },
      {datetime: '16', valPE: 13.7, valTE: 19, valQE: 0.62, val: 100, sumVal: 1598 },
      {datetime: '17', valPE: 12.7, valTE: 21, valQE: 0.62, val: 120, sumVal: 1718 },
      {datetime: '18', valPE: 13.9,  valTE: 21,  valQE: 0.6 ,  val: 93, sumVal:  1811 },
      {datetime: '19', valPE: 11.1, valTE: 22, valQE: 0.9 , val: 100, sumVal: 1911 },
      {datetime: '20', valPE: 8.5 , valTE: 19, valQE: 0.68, val: 108, sumVal: 2019 },
      {datetime: '21', valPE: 8.2 , valTE: 21, valQE: 0.84, val: 100, sumVal: 2119 },
      {datetime: '22', valPE: 10.1, valTE: 20, valQE: 0.78, val: 106, sumVal: 2225 },
      {datetime: '23', valPE: 8.4 , valTE: 18, valQE: 0.66, val: 105, sumVal: 2330 },
      {datetime: '24', valPE: 11.4, valTE: 19, valQE: 0.86, val: 109, sumVal: 2439 },
      {datetime: '25', valPE: 11.4, valTE: 19, valQE: 0.86, val: 109, sumVal: 2439 },
      {datetime: '26', valPE: 11.4, valTE: 19, valQE: 0.86, val: 109, sumVal: 2439 },
      {datetime: '27', valPE: 11.4, valTE: 19, valQE: 0.86, val: 109, sumVal: 2439 },
      {datetime: '28', valPE: 11.4, valTE: 19, valQE: 0.86, val: 109, sumVal: 2439 },
      {datetime: '29', valPE: 11.4, valTE: 19, valQE: 0.86, val: 109, sumVal: 2439 },
      {datetime: '30', valPE: 11.4, valTE: 19, valQE: 0.86, val: 109, sumVal: 2439 },
      {datetime: '31', valPE: 11.4, valTE: 19, valQE: 0.86, val: 109, sumVal: 2439 }
    ];

    $scope.dataYear = [
      {datetime: '01', valPE: 12.2, valTE: 22, valQE: 0.66, val: 105, sumVal: 105 },
      {datetime: '02', valPE: 7.6 , valTE: 20, valQE: 0.69, val: 120, sumVal: 225 },
      {datetime: '03', valPE: 8.3 , valTE: 21, valQE: 0.75, val: 101, sumVal: 326 },
      {datetime: '04', valPE: 7.2 ,  valTE: 19,  valQE: 0.8 ,  val: 93, sumVal:  419 },
      {datetime: '05', valPE: 10.9,  valTE: 22,  valQE: 0.8 ,  val: 84, sumVal:  503 },
      {datetime: '06', valPE: 7.5 ,  valTE: 21,  valQE: 0.85,  val: 94, sumVal:  597 },
      {datetime: '07', valPE: 8.7 ,  valTE: 20,  valQE: 0.76,  val: 88, sumVal:  685 },
      {datetime: '08', valPE: 9.0 ,  valTE: 20,  valQE: 0.77,  val: 98, sumVal:  783 },
      {datetime: '09', valPE: 12.8, valTE: 19, valQE: 0.82, val: 107, sumVal: 890 },
      {datetime: '10', valPE: 8.9 ,  valTE: 18,  valQE: 0.85,  val: 89, sumVal:  979 },
      {datetime: '11', valPE: 11.4, valTE: 19, valQE: 0.68, val: 109, sumVal: 1088 },
      {datetime: '12', valPE: 8.1 ,  valTE: 19,  valQE: 0.73,  val: 98, sumVal:  1186 }
    ];

    $scope.data = {
      dataset0: [
        {x: 0, val_0: 0, val_1: 0, val_2: 0, val_3: 0},
        {x: 1, val_0: 0.993, val_1: 3.894, val_2: 8.47, val_3: 14.347},
        {x: 2, val_0: 1.947, val_1: 7.174, val_2: 13.981, val_3: 19.991},
        {x: 3, val_0: 2.823, val_1: 9.32, val_2: 14.608, val_3: 13.509},
        {x: 4, val_0: 3.587, val_1: 9.996, val_2: 10.132, val_3: -1.167},
        {x: 5, val_0: 4.207, val_1: 9.093, val_2: 2.117, val_3: -15.136},
        {x: 6, val_0: 4.66, val_1: 6.755, val_2: -6.638, val_3: -19.923},
        {x: 7, val_0: 4.927, val_1: 3.35, val_2: -13.074, val_3: -12.625}
      ]
    };
// --------------------------------------------------------------
    $('#reports').jsGrid({
        height: "500px",
        width: "950px",

        sorting: false,
        paging: false,
        editing: false,
        filtering: true,
        autoload: true,
        pageLoading: false,
        inserting: false,
//        pageIndex: 1,
//        pageSize: 10,
    }).jsGrid('initOdata', {
        serviceUrl: serviceUrl,
        table: 'v_GasCollectionData',

        fields: [{
            id: 'ID',
            name: 'ID',
            title: 'ID', // $translate.instant('market.grid.orders.order'),
            order: 1
        }, {
            id: 'dtStart',
            name: 'dtStart',
            title: 'dtStart', // $translate.instant('market.grid.orders.contract'),
            order: 2
        }, {
            id: 'dtEnd',
            name: 'dtEnd',
            title: 'dtEnd', // $translate.instant('market.grid.orders.direction'),
            order: 3
        }, {
            id: 'FE',
            name: 'FE',
            title: 'FE', //$translate.instant('market.grid.orders.labelTemplate'),
            order: 4
        }, {
            id: 'TE',
            name: 'TE',
            title: 'TE', //$translate.instant('market.grid.orders.labelTemplate'),
            order: 5
        }, {
            id: 'PE',
            name: 'PE',
            title: 'PE', //$translate.instant('market.grid.orders.labelTemplate'),
            order: 6
        }, {
            id: 'QE',
            name: 'QE',
            title: 'QE', //$translate.instant('market.grid.orders.labelTemplate'),
            order: 7
        }, {
            id: 'type',
            name: 'type',
            title: 'type', //$translate.instant('market.grid.orders.labelTemplate'),
            order: 8
        }, {
            id: 'IDeq',
            name: 'IDeq',
            title: 'IDeq', //$translate.instant('market.grid.orders.labelTemplate'),
            order: 9
        }, {
            id: 'Description',
            name: 'Description',
            title: 'Description', //$translate.instant('market.grid.orders.labelTemplate'),
            order: 10
        }]
    }).jsGrid('loadOdata', {
        order: 'id desc'
    })
 // --------------------------------------------------------------

    $scope.options = {
      series: [
        {
          axis: "y",
          dataset: "dataset0",
          key: "val_0",
          label: "An area series",
          color: "#1f77b4",
          type: ['line', 'dot', 'area'],
          id: 'mySeries0'
        }
      ],
      axes: {x: {key: "x"}}
    };
  }]);
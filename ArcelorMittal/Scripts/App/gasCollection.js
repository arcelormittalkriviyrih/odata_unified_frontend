angular.module('indexApp')
// angular.module('indexAppDaf')

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
          
          $scope.drawTrends($scope.dateStart, $scope.dateEnd, $scope.dataDaily);
          


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

    $scope.drawTrends = function (dateStart, dateEnd, gasColectionData) {
      $('#chart').empty();
      
      var dataTrendPE = gasColectionData.map(function (item) {
        var arr = [];
        arr.push(item.datetime);
        arr.push(item.valQE);
        return [arr];
      });
      dataTrendPE = gasColectionData.reduce(function (prev, curr) {
        var retArr = prev.slice();
        var arr = [];
        arr[0] = curr.datetime;
        arr[1] = curr.valQE;
        //arr.push(curr.datetime);
        //arr.pus(curr.valQE);

        retArr.push(arr);
        return retArr;
      }, [[]]);
      
      //dataTrendPE = [['08.12.2016 08:00:00', 42.2], ['08.12.2016 09:00:00', 24.2], ['08.12.2016 10:00:00', 3], ['08.12.2016 11:00:00', 4], ['08.12.2016 12:00:00', 15]];
      //alert(dataTrendPE[0][0] + ' | ' + dataTrendPE[0][1] + ' # ' + dataTrendPE[1][0]);
      plot1 = $.jqplot('chart', [dataTrendPE], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        animate: !$.jqplot.use_excanvas,
        //seriesDefaults: {
        //renderer: $.jqplot.BarRenderer,
        //renderer: $.jqplot.EnhancedLegendRenderer,
        //pointLabels: { show: true }
        //},
        axes: {
          xaxis: {
            renderer: $.jqplot.DateAxisRenderer,
            label: '<' + dataTrendPE + '>', //'Время',
            labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
            tickRenderer: $.jqplot.CanvasAxisTickRenderer,
            tickOptions: {
              formatString: '%d.%m.%Y %H:%M',
              angle: 15
            },
            min: dateStart + ' 00:00', //'08.12.2016 08:00:00', //$scope.dateStart,
            max: dateEnd + ' 23:59', //'08.12.2016 12:00:00', //$scope.dateEnd,
            tickInterval: '60 minutes',
            drawMajorGridlines: true
          },
          yaxis: {
            //label: 'КГ',
            min: 0,
            max: 100 ,
            labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          },
        },
        highlighter: { show: true },
        cursor: {
          show: true
        }
      });


    }
      var s1 = [['08.12.2016 08:00', 12], ['08.12.2016 09:00:00', 2], ['08.12.2016 10:00:00', 23], ['08.12.2016 11:00:00', 4], ['08.12.2016 12:00:00', 15]];
      plot1 = $.jqplot('chart', [s1], {
        // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
        //animate: !$.jqplot.use_excanvas,
        //seriesDefaults: {
        //renderer: $.jqplot.BarRenderer,
        //renderer: $.jqplot.EnhancedLegendRenderer,
        //pointLabels: { show: true }
        //},
        axes: {
          xaxis: {
            renderer: $.jqplot.DateAxisRenderer,
            label: '<' + s1 + '>', //'Время',
            labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
            tickRenderer: $.jqplot.CanvasAxisTickRenderer,
            tickOptions: {
              formatString: '%d.%m.%Y %H:%M:%S',
              angle: -30
            },
            min: '08.12.2016 08:00:00', //$scope.dateStart,
            max: '08.12.2016 12:00:00', //$scope.dateEnd,
            tickInterval: '60 minutes',
            drawMajorGridlines: true
          },
          yaxis: {
            //label: 'КГ',
            labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
          },
        },
        highlighter: { show: true },
        cursor: {
          show: true
        }
      });
    
    
/**/
 /*   $('#chart').empty();
    var chartDataChunks = [['10.11.2016 08:00:00', 1], ['10.11.2016 09:00:00', 2], ['10.11.2016 10:00:00',3], ['10.11.2016 11:00:00',4], ['10.11.2016 12:00:00',5]];
    var labels = ['1', '2', '3', '4', '5'];
    var plotLine = $.jqplot('chart', chartDataChunks, {

      seriesDefaults: { showMarker: false },

      legend: {
        show: true,
        labels: labels,
        placement: "outside",
        renderer: $.jqplot.EnhancedLegendRenderer,
        location: 's',
      },

      axes: {

        xaxis: {
          renderer: $.jqplot.DateAxisRenderer,
          tickRenderer: $.jqplot.CanvasAxisTickRenderer,
          tickOptions: {
            formatString: '%d.%m.%Y %H:%M:%S',
            angle: -30,
          },
          min: $scope.dateStart,
          max: $scope.dateEnd,
          tickInterval: '60 minutes',//vmGetAxeInterval(dateStart, dateEnd),
          drawMajorGridlines: false
        },

        yaxis: {
          label: 'КГ',
          labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
        },
      },

      highlighter: {
        show: true,
        sizeAdjust: 7.5,
        useAxesFormatters: true,
        formatString: '%s , %s {0}'.format('marker.kg')

      },
      cursor: {
        show: false
      }

    });
    /**/
  }]);

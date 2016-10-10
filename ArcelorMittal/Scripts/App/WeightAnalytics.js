angular.module('indexApp')

.config(['$stateProvider', function ($stateProvider) {

    $stateProvider
        .state('app.WeightAnalytics.Index', {

            url: '/index',
            templateUrl: 'Static/weightanalytics/index.html',
            controller: 'WeightAnalyticsCtrl',

            onExit: function ($state, $injector) {

                var $interval = $injector.get('$interval');
                var $rootScope = $injector.get('$rootScope');

                $interval.cancel($rootScope.intervalScales);
                $interval.cancel($rootScope.intervalWorkRequest);
            }
        })

        .state('app.WeightAnalytics.Kopr4', {

            url: '/kopr_4',
            templateUrl: 'Static/weightanalytics/kopr_4.html',
            controller: 'WeightAnalyticsKopr4Ctrl',

            // stop periodic reading of scales
            onExit: function ($state, $injector) {

                var $interval = $injector.get('$interval');
                var $rootScope = $injector.get('$rootScope');

                $interval.cancel($rootScope.intervalScales);
                //$interval.cancel($rootScope.intervalWorkRequest);
            }
        })

        .state('app.WeightAnalytics.Link2', {

            url: '/link2',
            templateUrl: 'Static/weightanalytics/link2.html',
            controller: 'WeightAnalyticsLink2Ctrl',

        })

}])



.controller('WeightAnalyticsCtrl', ['$scope', '$rootScope', 'indexService', '$state', 'roles', '$q', 'scalesRefresh', '$interval', '$http', '$filter', '$translate', function ($scope, $rootScope, indexService, $state, roles, $q, scalesRefresh, $interval, $http, $filter, $translate) {

    $scope.filter = [];
    $scope.Init = vmInit;
    $scope.GetAvalWeighbridges = vmGetAvalWeighbridges;
    $scope.SelectWeighbridge = vmSelectWeighbridge;
    $scope.SelectWeighingMode = vmSelectWeighingMode;
    $scope.EnterWeightSheetNumber = vmEnterWeightSheetNumber;
    $scope.CloseWeightSheetNumberModalWindow = vmCloseWeightSheetNumberModalWindow;
    $scope.GetScrapTypes = vmGetScrapTypes;
    $scope.SelectScrapSender = vmSelectScrapSender;
    $scope.SelectScrapReceiver = vmSelectScrapReceiver;
    $scope.SelectScrapType = vmSelectScrapType;
    $scope.SelectPairNumber = vmSelectPairNumber;
    $scope.GetPairNumbers = vmGetPairNumbers;
    $scope.TakeWeight = vmTakeWeight;
    $scope.CloseWeightSheet = vmCloseWeightSheet;

    $scope.Modal = [];
    $scope.Modal.WeightSheetNumber = null;
    $scope.Modal.WeightingMode = null;
    $scope.ShowWeightSheetNumberModalWindow = false;
    $scope.WaySheetNumberDisabled = false;
    $scope.TakeWeightButtonDisabled = false;
    $scope.ArchiveWeightSheetSelected = false;
    $scope.isInfoLoaded = false;

    $scope.CurrentWeight = 0;
    $scope.CurrentWeightSheet = []; // test CurrentWSheet collection - all info about current opened WSheet
    $scope.CurrentWeightSheet.CurrentWeighbridgeID = null;
    $scope.WeightingModes = [{ ID: 1, Description: "Taring" }, { ID: 2, Description: "Weighting" }];
    $scope.CurrentWeightSheet.WeightingMode = null;
    $scope.CurrentWeightSheet.WeightSheetID = null;
    $scope.CurrentWeightSheet.WeightSheetNumber = null;
    $scope.CurrentWeightSheet.WeightSheetStartDT = null;
    $scope.CurrentWeightSheet.SelectedScrapSender = null;
    $scope.CurrentWeightSheet.SelectedScrapReceiver = null;
    $scope.CurrentWeightSheet.SelectedScrapType = null;
    $scope.CurrentWeightSheet.WaySheetNumber = null;
    $scope.CurrentPairNumber = { selected: null };
    $scope.CurrentWeightSheet.PairNumber = null;
    $scope.CurrentWeightSheet.PairNumbers = [];
    $scope.ArchiveWeightSheets = [];



    vmInit();
    vmGetAvalWeighbridges();
    vmCreatePlot();

    vmGetArchiveWeightSheetsTree();

    // сбрасываем переменные в начальное состояние
    function vmInit() {
        $scope.CurrentWeight = 0;
        $scope.WaySheetNumberDisabled = false;
        $scope.TakeWeightButtonDisabled = false;
        $scope.ArchiveWeightSheetSelected = false;
        $scope.CurrentWeightSheet.WeightingMode = null;
        $scope.CurrentWeightSheet.WeightSheetID = null;
        $scope.CurrentWeightSheet.WeightSheetNumber = null;
        $scope.CurrentWeightSheet.WeightSheetStartDT = null;
        $scope.CurrentWeightSheet.SelectedScrapSender = null;
        $scope.CurrentWeightSheet.SelectedScrapReceiver = null;
        $scope.CurrentWeightSheet.SelectedScrapType = null;
        $scope.CurrentWeightSheet.WaySheetNumber = null;
        $scope.CurrentWeightSheet.PairNumber = null;
        $scope.CurrentPairNumber.selected = null;
        $scope.CurrentWeightSheet.PairNumbers.length = 0;  // clear array
    }

    // получение списка доступных весов
    function vmGetAvalWeighbridges() {
        $q.all([indexService.getInfo('v_AvailableWeighbridges'), indexService.getInfo('GetUserProcedure')])
        .then(function (responses) {
            //AvalWeighbridges - коллекция доступных весов
            $scope.AvalWeighbridges = responses[0].data.value;
            $scope.userMetadata = responses[1].data.value.map(function (item) {
                return item.Name;
            });
        });

    };

    // выбор вида взвешивания
    function vmSelectWeighingMode(mode) {
        vmInit();
        $scope.ShowWeightSheetNumberModalWindow = true;
        $scope.Modal.WeightingMode = mode;
    }

    // получение списка видов лома
    function vmGetScrapTypes() {
        indexService.getInfo('v_KP4_ScrapTypes')
        .then(function (response) {
            $scope.ScrapTypes = response.data.value;
        });
    };

    // получение списка поставщиков лома
    function vmGetScrapSenders() {
        indexService.getInfo('v_KP4_ScrapSender')
        .then(function (response) {
            $scope.ScrapSenders = response.data.value;
        });
    };

    // получение списка получателей лома
    function vmGetScrapReceivers() {
        indexService.getInfo('v_KP4_ScrapReceiver')
        .then(function (response) {
            $scope.ScrapReceivers = response.data.value;
        });
    };

    // выбор вида лома
    function vmSelectScrapType(scrap_type) {
        $scope.CurrentWeightSheet.SelectedScrapType = scrap_type;
    };
    // выбор поставщика лома
    function vmSelectScrapSender(scrap_sender) {
        $scope.CurrentWeightSheet.SelectedScrapSender = scrap_sender;
    };

    // выбор получателя лома
    function vmSelectScrapReceiver(scrap_receiver) {
        $scope.CurrentWeightSheet.SelectedScrapReceiver = scrap_receiver;
    };

    // получение списка номеров пар лафет-короб
    function vmGetPairNumbers(search) {
        var newPairNumbers = $scope.CurrentWeightSheet.PairNumbers.slice();    // copying array Pairs to newSupes
        if (search && newPairNumbers.indexOf(search) === -1) {
            newPairNumbers.unshift(search);           // add element to begin of array newPairs
        }
        return newPairNumbers;
    }

    // выбор номера пары лафет-короб
    function vmSelectPairNumber(selected_pair_number) {
        $scope.CurrentWeightSheet.CurrentPairNumber = selected_pair_number;
        $scope.WaySheetNumberDisabled = false;
        // добавить выбор № путевой при выборе пары

        if ($scope.WagonsInfo != null) {
            $scope.WagonsInfo.forEach(function (item) {
                if (item.WeightingIndex == 1 && item.WagonNumber == selected_pair_number && item.WaybillNumber != null) {
                    $scope.CurrentWeightSheet.WaySheetNumber = item.WaybillNumber;
                    $scope.WaySheetNumberDisabled = true;
                };
            });
        };

    };

    // выбор весов
    function vmSelectWeighbridge(id) {

        $scope.CurrentWeightSheet.CurrentWeighbridgeID = id;

        vmGetScrapTypes();
        vmGetScrapSenders();
        vmGetScrapReceivers();

        // get info about current WeightSheet for CurrentWeighbridgeID
        vmGetWorkPerfomanceInfo();


        //remove old interval
        if ($rootScope.intervalScales)
            $interval.cancel($rootScope.intervalScales);

        //create interval for autorefresh scales
        //this interval must be clear on activity exit
        //so I create rootScope variable and set interval there
        //it will be called in $state onExit handler
        $rootScope.intervalScales = $interval(function () {
            //vmGetScaleData();
        }, scalesRefresh);

    }

    //
    function vmGetWorkPerfomanceInfo() {
        $scope.isInfoLoaded = false;
        // get info about current WeightSheet for CurrentWeighbridgeID
        indexService.getInfo("v_KP4_LastWorkPerformance?$filter=WeightBridgeID eq '{0}'".format($scope.CurrentWeightSheet.CurrentWeighbridgeID))
        .then(function (response) {
            var WorkPerfomanceInfo = response.data.value;
            if (WorkPerfomanceInfo.length > 0) {
                //alert('WS is exists!');
                $scope.CurrentWeightSheet.WeightingMode = $filter('filter')($scope.WeightingModes, { Description: WorkPerfomanceInfo[0].WeightingMode })[0];
                $scope.CurrentWeightSheet.WeightSheetNumber = WorkPerfomanceInfo[0].WeightSheetNumber;
                $scope.CurrentWeightSheet.WeightSheetID = WorkPerfomanceInfo[0].ID;
                $scope.CurrentWeightSheet.WeightSheetStartDT = WorkPerfomanceInfo[0].StartTime;

                vmGetWagonsInfo();
            };
                $scope.isInfoLoaded = true;
        });


    }

    function vmGetWagonsInfo() {
        // получаем перечень всех провесок для отвесной
        indexService.getInfo("v_KP4_Wagon?$filter=WorkPerformanceID eq {0}".format($scope.CurrentWeightSheet.WeightSheetID))
        .then(function (response) {
            $scope.WagonsInfo = response.data.value;
            var PairNumbers = [];
            // цикл для каждого провешивания
            $scope.WagonsInfo.forEach(function (item) {
                // используемые номера пар вагонов
                if (item.WeightingIndex == 1) {
                    PairNumbers.unshift(item.WagonNumber);
                    //$scope.CurrentWeightSheet.SelectedScrapSender = $filter('filter')($scope.ScrapSenders, { ID: item.ScrapSender })[0];
                    //$scope.CurrentWeightSheet.SelectedScrapReceiver = $filter('filter')($scope.ScrapReceivers, { ID: item.ScrapReceiver })[0];

                };

            });
            //$scope.CurrentPairNumber.selected = PairNumbers[0];
            $scope.CurrentWeightSheet.PairNumbers = PairNumbers;

            //заполнение грида
            vmCreateWagonTable($scope.CurrentWeightSheet.WeightSheetID);
        });

    }

    // получение онлайн показаний весов
    function vmGetScaleData() {
        //get data from SQL view//
        var pathScalesDetail = 'v_ScalesDetailInfo?$filter=ID eq 240';
        indexService.getInfo(pathScalesDetail)
            .then(function (response) {
                $scope.CurrentWeight = 45 + (Math.random() * 40);
                //$scope.response = response;
                vmRedrawArrow();

            });
    };

    // создание стрелочного индикатора
    function vmCreatePlot() {

        var seriesDefaults = {

            renderer: $.jqplot.MeterGaugeRenderer,
            min: 0,
            max: 100,

            rendererOptions: {
                ringWidth: 4,
                shadowDepth: 0,
                intervalOuterRadius: 85,
                intervalInnerRadius: 75,
                hubRadius: 6,
                intervals: [40, 90, 100],
                intervalColors: ['#E7E658', '#66cc66', '#cc6666']
            }
        };
        $('#plot-1000').addClass('plotVisible').empty();

        plot = $.jqplot('plot-1000', [[0 || 0]], {
            seriesDefaults: seriesDefaults
        });
    };

    // перерисовка стрелки индикатора
    function vmRedrawArrow() {

        plot.replot({
            data: [[$scope.CurrentWeight || 0]],
        });
    };

    // отслеживание изменения значения номера пары лафет-короб
    $scope.$watch('CurrentPairNumber.selected', function (newVal, oldVal) {
        if (newVal !== oldVal && newVal != null) {
            if ($scope.CurrentWeightSheet.PairNumbers.indexOf(newVal) === -1) {
                $scope.CurrentWeightSheet.PairNumbers.unshift(newVal);
            }
        }
    });


    // закрытие модального окна ввода номера отвесной
    function vmCloseWeightSheetNumberModalWindow() {
        vmInit();
        $scope.CurrentWeightSheet.WeightingMode = null;
        $scope.ShowWeightSheetNumberModalWindow = false;
    }

    // нажатие ОК при вводе номера отвесной
    function vmEnterWeightSheetNumber() {
        if ($scope.Modal.WeightSheetNumber == null)
            return

        $scope.CurrentWeightSheet.WeightSheetNumber = $scope.Modal.WeightSheetNumber;
        $scope.CurrentWeightSheet.WeightingMode = $scope.Modal.WeightingMode;
        $scope.ShowWeightSheetNumberModalWindow = false;
        //удалить таблицу
        $("#KP4_Wagon").jsGrid("destroy");
    }

    // кнопка "Закрыть отвесную"
    function vmCloseWeightSheet() {

        // exec SQL procedure
        indexService.sendInfo('upd_KP4_WorkPerformance', {
            WorkPerformanceID: $scope.CurrentWeightSheet.WeightSheetID || null
        }).then(function (response) {
            var weightsheetnumber = $scope.CurrentWeightSheet.WeightSheetNumber;
            vmInit();
            vmRefreshWagonTable($scope.CurrentWeightSheet.WeightSheetID);
            alert('Отвесная №' + weightsheetnumber + ' закрыта.');
            vmGetArchiveWeightSheetsTree();
            // увеличиваем на 1 номер отвесной
            if (weightsheetnumber) {
                weightsheetnumber = parseInt(weightsheetnumber) + 1;
                $scope.Modal.WeightSheetNumber = weightsheetnumber.toString();
            }
        });

    }

    // кнопка "Взять вес"
    function vmTakeWeight() {

        $scope.TakeWeightButtonDisabled = true;
        var WorkPerformanceID = $scope.CurrentWeightSheet.WeightSheetID ? $scope.CurrentWeightSheet.WeightSheetID : 0;
        var WeightBridgeID = $scope.CurrentWeightSheet.CurrentWeighbridgeID || null;
        var WeightSheetNumber = $scope.CurrentWeightSheet.WeightSheetNumber || null;
        var WagonNumber = $scope.CurrentWeightSheet.CurrentPairNumber || null;
        var WorkResponseDescription = $scope.CurrentWeightSheet.WaySheetNumber || null;
        var CurrentWeight = $scope.CurrentWeight.toString();
        var WeightMode = $scope.CurrentWeightSheet.WeightingMode.Description || null;
        var MaterialDefinitionID = $scope.CurrentWeightSheet.SelectedScrapType ? $scope.CurrentWeightSheet.SelectedScrapType.ID : null;
        var ReceiverID = $scope.CurrentWeightSheet.SelectedScrapReceiver ? $scope.CurrentWeightSheet.SelectedScrapReceiver.ID : null;
        var SenderID = $scope.CurrentWeightSheet.SelectedScrapSender ? $scope.CurrentWeightSheet.SelectedScrapSender.ID : null;

        //send weight info to SQL procedure
        indexService.sendInfo('ins_KP4_TakeWeight', {
            WorkPerformanceID: WorkPerformanceID,
            WeightBridgeID: WeightBridgeID,
            WeightSheetNumber: WeightSheetNumber,
            WagonNumber: WagonNumber,
            WorkResponseDescription: WorkResponseDescription,
            Value: CurrentWeight,
            WeightMode: WeightMode,
            MaterialDefinitionID: MaterialDefinitionID,
            ReceiverID: ReceiverID,
            SenderID: SenderID

        }).then(function (response) {
            var message = '';
            message += 'Для пары ' + WagonNumber + ' зафиксирован вес ' + (CurrentWeight) + ' т';
            alert(message);
            vmGetWorkPerfomanceInfo();
            $scope.CurrentWeightSheet.WaySheetNumber = null;
            $scope.CurrentWeightSheet.CurrentPairNumber = null;
            $scope.CurrentPairNumber.selected = null;

            vmRefreshWagonTable($scope.CurrentWeightSheet.WeightSheetID);
        });
        $scope.TakeWeightButtonDisabled = false;

    }

    // создать таблицу с данными по отвесной
    function vmCreateWagonTable(weightsheetid) {

        $('#KP4_Wagon').jsGrid({
            //height: "400px",
            width: "940px",

            sorting: false,
            editing: false,
            selecting: false,
            paging: false,
            filtering: false,
            autoload: true,
            pageLoading: true,
            inserting: false,
            pageSize: 30,

            onDataLoaded: function (args) {
                // убираем повторяющиеся числа для одного вагона
                args.data.data.forEach(function (item) {
                    if (item.WeightingIndex > 1) {
                        item.WagonNumber = null;
                        item.WaybillNumber = null;
                        item.Tare = null;
                    }

                });
                //$scope.$apply();
                $("#KP4_Wagon").jsGrid("refresh");
            },

            rowClick: function (args) {
            },

            rowClass: function (item, itemIndex) {
                // чередование цвета строк для разных вагонов
                var rowclass = "";
                if (item.WagonIndex % 2 == 1) {
                    rowclass = "jsgrid-weight-odd-row td";
                }
                else {
                    rowclass = "jsgrid-weight-even-row td";
                };
                if (item.WeightingIndex == 1) {
                    rowclass += " jsgrid-weight-border-row td";
                };

                return rowclass;
            }

        })

        .jsGrid('initOdata', {
            serviceUrl: serviceUrl,
            table: 'v_KP4_Wagon',

            fields: [{
                id: 'WeightSheetNumber',
                name: 'WeightSheetNumber',
                title: 'WeightSheet',
                order: 2
            }, {
                id: 'WagonNumber',
                name: 'WagonNumber',
                title: 'Wagon',
                order: 3,
                css: "jsgrid-bold-cell"
            }, {
                id: 'WaybillNumber',
                name: 'WaybillNumber',
                title: 'Waybill',
                order: 4
            }, {
                id: 'CSH',
                name: 'CSH',
                title: 'CSH',
                order: 5
            }, {
                id: 'Brutto',
                name: 'Brutto',
                title: 'Brutto',
                width: 50,
                order: 6
            }, {
                id: 'Tare',
                name: 'Tare',
                title: 'Tare',
                width: 50,
                order: 7
            }, {
                id: 'Netto',
                name: 'Netto',
                title: 'Netto',
                width: 50,
                order: 8,
                css: "jsgrid-bold-cell"
            }, {
                id: 'WeightingTime',
                name: 'WeightingTime',
                title: 'WeightingTime',
                width: 130,
                order: 9
            }]
        })

      .jsGrid('loadOdata', {
          defaultFilter: 'WorkPerformanceID eq ({0})'.format(weightsheetid),
          order: 'WorkResponseID,WeightingIndex'
      });

    }

    // обновить таблицу
    function vmRefreshWagonTable(weightsheetid) {

        $('#KP4_Wagon').jsGrid('loadOdata', {
            defaultFilter: 'WorkPerformanceID eq ({0})'.format(weightsheetid),
            order: 'WorkResponseID,WeightingIndex'
        });
    }

    // тестовая ф-ция архивные отвесные
    function vmGetArchiveWeightSheetsTree() {

        $WeightSheetList = $('#weight_sheet_list').empty();

        indexService.getInfo('v_KP4_AllWorkPerformance').then(function (response) {

            $scope.ArchiveWeightSheets = response.data.value;
            
            $WeightSheetList.odataTree({
                serviceUrl: serviceUrl,
                //table: 'v_KP4_AllWorkPerformance',
                data: $scope.ArchiveWeightSheets,
                keys: {
                    id: 'ID',
                    parent: 'ParentID',
                    text: 'Description'
                },
                translates: {
                    nodeName: $translate.instant('tree.nodeName'),
                    parentID: $translate.instant('tree.parentID')
                },
                parentID: {
                    keyField: 'ID',
                    valueField: 'WorkPerfomanceID',
                },
                disableControls: true
            });
            
        });

        // выбор элемента в дереве отвесных
        $WeightSheetList.on('tree-item-selected', function (e, data) {
            var NodeID = data.id;
            var SelectedArchiveWeightSheet = $filter('filter')($scope.ArchiveWeightSheets, { ID: NodeID })[0];
            if (SelectedArchiveWeightSheet.WorkPerfomanceID) {
                $scope.ArchiveWeightSheetSelected = true;
                // если таблица существует, обновляем ее, если нет - создаем
                if ($("#KP4_Wagon").data("JSGrid")) {
                    vmRefreshWagonTable(SelectedArchiveWeightSheet.WorkPerfomanceID);
                }
                else {
                    vmCreateWagonTable(SelectedArchiveWeightSheet.WorkPerfomanceID);
                };

            };
        });


    }







}])



.controller('WeightAnalyticsKopr4Ctrl', ['$scope', '$rootScope', 'indexService', '$state', 'roles', '$q', '$translate', 'scalesRefresh', 'workRequestRefresh', '$interval', '$http', function ($scope, $rootScope, indexService, $state, roles, $q, $translate, scalesRefresh, workRequestRefresh, $interval, $http) {

}])

.controller('WeightAnalyticsLink2Ctrl', ['$scope', '$translate', 'indexService', '$state', function ($scope, $translate, indexService, $state) {

}])





.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
})

.directive('myConfirmClick', [
    function () {
        return {
            link: function (scope, element, attr) {
                var msg = attr.myConfirmClick || "Are you sure?";
                var clickAction = attr.confirmedClick;
                element.bind('click', function (event) {
                    if (window.confirm(msg)) {
                        scope.$eval(clickAction)
                    }
                });
            }
        };
    }])
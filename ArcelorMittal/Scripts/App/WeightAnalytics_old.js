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

        .state('app.WeightAnalytics.Link1', {

            url: '/link1',
            templateUrl: 'Static/weightanalytics/link1.html',
            controller: 'WeightAnalyticsLink1Ctrl',

        })

        .state('app.WeightAnalyticsPrint', {

            url: '/weightanalytics/toprint/:data',
            templateUrl: 'Static/weightanalytics/toprint.html',
            controller: 'WeightAnalyticsPrintCtrl',
            params: {
                data: null
            }
            //url: '/toprint',
            //templateUrl: 'Static/weightanalytics/toprint.html',
            //controller: 'WeightAnalyticsPrintCtrl',
            //params: {
            //    data: null
            //},
            //onExit: function ($state, $injector) {

            //    var $interval = $injector.get('$interval');
            //    var $rootScope = $injector.get('$rootScope');

            //    $interval.cancel($rootScope.intervalMonitor);
            //}
        })

}])


.controller('WeightAnalyticsCtrl', ['$scope', '$rootScope', 'indexService', '$state', 'roles', '$q', 'scalesRefresh', '$interval', '$http', '$filter', '$translate', '$timeout', function ($scope, $rootScope, indexService, $state, roles, $q, scalesRefresh, $interval, $http, $filter, $translate, $timeout) {

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
    $scope.PrintWeightSheet = vmPrintWeightSheet;

    $scope.Modal = [];
    $scope.Modal.WeightSheetNumber = null;
    $scope.Modal.WeightingMode = null;
    $scope.ShowWeightSheetNumberModalWindow = false;
    $scope.WaySheetNumberDisabled = false;
    $scope.TakeWeightButtonDisabled = false;
    $scope.ArchiveWeightSheetSelected = false;
    $scope.isInfoLoaded = false;

    $scope.CurrentWeight = 0;
    $scope.CurrentWeightPlatf1 = 0;
    $scope.CurrentWeightPlatf2 = 0;
    $scope.WeightPlatforms = [{ ID: 1, Description: "Platform_I" }, { ID: 2, Description: "Platform_I_II" }];
    $scope.WeightingModes = [{ ID: 1, Description: "Taring" }, { ID: 2, Description: "Weighting" }];
    $scope.CurrentWeightSheet = []; // CurrentWSheet collection - all info about current opened WSheet
    $scope.CurrentWeightSheet.WeightPlatform = null;
    $scope.CurrentWeightSheet.CurrentWeighbridgeID = null;
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
    $scope.WeightSheetForPrint = [];


    var newTabForPrint;

    vmInit();
    vmGetAvalWeighbridges();
    vmCreatePlot();
    //vmCreateTree();

    vmGetArchiveWeightSheetsTree();

    // сбрасываем переменные в начальное состояние
    function vmInit() {
        $scope.CurrentWeight = 0;
        $scope.CurrentWeightSheet.WeightPlatform = $scope.WeightPlatforms[0];
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
        $q.all([indexService.getInfo('v_AvailableWeighbridges')/*, indexService.getInfo('GetUserProcedure')*/])
        .then(function (responses) {
            //AvalWeighbridges - коллекция доступных весов
            $scope.AvalWeighbridges = responses[0].data.value;
            /*
            $scope.userMetadata = responses[1].data.value.map(function (item) {
                return item.Name;
            });
            */
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

        indexService.getInfo("v_KP4_PackagingUnitsProperty?$filter=Wagon eq '{0}'".format(selected_pair_number))
        .then(function (response) {
            var TareInfo = response.data.value;
            $scope.CurrentPairNumberTare = TareInfo.length ? TareInfo[0].Value : null;
            //alert($scope.CurrentPairNumberTare);
        });

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
            vmGetScaleData();
        }, scalesRefresh);

    }

    // проверка последней открытой отвесной
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

    // получение детальной информации для отвесной
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
                    $scope.CurrentWeightSheet.SelectedScrapSender = $filter('filter')($scope.ScrapSenders, { Name: item.Sender })[0];
                    $scope.CurrentWeightSheet.SelectedScrapReceiver = $filter('filter')($scope.ScrapReceivers, { Name: item.Receiver })[0];
                    $scope.CurrentWeightSheet.SelectedScrapType = $filter('filter')($scope.ScrapTypes, { ID: item.CSH })[0];
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
        var pathScalesDetail = "v_AvailableWeighbridgesInfo?$filter=EquipmentID eq {0}".format($scope.CurrentWeightSheet.CurrentWeighbridgeID);
        indexService.getInfo(pathScalesDetail)
            .then(function (response) {
                var response = response.data.value[0];
                if (response) {
                    //$scope.CurrentWeight = response.Weight;


                    /*test platform*/
                    var cur_seconds = new Date().getSeconds();
                    var iii = cur_seconds % 4;

                    var ScalesPlatformProperty = "[{ WagonClassID : 2, Weight : [ 'Weight_platform_1' ] },{ WagonClassID : 3, Weight : [ 'Weight_platform_1', 'Weight_platform_2' ] },{ WagonClassID : 1, Weight : [ 'Weight_platform_1', 'Weight_platform_2' ] },{ WagonClassID : 4, Weight : [ 'Weight_platform_1', 'Weight_platform_2' ] }]";
                    //alert(ScalesPlatformProperty.length);
                    var ScalesPlatformPropertyArray;
                    eval('ScalesPlatformPropertyArray = ' + ScalesPlatformProperty); // convert to array of objects
                    ScalesPlatformPropertyArray = $filter('filter')(ScalesPlatformPropertyArray, { WagonClassID: iii+1 })[0]; // select platforms according to WagonType
                    var platforms = ScalesPlatformPropertyArray ? ScalesPlatformPropertyArray['Weight'] : null; // convert to array (of platforms)
                    //alert(platforms);

                    var w = 0;
                    platforms.forEach(function (item) {
                        w += response[item];
                    });
                    $scope.CurrentWeight = w;
                    /*test platform*/

                    if (iii == 2) {
                        $scope.CurrentWeight = null;
                    }

                    //$scope.CurrentWeight = $scope.CurrentWeightSheet.WeightPlatform.ID == 1 ? response.Weight_platform_1 : response.Weight;
                    $scope.CurrentWeightPlatf1 = response.Weight_platform_1;
                    $scope.CurrentWeightPlatf2 = response.Weight_platform_2;
                    $scope.CurrentWeightOffsetX = response.L_bias_weight;
                    $scope.CurrentWeightOffsetY = response.H_bias_weight;
                    $scope.WeightStab = response.stabilizing_weight;
                    vmRedrawArrow();
                }
                else {
                    $scope.CurrentWeight = null;
                    $scope.CurrentWeightPlatf1 = null;
                    $scope.CurrentWeightPlatf2 = null;
                    $scope.CurrentWeightOffsetX = null;
                    $scope.CurrentWeightOffsetY = null;
                    $scope.WeightStab = null;
                };
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
    };

    // нажатие ОК при вводе номера отвесной
    function vmEnterWeightSheetNumber() {
        if ($scope.Modal.WeightSheetNumber == null)
            return

        $scope.CurrentWeightSheet.WeightSheetNumber = $scope.Modal.WeightSheetNumber;
        $scope.CurrentWeightSheet.WeightingMode = $scope.Modal.WeightingMode;
        $scope.ShowWeightSheetNumberModalWindow = false;
        //удалить таблицу
        $("#KP4_Wagon").jsGrid("destroy");
    };

    // кнопка "Закрыть отвесную"
    function vmCloseWeightSheet() {

        indexService.sendInfo('upd_KP4_WorkPerformance', {
            WorkPerformanceID: $scope.CurrentWeightSheet.WeightSheetID || null
        }).then(function (response) {
            var weightsheetnumber = $scope.CurrentWeightSheet.WeightSheetNumber;
            var weightsheetid = $scope.CurrentWeightSheet.WeightSheetID;
            vmInit();
            vmRefreshWagonTable(weightsheetid);
            alert('Отвесная №' + weightsheetnumber + ' закрыта.');
            vmGetArchiveWeightSheetsTree(weightsheetid);
            // увеличиваем на 1 номер отвесной
            if (weightsheetnumber) {
                weightsheetnumber = parseInt(weightsheetnumber) + 1;
                $scope.Modal.WeightSheetNumber = weightsheetnumber.toString();
            }
        });

    };

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

    };

    // создать таблицу с данными по отвесной
    function vmCreateWagonTable(weightsheetid) {

        $('#KP4_Wagon').jsGrid({
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

            fields: [
            {
                id: 'WagonNumber',
                name: 'WagonNumber',
                title: $translate.instant('weightanalytics.Table.wagon'), //title: 'Wagon',
                order: 3,
                css: "jsgrid-bold-cell"
            }, {
                id: 'WaybillNumber',
                name: 'WaybillNumber',
                title: $translate.instant('weightanalytics.Table.waybill'), //title: 'Waybill',
                width: 60,
                order: 4
            }, {
                id: 'CSH',
                name: 'CSH',
                title: $translate.instant('weightanalytics.Table.CSH'), //title: 'CSH',
                order: 5
            }, {
                id: 'Brutto',
                name: 'Brutto',
                title: $translate.instant('weightanalytics.Table.brutto'), //title: 'Brutto',
                width: 50,
                order: 6
            }, {
                id: 'Tare',
                name: 'Tare',
                title: $translate.instant('weightanalytics.Table.tare'), //title: 'Tare',
                width: 50,
                order: 7
            }, {
                id: 'Netto',
                name: 'Netto',
                title: $translate.instant('weightanalytics.Table.netto'), //title: 'Netto',
                width: 50,
                order: 8,
                css: "jsgrid-bold-cell"
            }, {
                id: 'Sender',
                name: 'Sender',
                title: $translate.instant('weightanalytics.Labels.sender'), //title: 'Netto',
                width: 100,
                order: 9
            }, {
                id: 'Receiver',
                name: 'Receiver',
                title: $translate.instant('weightanalytics.Labels.receiver'), //title: 'Netto',
                width: 100,
                order: 10
            }, {
                id: 'WeightingTime',
                name: 'WeightingTime',
                title: $translate.instant('weightanalytics.Table.weightingTime'), //title: 'WeightingTime',
                width: 120,
                order: 11
            }]
        })

      .jsGrid('loadOdata', {
          defaultFilter: 'WorkPerformanceID eq ({0})'.format(weightsheetid),
          order: 'WorkResponseID,WeightingIndex'
      });

    };

    // обновить таблицу для отвесной
    function vmRefreshWagonTable(weightsheetid) {

        $('#KP4_Wagon').jsGrid('loadOdata', {
            defaultFilter: 'WorkPerformanceID eq ({0})'.format(weightsheetid),
            order: 'WorkResponseID,WeightingIndex'
        });
    };

    // получение дерева архивных отвесных
    function vmGetArchiveWeightSheetsTree(weightsheetID) {

        $WeightSheetList = $('#weight_sheet_list').jstree('destroy');

        indexService.getInfo('v_KP4_AllWorkPerformance').then(function (response) {

            if (response.data.value.length) {
                response.data.value.forEach(function (e) {
                    e.id = e.ID;
                    e.parent = e.ParentID;
                    e.text = e.Description;
                    if (e.WorkPerfomanceID) {
                        e.icon = 'jstree-file';
                    };
                    delete e.ID;
                    delete e.ParentID;
                    delete e.Description;
                });

                $scope.ArchiveWeightSheets = response.data.value;

                $WeightSheetList.jstree({
                    core: {
                        data: $scope.ArchiveWeightSheets
                    }
                });
            };
        });

        // загрузка дерева отвесных
        $WeightSheetList.on('loaded.jstree', function (e, data) {
            //alert('loaded');
            // при загрузке данные убираем выделение эл-тов и сворачиваем дерево
            $WeightSheetList.jstree('close_all');
            $WeightSheetList.jstree('deselect_all', true);
            // после закрытия выделяем закрытую отвесную
            if (weightsheetID) {
                var node = $filter('filter')($scope.ArchiveWeightSheets, { WorkPerfomanceID: weightsheetID })[0].id;
                $WeightSheetList.jstree('select_node', node, false);
                $WeightSheetList.jstree('open_node', node);
            }
                // при первой загрузке дерева выделяем число месяца, содержащее последнюю отвесную
            else {
                var node = $scope.ArchiveWeightSheets.filter(function (element) {
                    return element.parent != '#' &&
                            element.WorkPerfomanceID == null &&
                            !isNaN(element.text)
                });
                node = node[0].id;
                $WeightSheetList.jstree('select_node', node, false);
                $WeightSheetList.jstree('open_node', node);
            };
        });

        // выбор элемента в дереве отвесных
        $WeightSheetList.on('select_node.jstree', function (e, data) {
            //alert('select_node');
            $scope.ArchiveWeightSheetSelected = false;
            if (data.node.original.WorkPerfomanceID) {
                $scope.SelectedArchiveWeightSheetID = data.node.original.WorkPerfomanceID;
                $scope.ArchiveWeightSheetSelected = true;
                // если таблица существует, обновляем ее, если нет - создаем                
                if ($("#KP4_Wagon").data("JSGrid")) {
                    vmRefreshWagonTable(data.node.original.WorkPerfomanceID);
                }
                else {
                    vmCreateWagonTable(data.node.original.WorkPerfomanceID);
                };
            };
        });

    };

    // кнопка "Печать"
    function vmPrintWeightSheet() {

        var WeightSheettoPrintID = $scope.CurrentWeightSheet.WeightSheetID ? $scope.CurrentWeightSheet.WeightSheetID : $scope.SelectedArchiveWeightSheetID;

        var url = $state.href('app.WeightAnalyticsPrint', { data: WeightSheettoPrintID });

        var windowwidth = 670;
        var windowheight = screen.height - 105;
        var windowleft = screen.width / 2 - windowwidth / 2;
        var windowparam = 'top=0,width=' + windowwidth + ',left=' + windowleft + ',height=' + windowheight + 'resizable=no,scrollbars=no,status=no,titlebar=no,location=no';
        //var windowparam = "menubar=no,location=no,resizable=no,scrollbars=no,status=no,navigation=no,titlebar=no";
        if (newTabForPrint) {
            newTabForPrint.close();
        };
        newTabForPrint = window.open(url, 'toPrint', windowparam);


        //$state.go('app.WeightAnalytics.toPrint', { code: 100500 });
        /*
        indexService.getInfo("v_KP4_Wagon?$filter=WorkPerformanceID eq {0}&$orderby=WorkResponseID,WeightingIndex".format(WeightSheettoPrintID))
            .then(function (response) {
                $scope.WeightSheetForPrint = response.data.value;
                if ($scope.WeightSheetForPrint) {

                    var yyy = $scope.WeightSheetForPrint[0].EndTime;

                    if ($scope.CurrentWeightSheet.WeightSheetID) {
                        alert("Отвесная будет закрыта после печати!");
                        vmCloseWeightSheet();
                    }

                    //$("#btnPrint").click();

                    var printContents = document.getElementById('tbp').innerHTML;
                    var windowwidth = 670;
                    var windowheight = screen.height - 105;
                    var windowleft = screen.width / 2 - windowwidth / 2;
                    var windowparam = 'top=0,width=' + windowwidth + ',left=' + windowleft + ',location=no,height=' + windowheight + 'resizable=no,scrollbars=yes,status=no';
                    var popupWin = window.open('', '_blank', windowparam);
                    popupWin.document.open();
                    popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + printContents + '</body></html>');
                    popupWin.document.close();
                }
            });
*/
    }

    /*
    $("#PrintWS").click(function () {
        indexService.getInfo("v_KP4_Wagon?$filter=WorkPerformanceID eq 55").then(function (response) {
            var obj = response.data.value;
            $("#tbp table tbody").empty();
            for (var i = 0; i < obj.length; i++) {
                $("#tbp table tbody").append("<tr><td>" + obj[i].WagonNumber + "</td><td> " + obj[i].WaybillNumber + "</td><td> " +
                    obj[i].CSH + "</td><td> " + obj[i].Brutto + "</td><td> " + obj[i].Tare + "</td><td> " + obj[i].Netto + "</td><td> " +
                    obj[i].WeightingTime + "</td><td> " +
                    obj[i].WeightingTime + "</td></tr>");
            }
      
            $("#btnPrint").click();
        });

        
    });
    
    $("#btnPrint").printPreview({
        obj2print: '#tbp',
        width: '810'
    });
    */

}])



.controller('WeightAnalyticsLink1Ctrl', ['$scope', '$translate', 'indexService', '$state', function ($scope, $translate, indexService, $state) {

}])


.controller('WeightAnalyticsPrintCtrl', ['$scope', '$q', '$translate', 'indexService', '$state', '$timeout', function ($scope, $q, $translate, indexService, $state, $timeout) {

    $scope.print = vmprint;

    var WeightSheettoPrintID = $state.params.data;
    $scope.WeightSheetForPrint = [];
    $scope.NettoSum = 0;
    $q.all([indexService.getInfo('v_System_User'),
        indexService.getInfo("v_KP4_WorkPerformance?$filter=WorkPerformanceID eq {0}&$orderby=ID".format(WeightSheettoPrintID)),
        indexService.getInfo("v_KP4_Wagon?$filter=WorkPerformanceID eq {0}&$orderby=WorkResponseID,WeightingIndex".format(WeightSheettoPrintID))])
        .then(function (responses) {
            $scope.WeightSheettoPrintID = WeightSheettoPrintID;
            $scope.user = responses[0].data.value[0].SYSTEM_USER;
            $scope.WeightSheetForPrint = responses[2].data.value;
            $scope.WeightSheetForPrint.Date = responses[1].data.value[0].StartTime;
            $scope.WeightSheetForPrint.WeightBridge = responses[1].data.value[0].WeightBridge;

            var rowspan = 0;
            var wagonindex = 0;
            var nettosum = 0;

            for (var i = $scope.WeightSheetForPrint.length - 1; i >= 0; i--) {

                if ($scope.WeightSheetForPrint[i].WagonIndex != wagonindex) {
                    rowspan = $scope.WeightSheetForPrint[i].WeightingIndex;
                    wagonindex = $scope.WeightSheetForPrint[i].WagonIndex;
                };
                if ($scope.WeightSheetForPrint[i].WeightingIndex == 1) {
                    $scope.WeightSheetForPrint[i].RowSpan = rowspan;
                };

                nettosum += $scope.WeightSheetForPrint[i].Netto;
                //$scope.NettoSum = $scope.NettoSum + $scope.WeightSheetForPrint[i].Netto;
            }

            $scope.NettoSum = Math.round(nettosum * 100) / 100; //round(2)
            angular.element(window.document)[0].title = "Печать отвесной №" + $scope.WeightSheetForPrint[0].WeightSheetNumber;

            /*
            //==
            var obj = responses[2].data.value;
            var current_wagon_array = [];
            var current_wagon_Num = [];
            var count_current_wagon = 0;
            var current_wagon;
            var count = 0;
            var chek = false;

            for (var i = 0; i < obj.length; i++) {

                current_wagon = obj[i].WagonNumber;
                
                for (var q = 0; q < current_wagon_array.length ; q++) {
                    if (current_wagon == current_wagon_array[q]) {
                        chek = true;
                    }
                }

                if (chek == true) {
                    chek = false;
                    continue;
                }
                
                current_wagon_array[count_current_wagon] = obj[i].WagonNumber;
                count_current_wagon++;
                count++;

                for (var j = 0; j < obj.length; j++) {
                    if (current_wagon == obj[j].WagonNumber && j != i) {
                        count++;
                    }
                }
                var counter_chek = 0;
                for (var s = 0; s < obj.length; s++) {
                    if (current_wagon == obj[s].WagonNumber) {

                        if (counter_chek == 0) {
                            //count = count / 2;
                            $("#masterContent table tbody").append("<tr> <td rowspan = " + count + " style=\"text-align:center; vertical-align:middle;\">" + obj[i].WagonNumber + "</td> <td rowspan = " + count + " style=\"text-align:center; vertical-align:middle;\">" + obj[i].WaybillNumber
                            + "</td> <td rowspan = " + count + " style=\"text-align:center; vertical-align:middle;\">" + obj[i].Tare + "</td> <td>" + obj[i].Brutto + "</td><td>" + obj[i].Netto + "</td>  <td>" + obj[i].CSH + "</td> <td>" + obj[i].WeightingTime + "</td> <td>" + obj[i].WeightingTime + "</td> </tr>");
                            counter_chek = 1;
                        }
                        else {
                            $("#masterContent table tbody").append("<tr>  <td>" + obj[i].Brutto + "</td>  <td>" + obj[i].Netto + "</td><td>" + obj[i].CSH + "</td> <td>" + obj[i].WeightingTime + "</td> <td>" + obj[i].WeightingTime + "</td> </tr>");
                        }
                    }
                }
                count = 0;
            }
            //==
            */

        });

    function vmprint() {
        $timeout(function () {
            $scope.$apply();
            //var eeeee = angular.element(window.document);
            var inner_html = $('#WStoPrint');
            if (inner_html.length > 0) {
                var inner_html = inner_html[0]['innerHTML'];
            }
            //window.open().document.write(output);
            window.open().document.write(inner_html);
        });

        return
        $timeout(function () {
            $scope.$apply();
            window.print();
            window.close();
        }, 1000);
    };

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

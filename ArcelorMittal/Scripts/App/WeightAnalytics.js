angular.module('indexApp')

.config(['$stateProvider', function ($stateProvider) {

    $stateProvider

        .state('app.WeightAnalytics.Main', {

            url: '/main',
            templateUrl: 'Static/weightanalytics/main.html',
            controller: 'WeightAnalyticsMainCtrl',
        })

        .state('app.WeightAnalytics.WBStatic', {
            url: '/{wb_id:int}/{ws_id:int}?',
            //templateUrl: 'Static/weightanalytics/wb_static.html',
            views: {
                "": {
                    templateUrl: 'Static/weightanalytics/wb_static.html',
                    controller: 'WeightAnalyticsWBCtrl',
                },
                "WS_table@app.WeightAnalytics.WBStatic": {
                    templateUrl: 'Static/weightanalytics/ws_table.html',
                    //controller: 'WeightAnalyticsWSTableCtrl',
                },
                "WS_toprint@app.WeightAnalytics.WBStatic": {
                    templateUrl: 'Static/weightanalytics/ws_table.html',
                    controller: 'WeightAnalyticsWSPrintCtrl',
                },
                "waybill_toprint@app.WeightAnalytics.WBStatic": {
                    templateUrl: "Static/consigners/waybill.html",
                    controller: 'WaybillPreviewCtrl',
                }
            },
            //controller: 'WeightAnalyticsWBCtrl',
            params: {
                wb_id: { squash: true, value: null },
                ws_id: { squash: true, value: null },
            },
            resolve: {
                wb: function (indexService, $stateParams, $state, $q, $timeout) {
                    // проверка существования WB_ID и WS_ID
                    var WB_ID = $stateParams.wb_id;
                    var WS_ID = $stateParams.ws_id;
                    return $q.all([indexService.getInfo("v_AvailableWeighbridges?$filter=ID eq {0}".format(WB_ID)),
                                   indexService.getInfo("v_WGT_WeightsheetList?$top=1&$filter=DocumentationsID eq {0}".format(WS_ID))])
                        .then(function (responses) {
                            var WB_aval = responses[0].data.value;
                            var WS_aval = responses[1].data.value;
                            // если параметр WB_ID не задан - переходим к состоянию 'app.WeightAnalytics'
                            if (WB_ID == null) {
                                $state.go('app.WeightAnalytics');
                                return;
                            }
                            // если параметр WB_ID задан и для весы с таким ID существуют
                            if (WB_aval.length > 0) {
                                // при этом WS_ID не задан или если задан и существуют отвесные - возвращаем 0 и разрешаем вход
                                // иначе - переходим с WS_ID = null
                                if (WS_ID != null && WS_aval.length == 0) {

                                    $timeout(function () {
                                        $state.go('app.WeightAnalytics.WBStatic', { wb_id: WB_ID, ws_id: null });
                                    }, 0);
                                    //$state.go('app.WeightAnalytics.WBStatic', { wb_id: WB_ID, ws_id: null });
                                }
                                return 0;
                            }
                            // в остальных случаях - unauthorized
                            $state.go('app.error', { code: 'unauthorized' });

                        });

                }
            }
        })


}])




.controller('WeightAnalyticsCtrl', ['$scope', '$rootScope', 'indexService', '$state', 'roles', '$q', 'scalesRefresh', '$interval', '$http', '$filter', '$translate', '$timeout', function ($scope, $rootScope, indexService, $state, roles, $q, scalesRefresh, $interval, $http, $filter, $translate, $timeout) {
    var message = "WeightAnalyticsCtrl";
    //alert(message);


    vmGetAvalWeighbridges();

    // получение списка доступных весов
    function vmGetAvalWeighbridges() {
        $q.all([indexService.getInfo("v_AvailableWeighbridges?$orderby=Description")])
        .then(function (responses) {
            //AvalWeighbridges - коллекция доступных весов
            $scope.AvalWeighbridges = responses[0].data.value;
        });

    };

    // 
    $scope.SelectMainTab = function () {
        alert("SelectMainTab");
        $state.go('app.WeightAnalytics.Main');
    };

    // 
    $scope.SelectWeighbridge = function (id) {
        alert("SelectWeighbridge" + "\n" + "passing_id = " + id);
        $state.go('app.WeightAnalytics.WBStatic', { id: id });
    };




}])




.controller('WeightAnalyticsMainCtrl', ['$scope', '$translate', 'indexService', 'consignersService', '$state', '$interval', '$filter', function ($scope, $translate, indexService, consignersService, $state, $interval, $filter) {
    var message = "WeightAnalyticsMainCtrl";
    //alert(message);
    /*
    $scope.SelectedObjects = {};

    $scope.CurrentWeightSheet = [];
    //$scope.CurrentWeightSheet.SelectedWagonNumber = null;
    //$scope.CurrentWeightSheet.SelectedWBNumber = null;
    var WBs_Wagons = [];
    $scope.WagonManualEnterDisabled = false;
    $scope.WBManualEnterDisabled = false;


    // получение списка номеров пар лафет-короб
    $scope.GetWagonNumbers = function (search) {
        var array = [];
        if ($scope.WagonManualEnterDisabled) {
            array = WBs_Wagons.slice();
        }
            // if Wagon entered first
        else if (search) {
            array.unshift(search);
        }
        return array;
    }

    // выбор номера пары лафет-короб
    $scope.SelectWagonNumber = function (selected_wagon_number) {
        // is WagonNumber is not null
        if ($scope.SelectedObjects.WagonNumber) {
            if ($scope.SelectedObjects.WBNumber == null) {
                $scope.WBManualEnterDisabled = true;
            }
            else if ($scope.WagonManualEnterDisabled) {
                //alert(selected_wagon_number['WagonNumber']);
                vmGetWB(selected_wagon_number['WaybillID']);
                return;
            }

            $scope.WBShowLoading = true;
            var query = "v_WGT_test?$filter= WagonNumber eq '{0}' &$orderby=ID desc".format(selected_wagon_number);
            indexService.getInfo(query)
                .then(function (response) {
                    WBs_Wagons = response.data.value;
                    if (WBs_Wagons.length) {
                        $scope.SelectedObjects.WBNumber = WBs_Wagons[0];
                        //alert($scope.SelectedObjects.WBNumber['WaybillNumber']);
                        vmGetWB($scope.SelectedObjects.WBNumber['WaybillID']);
                    }
                    else {
                        $scope.SelectedObjects.WBNumber = null;
                    }
                    //$scope.SelectedObjects.WBNumber = WBs_Wagons.length ? WBs_Wagons[0] : null;
                    $scope.WBShowLoading = false;
                })
        }
            // is WagonNumber is null
        else {
            if ($scope.WBManualEnterDisabled) {
                $scope.SelectedObjects.WBNumber = null;
                WBs_Wagons.length = 0;

                $scope.WagonManualEnterDisabled = false;
                $scope.WBManualEnterDisabled = false;
            }
        }
    };



    // получение списка путевых (при заполнении комбобоксов №путевой и №вагона)
    $scope.GetWBNumbers = function (search) {
        var array = [];
        if ($scope.WBManualEnterDisabled) {
            array = WBs_Wagons.slice();
        }
            // if WB entered first
        else if (search) {
            array.unshift(search);
        }
        return array;
    }

    // выбор номера путевой в комбобоксе
    $scope.SelectWBNumber = function (selected_wb_number) {

        // is WBNumber is not null
        if ($scope.SelectedObjects.WBNumber) {
            if ($scope.SelectedObjects.WagonNumber == null) {
                $scope.WagonManualEnterDisabled = true;
            }
            else if ($scope.WBManualEnterDisabled) {
                //alert(selected_wb_number['WaybillNumber']);
                vmGetWB(selected_wb_number['WaybillID']);
                return;
            }
            $scope.WagonShowLoading = true;
            var query = "v_WGT_test?$filter= WaybillNumber eq '{0}' &$orderby=ID desc".format(selected_wb_number);
            indexService.getInfo(query)
                .then(function (response) {
                    WBs_Wagons = response.data.value;
                    if (WBs_Wagons.length) {
                        $scope.SelectedObjects.WagonNumber = WBs_Wagons[0];
                        //alert($scope.SelectedObjects.WagonNumber['WagonNumber']);
                        vmGetWB($scope.SelectedObjects.WagonNumber['WaybillID']);
                    }
                    else {
                        $scope.SelectedObjects.WagonNumber = null;
                    }
                    //$scope.SelectedObjects.WagonNumber = WBs_Wagons.length ? WBs_Wagons[0] : null;
                    $scope.WagonShowLoading = false;
                })
        }
            // is WBNumber is null
        else {
            if ($scope.WagonManualEnterDisabled) {
                $scope.SelectedObjects.WagonNumber = null;
                WBs_Wagons.length = 0;

                $scope.WagonManualEnterDisabled = false;
                $scope.WBManualEnterDisabled = false;
            }
        }
    };

    vmGetWB = function (waybill_id) {
        consignersService.GetWaybillObject(waybill_id)
            .then(function (waybill_obj) {
                var msg = '';
                msg += 'WaybillNumber: ' + waybill_obj['WaybillNumber'] + '\n';
                msg += 'Created: ' + waybill_obj['CreateDT'] + '\n';
                msg += 'SenderShop: ' + waybill_obj.SenderShop['Description'] + '\n';
                msg += 'ReceiverShop: ' + waybill_obj.ReceiverShop['Description'] + '\n';
                msg += 'WagonType: ' + waybill_obj.WagonType['Description'] + '\n';
                msg += 'WagonNumber: ' + waybill_obj['WagonNumber'] + '\n';

                alert(msg);
            })
    }
    */

}])




// контроллер Отвесных для статических весов
.controller('WeightAnalyticsWBCtrl', ['$scope', '$translate', 'indexService', 'consignersService', 'weightanalyticsService', 'LocalStorageService', '$state', '$q', '$timeout', '$interval', '$filter', 'user', 'scalesRefresh', function ($scope, $translate, indexService, consignersService, weightanalyticsService, LocalStorageService, $state, $q, $timeout, $interval, $filter, user, scalesRefresh) {

    // Init
    var wb_id = $state.params.wb_id;
    var ws_id = $state.params.ws_id;
    var message = "WeightAnalyticsWBCtrl" + " \n" + "ID: " + wb_id;
    var Timer = null;
    var isExit = false;
    //alert(message);

    $scope.ShowWeightSheetNumberModalWindow = false;
    $scope.PlatformsArray = [];
    var PlatformWagonClassArray = [];
    var ArchiveWeightSheets = [];

    var CargoSenders = [];          // Districts
    var CargoReceivers = [];        // Districts//$scope.Platforms = [];
    $scope.CargoSenderShops = [];   // unique shops from Districts
    $scope.CargoReceiverShops = []; // unique shops from Districts
    $scope.CargoTypes = [];
    $scope.WagonTypes = [];
    $scope.WagonNumbers = [];
    //$scope.WaybillNumbers = [];
    $scope.WSTypes = [];

    var WBs_Wagons = [];
    $scope.WagonManualEnterDisabled = false;
    $scope.WBManualEnterDisabled = false;

    $scope.SelectedObjects = {
        weightsheet_id: ws_id,
        Status: null,
        //WaybillNumber: null,
        WeightingMode: null,
        WeightSheetNumber: null,
        SenderShop: null,
        ReceiverShop: null,
        WagonNumber: null,
        WBNumber: null,
        CargoType: null,
        WagonType: null,
        CreateWSAtFirstWeighing: false,
    };

    $scope.CurrentMeasuring = {
        Weight: -99.99,
        OffsetX: -99.99,
        OffsetY: -99.99,
        PlatformWeights: [],
        WeightStab: false,
        Fault: true,
        ZeroingEnable: false,
    };

    $scope.CurrentWeightSheet = {
        WeightingMode: null,
        Status: null,
        Weigher: null,
        WeightSheetNumber: null,
        WeightSheetID: null,
        WeightBridgeID: null,
        WeightBridge: null,
        SenderShop: null,
        ReceiverShop: null,
        CreateDT: null,
        EditDT: null,

        CurrentWeighting: {
            WaybillNumber: null,
            WaybillID: null,
            //PersonName: null,
            WagonNumber: null,
            WagonID: null,
            WagonNumberPattern: null,
            //Sender: null,
            //Receiver: null,
            CargoTypeID: null,
        },
        Weighings: [],
    }

    $scope.OpenWS = vmOpenWS;
    $scope.PrintWS = vmPrintWS;
    //$scope.RejectWS = vmRejectWS;
    $scope.Back = vmBack;
    $scope.CloseWS = vmCloseWS;
    $scope.CreateWS = vmCreateWS;
    $scope.CreateWSCancel = vmCreateWSCancel;
    $scope.WSTypeSelect = vmWSTypeSelect;
    $scope.GetWBNumbers = vmGetWBNumbers;
    $scope.SelectWBNumber = vmSelectWBNumber;
    $scope.WagonTypeSelect = vmWagonTypeSelect;
    $scope.GetWagonNumbers = vmGetWagonNumbers;
    $scope.SelectWagonNumber = vmSelectWagonNumber;
    $scope.TakeWeight = vmTakeWeight;
    $scope.UpdateTare = vmUpdateTare;
    $scope.RejectWeighing = vmRejectWeighing;
    $scope.ckbxShowOnlyActiveWS = vmCkbxShowOnlyActiveWS;
    $scope.ZeroingScales = vmZeroingScales;

    $scope.ckbx = {};
    $scope.ckbx.ShowOnlyActiveWS = LocalStorageService.getData("ShowOnlyActiveWS") == "true" ? true : false;

    var WeightSheetTree = $('#weightsheet_tree').jstree('destroy');

    vmCreatePlot();
    vmCreateWSTree();
    vmGetConsignersServiceArrays();
    vmCheckZeroingEnable();
    //vmGetWSTree();


    // создание дерева отвесных
    function vmCreateWSTree() {
        WeightSheetTree.jstree({
            //core: {
            //    data: data
            //},
            search: {
                "case_insensitive": true,
                "show_only_matches": true
            },
            plugins: ["search"]
        });
    };

    // загрузка данных в дерево отвесных
    function vmLoadWSTree(data) {
        WeightSheetTree.jstree(true).settings.core.data = data;
        WeightSheetTree.jstree(true).refresh(true, true);
    };

    // выбор чекбокса "Показать активные отвесные"
    function vmCkbxShowOnlyActiveWS() {
        var show_active_ws = $scope.ckbx.ShowOnlyActiveWS || false;
        LocalStorageService.setData("ShowOnlyActiveWS", show_active_ws);
        vmGetWSTree();
    }

    // создание стрелочного индикатора
    function vmCreatePlot() {
        var seriesDefaults = {
            renderer: $.jqplot.MeterGaugeRenderer,
            min: 0,
            max: 150,
            rendererOptions: {
                ringWidth: 4,
                shadowDepth: 0,
                intervalOuterRadius: 85,
                intervalInnerRadius: 75,
                hubRadius: 6,
                intervals: [30, 120, 150],
                intervalColors: ['#E7E658', '#66cc66', '#cc6666']
            }
        };

        plot = $.jqplot('plot-1000', [[0]], {
            seriesDefaults: seriesDefaults
        });
    };


    // перерисовка стрелки индикатора
    function vmRedrawArrow(weight) {
        if (plot) {
            plot.replot({
                data: [[weight || 0]],
            });
        }
    };


    // получение списков отправителей, получателей, станция, видов груза
    function vmGetConsignersServiceArrays() {
        $q.all([consignersService.GetWagonTypes(),
                consignersService.GetCargoTypes(),
                consignersService.GetCargoSenders(),
                consignersService.GetCargoReceivers(),
                weightanalyticsService.GetWSTypes(),
                weightanalyticsService.GetWBPlatforms(wb_id),
                weightanalyticsService.GetWBPlatfWagons(wb_id)])
        .then(function (responses) {
            var resp_1 = responses[0].data.value;
            var resp_2 = responses[1].data.value;
            var resp_3 = responses[2].data.value;
            var resp_4 = responses[3].data.value;
            var resp_5 = responses[4].data.value;
            var resp_6 = responses[5].data.value;
            var resp_7 = responses[6].data.value;
            if (resp_1) {
                // получение списка ЖД вагонов
                $scope.WagonTypes = resp_1;
            }
            if (resp_2) {
                // получение списка видов лома
                $scope.CargoTypes = resp_2;
            }
            if (resp_3) {
                // получение списка поставщиков груза
                CargoSenders = resp_3;
                // получение уникальных цехов поставщиков груза
                vmGetCargoClient(CargoSenders, $scope.CargoSenderShops);
            }
            if (resp_4) {
                // получение списка получателей груза
                CargoReceivers = resp_4;
                // получение уникальных цехов получателей груза
                vmGetCargoClient(CargoReceivers, $scope.CargoReceiverShops);
            }
            if (resp_5) {
                // получение списка видов отвесных
                $scope.WSTypes = resp_5;

            }
            if (resp_6) {
                // получение платформ для весов
                if (resp_6.length > 0) {
                    var PlatformsArray = resp_6[0]['Value'];
                    eval('PlatformsArray = ' + PlatformsArray); // convert to array of objects
                    for (var i = 0; i < PlatformsArray.length; i++) {
                        var obj = {};
                        obj['name'] = PlatformsArray[i];
                        obj['value'] = i + 1;
                        $scope.PlatformsArray.push(obj);
                    }
                }
            }
            if (resp_7) {
                // получение соответствия платформ и видов вагонов
                PlatformWagonClassArray = resp_7[0]['Value'];
                eval('PlatformWagonClassArray = ' + PlatformWagonClassArray); // convert to array of objects

            }

            // если задан ID отвесной в адресе - получаем инфу по ней
            if (ws_id) {
                vmGetWSInfo(ws_id).then(function (weightsheet_object) {
                    //weightanalyticsService.GetWSInfo(ws_id).then(function (weightsheet_object) {
                    //alert(response);
                    //
                    for (key in weightsheet_object) {
                        if ($scope.CurrentWeightSheet.hasOwnProperty(key)) {
                            $scope.CurrentWeightSheet[key] = weightsheet_object[key];
                        }
                    }
                    //$scope.WaybillNumbers = weightsheet_object.WaybillNumbers;
                    //vmGetWagonTable($scope.CurrentWeightSheet.WeightSheetID);
                });
            }
            else {
                // после заполнения справочников получаем дерево отвесных
                //vmGetWSTree();
            }
            vmGetWSTree();
            // запускаем таймер опроса весового контроллера
            Timer = $interval(function () {
                vmGetScaleData();
            }, scalesRefresh);
        })
    }

    // получение списка пользователей (поставщиков и получателей) груза
    function vmGetCargoClient(array, unique_array) {
        // array - массив участков
        // unique_array - массив уникальных цехов участков (ParentID)
        for (i = 0; i < array.length; i++) {
            var CargoUserObject = {};
            CargoUserObject['ID'] = array[i]['ParentID'];
            CargoUserObject['Description'] = array[i]['ParentDescription'];
            // выбираем уникальные ParentID
            if (unique_array.map(function (elem) { return elem['ID']; }).indexOf(CargoUserObject['ID']) == -1) {
                unique_array.push(CargoUserObject);
            }
        }
    }


    // получение дерева архивных отвесных
    function vmGetWSTree() {
        //WeightSheetTree = $('#weightsheet_tree').jstree('destroy', true);
        weightanalyticsService.GetWSList(wb_id, $scope.ckbx.ShowOnlyActiveWS).then(function (list) {
            ArchiveWeightSheets = list;
            vmLoadWSTree(ArchiveWeightSheets);
        })
    };


    // загрузка дерева отвесных
    WeightSheetTree.on('redraw.jstree', function (e, data) {
        // при загрузке данных убираем выделение эл-тов и сворачиваем дерево
        WeightSheetTree.jstree('close_all');
        WeightSheetTree.jstree('deselect_all', true);

        // при первой загрузке дерева выделяем или отвесную (если задан ID) или год, содержащий последнюю отвесную
        var node = ArchiveWeightSheets.filter(function (element) {
            if (ws_id) {
                return element.parent != '#' && element.DocumentationsID == ws_id;
            }
            else {
                return element.parent == '#' && element.DocumentationsID == null && !isNaN(element.text);
            }
        });
        if (node[0]) {
            var node_id = node[0].id;
            WeightSheetTree.jstree('select_node', node_id, false);
            WeightSheetTree.jstree(true).get_node(node_id, true).children('.jstree-anchor').focus();
            WeightSheetTree.jstree('open_node', node_id);
        }
    });

    // выбор элемента в дереве отвесных
    WeightSheetTree.on('select_node.jstree', function (e, data) {
        var ws_item = data.node.original;
        $scope.SelectedObjects.weightsheet_id = null;
        if (ws_item.DocumentationsID) {
            //if (ws_item.DocumentationsID != $scope.SelectedObjects.weightsheet_id) {
            $scope.SelectedObjects.Status = ws_item.Status;
            $scope.SelectedObjects.weightsheet_id = ws_item.DocumentationsID;
            //}
        }
        else {
            //$scope.SelectedObjects.weightsheet_id = null;
        };
    });

    // двойной клик элемента в дереве отвесных - открываем сразу
    WeightSheetTree.bind("dblclick.jstree", function (event) {
        var tree = $(this).jstree();
        var node = tree.get_node(event.target);
        if (node.original && node.original.DocumentationsID) {
            $scope.SelectedObjects.weightsheet_id = node.original.DocumentationsID;
            vmOpenWS($scope.SelectedObjects.weightsheet_id);
        }
    });


    // получение всей информации по отвесной (возвращает объект weightsheet_object)
    function vmGetWSInfo(id) {
        //var weightsheet_object = {};
        if (!id) return weightsheet_object;
        return weightanalyticsService.GetWSInfo(id);
    }

    // нажатие кнопки "Открыть отвесную"
    function vmOpenWS(id) {
        //alert(id);
        //$scope.ws_id = id;
        ws_id = id;
        //$scope.$applyAsync();
        $state.go('app.WeightAnalytics.WBStatic', { wb_id: wb_id, ws_id: id }, { notify: false })
        ///* !!! get full WS info here */
        //weightanalyticsService.GetWSInfo($scope.SelectedObjects.weightsheet_id).then(function (weightsheet_object) {
        vmGetWSInfo($scope.SelectedObjects.weightsheet_id).then(function (weightsheet_object) {
            //alert(response);
            // копируем все свойства weightsheet_object в $scope.CurrentWeightSheet
            for (key in weightsheet_object) {
                if ($scope.CurrentWeightSheet.hasOwnProperty(key)) {
                    $scope.CurrentWeightSheet[key] = weightsheet_object[key];
                }
            }
            //$scope.WaybillNumbers = weightsheet_object.WaybillNumbers;
            // создаем таблицу
            //vmGetWagonTable($scope.CurrentWeightSheet.WeightSheetID);
        });
        //$scope.ShowWeightSheetNumberModalWindow = true;
    }

    // нажатие кнопки "Печать отвесной"
    function vmPrintWS(id, remotePrint) {
        //alert("Remote print flag: " + remotePrint);
        //alert(id);
        if (!id || ($scope.SelectedObjects.Status != 'closed' && $scope.SelectedObjects.Status)) return;
        $scope.RemotePrint = remotePrint;
        $scope.CreateWSToPrint = true;
    }

    // нажатие кнопки "Закрыть отвесную"
    function vmCloseWS(id) {
        //alert(id);
        // если флаг "CreateWSAtFirstWeighing"
        if ($scope.SelectedObjects.CreateWSAtFirstWeighing) {
            vmBack();
            return;
        }

        // проверка наличия Нетто у всех незабракованных вагонов
        if (['Тарирование', 'Контроль брутто'].indexOf($scope.CurrentWeightSheet.WeightingMode['Description']) == -1) {
            var weighings = $scope.CurrentWeightSheet.Weighings;
            var count_no_reject = 0;
            var count_with_netto = 0;
            for (var i = 0; i < weighings.length; i++) {
                if (weighings[i]['Status'] == 'reject') continue;
                count_no_reject += 1;
                count_with_netto += weighings[i]['Netto'] ? 1 : 0;
            }
            if (count_no_reject != count_with_netto) {
                alert($translate.instant('weightanalytics.Messages.notAllNettoInWS'));//alert("Not all wagons has Netto! Action cancelled.");
                return;
            }
        }

        //var confirm_string = "Are you sure to close weightsheet #{0}?".format($scope.CurrentWeightSheet.WeightSheetNumber);
        var confirm_string = $translate.instant('weightanalytics.Messages.closeWSConfirm').format($scope.CurrentWeightSheet.WeightSheetNumber);
        // если подтвердили закрытие
        if (confirm(confirm_string)) {
            DocumentationsID = id;
            var Status = "closed";
            indexService.sendInfo("upd_Documentations", {
                DocumentationsID: DocumentationsID,
                Status: Status
            }).then(function (response) {
                //var message = "Weightsheet #{0} closed succesfully.".format($scope.CurrentWeightSheet.WeightSheetNumber);
                var message = $translate.instant('weightanalytics.Messages.closeWSSuccess').format($scope.CurrentWeightSheet.WeightSheetNumber);
                //$scope.CurrentWeightSheet.Status = Status;
                $scope.SelectedObjects.Status = Status;
                vmOpenWS(id);
                alert(message);
            })
        }


    }

    /*
    // нажатие "Забраковать"
    function vmRejectWS() {
        //alert("Reject");
        var reject = false;
        if ($scope.CurrentWeightSheet.Status != 'reject') {
            reject = true;
        }
        //var confirm_string = (reject ?
        //                    $translate.instant('consigners.Messages.rejectConfirm') :
        //                    $translate.instant('consigners.Messages.rejectDiscardConfirm')).format($scope.CurrentWeightSheet.WeightSheetNumber);
        var confirm_string = reject ?
            "Are you sure to reject weightsheet #{0}?".format($scope.CurrentWeightSheet.WeightSheetNumber) :
            "Are you sure to discard reject weightsheet #{0}?".format($scope.CurrentWeightSheet.WeightSheetNumber);
        // если подтвердили забраковку
        if (confirm(confirm_string) && $scope.CurrentWeightSheet.WeightSheetID) {
            DocumentationsID = $scope.CurrentWeightSheet.WeightSheetID;
            var Status = reject ? "reject" : null;
            indexService.sendInfo("upd_Documentations", {
                DocumentationsID: DocumentationsID,
                Status: Status
            }).then(function (response) {
                //var message = (reject ?
                //    $translate.instant('consigners.Messages.rejectSuccess') :
                //    $translate.instant('consigners.Messages.rejectDiscardSuccess')).format($scope.CurrentWaybill.WaybillNumber);
                var message = reject ?
                    "Weightsheet #{0} rejected succesfully.".format($scope.CurrentWeightSheet.WeightSheetNumber) :
                    "Discard rejecting of weightsheet #{0} succesfully.".format($scope.CurrentWeightSheet.WeightSheetNumber);
                $scope.CurrentWeightSheet.Status = Status;
                alert(message);
            })
        }
    }
    */

    // нажатие кнопки "Назад"
    function vmBack() {
        // очистка всех свойств объекта
        function DelAllProps(obj, nested_obj_array, ignore_props_array) {
            nested_obj_array = nested_obj_array ? nested_obj_array : [];
            ignore_props_array = ignore_props_array ? ignore_props_array : [];
            for (key in obj) {
                if (obj.hasOwnProperty(key) && ignore_props_array.indexOf(key) == -1) {
                    // if Array -> clear it
                    if (Array.isArray(obj.hasOwnProperty(key))) {
                        obj[key].length = 0;
                    }
                        // if specify name -> recursively clear
                    else if (nested_obj_array.indexOf(key) != -1) {
                        DelAllProps(obj[key]);
                    }
                        //other -> null
                    else {
                        obj[key] = null;
                    }
                }
            }
        }
        // test another way to Back (prevent reloading tree)
        DelAllProps($scope.CurrentWeightSheet, ['CurrentWeighting'], null);
        DelAllProps($scope.SelectedObjects, null, ['weightsheet_id', 'Status', 'Platforms']);
        $scope.ShowWeightSheetNumberModalWindow = false;
        vmClearSelected();
        vmGetWSTree();
        $state.go('app.WeightAnalytics.WBStatic', { wb_id: wb_id, ws_id: null }, { notify: false })

        //$state.go('app.WeightAnalytics.WBStatic', { wb_id: wb_id, ws_id: null });
    }

    // Выбор вида отвесной при создании
    function vmWSTypeSelect(item) {
        //alert(item);
        $scope.ShowWeightSheetNumberModalWindow = true;
        $scope.SelectedObjects.WeightSheetNumber = null;
        // автоинкремент номера отвесной (для текущего года)
        var query = "v_WGT_DocumentationsExistCheck?$top=1&$select=WeightsheetNumber &$filter=Weightbridge eq '{0}' and DocumentationsType eq '{1}' and Status ne 'reject' and year(StartTime) eq {2} &$orderby=StartTime desc".format(wb_id, encodeURI("Отвесная"), new Date().getFullYear());
        return indexService.getInfo(query)
            .then(function (response) {
                // проверяем поле на неиспользование (т.е. если попытка ввода вручную, не обновляем)
                var pristine = $("#WSNumberCreation.ng-pristine");
                if (pristine.length && response.data.value && response.data.value[0]) {
                    var last_number = response.data.value[0]['WeightsheetNumber'];
                    last_number = last_number || 0;
                    last_number++;
                    $timeout(function () {
                        $scope.SelectedObjects.WeightSheetNumber = last_number.toString();
                    });
                }
                $("#WSNumberCreation").focus();
            })
    }

    // нажатие кнопки "Отменить создание отвесной"
    function vmCreateWSCancel() {
        //alert(item);
        $scope.SelectedObjects.WeightingMode = null;
        $scope.SelectedObjects.WeightSheetNumber = null;
        $scope.SelectedObjects.SenderShop = null;
        $scope.SelectedObjects.ReceiverShop = null;

        $scope.ShowWeightSheetNumberModalWindow = false;
    }


    // нажатие кнопки "Создать отвесную"
    function vmCreateWS(create_at_first_weighing) {
        //alert(item);
        if (!$scope.SelectedObjects.WeightingMode &&
            !$scope.SelectedObjects.WeightSheetNumber) {
            alert("Creating weightsheet failed! WeightingMode or WeightSheetNumber is missing!");
            return false;
        }

        // если Тарирование или Брутто - предварительно создавать не нужно
        // TEST Preliminary for all types of WS
        if (['Контроль брутто'].indexOf($scope.SelectedObjects.WeightingMode['Description']) > -1) {
            create_at_first_weighing = false;
            $scope.SelectedObjects.CreateWSAtFirstWeighing = false;
        }

        // если Погрузка или Разгрузка и отмечено "Брать из 1-ой путевой" - фиктивно создаем "предварительную" отвесную
        if (create_at_first_weighing &&
            ['Контроль брутто'].indexOf($scope.SelectedObjects.WeightingMode['Description']) == -1) {
            //alert("Need to handle CreateWSAtFirstWeighing");
            //create_at_first_weighing = false;

            $scope.CurrentWeightSheet.WeightSheetID = -9999;
            $scope.CurrentWeightSheet.WeightSheetNumber = $scope.SelectedObjects.WeightSheetNumber;
            $scope.CurrentWeightSheet.WeightingMode = $scope.SelectedObjects.WeightingMode;
            $scope.CurrentWeightSheet.Status = "preliminary";
            $scope.CurrentWeightSheet.Weigher = user;
            $timeout(function () {
                $("#WagonNumberSelect > .ui-select-focusser").focus();
            }, 10);

            return;
        }

        // если Погрузка или Разгрузка и отсутствует Отправитель или Получатель - ошибка
        if (['Тарирование', 'Контроль брутто'].indexOf($scope.SelectedObjects.WeightingMode['Description']) == -1 &&
            !($scope.SelectedObjects.SenderShop && $scope.SelectedObjects.ReceiverShop)) {
            alert("Creating weightsheet failed! Sender or Receiver is missing!");
            return false;
        }


        var WeightSheetNumber = $scope.SelectedObjects.WeightSheetNumber;
        var DocumentationsClassID = $scope.SelectedObjects.WeightingMode['ID'];
        var ScalesID = wb_id;
        var SenderID = $scope.SelectedObjects.SenderShop ? $scope.SelectedObjects.SenderShop['ID'] : null;
        var ReceiverID = $scope.SelectedObjects.ReceiverShop ? $scope.SelectedObjects.ReceiverShop['ID'] : null;

        // проверка существования номера отвесной
        function checkWeightsheetNumber(weightsheet_number, weightbridge_id) {
            var query = "v_WGT_DocumentationsExistCheck?$filter=WeightsheetNumber eq {0} and Weightbridge eq '{1}' and DocumentationsType eq '{2}' and Status ne 'reject' &$orderby=EndTime desc".format(weightsheet_number, weightbridge_id, encodeURI("Отвесная"));
            return indexService.getInfo(query);
        }

        // вставка новой отвесной в БД
        function insCreateWeightsheet() {
            /*HERE creating WS in DB, return ID of WS*/
            return indexService.sendInfo('ins_CreateWeightsheet', {
                WeightSheetNumber: WeightSheetNumber,
                DocumentationsClassID: DocumentationsClassID,
                ScalesID: ScalesID,
                PersonName: user,
                SenderID: SenderID,
                ReceiverID: ReceiverID,
                DocumentationID: 0
            })
        }

        // основная функция создания отвесной
        function mainCreateWeightsheet() {
            return checkWeightsheetNumber(WeightSheetNumber, ScalesID).then(function (response) {
                existing_weightsheet = response.data.value;
                // если существует - предлагаем все же добавить в БД
                if (existing_weightsheet && existing_weightsheet[0]) {
                    nearest_DT = existing_weightsheet[0]['StartTime'];
                    var date = new Date(nearest_DT).toLocaleDateString();
                    //console.log(new Date() + ". " + "checkWeightSheetNumber: WeightSheetNumber already exists.");
                    //var confirm_string = "Weightsheet #{0} ({1}) for weightbridge '{2}' already exists!\n".format(WeightSheetNumber, date, ScalesID) +
                    //                     "Do you want to create Weightsheet anyway?\n" +
                    //                     "If 'Cancel' Weightsheet will not be created.";
                    var confirm_string = $translate.instant('weightanalytics.Messages.checkWSConfirm').format(WeightSheetNumber, date, ScalesID);
                    if (!confirm(confirm_string)) {
                        //console.log("checkWeightSheetNumber confirm rejected");
                        return false;
                    }
                    //console.log(new Date() + ". " + "checkWeightSheetNumber confirm accepted.");
                    //return insCreateWeightsheet();
                }
                //console.log("-----");
                return insCreateWeightsheet();
            })
        }

        return mainCreateWeightsheet().then(function (response) {
            // если вернулся результат сохранения (ID записи), то возвращаем сохраненный объект
            if (response.data && response.data.ActionParameters) {

                $scope.CurrentWeightSheet.WeightingMode = $scope.SelectedObjects.WeightingMode;
                $scope.CurrentWeightSheet.WeightSheetNumber = $scope.SelectedObjects.WeightSheetNumber;
                $scope.CurrentWeightSheet.WeightBridgeID = wb_id;
                $scope.CurrentWeightSheet.SenderShop = $scope.SelectedObjects.SenderShop;
                $scope.CurrentWeightSheet.ReceiverShop = $scope.SelectedObjects.ReceiverShop;

                $scope.CurrentWeightSheet.WeightSheetID = response.data.ActionParameters[0]['Value'];
                $scope.SelectedObjects.weightsheet_id = $scope.CurrentWeightSheet.WeightSheetID;
                /*change url - adding WS_ID*/
                $state.go('app.WeightAnalytics.WBStatic', { wb_id: $scope.CurrentWeightSheet.WeightBridgeID, ws_id: $scope.CurrentWeightSheet.WeightSheetID }, { notify: false })
                // because notify is false - need to add Person and Create Date
                return vmGetWSInfo($scope.CurrentWeightSheet.WeightSheetID).then(function (weightsheet_object) {
                    //weightanalyticsService.GetWSInfo($scope.SelectedObjects.weightsheet_id).then(function (weightsheet_object) {
                    for (key in weightsheet_object) {
                        if ($scope.CurrentWeightSheet.hasOwnProperty(key)) {
                            $scope.CurrentWeightSheet[key] = weightsheet_object[key];
                        }
                    }
                    //$scope.WaybillNumbers = weightsheet_object.WaybillNumbers;
                    vmGetWagonTable($scope.CurrentWeightSheet.WeightSheetID);
                    //return 111;
                });

            }
                // если вернулся false, сообщение об отмене
            else {
                //alert($translate.instant('consigners.Messages.savingRejected'));
                $scope.SelectedObjects.WeightSheetNumber = null;
                alert($translate.instant('weightanalytics.Messages.savingWSRejected'));//alert('Saving has been rejected!');
                return false;
            }

        })
    }

    // нажатие кнопки "Взять вес"
    function vmTakeWeight() {
        // сделать кнопку неактивной (для исключения повторного нажатия)
        $scope.TakeWeightBtnDisabled = true;
        // если был флаг "CreateWSAtFirstWeighing" - вернуть Создание отвесной
        if ($scope.SelectedObjects.CreateWSAtFirstWeighing) {
            return vmCreateWS().then(function (response) {
                if (response === false) {
                    $scope.TakeWeightBtnDisabled = false;
                    return;
                }
                else {
                    $scope.SelectedObjects.CreateWSAtFirstWeighing = false;
                    return wrapperMainTakeWeight();
                }
            });
        }
        else {
            return wrapperMainTakeWeight();
        }

        function wrapperMainTakeWeight() {

            var ScalesID = $scope.CurrentWeightSheet.WeightBridgeID;
            var WeightSheetID = $scope.CurrentWeightSheet.WeightSheetID;
            var WaybillID = $scope.CurrentWeightSheet.CurrentWeighting.WaybillID;
            var WagonID = $scope.CurrentWeightSheet.CurrentWeighting.WagonID;
            var WagonNumber = $scope.CurrentWeightSheet.CurrentWeighting.WagonNumber;
            var CurrentWeight = $scope.CurrentMeasuring.Weight;
            var WagonTypeID = $scope.SelectedObjects.WagonType.ID;
            var CargoTypeID = $scope.SelectedObjects.CargoType ? $scope.SelectedObjects.CargoType.ID : null;
            //CurrentWeight = 49;

            if (!(ScalesID && WeightSheetID && WagonNumber && WagonTypeID)) {
                alert("Error! ScalesID or WeightSheetID or WagonNumber or WagonTypeID is missing!");
                $scope.TakeWeightBtnDisabled = false;
                return;
            }

            if (['Погрузка'].indexOf($scope.CurrentWeightSheet.WeightingMode['Description']) > 1 &&
                $scope.CurrentPairNumberTare.Tare && CurrentWeight < $scope.CurrentPairNumberTare.Tare) {
                alert("Тара превышает текущий вес!");
                $scope.TakeWeightBtnDisabled = false;
                return;
            }

            return mainTakeWeight().then(function (resp) {
                $scope.TakeWeightBtnDisabled = false;
                // if checkWagonExists was rejected
                if (resp === false) {
                    return;
                }
                // после взятия веса
                alert($translate.instant('weightanalytics.Messages.takeWeightSuccess'));//alert('Вес зарегистрирован.');
                $scope.CurrentPairNumberTare = null;
                $scope.SelectedObjects.WagonNumber = null;
                $scope.SelectedObjects.WBNumber = null;
                $scope.CurrentWeightSheet.CurrentWeighting['WagonNumber'] = null;
                // обновить таблицу
                vmGetWagonTable($scope.CurrentWeightSheet.WeightSheetID);

            })
            //.error(function (err) {
            //    alert(err);
            //})


            // проверка существования номера вагона
            function checkWagonExists(wagon_type_id, wagon_number) {
                var queryPackagingUnits = "PackagingUnits?$filter=PackagingClassID eq {0} and Description eq '{1}' &$orderby=ID".format(wagon_type_id, wagon_number);
                return indexService.getInfo(queryPackagingUnits);
            };

            // вставка нового вагона в БД
            function insertNewWagon(wagon_type, wagon_number) {
                return indexService.sendInfo('ins_PackagingUnits', {
                    WagonNumber: wagon_number,
                    PackagingClass: wagon_type,
                    PackagingUnitsID: 0
                });
                //var data = { data: { ActionParameters: [{ Value: 100500 }] } };
                //return $q.when(data);
            };

            // вставка Тарирования в БД
            function ins_TakeWeightTare() {
                return indexService.sendInfo('ins_TakeWeightTare', {
                    WeightsheetID: WeightSheetID,
                    ScalesID: ScalesID,
                    PackagingUnitsID: WagonID,
                    WeightTare: CurrentWeight,
                    PackagingUnitsDocsID: 0
                });
            };

            // вставка Загрузки в БД
            function ins_TakeWeightLoading() {
                return indexService.sendInfo('ins_TakeWeightLoading', {
                    WeightsheetID: WeightSheetID,
                    ScalesID: ScalesID,
                    WaybillID: WaybillID,
                    WeightBrutto: CurrentWeight
                });
            };

            // вставка Разгрузки в БД
            function ins_TakeWeightUnloading() {
                return indexService.sendInfo('ins_TakeWeightUnloading', {
                    WeightsheetID: WeightSheetID,
                    ScalesID: ScalesID,
                    WaybillID: WaybillID,
                    WeightBrutto: CurrentWeight
                });
            };

            // вставка Брутирования в БД
            function ins_TakeWeightBrutto() {
                return indexService.sendInfo('ins_TakeWeightBrutto', {
                    WeightsheetID: WeightSheetID,
                    ScalesID: ScalesID,
                    //WaybillID: WaybillID,
                    WeightBrutto: CurrentWeight,
                    PackagingUnitsID: WagonID,
                    MaterialDefinitionID: CargoTypeID
                });
            };

            // взятие веса в зависимости от вида отвесной
            function ins_TakeWeight() {
                switch ($scope.CurrentWeightSheet.WeightingMode['Description']) {
                    case 'Тарирование': {
                        return ins_TakeWeightTare();
                    }
                    case 'Погрузка': {
                        return ins_TakeWeightLoading();
                    }
                    case 'Разгрузка': {
                        return ins_TakeWeightUnloading();
                    }
                    case 'Контроль брутто': {
                        return ins_TakeWeightBrutto();
                    }
                    default: return $q.when(false);
                }
            }

            // главная функция взятия веса
            function mainTakeWeight() {
                // проверяем существование вагона
                return checkWagonExists(WagonTypeID, WagonNumber).then(function (response) {
                    var Wagon = response.data.value;
                    // если не существует - предлагаем добавить вагон в БД
                    if (Wagon[0] == null) {
                        //console.log(new Date() + ". " + "checkWagonExists: Wagon does not exist.");

                        var confirm_string = $translate.instant('consigners.Messages.checkWagonExistsConfirm').format(WagonNumber);
                        //var confirm_string = "Wagon #{0} doesnt exist!\n".format(WagonNumber) +
                        //                     "Do you want to add this wagon to DB?\n" +
                        //                     "If 'Cancel' waybill will not be created.";
                        if (confirm(confirm_string)) {
                            //console.log(new Date() + ". " + "checkWagonExists confirm accepted.");
                            return insertNewWagon(WagonTypeID, WagonNumber).then(function (response) {
                                //console.log(new Date() + ". " + "New wagon has been created.");
                                if (response.data.ActionParameters) {
                                    WagonID = response.data.ActionParameters[0]['Value'];
                                    // после создания вагона - создаем новое взвешивание в БД
                                    return ins_TakeWeight();
                                }
                                else {
                                    alert($translate.instant('consigners.Messages.errorCreatingWagon'));//alert("Error during creating new wagon!");
                                }
                            })
                        }
                        else {
                            //console.log("checkWagonExists confirm rejected");
                        }
                    }
                        // если существует - создаем новое взвешивание в БД
                    else {
                        //console.log(new Date() + ". " + "checkWagonExists: Wagon exists.");
                        WagonID = Wagon[0]['ID'];
                        return ins_TakeWeight();
                    }
                    //console.log("-----");
                    $scope.TakeWeightBtnDisabled = false;
                    return false;
                });
            }
        }

    }


    // нажатие кнопки "Обновить тару в отвесной"
    function vmUpdateTare() {
        //alert("UpdateTare");
        var WeightSheetID = $scope.CurrentWeightSheet.WeightSheetID;
        indexService.sendInfo('ins_TakeWeightUnloadingTare', {
            WeightsheetID: WeightSheetID
        }).then(function (response) {
            vmGetWagonTable(WeightSheetID);
            alert($translate.instant('weightanalytics.Messages.updateTareSuccess'));//alert("Tare updated successfully.");
        })
    }


    //
    function vmCheckZeroingEnable() {
        indexService.getInfo("v_EquipmentProperty?$filter=EquipmentID eq {0} and Property eq '{1}'".format(wb_id, "ZEROING_TAG"))
        .then(function (response) {
            var zeroingEnable = response.data.value.length > 0 ? true : false;
            $scope.CurrentMeasuring.ZeroingEnable = zeroingEnable;
        })
    }

    // обнулить весы
    function vmZeroingScales() {
        if ($scope.CurrentMeasuring.Weight == 0 || Math.abs($scope.CurrentMeasuring.Weight) > 1) return;
        if (confirm($translate.instant('weightanalytics.Messages.zeroWBConfirm'))) {
            indexService.sendInfo("ins_JobOrderOPCCommandZeroingScales", {
                ScalesID: wb_id
            })
            .then(function (response) {
                alert($translate.instant('weightanalytics.Messages.zeroWBSuccess'));
            });
        }
    }


    // получение онлайн показаний весов
    function vmGetScaleData() {
        var pathScalesDetail = "v_AvailableWeighbridgesInfo?$filter=EquipmentID eq {0}".format(wb_id);
        indexService.getInfo(pathScalesDetail)
            .then(function (response) {
                var response = response.data.value[0];
                // проверка isExit и plot, чтобы исключить ошибку plotа "Target dimension is not set"
                if (!isExit && plot && response) {
                    // если есть ответ, обновляем переменные новыми значениями
                    $scope.CurrentMeasuring.Fault = false;
                    $scope.CurrentMeasuring.OffsetX = response.L_bias_weight;
                    $scope.CurrentMeasuring.OffsetY = response.H_bias_weight;
                    $scope.CurrentMeasuring.WeightStab = response.stabilizing_weight;
                    // определяем суммарный вес в зависимости от выбранных платформ
                    var sum_weight = 0;
                    for (var i = 0; i < Object.keys($scope.SelectedObjects.Platforms).length; i++) {
                        var pl = Object.keys($scope.SelectedObjects.Platforms)[i];
                        var isPlatfActive = $scope.SelectedObjects.Platforms[pl];
                        sum_weight += isPlatfActive ? response[pl] : 0;
                        $scope.CurrentMeasuring.PlatformWeights[pl] = (Math.round(response[pl] * 100)) / 100;;
                    }
                    // округляем вес до сотых
                    $scope.CurrentMeasuring.Weight = (Math.round(sum_weight * 100)) / 100;
                    vmRedrawArrow(sum_weight);
                }
                else {
                    // если нет ответа - ошибка
                    $scope.CurrentMeasuring.Weight = -99.99;
                    $scope.CurrentMeasuring.OffsetX = -99.99;
                    $scope.CurrentMeasuring.OffsetY = -99.99;
                    $scope.CurrentMeasuring.WeightStab = false;
                    $scope.CurrentMeasuring.Fault = true;
                };
            });
    };



    // выбор вида вагона
    function vmWagonTypeSelect(wagon_type) {
        if (!wagon_type || !wagon_type['ID']) { return; }

        // получение WagonNumberPattern
        consignersService.GetWagonNumberPattern(wagon_type)
        .then(function (pattern) {
            $scope.CurrentWeightSheet.CurrentWeighting.WagonNumberPattern = pattern;
        })

        // доступные платформы
        var selected_platforms = Object.keys($scope.SelectedObjects.Platforms);
        var active_platforms = [];
        // заполняем массив активных платформ
        for (var i = 0; i < PlatformWagonClassArray.length; i++) {
            var item = PlatformWagonClassArray[i];
            if (item['WagonClassID'] == wagon_type['ID']) {
                for (var j = 0; j < item['Weight'].length; j++) {
                    active_platforms.push(item['Weight'][j]);
                }
                break;
            }
        }
        // отмечаем все активные платформы в доступных
        selected_platforms.forEach(function (elem, i) {
            for (var i = 0; i < active_platforms.length; i++) {
                if (elem == active_platforms[i]) {
                    $scope.SelectedObjects.Platforms[elem] = true;
                    break;
                }
                else {
                    $scope.SelectedObjects.Platforms[elem] = false;
                }
            }
        })
    }


    // получение списка номеров пар лафет-короб
    function vmGetWagonNumbers(search) {
        var array = [];
        if ($scope.WagonManualEnterDisabled) {
            array = WBs_Wagons.slice();
        }
            // если № вагона введен первым
        else if (search) {
            array.unshift(search);
        }
        return array;
    }

    // выбор номера пары лафет-короб
    function vmSelectWagonNumber(selected_wagon_number) {
        // если № вагона не null
        if ($scope.SelectedObjects.WagonNumber) {
            if ($scope.SelectedObjects.WBNumber == null) {
                $scope.WBManualEnterDisabled = true;
            }
            else if ($scope.WagonManualEnterDisabled) {
                //alert(selected_wagon_number['WagonNumber']);
                vmGetWB(selected_wagon_number['WaybillID']);
                return;
            }

            // если режим Тарирование или Контроль брутто
            //if ($scope.CurrentWeightSheet.WeightingMode['Description'] == 'Тарирование') {
            if (['Тарирование', 'Контроль брутто'].indexOf($scope.CurrentWeightSheet.WeightingMode['Description']) > -1) {
                //alert("Тарирование: " + selected_wagon_number);
                $scope.CurrentPairNumberTare = null;
                $scope.CurrentWeightSheet.CurrentWeighting['WagonNumber'] = selected_wagon_number;
                $scope.CurrentWeightSheet.CurrentWeighting['WagonID'] = null;
                if (!selected_wagon_number) { return; }
                indexService.getInfo("PackagingUnits?$filter=Description eq '{0}'".format(selected_wagon_number))
                .then(function (response) {
                    if (response.data.value[0]) {
                        var wagon_id = response.data.value[0]['ID'];
                        $scope.CurrentWeightSheet.CurrentWeighting['WagonID'] = wagon_id;
                        var wagon_type_id = response.data.value[0]['PackagingClassID'];
                        $scope.SelectedObjects.WagonType = $filter('filter')($scope.WagonTypes, { ID: wagon_type_id })[0];
                        vmWagonTypeSelect($scope.SelectedObjects.WagonType);
                        // получить тару
                        vmGetWagonTare(wagon_id);
                    }
                })
                return;
            }

            $scope.WBShowLoading = true;
            var query = "v_WGT_WaybillWagonMatching?$filter= WagonNumber eq '{0}' &$orderby=ID desc".format(selected_wagon_number);
            indexService.getInfo(query)
                .then(function (response) {
                    WBs_Wagons = response.data.value;
                    if (WBs_Wagons.length) {
                        $scope.SelectedObjects.WBNumber = WBs_Wagons[0];
                        //alert($scope.SelectedObjects.WBNumber['WaybillNumber']);
                        vmGetWB($scope.SelectedObjects.WBNumber['WaybillID']);
                    }
                    else {
                        $scope.SelectedObjects.WBNumber = null;
                    }
                    //$scope.SelectedObjects.WBNumber = WBs_Wagons.length ? WBs_Wagons[0] : null;
                    $scope.WBShowLoading = false;
                })
        }
            // если № вагона = null
        else {
            if ($scope.WBManualEnterDisabled) {
                $scope.SelectedObjects.WBNumber = null;
                vmClearSelected();
            }
            $scope.CurrentPairNumberTare = null;
        }
    };


    // получение списка путевых
    function vmGetWBNumbers(search) {
        var array = [];
        if ($scope.WBManualEnterDisabled) {
            array = WBs_Wagons.slice();
        }
            // если № путевой введен первым
        else if (search) {
            array.unshift(search);
        }
        return array;
    }

    // выбор номера путевой
    function vmSelectWBNumber(selected_wb_number) {

        // если № путевой не null
        if ($scope.SelectedObjects.WBNumber) {
            if ($scope.SelectedObjects.WagonNumber == null) {
                $scope.WagonManualEnterDisabled = true;
            }
            else if ($scope.WBManualEnterDisabled) {
                //alert(selected_wb_number['WaybillNumber']);
                vmGetWB(selected_wb_number['WaybillID']);
                return;
            }
            $scope.WagonShowLoading = true;
            var query = "v_WGT_WaybillWagonMatching?$filter= WaybillNumber eq '{0}' &$orderby=ID desc".format(selected_wb_number);
            indexService.getInfo(query)
                .then(function (response) {
                    WBs_Wagons = response.data.value;
                    if (WBs_Wagons.length) {
                        $scope.SelectedObjects.WagonNumber = WBs_Wagons[0];
                        //alert($scope.SelectedObjects.WagonNumber['WagonNumber']);
                        vmGetWB($scope.SelectedObjects.WagonNumber['WaybillID']);
                    }
                    else {
                        $scope.SelectedObjects.WagonNumber = null;

                        $scope.CurrentPairNumberTare = null;
                        angular.forEach($scope.CurrentWeightSheet.CurrentWeighting, function (value, key) {
                            $scope.CurrentWeightSheet.CurrentWeighting[key] = null;
                        });
                    }
                    //$scope.SelectedObjects.WagonNumber = WBs_Wagons.length ? WBs_Wagons[0] : null;
                    $scope.WagonShowLoading = false;
                })
        }
            // если № путевой = null
        else {
            if ($scope.WagonManualEnterDisabled) {
                $scope.SelectedObjects.WagonNumber = null;
                vmClearSelected();
            }
        }
    };

    // очистка выбранных полей при очистке Путевой или вагона
    function vmClearSelected() {
        WBs_Wagons.length = 0;
        $scope.WagonManualEnterDisabled = false;
        $scope.WBManualEnterDisabled = false;

        $scope.SelectedObjects.CargoType = null;
        $scope.SelectedObjects.WagonType = null;
        $scope.CurrentPairNumberTare = null;

        angular.forEach($scope.CurrentWeightSheet.CurrentWeighting, function (value, key) {
            $scope.CurrentWeightSheet.CurrentWeighting[key] = null;
        });

        //$scope.isWagonTypeDisabled = false;
        //$scope.isCargoTypeDisabled = false;
    }

    // получение информации по путевой при выборе ИЛИ вагона ИЛИ номера путевой
    function vmGetWB(waybill_id) {
        $scope.SelectedObjects.CargoType = null;
        $scope.SelectedObjects.WagonType = null;
        $scope.CurrentPairNumberTare = null;

        // имея ID путевой, получаем инфу по ней
        consignersService.GetWaybillObject(waybill_id)
            .then(function (waybill_obj) {
                var msg = '';
                msg += 'WaybillID: ' + waybill_obj['ID'] + '\n';
                msg += 'WaybillNumber: ' + waybill_obj['WaybillNumber'] + '\n';
                msg += 'Created: ' + waybill_obj['CreateDT'] + '\n';
                msg += 'SenderShop: ' + waybill_obj.SenderShop['Description'] + '\n';
                msg += 'ReceiverShop: ' + waybill_obj.ReceiverShop['Description'] + '\n';
                msg += 'WagonType: ' + waybill_obj.WagonType['Description'] + '\n';
                msg += 'WagonNumber: ' + waybill_obj['WagonNumbers'] + '\n';

                //alert(msg);

                $scope.CurrentWeightSheet.CurrentWeighting['WaybillID'] = waybill_obj['ID'];
                $scope.CurrentWeightSheet.CurrentWeighting['WaybillNumber'] = waybill_obj['WaybillNumber'];
                // fill CargoType combobox from waybill_obj
                if (waybill_obj.CargoType) {
                    $scope.SelectedObjects.CargoType = waybill_obj.CargoType;
                    $scope.CurrentWeightSheet.CurrentWeighting['CargoTypeID'] = waybill_obj.CargoType['ID'];
                }
                // fill WagonType combobox from waybill_obj
                if (waybill_obj.WagonType) {
                    $scope.SelectedObjects.WagonType = waybill_obj.WagonType;
                    vmWagonTypeSelect(waybill_obj.WagonType);
                }
                // get Wagon info (Number and ID)
                if ($scope.SelectedObjects.WagonNumber.hasOwnProperty('ID')) {
                    $scope.CurrentWeightSheet.CurrentWeighting['WagonNumber'] = $scope.SelectedObjects.WagonNumber['WagonNumber'];
                    $scope.CurrentWeightSheet.CurrentWeighting['WagonID'] = $scope.SelectedObjects.WagonNumber['PackagingUnitsID'];
                }
                else if (waybill_obj.WagonNumbers && $scope.SelectedObjects.WagonNumber) {
                    var wagon = $filter('filter')(waybill_obj.WagonNumbers, { Description: $scope.SelectedObjects.WagonNumber })[0];
                    $scope.CurrentWeightSheet.CurrentWeighting['WagonNumber'] = wagon['Description'];
                    $scope.CurrentWeightSheet.CurrentWeighting['WagonID'] = wagon['PackagingUnitsID'];
                }
                // получить тару
                vmGetWagonTare($scope.CurrentWeightSheet.CurrentWeighting['WagonID']);

                //!!!!!!! ADD fill Sender and Receiver if CreateWSAtFirstWeighing == true
                if ($scope.SelectedObjects.CreateWSAtFirstWeighing) {
                    if (waybill_obj['CargoSender']) {
                        $scope.SelectedObjects.SenderShop = {
                            ID: waybill_obj.CargoSender['ParentID'],
                            Description: waybill_obj.CargoSender['ParentDescription']
                        };
                    }
                    if (waybill_obj['CargoReceiver']) {
                        $scope.SelectedObjects.ReceiverShop = {
                            ID: waybill_obj.CargoReceiver['ParentID'],
                            Description: waybill_obj.CargoReceiver['ParentDescription']
                        };
                    }
                }

                //$scope.isWagonTypeDisabled = true;
                //$scope.isCargoTypeDisabled = true;

            })
    }

    // получение тары вагона
    function vmGetWagonTare(wagon_id) {
        if (!wagon_id) { return; }
        $scope.CurrentPairNumberTare = null;
        indexService.getInfo("v_KP4_PackagingUnitsProperty?$filter=ID eq {0}".format(wagon_id))
            .then(function (resp) {
                var TareInfo = resp.data.value;
                if (TareInfo.length) {
                    var DT = null;
                    if (TareInfo[0]['ValueTime']) {
                        DT = new Date(TareInfo[0]['ValueTime']);
                        DT.setMinutes(DT.getMinutes() + DT.getTimezoneOffset());
                    }
                    $scope.CurrentPairNumberTare = { Tare: TareInfo[0]['Value'], DT: DT };
                }
                //$scope.CurrentPairNumberTare = TareInfo.length ? TareInfo[0].Value : null;
            })
    }


    // обновить таблицу с данными по отвесной
    function vmGetWagonTable(weightsheetid) {
        indexService.getInfo("v_WGT_Weightsheet?$filter=WeightsheetID eq {0} &$orderby=ID desc".format(weightsheetid))
        .then(function (response) {
            if (response.data.value) {
                if ($scope.CurrentWeightSheet && $scope.CurrentWeightSheet.Weighings) {
                    $scope.CurrentWeightSheet.Weighings = response.data.value;
                }
            }
        })
    };


    // забраковать взвешивание
    function vmRejectWeighing(weighing_id, wagon_number) {
        //var confirm_string = "Are you sure to reject weighing for wagon #{0}?".format(wagon_number);
        var confirm_string = $translate.instant('weightanalytics.Messages.rejectWeighingConfirm').format(wagon_number);
        // если подтвердили забраковку
        if (confirm(confirm_string)) {
            indexService.sendInfo("upd_WeightingOperations", {
                WeightingOperationsID: weighing_id,
                Status: 'reject'
            }).then(function (response) {
                //var message = "Weighing for wagon #{0} rejected succesfully.".format(wagon_number);
                var message = $translate.instant('weightanalytics.Messages.rejectWeighingSuccess').format(wagon_number);
                vmGetWagonTable($scope.CurrentWeightSheet.WeightSheetID);
                alert(message);
            })
        }
    }


    // перенести взвешивание в другую отвесную
    $scope.TransferWeighing = function (weighing_id) {
        alert(weighing_id);
    }






    // открытие модального окна Путевой
    $('#WaybillModal').on('show.bs.modal', function (e) {
        $scope.ShowWaybillModal = true;
        $('#ModalLoading').css("display", "block");
    })

    // закрытие модального окна Путевой
    $('#WaybillModal').on('hide.bs.modal', function (e) {
        $scope.ShowWaybillModal = false;
    })


    // при выходе из контроллера останавливаем таймер
    $scope.$on('$destroy', function () {
        $interval.cancel(Timer);
        isExit = true;
    });


}])


// контроллер печати отвесной
.controller('WeightAnalyticsWSPrintCtrl', ['$http', '$scope', 'weightanalyticsService', 'printService', '$state', '$translate', 'user', function ($http, $scope, weightanalyticsService, printService, $state, $translate, user) {

    $scope.toprint = true;
    $scope.ReadyToPrint = vmReadyToPrint;

    // если Weighings заполнена (т.е. вызываем печать из открытой отвесной)
    if ($scope.CurrentWeightSheet.Weighings && $scope.CurrentWeightSheet.Weighings.length) {
        $scope.CurrentWeightSheet.Weighings.Totals = null;
        CheckWagonExists();
    }
        // если Weighings не заполнена (т.е. вызываем печать из дерева отвесных)
    else {
        weightanalyticsService.GetWSInfo($scope.SelectedObjects.weightsheet_id).then(function (weightsheet_object) {
            var ttt = weightsheet_object;
            if (weightsheet_object) {
                $scope.CurrentWeightSheet = weightsheet_object;
                //$scope.WeightSheetForPrint = weightsheet_object.Weighings;
                //$scope.WeightSheetForPrint.Totals = null;
                $scope.CurrentWeightSheet.Weighings.Totals = null;
                vmCheckWSToPrint();
            }
        })
    }

    // проверка отвесной на заполнение (если да - то скрываем в HTML)
    function vmCheckWSToPrint() {
        CheckWagonExists();

        if ($scope.CurrentWeightSheet.Status != 'closed') {
            alert($translate.instant('weightanalytics.Messages.notClosedWS')); //alert("Weightsheet is not complete!");
            if ($scope.$parent.$parent.CreateWSToPrint) {
                $scope.$parent.$parent.CreateWSToPrint = false;
            }
        }
    }

    // проверяет отвесную на наличие незабрак. взвешиваний
    function CheckWagonExists() {
        var no_reject_wagons = $scope.CurrentWeightSheet.Weighings.filter(function (element) {
            return element.Status != 'reject';
        });
        if (!no_reject_wagons.length) {
            alert($translate.instant('weightanalytics.Messages.noWagonsInWS'));//alert("There is no wagon in Weightsheet!");            
            if ($scope.$parent.$parent.CreateWSToPrint) {
                $scope.$parent.$parent.CreateWSToPrint = false;
                return;
            }
        }
    }

    // Печать после отрисовки таблицы!
    function vmReadyToPrint() {
        //alert("Ready to Print!");
        // add QRcode
        QRgen();
        var ws_toprint_html = document.getElementById('WS_toprint');
        var inner_html = ws_toprint_html.innerHTML;
        var autoprint = "";
        var fix_print = "";
        autoprint = "\n\<script type=\"text/javascript\">\n\window.onload=function(){window.print();window.close();} \n\ </script>\n";
        fix_print = "\n\<script type=\"text/javascript\">\n" +
            'var heightImage = document.getElementById("qr").clientHeight; var row_count = document.getElementsByClassName("WBrow")[0].rows.length; var new_height_tr = heightImage/row_count;' +
            'for(var i=0; i<row_count; i++) {document.getElementsByClassName("WBrow")[0].getElementsByTagName("tr")[i].style.height = new_height_tr + "px";} \n\ </script>\n';
        var str = "\
            <!DOCTYPE html>\n\
            <html>\n\
            <head>\n\
                <meta http-equiv=\"content-type\" content=\"text/html; charset=UTF-8\">\n\
                <meta name=\"viewport\" content=\"width=device-width\">\n\
                <meta http-equiv=\"X-UA-Compatible\" content=\"IE=9\">\n\
                <title>{1} № {0}</title>\n\
            </head>\n\
            <body>\n\
        ".format($scope.CurrentWeightSheet.WeightSheetNumber, $translate.instant('weightanalytics.Table.weightsheet'));
        inner_html = str + inner_html + "</body>" + autoprint + fix_print + "</html>"

        // Проверка на удаленную или локальную печать
        if ($scope.RemotePrint) {
            SendToPrintService(inner_html, $scope.CurrentWeightSheet, $state.params["wb_id"]);
        }
        else {
            // Открыть документ в новом окне (или послать inner_html в сервис печати)
            var printWindow = window.open('', '_blank');
            printWindow.document.open();
            printWindow.document.write(inner_html);
            printWindow.document.close();
        }
        // После печати удаляем WS_toprint ui-view
        $scope.$parent.$parent.CreateWSToPrint = false;

    }

    // QR code generator
    function QRgen() {
        // Returns full URL
        var url = $state.href($state.current.name, { wb_id: $scope.CurrentWeightSheet['WeightBridgeID'], ws_id: $scope.CurrentWeightSheet['WeightSheetID'] }, { absolute: true })
        // create QR as canvas (larger dimentions for better quality)
        var qr = $('#WS_QR').qrcode({
            //render: "table",
            width: "300",
            height: "300",
            text: url
        });
        var canvas = angular.element("#WS_QR > canvas");
        if (canvas && canvas[0]) {
            // convert canvas to PNG
            var qr_img = canvas[0].toDataURL("image/png");
            $("#WS_QR").replaceWith('<img id="qr" style="height:26mm;" src="' + qr_img + '"/>');
        }
    }

    // функция отправки на сервис печати
    function SendToPrintService(content, ws, equip_id) {
        var id = ws.WeightSheetID;
        var data = { ID: id, DocumentName: "Отвесная №" + ws.WeightSheetNumber, Content: content, User: user };
        //printService.Print(data)
        printService.Print(equip_id, data)
            .then(function (response) {
                alert(response);
                return;
            }, function (error) {
                alert("Error during sending to PrintService!");
            });
    }

}])




.controller('WaybillPreviewCtrl', ['$scope', 'consignersService', function ($scope, consignersService) {

    $scope.CurrentWaybill = {};
    var waybill_id = $scope.waybill_id;
    $scope.$parent.WaybillInfoReady = false;
    /* !!! get full waybill info here */
    consignersService.GetWaybillObject(waybill_id)
    .then(function (waybill_obj) {
        $scope.CurrentWaybill = waybill_obj;
        $scope.$parent.WaybillInfoReady = true;
        $('#ModalLoading').css("display", "none");
    })


}])





.service('weightanalyticsService', ['indexService', '$q', '$filter', function (indexService, $q, $filter) {

    // возвращает виды отвесных
    this.GetWSTypes = function () {
        var filter_str = "Отвесная";
        filter_str = encodeURI(filter_str);
        var pathWSTypes = "v_DocumentationsClass?$filter=ParentDescription eq '{0}' &$orderby=ID".format(filter_str);
        var request = indexService.getInfo(pathWSTypes);
        //return request;
        return request.then(function (response) {
            if (response.data && response.data.value && response.data.value.length) {
                for (var i = 0; i < response.data.value.length; i++) {
                    var tooltip = "";
                    switch (response.data.value[i]['Description']) {
                        case "Тарирование": {
                            response.data.value[i]['Tooltip'] = response.data.value[i]['Description'];
                            break;
                        }
                        case "Погрузка": {
                            response.data.value[i]['Tooltip'] = "Взвешивание вагона после его предварительного тарирования";
                            break;
                        }
                        case "Разгрузка": {
                            response.data.value[i]['Tooltip'] = "Взвешивание вагона и последующее его тарирование после разгрузки";
                            break;
                        }
                        case "Контроль брутто": {
                            response.data.value[i]['Tooltip'] = "Контроль брутто (например, транзитный груз)";
                            break;
                        }
                        default: {
                            response.data.value[i]['Tooltip'] = response.data.value[i]['Description'];
                        }
                    }
                }
            }
            return response;
        });
    };

    // возвращает перечень платформ для весов
    this.GetWBPlatforms = function (wb_id) {
        var prop = "WEIGHBRIDGES_PLATFORMS";
        var request = indexService.getInfo("v_EquipmentProperty?$filter=EquipmentID eq {0} and Property eq '{1}' &$orderby=ID".format(wb_id, prop));
        return request;
    };

    // возвращает соответствие платформ видам вагонов
    this.GetWBPlatfWagons = function (wb_id) {
        var prop = "WEIGHBRIDGES_PLATFORMS_WAGON_CLASS";
        var request = indexService.getInfo("v_EquipmentProperty?$filter=EquipmentID eq {0} and Property eq '{1}' &$orderby=ID".format(wb_id, prop));
        return request;
    };

    // возвращает список отвесных для заданных весов
    this.GetWSList = function (wb_id, show_active) {
        var pathGetWSList = "v_WGT_WeightsheetList";
        pathGetWSList = pathGetWSList + (show_active ? "?$filter=(WeightbridgeID eq '{0}' or WeightbridgeID eq null) and (Status eq 'active' or ParentID eq '%23')" : "?$filter=WeightbridgeID eq '{0}' or WeightbridgeID eq null");
        pathGetWSList = pathGetWSList + " &$orderby=ID";
        //return indexService.getInfo("v_WGT_WeightsheetList?$filter=WeightbridgeID eq '{0}' or WeightbridgeID eq null &$orderby=ID".format(wb_id))
        return indexService.getInfo(pathGetWSList.format(wb_id))
        .then(function (response) {
            var list = response.data.value;
            if (list.length) {
                list.forEach(function (e) {
                    e.id = e.ID;
                    e.parent = e.ParentID;
                    e.text = e.Description;
                    if (e.DocumentationsID) {
                        e.text = e.Description + ' (' + e.Creator + ')';

                        e.icon = 'jstree-file';
                        if (e.Status == 'reject') {
                            e.icon = 'jstree-reject';
                        }
                        if (e.Status == 'closed') {
                            e.icon = 'jstree-finalize';
                        }
                    };
                    delete e.ID;
                    delete e.ParentID;
                    delete e.Description;
                });

                return list;
            };
        });
    };

    // возвращает всю информацию по отвесной (возвращает объект weightsheet_object)
    this.GetWSInfo = function (id) {
        if (!id) return;
        var weightsheet_object = {};
        return $q.all([indexService.getInfo("v_WGT_DocumentsProperty?$filter=DocumentationsID eq {0} &$orderby=ID".format(id)),
                       indexService.getInfo("v_WGT_Weightsheet?$filter=WeightsheetID eq {0} &$orderby=ID desc".format(id)),
        ])
        .then(function (responses) {
            var resp_1 = responses[0].data.value;
            var resp_2 = responses[1].data.value;

            var prop_queries_array = [
                        { prop: "SenderShop", query: "Equipment?$filter=ID eq {0}&$orderby=ID" },
                        { prop: "ReceiverShop", query: "Equipment?$filter=ID eq {0}&$orderby=ID" },
                        { prop: "DocumentType", query: "v_DocumentationsClass?$filter=ID eq {0}&$orderby=ID" },
                        //{ prop: "Weightbridge", query: "Equipment?$filter=ID eq {0}&$orderby=ID" },
            ];
            var actual_prop_queries_array = [];

            weightsheet_object.WeightSheetID = id;
            if (resp_1) {
                for (i = 0; i < resp_1.length; i++) {
                    var prop = resp_1[i];
                    var filtered_item = prop_queries_array.filter(function (item) {
                        return item['prop'] === prop['Description2'];
                    })[0];
                    if (filtered_item) {
                        var query = filtered_item['query'].format(prop['Value']);
                        var query_item = { prop: prop['Description2'], query: query };
                        actual_prop_queries_array.push(query_item);
                        //alert(query);
                    }
                    else {
                        switch (prop['Description2']) {
                            case "WeightsheetNumber": {
                                weightsheet_object.WeightSheetNumber = prop['Value2'];
                                break;
                            }
                            case "StartTime": {
                                weightsheet_object.CreateDT = prop['Value2'];
                                break;
                            }
                            case "EndTime": {
                                weightsheet_object.EditDT = prop['Value2'] || null;
                                break;
                            }
                            case "Weightbridge": {
                                weightsheet_object.WeightBridgeID = prop['Value'];
                                weightsheet_object.WeightBridge = prop['Value2'];
                                break;
                            }
                            default: {
                                weightsheet_object[prop['Description2']] = prop['Value2'];
                            }
                        }
                    }
                }
            }
            if (resp_2) {
                weightsheet_object.Weighings = resp_2;
            }

            return $q.all(actual_prop_queries_array.map(function (item) { return indexService.getInfo(item['query']) }))
            .then(function (responses) {
                //console.log("!");
                actual_prop_queries_array.forEach(function (item, i) {
                    //console.log(item);
                    item['response'] = responses[i].data.value[0];
                    if (item['response']) {
                        //weightsheet_object[actual_prop_queries_array[i]['prop']] = item['response'];
                        switch (actual_prop_queries_array[i]['prop']) {
                            case "SenderShop": {
                                var sender = { ID: item['response']['ID'], Description: item['response']['Description'] };
                                weightsheet_object.SenderShop = sender; //item['response'];
                                break;
                            }
                            case "ReceiverShop": {
                                var receiver = { ID: item['response']['ID'], Description: item['response']['Description'] };
                                weightsheet_object.ReceiverShop = receiver; //item['response'];
                                break;
                            }
                            case "DocumentType": {
                                weightsheet_object.WeightingMode = item['response'];
                                break;
                            }
                        }
                    }
                })

                return weightsheet_object;
            })
        })
    };

}])



.service('printService', ['$http', 'indexService', '$q', '$filter', 'printServiceUrl', function ($http, indexService, $q, $filter, printServiceUrl) {

    // отправка на сервис печати
    this.Print = function (equip_id, data) {
        return indexService.getInfo("v_PrinterSettings?$filter=EquipmentID eq {0}".format(equip_id))
        .then(function (response) {
            var settings = response.data.value;
            var query_array = [];
            settings.forEach(function (el, i) {
                var printSettings = { PaperSize: el['PAPER_SIZE'], Landscape: el['PAPER_ORIENTATION_LANDSCAPE'], Copies: el['COPIES'] };
                var dataToSend = angular.copy(data);
                dataToSend['PrinterName'] = el['PRINTER_NAME'];
                dataToSend['PrintSettings'] = JSON.stringify(printSettings);
                var query =
                    $http({
                        method: 'post',
                        headers: { 'Content-Type': 'application/json; charset=utf-8' },
                        url: printServiceUrl,
                        data: dataToSend,
                        withCredentials: true,
                        timeout: 5000,
                    });
                query_array.push(query);
            })
            return $q.all(query_array)
            .then(function (responses) {
                var answer = "";
                responses.forEach(function (elem) {
                    if (elem.data["StatusCode"] == 0) {
                        answer += elem.data["PrinterName"] + ": OK"
                    }
                    else {
                        answer += elem.data["PrinterName"] + ": Error (" + elem.data["StatusMessage"] + ")";
                    }
                    answer += "\n";
                });
                return answer;
            });
        });

    }
}])

//.directive('updateOnEnter', function () {
//    return {
//        restrict: 'A',
//        require: 'ngModel',
//        link: function (scope, element, attrs, ctrl) {
//            element.bind("keyup", function (ev) {
//                if (ev.keyCode == 13) {
//                    ctrl.$commitViewValue();
//                    scope.$apply(ctrl.$setTouched);
//                }
//            });
//        }
//    }
//})

.directive('onEnter', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ctrl) {
            element.bind("keypress", function (ev) {
                if (ev.keyCode == 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.onEnter);
                    });
                    ev.preventDefault();
                }
            });
        }
    }
})


.directive('repeatDone', function ($timeout) {
    return function (scope, element, attr) {
        if (scope.$last === true) {
            // call after rendered
            $timeout(function () {
                scope.$eval(attr.repeatDone);
            });
        }
    }
})

angular.module('indexApp')

.config(['$stateProvider', function ($stateProvider) {

    $stateProvider

        .state('app.WeightAnalytics.WBDynamic', {
            url: '/wd/{wb_id:int}/{ws_id:int}?',
            //templateUrl: 'Static/weightanalytics/wb_static.html',
            views: {
                "": {
                    templateUrl: 'Static/weightanalytics/wb_dynamic.html',
                    controller: 'WeightAnalyticsDWBCtrl',
                },
                "WS_toprint@app.WeightAnalytics.WBDynamic": {
                    templateUrl: 'Static/weightanalytics/ws_table.html',
                    controller: 'WeightAnalyticsWSPrintCtrl',
                },
                //,
                //"WS_table@app.WeightAnalytics.WBStatic": {
                //    templateUrl: 'Static/weightanalytics/ws_table.html',
                //    //controller: 'WeightAnalyticsWSTableCtrl',
                //},
                //"WS_toprint@app.WeightAnalytics.WBStatic": {
                //    templateUrl: 'Static/weightanalytics/ws_table.html',
                //    controller: 'WeightAnalyticsWSPrintCtrl',
                //},
                "waybill_toprint@app.WeightAnalytics.WBDynamic": {
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
                            // если параметр WB_ID задан и весы с таким ID существуют
                            if (WB_aval.length > 0) {
                                // при этом WS_ID не задан или если задан и существуют отвесные - возвращаем 0 и разрешаем вход
                                // иначе - переходим с WS_ID = null
                                if (WS_ID != null && WS_aval.length == 0) {

                                    $timeout(function () {
                                        $state.go('app.WeightAnalytics.WBDynamic', { wb_id: WB_ID, ws_id: null });
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

// контроллер Отвесных для динамических весов
.controller('WeightAnalyticsDWBCtrl', ['$scope', '$translate', 'indexService', 'consignersService', 'weightanalyticsService', 'LocalStorageService', '$state', '$q', '$timeout', '$interval', '$filter', 'user', 'scalesRefresh', function ($scope, $translate, indexService, consignersService, weightanalyticsService, LocalStorageService, $state, $q, $timeout, $interval, $filter, user, scalesRefresh) {

    // Init variable
    var wb_id = $state.params.wb_id;
    var ws_id = $state.params.ws_id;
    var Timer = null;
    var Tasks = null;
    var Trains_tree = $('#Trains_tree').jstree('destroy');
    var WeightSheetTree = $('#weightsheet_tree').jstree('destroy'); 
    var ArchiveWeightSheets = null;
    $scope.InformationMessage = "";
    $scope.CurrentTrainsList = null;

    ///////////////////////////////////// Выбор путевой
    $scope.SpecialDTForOpenWS = null;

    $scope.ShowWayBillPreview = false;
    $scope.CurrentWagonWayBillList = [];
    $scope.ShowWaybillModal = false;
    $scope.SelectionWaybillID = null;
    $scope.SelectionWagonNunber = "--";
    $scope.ModifyObject = null;
    $scope.WayBillObject = null;
    $scope.SetSRWB_box = false;

    $scope.SetSenderAndReceiverWB = function () {
        if (this.SetSRWB_box) {
            $scope.SetSRWB_box = true;
            if ($scope.WeightSheet.WS_WagonsList.length < 1 || $scope.WeightSheet.WS_WagonsList[0].WayBill == null || $scope.WeightSheet.WS_WagonsList[0].WayBill === undefined) {
                return;
            }

            var Sender = $scope.WeightSheet.WS_WagonsList[0].WayBill.SenderShop;
            var Receiver = $scope.WeightSheet.WS_WagonsList[0].WayBill.ReceiverShop;

            if (Sender != null && Sender != undefined) {
                $scope.WeightSheet.WS_SenderShop = Sender;
            } else {
                $scope.WeightSheet.WS_SenderShop = null;
            }
            if (Sender != null && Sender != undefined) {
                $scope.WeightSheet.WS_ReceiverShop = Receiver;
            } else {
                $scope.WeightSheet.WS_ReceiverShop = null;
            }
        } else {
            $scope.SetSRWB_box = false;
        }
    }


    ////////////////////////// Размер таблицы
    $scope.SizeTable = false;

    $scope.CurrentTrainNumber = null;
    $scope.CurrentWagonNumberRecognize = null;
    $scope.CurrentWagonNumberPP = null;

    $scope.CurrentWagonsList = null;
    $scope.SelectAllWagonsFlag = false;
    $scope.ShowPreviewTrains = false;

    // Переключение видов
    $scope.ShowCreatorWS = false;
    $scope.ShowFinalizeViewerWS = false;

    /////////// Просмотр фото
    $scope.FullSizeImageViewer = null;
    $scope.CurrentTrainNumberForImageViewer = null;
    $scope.ShowImagesMarkup = false;
    $scope.ShowImagesLinks = null;
    $scope.slideIndex = 1;

    /////////// Просмотр Видео
    $scope.DetectViewerWS = false;
    $scope.FullSizeVideosViewer = null;
    $scope.CurrentTrainNumberForVideosViewer = null;
    $scope.ShowVideosMarkup = false;
    $scope.ShowVideosLinks = null;
    $scope.slideIndexVideos = 1;

    $scope.WeightSheet =
    {
        WS_Number: "--",
        WS_SenderShop: null,
        WS_ReceiverShop: null,
        WS_Creater: "",
        WS_TrainNumber: null,
        WS_WagonsList: [],
        WS_Type_Mode: "",
        WS_ReadyToCreate: false
    };
    $scope.PrintAfterOpen = false;
    $scope.CurrentWeightSheet =
    {
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
        WagonsList: [],
    };

    $scope.CurrentWeightSheetTotals = {
        TotalBrutto: 0,
        TotalTara: 0,
        TotalNetto: 0
    }

    //////////// Создание отвесных 
    $scope.CreateWSToPrint = false;
    $scope.WSTypes = null;
    $scope.WagonTypes = null;
    $scope.CargoTypes = null;
    $scope.CargoSenders = null;
    $scope.CargoReceivers = null;
    $scope.WagonPattern = null;
    $scope.DisableAllButtons = false;

    $scope.TESTS = null;

    // --------------------------------- Инициализация спсиков составов и отвесных
    init();

    function init() {
        initTrainsList();
        vmCreateWSTree();
        vmGetConsignersServiceArrays();
        $("#draggable").draggable({ containment: "window" });
        $("#draggableVideos").draggable({ containment: "window", cancel: ".mySlidesVideos" });

        $('#SelectWayBillModal').on('hidden.bs.modal', function (e) {
            $scope.ShowWayBillPreview = false;
            $scope.CurrentWagonWayBillList = [];
            $scope.ShowWaybillModal = false;
            $scope.SelectionWaybillID = null;
            $scope.SelectionWagonNunber = "--";
        });
    }

    function initTrainsList() {
        Trains_tree.jstree({
            //core: {
            //    data: new Object()
            //},
            search: {
                "case_insensitive": true,
                "show_only_matches": true
            },
            plugins: ["search"]
        });
      
        Trains_tree.on('redraw.jstree', function (e, data) {
            Trains_tree.jstree('close_all');
            Trains_tree.jstree('deselect_all', true);
            var node = $scope.CurrentTrainsList.filter(function (element) {
                return element.parent == '#' || element.RealID == 0;
            });
            if (node[0]) {
                var node_id = node[0].id;
                //WeightSheetTree.jstree('select_node', node_id, false);
                Trains_tree.jstree(true).get_node(node_id, true).children('.jstree-anchor').focus();
                Trains_tree.jstree('open_node', node_id);
                if (node[1] && node[1].RealID == 0 && node[1].ScalesSerial == null) {
                    var node_id_month = node[1].id;
                    //WeightSheetTree.jstree('select_node', node_id, false);
                    Trains_tree.jstree(true).get_node(node_id_month, true).children('.jstree-anchor').focus();
                    Trains_tree.jstree('open_node', node_id_month);
                }
            }
        });

        Trains_tree.on('select_node.jstree', function (e, data) {
            var TrainsID = data.node.original.RealID;
            if (TrainsID != 0) {
                $scope.HideImagesMarkup();
                $scope.HideVideosMarkup();
                $scope.SelectAllWagonsFlag = false;
                $scope.CurrentTrainNumber = data.node.original.TrainSerial;
                GetWagonsList(TrainsID);
            } else {
                $scope.SelectAllWagonsFlag = false;
                $scope.CurrentTrainNumber = null;
                $scope.CurrentWagonsList = [];
                $scope.ShowPreviewTrains = false;
                $scope.$apply();
            }
        });

        GetDataTrainsList();

        //Timer = setInterval(function () { GetDataTrainsList(); }, 30000);
    }

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

    WeightSheetTree.on('redraw.jstree', function (e, data) {
        WeightSheetTree.jstree('close_all');
        WeightSheetTree.jstree('deselect_all', true);
        var node = ArchiveWeightSheets.filter(function (element) {
            return element.parent == '#' || (element.ParentID != '#' && element.DocumentationsID == null && element.WeightbridgeID == null);
        });
        if (node[0]) {
            var node_id = node[0].id;
            //WeightSheetTree.jstree('select_node', node_id, false);
            WeightSheetTree.jstree(true).get_node(node_id, true).children('.jstree-anchor').focus();
            WeightSheetTree.jstree('open_node', node_id);
            if (node[1] && node[1].WeightbridgeID == null && node[1].Weightbridge == null) {
                var node_id_month = node[1].id;
                //WeightSheetTree.jstree('select_node', node_id, false);
                WeightSheetTree.jstree(true).get_node(node_id_month, true).children('.jstree-anchor').focus();
                WeightSheetTree.jstree('open_node', node_id_month);
            }
        }
    });

    WeightSheetTree.on('select_node.jstree', function (e, data) {
        var DocumentID = data.node.original.DocumentationsID;
        if (DocumentID != null) {
            $scope.HideImagesMarkup();
            $scope.HideVideosMarkup();
            $scope.SelectAllWagonsFlag = false;
            $scope.CurrentTrainNumber = data.node.original.TrainSerial;
            $scope.CurrentWeightSheet.WeightSheetID = DocumentID;
            $scope.CurrentWeightSheet.Weighings = null;
        } else {
            $scope.SelectAllWagonsFlag = false;
            $scope.CurrentTrainNumber = null;
            $scope.CurrentWagonsList = [];
            $scope.CurrentWeightSheet.WeightSheetID = null;
            $scope.ShowPreviewTrains = false;
            //$scope.$apply();
        }
        $scope.HidePreviewTable();
        $scope.$apply();
    });

    // загрузка данных в дерево отвесных
    function vmLoadWSTree(data) {
        WeightSheetTree.jstree(true).settings.core.data = data;
        WeightSheetTree.jstree(true).refresh(true, true);
    };

    // получение дерева архивных отвесных
    function vmGetWSTree() {
        //WeightSheetTree = $('#weightsheet_tree').jstree('destroy', true);
        weightanalyticsService.GetWSList(wb_id, false).then(function (list) {
            ArchiveWeightSheets = list;
            vmLoadWSTree(ArchiveWeightSheets);
        })
    };

    function GetDataTrainsList() {
        var pathGetScalesSerial = "v_EquipmentProperty?$filter=EquipmentID eq {0} and Property eq 'SCALES_NO'";
        var pathGetTrainList = "v_DW_TrainsList?$filter=ScalesSerial eq '{0}' or ScalesSerial eq null";
        var ServiceAnswer = "";
        indexService.getInfo(pathGetScalesSerial.format(wb_id))
        .then(function (response) {
            var res = response.data.value;
            if (res.length > 0) {
                var ScalesSerial = res[0].Value;
                indexService.getInfo(pathGetTrainList.format(ScalesSerial))
                    .then(function (response) {
                        var list = response.data.value;
                        if (list.length) {
                            list.forEach(function (e) {
                                e.id = e.ID;
                                e.parent = e.ParentID;
                                e.text = e.Description;
                                if (e.ParentID == '#' || (e.RealID == 0 && e.ParentID != "#")) {
                                    e.icon = 'jstree-trains-list';

                                } else {
                                    e.icon = 'jstree-trains';
                                }
                                delete e.ID;
                                delete e.ParentID;
                                delete e.Description;
                            });
                            $scope.CurrentTrainsList = list;
                            Trains_tree.jstree(true).settings.core.data = list;
                            Trains_tree.jstree(true).refresh(true, true);
                        };
                    });
            } else {
                ServiceAnswer = "NoScale";
            }
        });
    };

    $scope.RefreshTrainsList = function () {
        GetDataTrainsList();
    }

    $scope.RefreshWeightSheetList = function () {
        vmGetWSTree();
    }

    function vmGetConsignersServiceArrays() {
        var pathWagonTypes = "PackagingClassProperty?$filter=Description eq '{0}' &$orderby=ID".format('Wagon number template');
        $q.all([consignersService.GetWagonTypes(),
                consignersService.GetCargoTypes(),
                consignersService.GetCargoSenders(),
                consignersService.GetCargoReceivers(),
                weightanalyticsService.GetWSTypes(),
                indexService.getInfo(pathWagonTypes)])
        .then(function (responses) {
            var resp_1 = responses[0].data.value;
            var resp_2 = responses[1].data.value;
            var resp_3 = responses[2].data.value;
            var resp_4 = responses[3].data.value;
            var resp_5 = responses[4].data.value;
            var resp_6 = responses[5].data.value;
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
                $scope.CargoSenders = resp_3;
            }
            if (resp_4) {
                // получение списка получателей груза
                $scope.CargoReceivers = resp_4;
            }
            if (resp_5) {
                // получение списка получателей груза
                $scope.WSTypes = resp_5;
            }
            if (resp_6) {
                // получение списка получателей груза
                $scope.WagonPattern = resp_6;
            }
            vmGetWSTree();
        });
    }
    //-----------------------------------------------------------------------------
    // ------------------------------------------------------ Просмотр ФОТО и ВИДЕО
    // Включить полноекранны режим просмотра
    $scope.FullScreenControll = function () {
        if ($scope.FullSizeImageViewer) {
            $scope.FullSizeImageViewer = false;
        } else {
            $scope.FullSizeImageViewer = true;
        }
    }

    // Конец отрисовки фото с камер
    $scope.RepeatDoneImage = function () {
        $scope.slideIndex = 1
        showDivs(1);
        $scope.ShowImagesMarkup = true;
    }

    // Скрыть фото с камер
    $scope.HideImagesMarkup = function () {
        $scope.slideIndex = 1;
        $scope.FullSizeImageViewer = false;
        $scope.CurrentTrainNumberForImageViewer = null;
        $scope.CurrentWagonNumberPP = null;
        $scope.CurrentWagonNumberRecognize = null;
        $scope.ShowImagesLinks = [];
        $scope.ShowImagesMarkup = false;
        if ($scope.CurrentWagonsList != null || $scope.CurrentWagonsList != undefined) {
            $scope.CurrentWagonsList.forEach(function (e) {
                e.active = false;
            });
        }
        
    }

    // Показать фото с камер
    $scope.ShowImages = function (value) {
        $scope.CurrentWagonsList.forEach(function (e) {
            e.active = false;
        });
        var links = [];
        var FileServer = "";
        //////// Временная проверка на соответствие сервера изображений текущим весам
        if (wb_id == 473) {
            FileServer = "http://krr-app-dvmia04/images/";
        } else if (wb_id == 474) {
            FileServer = "http://krr-app-dvmia05/images/";
        } else {
            alert("Сервер изображений для текущих весов не существует!");
            return;
        }
        for (var i = 1; i < 5; i++) {
            var npp = value.Number < 10 ? "0" + value.Number : value.Number;
            var SpecialDateFormat = moment(value.DTBegin).subtract(3, 'h').format("YYYY/MM/DD");
            var lnk = FileServer + SpecialDateFormat + "/" + $scope.CurrentTrainNumber + "/npp" + npp + "_cam" + i + ".jpg";
            links.push(lnk);
        }
        $scope.CurrentTrainNumberForImageViewer = $scope.CurrentTrainNumber;
        $scope.CurrentWagonNumberPP = value.Number;
        $scope.CurrentWagonNumberRecognize = value.RecNumber;
        $scope.ShowImagesLinks = links;
        value.active = true;
    }

    // Просмотр фото для финализированной отвесной (после создания)
    $scope.ShowImagesFin = function (valueS) {
        $scope.DetectViewerWS = true;
        indexService.getInfo("v_DW_PreviewWagonsList?$filter=ID eq {0}".format(valueS.DWWagonID))
       .then(function (response) {
           var value = null;
           if (response.data.value.length > 0) {
               value = response.data.value[0];
           } else {
               value = new Object();
           }
           var links = [];
           var FileServer = "";
           //////// Временная проверка на соответствие сервера изображений текущим весам
           if (wb_id == 473) {
               FileServer = "http://krr-app-dvmia04/images/";
           } else if (wb_id == 474) {
               FileServer = "http://krr-app-dvmia05/images/";
           } else {
               alert("Сервер изображений для текущих весов не существует!");
               return;
           }
           for (var i = 1; i < 5; i++) {
               var npp = value.Number < 10 ? "0" + value.Number : value.Number;
               var SpecialDateFormat = moment(value.DTBegin).subtract(3, 'h').format("YYYY/MM/DD");
               var lnk = FileServer + SpecialDateFormat + "/" + $scope.CurrentTrainNumber + "/npp" + npp + "_cam" + i + ".jpg";
               links.push(lnk);
           }
           $scope.CurrentTrainNumberForImageViewer = $scope.CurrentTrainNumber;
           $scope.CurrentWagonNumberPP = value.Number;
           $scope.CurrentWagonNumberRecognize = value.RecNumber;
           $scope.ShowImagesLinks = links;
       });
    }

    $scope.ShowVideosFin = function () {
        var links = [];
        var FileServer = "";
        var SpecialDateForVideo = null;
        if ($scope.CurrentWeightSheet.Weighings != null && $scope.CurrentWeightSheet.Weighings.length > 0) {
            SpecialDateForVideo = moment($scope.SpecialDTForOpenWS).subtract(3, 'h').format("YYYY/MM/DD");
        } else {
            SpecialDateForVideo = "NotFound";
        }
        //////// Временная проверка на соответствие сервера видео текущим весам
        if (wb_id == 473) {
            FileServer = "http://krr-app-dvmia04/video/";
        } else if (wb_id == 474) {
            FileServer = "http://krr-app-dvmia05/video/";
        } else {
            alert("Сервер видеофайлов для текущих весов не существует!");
            return;
        }
        for (var i = 1; i < 5; i++) {
            var lnk = FileServer + SpecialDateForVideo + "/" + $scope.CurrentTrainNumber + "/cam" + i + ".mp4";
            links.push(lnk);
        }
        $scope.CurrentTrainNumberForVideosViewer = $scope.CurrentTrainNumber;
        $scope.ShowVideosLinks = links;
    }

    $scope.ShowVideos = function () {
        var links = [];
        var FileServer = "";
        var SpecialDateForVideo = null;
        if ($scope.CurrentWagonsList != null && $scope.CurrentWagonsList.length > 0) {
            SpecialDateForVideo = moment($scope.CurrentWagonsList[0].DTBegin).subtract(3, 'h').format("YYYY/MM/DD");
        } else {
            SpecialDateForVideo = "NotFound";
        }
        //////// Временная проверка на соответствие сервера видео текущим весам
        if (wb_id == 473) {
            FileServer = "http://krr-app-dvmia04/video/";
        } else if (wb_id == 474) {
            FileServer = "http://krr-app-dvmia05/video/";
        } else {
            alert("Сервер видеофайлов для текущих весов не существует!");
            return;
        }
        for (var i = 1; i < 5; i++) {
            var lnk = FileServer + SpecialDateForVideo + "/" + $scope.CurrentTrainNumber + "/cam" + i + ".mp4";
            links.push(lnk);
        }
        $scope.CurrentTrainNumberForVideosViewer = $scope.CurrentTrainNumber;
        $scope.ShowVideosLinks = links;
    }

    // Конец отрисовки видео с камер
    $scope.RepeatDoneVideos = function () {
        $scope.slideIndexVideos = 1
        showDivsVideos(1);
        $scope.ShowVideosMarkup = true;
    }

    // Скрыть видео с камер
    $scope.HideVideosMarkup = function () {
        $scope.slideIndexVideos = 1;
        $scope.FullSizeVideosViewer = false;
        $scope.CurrentTrainNumberForVideosViewer = null;
        $scope.ShowVideosLinks = [];
        $scope.ShowVideosMarkup = false;
    }

    // Включить полноекранны режим просмотра видео
    $scope.FullScreenControllVideos = function () {
        if ($scope.FullSizeVideosViewer) {
            $scope.FullSizeVideosViewer = false;
        } else {
            $scope.FullSizeVideosViewer = true;
        }
    }

    // Переключение слайдов фото
    $scope.plusDivs = function (n) {
        showDivs($scope.slideIndex += n);
    }

    // Переключение слайдов Видео 
    $scope.plusDivsVideos = function (n) {
        showDivsVideos($scope.slideIndexVideos += n);
    }

    function showDivs(n) {
        var i;
        var x = document.getElementsByClassName("mySlides");
        if (n > x.length) { $scope.slideIndex = 1 }
        if (n < 1) { $scope.slideIndex = x.length }
        for (i = 0; i < x.length; i++) {
            x[i].style.display = "none";
        }
        x[$scope.slideIndex - 1].style.display = "block";
        document.getElementById("CameraNumberInd").innerHTML = $scope.slideIndex;
    }

    function showDivsVideos(n) {
        var i;
        var x = document.getElementsByClassName("mySlidesVideos");
        if (n > x.length) { $scope.slideIndexVideos = 1 }
        if (n < 1) { $scope.slideIndexVideos = x.length }
        for (i = 0; i < x.length; i++) {
            x[i].style.display = "none";
        }
        x[$scope.slideIndexVideos - 1].style.display = "block";
        document.getElementById("CameraNumberIndVideos").innerHTML = $scope.slideIndexVideos;
    }
    // ----------------------------------------------------------------------------------
    // ------------------------------------------------------------------ ПРЕВЬЮ СОСТАВОВ
    // Выбрать все вагоны (превью)
    $scope.SelectAll = function (event) {
        if (event.target.checked) {
            $scope.CurrentWagonsList.forEach(function (e) {
                if (e.CheckerWagonID == false) {
                    e.check = true;
                }
            });
        } else {
            $scope.CurrentWagonsList.forEach(function (e) {
                e.check = false;
            });
        }

    }

    // Скрыть превью таблицу
    $scope.HidePreviewTable = function () {
        $scope.CurrentTrainNumber = null;
        $scope.CurrentWagonsList = [];
        $scope.ShowPreviewTrains = false;
        $scope.HideImagesMarkup();
        $scope.HideVideosMarkup();
        //$('#tree').jstree("deselect_all");
        Trains_tree.jstree('deselect_all', true);
    }

    function GetWagonsList(TrainsID) {
        var pathGetWagonsList = "v_DW_PreviewWagonsList?$filter=TrainID eq {0} &$orderby=Number asc";
        indexService.getInfo(pathGetWagonsList.format(TrainsID))
        .then(function (response) {
            var res = response.data.value;

            res.forEach(function (e) {
                e['dispDT'] = moment(e.DTBegin).subtract(3, 'h').format("DD.MM.YY HH:mm:ss");
                e['check'] = false;
                e['active'] = false;
                if (e.CheckerWagonID == null) {
                    e.CheckerWagonID = false;
                } else {
                    e.CheckerWagonID = true;
                }
            });
            $scope.CurrentWagonsList = res;
            $scope.ShowPreviewTrains = true;
            //$scope.$apply();
        });
    }

    // ------------------------------------------------------------------Создание ОТВСНЫХ (общее) 67696856 97596811

    // Получить тару вагона
    function vmGetWagonTare(wagon_number) {
        if (!wagon_number) { return; }
        $scope.CurrentPairNumberTare = null;
        return indexService.getInfo("v_KP4_PackagingUnitsProperty?$filter=Wagon eq '{0}'".format(wagon_number))
            .then(function (resp) {
                var TareInfo = resp.data.value;
                if (TareInfo.length) {
                    var DT = null;
                    if (TareInfo[0]['ValueTime']) {
                        DT = new Date(TareInfo[0]['ValueTime']);
                        DT.setMinutes(DT.getMinutes() + DT.getTimezoneOffset());
                    }
                    return { Wagon: TareInfo[0]['Wagon'], Tare: TareInfo[0]['Value'], DT: DT };
                }
                //$scope.CurrentPairNumberTare = TareInfo.length ? TareInfo[0].Value : null;
            });
    }

    $scope.WS_List_RefreshTara = function () {
        if ($scope.DisableAllButtons == true) { return; }
        $scope.DisableAllButtons = true;
        var querys = [];
        $scope.WeightSheet.WS_WagonsList.forEach(function (e) {
            var prom = vmGetWagonTare(e.NewRecNumber);
            if (prom != undefined) {
                querys.push(vmGetWagonTare(e.NewRecNumber));
            }
        });
        $q.all(querys).then(function (responsesWeight) {
            responsesWeight.forEach(function (e, i) {
                if (e === undefined) { }
                else {
                    $scope.WeightSheet.WS_WagonsList.forEach(function (ev) {
                        var search2 = ev.NewRecNumber;
                        if (search2 != null && search2 != "") {
                            search2 = search2.trim();
                        } else {
                            search2 = "";
                        }
                        if (search2 == e.Wagon.trim()) {
                            ev.Tara = e.Tare;
                            ev.TaraTime = moment(e.DT).format("DD.MM.YYYY H:m:s");
                            var nt = ev.Weight - e.Tare;
                            ev.Netto = nt.toFixed(2);
                        }
                    });
                }
            });
            $scope.DisableAllButtons = false;
        });
    }

    // Удалить вагон из создаваемой отвесной
    $scope.WSDeleteWagon = function (value) {
        var isOK = confirm("Вы действительно хотите удалить этот вагон из создаваемой отвесной?");
        if (isOK) {
            var index = $scope.WeightSheet.WS_WagonsList.indexOf(value);
            $scope.WeightSheet.WS_WagonsList.splice(index, 1);
        }
    }

    $scope.CheckField = function (type, field) {
        var SpecialFieldsTara = ["wb", "mat", "br", "nt"];
        var SpecialFieldsControlBrutto = ["wb", "tr", "nt"];
        var SpecialFieldsWagonLoad = [];
        if (type.Description == "Тарирование") {
            if (field == "selecttf") {
                return false;
            }
            if (field == "selecsr") {
                return true;
            }
            var a = SpecialFieldsTara.indexOf(field);
            if (a >= 0) {
                return false;
            }
            else {
                return true;
            }
        }
        if (type.Description == "Контроль брутто") {
            $scope.SizeTable = true;
            if (field == "selecttf") {
                return false;
            }
            if (field == "selecsr") {
                return true;
            }
            var a = SpecialFieldsControlBrutto.indexOf(field);
            if (a >= 0) {
                return false;
            }
            else {
                return true;
            }
        }
        if (type.Description == "Погрузка") {
            $scope.SizeTable = true;
            if (field == "selecttf") {
                return true;
            }
            if (field == "selecsr") {
                return false;
            }
            var a = SpecialFieldsWagonLoad.indexOf(field);
            if (a >= 0) {
                return false;
            }
            else {
                return true;
            }
        }
    }

    // Нажатие кнопки создать отвесную
    $scope.CreateWS = function (type) {
        var count = 0;
        var WS_Mid_WagonsList = [];
        $scope.WeightSheet.WS_WagonsList = [];
        $scope.CurrentWagonsList.forEach(function (e) {
            if (e.check == true) {
                count++;
                WS_Mid_WagonsList.push(e);
                //$scope.WeightSheet.WS_WagonsList.push(e);
            }
        });
        $scope.WeightSheet.WS_TrainNumber = $scope.CurrentTrainNumber;
        if (count > 0) {
            switch (type.Description) {
                case "Тарирование":
                    $scope.WeightSheet.WS_Type_Mode = type;
                    $scope.WeightSheet.WS_Creater = user;
                    WS_Mid_WagonsList.forEach(function (e) {
                        var obj = new Object();
                        obj.WagonOriginalID = e.ID;
                        obj.Number = e.Number;
                        obj.OldRecNumber = e.RecNumber;
                        obj.NewRecNumber = e.RecNumber;
                        obj.WS_ReadyToAdd = false;
                        if (CheckValidRecNumber(e.RecNumber)) {
                            obj.WS_ReadyToAdd = true;
                        }
                        obj.WayBill = null;
                        obj.Material = null;
                        obj.WagonType = $scope.WagonTypeAutoSelect(e, 0);
                        if (obj.WagonType != null) {
                            obj.WagonNumberPattern = $filter('filter')($scope.WagonPattern, { PackagingClassID: obj.WagonType['ID'] })[0]['Value'];
                        } else {
                            obj.WagonNumberPattern = null;
                        }
                        obj.Brutto = null;
                        obj.Tara = e.Weight / 1000;
                        obj.Weight = e.Weight / 1000;
                        obj.Netto = null;
                        obj.dispDT = e.dispDT;
                        obj.DTBegin = e.DTBegin;
                        obj.ShowHelper = false;
                        $scope.WeightSheet.WS_WagonsList.push(obj);
                    });
                    CreateWSTara();
                    break;
                case "Контроль брутто":
                    $scope.WeightSheet.WS_Type_Mode = type;
                    $scope.WeightSheet.WS_Creater = user;
                    WS_Mid_WagonsList.forEach(function (e) {
                        var obj = new Object();
                        obj.WagonOriginalID = e.ID;
                        obj.Number = e.Number;
                        obj.OldRecNumber = e.RecNumber;
                        obj.NewRecNumber = e.RecNumber;
                        obj.WS_ReadyToAdd = false;
                        if (CheckValidRecNumber(e.RecNumber)) {
                            obj.WS_ReadyToAdd = true;
                        }
                        obj.WayBill = null;
                        obj.Material = null;
                        obj.WagonType = $scope.WagonTypeAutoSelect(e, 0);
                        if (obj.WagonType != null) {
                            obj.WagonNumberPattern = $filter('filter')($scope.WagonPattern, { PackagingClassID: obj.WagonType['ID'] })[0]['Value'];
                        } else {
                            obj.WagonNumberPattern = null;
                        }
                        obj.Brutto = e.Weight / 1000;
                        obj.Tara = null;
                        obj.Weight = e.Weight / 1000;
                        obj.Netto = null;
                        obj.dispDT = e.dispDT;
                        obj.DTBegin = e.DTBegin;
                        obj.ShowHelper = false;
                        $scope.WeightSheet.WS_WagonsList.push(obj);
                    });
                    CreateWSControlBrutto();
                    break;
                case "Погрузка":
                    $scope.WeightSheet.WS_Type_Mode = type;
                    $scope.WeightSheet.WS_Creater = user;
                    WS_Mid_WagonsList.forEach(function (e) {
                        var obj = new Object();
                        obj.queryToTara = vmGetWagonTare(e.RecNumber.trim());
                        obj.WagonOriginalID = e.ID;
                        obj.Number = e.Number;
                        obj.OldRecNumber = e.RecNumber;
                        obj.NewRecNumber = e.RecNumber;
                        obj.WS_ReadyToAdd = false;
                        if (CheckValidRecNumber(e.RecNumber)) {
                            obj.WS_ReadyToAdd = true;
                        }
                        obj.WayBill = null;
                        obj.Material = null;
                        obj.WagonType = $scope.WagonTypeAutoSelect(e, 0);
                        if (obj.WagonType != null) {
                            obj.WagonNumberPattern = $filter('filter')($scope.WagonPattern, { PackagingClassID: obj.WagonType['ID'] })[0]['Value'];
                        } else {
                            obj.WagonNumberPattern = null;
                        }
                        obj.Brutto = e.Weight / 1000;
                        obj.Tara = null;
                        obj.Weight = e.Weight / 1000;
                        obj.Netto = null;
                        obj.TaraTime = null;
                        obj.dispDT = e.dispDT;
                        obj.DTBegin = e.DTBegin;
                        obj.ShowHelper = false;
                        $scope.WeightSheet.WS_WagonsList.push(obj);
                    });

                    $q.all($scope.WeightSheet.WS_WagonsList.map(function (item) { return item['queryToTara'] })).then(function (responsesWeight) {
                        responsesWeight.forEach(function (e, i) {
                            if (e === undefined) { }
                            else {
                                $scope.WeightSheet.WS_WagonsList.forEach(function (ev) {
                                    if (ev.NewRecNumber.trim() == e.Wagon.trim()) {
                                        ev.Tara = e.Tare;
                                        ev.TaraTime = moment(e.DT).format("DD.MM.YYYY H:m:s");
                                        var nt = ev.Weight - e.Tare;
                                        ev.Netto = nt.toFixed(2);
                                    }
                                });
                            }
                        });
                        CreateWSWagonLoad();
                    });
                    break;
                default:
                    $scope.InformationMessage = "Не соответствует тип отвесной";
                    $('#InformationModal').modal('show');
                    break;
            }
        }
        else {
            $scope.InformationMessage = "Для создания отвесной нужно выбрать хотя бы один вагон.";
            $('#InformationModal').modal('show');
        }
    }

    $scope.SetOldRecNumber = function (value) {
        if ($scope.DisableAllButtons == true) { return; }
        $scope.DisableAllButtons = true;
        value.NewRecNumber = value.OldRecNumber;
        value.WagonType = $scope.WagonTypeAutoSelect(value, 1);
        var search = value.NewRecNumber;
        if (search != null && search !="") {
            search = search.trim();
        } else {
            search = "";
        }

        if ($scope.WeightSheet.WS_Type_Mode.Description == "Погрузка") {
            var Proms = vmGetWagonTare(search);
            $q.all([Proms]).then(function (responsesWeight) {
                responsesWeight.forEach(function (e, i) {
                    if (e === undefined) { }
                    else {
                        $scope.WeightSheet.WS_WagonsList.forEach(function (ev) {
                            var search2 = ev.NewRecNumber;
                            if (search2 != null && search2 != "") {
                                search2 = search2.trim();
                            } else {
                                search2 = "";
                            }
                            if (search2 == e.Wagon.trim()) {
                                ev.Tara = e.Tare;
                                ev.TaraTime = moment(e.DT).format("DD.MM.YYYY H:m:s");
                                var nt = ev.Weight - e.Tare;
                                ev.Netto = nt.toFixed(2);
                            }
                        });
                    }
                });
                $scope.DisableAllButtons = false;
            });
        }
        if ($scope.WeightSheet.WS_Type_Mode.Description == "Тарирование") {
            $scope.DisableAllButtons = false;
        }
        if (value.WagonType != null) {
            value.WagonNumberPattern = $filter('filter')($scope.WagonPattern, { PackagingClassID: value.WagonType['ID'] })[0]['Value'];
            value.ShowHelper = false;
        } else {
            value.WagonNumberPattern = null;
        }
        if (CheckValidRecNumber(value.NewRecNumber)) {
            value.WS_ReadyToAdd = true;
        } else {
            //value.ShowHelper = false;
            value.WS_ReadyToAdd = false;
        }

        //var selector = "#inp" + value.WagonOriginalID;
        //$(selector).change();
        //value.WagonType = $scope.WagonTypeAutoSelect(value, 1);
    }

    $scope.ChangeRecNumber = function (value) {
        if (value.NewRecNumber != value.OldRecNumber) {
            if ($scope.WeightSheet.WS_Type_Mode.Description == "Погрузка") {
                value.Material = null;
                value.WagonType = null;
                value.WayBill = null;
                value.Tara = null;
                value.Netto = null;
                value.TaraTime = null;
                value.WagonType = null;
            }
            value.ShowHelper = true;
        } else {
            value.ShowHelper = false;
        }
        if (CheckValidRecNumber(value.NewRecNumber, 1)) {
            value.WS_ReadyToAdd = true;
        } else {
            value.WS_ReadyToAdd = false;
        }
    }

    function CheckValidRecNumber(RecNumber) {
        var StrToSearch = RecNumber;
        if (/^\d{4,8}$/i.test(StrToSearch) || /^\d{1,3}-\d{1,3}$/i.test(StrToSearch)) {
            return true;
        } else {
            return false;
        }
    }

    $scope.WagonTypeAutoSelect = function (value, tt) {
        var StrToSearch = "";
        if (tt == 0) {
            StrToSearch = value.RecNumber;
        } else if (tt == 1) {
            StrToSearch = value.NewRecNumber;
        }
        if ($scope.WagonTypes != null) {
            if (/^\d{8}$/i.test(StrToSearch)) {
                return $filter('filter')($scope.WagonTypes, { ID: 3 })[0];
            } else if (/^\d{3,6}$/i.test(StrToSearch)) {
                return $filter('filter')($scope.WagonTypes, { ID: 74 })[0];
            } else if (/^\d{1,3}-\d{1,3}$/i.test(StrToSearch)) {
                return $filter('filter')($scope.WagonTypes, { ID: 2 })[0];
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    $scope.SelectWagonType = function (value, item) {
        consignersService.GetWagonNumberPattern(item)
        .then(function (pattern) {
            value.WagonNumberPattern = pattern;
            //value.WagonType = $scope.WagonTypeAutoSelect(value,1);
        })
    }

    $scope.vmWSTypeSelect = function () {
        // автоинкремент номера отвесной (для текущего года)
        var query = "v_WGT_DocumentationsExistCheck?$top=1&$select=WeightsheetNumber &$filter=Weightbridge eq '{0}' and DocumentationsType eq '{1}' and Status ne 'reject' and year(StartTime) eq {2} &$orderby=StartTime desc".format(wb_id, encodeURI("Отвесная"), new Date().getFullYear());
        return indexService.getInfo(query);
    }

    // нажатие кнопки "Закрыть отвесную"
    function vmCloseWS(id) {

        var confirm_string = $translate.instant('weightanalytics.Messages.closeWSConfirm').format($scope.CurrentWeightSheet.WeightSheetNumber);
        // если подтвердили закрытие
        if (confirm(confirm_string)) {
            DocumentationsID = id;
            var Status = "closed";
            indexService.sendInfo("upd_Documentations", {
                DocumentationsID: DocumentationsID,
                Status: Status
            }).then(function (response) {
                //$scope.CurrentWeightSheet.Status = Status;
                //$scope.SelectedObjects.Status = Status;
                //vmOpenWS(id);
                $scope.InformationMessage = "Отвесная №{0} успешно сохранена и закрыта".format($scope.CurrentWeightSheet.WeightSheetNumber);
                $('#InformationModal').modal('show');
                /*change url - adding WS_ID*/
                $state.go('app.WeightAnalytics.WBDynamic', { wb_id: $scope.CurrentWeightSheet.WeightBridgeID, ws_id: $scope.CurrentWeightSheet.WeightSheetID }, { notify: false })
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
            })
        }
    }

    // ------------------------------------------------------------------------------------------

    function CreateWSTara() {
        $scope.vmWSTypeSelect().then(function (response) {
            // проверяем поле на неиспользование (т.е. если попытка ввода вручную, не обновляем)
            var pristine = $("#WSNumberCreation").hasClass("ng-pristine");
            if (!pristine && response.data.value && response.data.value[0]) {
                var last_number = response.data.value[0]['WeightsheetNumber'];
                last_number = last_number || 0;
                last_number++;
                $timeout(function () {
                    $scope.WeightSheet.WS_Number = last_number.toString();
                });
            }
            if (!pristine && response.data.value.length < 1) {
                var last_number = 0;
                last_number = last_number || 0;
                last_number++;
                $timeout(function () {
                    $scope.WeightSheet.WS_Number = last_number.toString();
                });
            }
            $("#WSNumberCreation").focus();
            $scope.ShowCreatorWS = true;
        });
    }

    function CreateWSControlBrutto() {
        $scope.vmWSTypeSelect().then(function (response) {
            // проверяем поле на неиспользование (т.е. если попытка ввода вручную, не обновляем)
            var pristine = $("#WSNumberCreation").hasClass("ng-pristine");
            if (!pristine && response.data.value && response.data.value[0]) {
                var last_number = response.data.value[0]['WeightsheetNumber'];
                last_number = last_number || 0;
                last_number++;
                $timeout(function () {
                    $scope.WeightSheet.WS_Number = last_number.toString();
                });
            }
            if (!pristine && response.data.value.length < 1) {
                var last_number = 0;
                last_number = last_number || 0;
                last_number++;
                $timeout(function () {
                    $scope.WeightSheet.WS_Number = last_number.toString();
                });
            }
            $("#WSNumberCreation").focus();
            $scope.ShowCreatorWS = true;
        });
    }

    function CreateWSWagonLoad() {
        $scope.vmWSTypeSelect().then(function (response) {
            // проверяем поле на неиспользование (т.е. если попытка ввода вручную, не обновляем)
            var pristine = $("#WSNumberCreation").hasClass("ng-pristine");
            if (!pristine && response.data.value && response.data.value[0]) {
                var last_number = response.data.value[0]['WeightsheetNumber'];
                last_number = last_number || 0;
                last_number++;
                $timeout(function () {
                    $scope.WeightSheet.WS_Number = last_number.toString();
                });
            }
            if (!pristine && response.data.value.length < 1) {
                var last_number = 0;
                last_number = last_number || 0;
                last_number++;
                $timeout(function () {
                    $scope.WeightSheet.WS_Number = last_number.toString();
                });
            }
            $("#WSNumberCreation").focus();
            $scope.ShowCreatorWS = true;
        });
    }

    // нажатие кнопки "Создать отвесную" 53567020 56443005
    function vmCreateWS(flagClose) {
        //alert(item);
        if (!$scope.WeightSheet.WS_Type_Mode ||
            $scope.WeightSheet.WS_Number === undefined || $scope.WeightSheet.WS_Number < 1) {
            //alert("Не удалось сохранить ! WeightingMode or WeightSheetNumber is missing!");
            $scope.InformationMessage = "Не удалось сохранить отвесную! Не выбран режим взвешивания или номер отвесной не коректен.";
            $('#InformationModal').modal('show');
            $scope.DisableAllButtons = false;
            return false;
        }
        //alert("Допустим сохранил");
        //return;
        var WeightSheetNumber = $scope.WeightSheet.WS_Number;
        var DocumentationsClassID = $scope.WeightSheet.WS_Type_Mode.ID;
        var ScalesID = wb_id;
        var SenderID = $scope.WeightSheet.WS_SenderShop ? $scope.WeightSheet.WS_SenderShop['ID'] : null;
        var ReceiverID = $scope.WeightSheet.WS_ReceiverShop ? $scope.WeightSheet.WS_ReceiverShop['ID'] : null;

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

                $scope.CurrentWeightSheet.WeightingMode = $scope.WeightSheet.WS_Type_Mode;
                $scope.CurrentWeightSheet.WeightSheetNumber = $scope.WeightSheet.WS_Number;
                $scope.CurrentWeightSheet.WeightBridgeID = wb_id;
                $scope.CurrentWeightSheet.SenderShop = $scope.WeightSheet.WS_SenderShop;
                $scope.CurrentWeightSheet.ReceiverShop = $scope.WeightSheet.WS_ReceiverShop;
                $scope.CurrentWeightSheet.WeightSheetID = response.data.ActionParameters[0]['Value'];
                $scope.CurrentWeightSheet.Weighings = $scope.WeightSheet.WS_WagonsList;
                vmTakeWeight(flagClose);
            }
                // если вернулся false, сообщение об отмене
            else {
                //alert($translate.instant('consigners.Messages.savingRejected'));
                //$scope.SelectedObjects.WeightSheetNumber = null;
                alert($translate.instant('weightanalytics.Messages.savingWSRejected'));//alert('Saving has been rejected!');
                $scope.DisableAllButtons = false;
                return false;
            }

        })
    }

    function vmGetWagonTable(weightsheetid) {
        indexService.getInfo("v_WGT_Weightsheet?$filter=WeightsheetID eq {0} &$orderby=ID desc".format(weightsheetid))
        .then(function (response) {
            if (response.data.value) {
                if ($scope.CurrentWeightSheet) {
                    $scope.CurrentWeightSheet.Weighings = response.data.value;
                }
            }
            $scope.CurrentWeightSheetTotals.TotalBrutto = null;
            $scope.CurrentWeightSheetTotals.TotalNetto = null;
            $scope.CurrentWeightSheetTotals.TotalTara = null;
            var CalculateTara = false, CalculateBrutto = false, CalculateAll = false;
            switch ($scope.CurrentWeightSheet.WeightingMode.Description) {
                case "Тарирование": {
                    CalculateTara = true;
                    $scope.CurrentWeightSheetTotals.TotalTara = 0;
                    break;
                }
                case "Контроль брутто": {
                    CalculateBrutto = true;
                    $scope.CurrentWeightSheetTotals.TotalBrutto = 0;
                    break;
                }
                case "Погрузка": {
                    CalculateAll = true;
                    $scope.CurrentWeightSheetTotals.TotalBrutto = 0;
                    $scope.CurrentWeightSheetTotals.TotalTara = 0;
                    $scope.CurrentWeightSheetTotals.TotalNetto = 0;
                    break;
                }
            }

            $scope.CurrentWeightSheet.Weighings.forEach(function (e, i) {
                if (CalculateTara) {
                    $scope.CurrentWeightSheetTotals.TotalTara += e.Tara;
                }
                if (CalculateBrutto) { $scope.CurrentWeightSheetTotals.TotalBrutto += e.Brutto; }
                if (CalculateAll) {
                    $scope.CurrentWeightSheetTotals.TotalBrutto += e.Brutto;
                    $scope.CurrentWeightSheetTotals.TotalTara += e.Tara;
                    $scope.CurrentWeightSheetTotals.TotalNetto += e.Netto;
                    e.Netto = e.Netto.toFixed(2);
                }
            });
            
            //////////////////////////////////////////////////////// Финализированная отвесная
            $scope.ShowCreatorWS = false;
            $scope.SizeTable = false;
            $scope.ShowFinalizeViewerWS = true;

            $scope.DisableAllButtons = false;
        })
    };

    function vmGetWSInfo(id) {
        //var weightsheet_object = {};
        if (!id) return weightsheet_object;
        return weightanalyticsService.GetWSInfo(id);
    }

    // нажатие кнопки "Взять вес"
    function vmTakeWeight(flagClose) {

        return wrapperMainTakeWeight();

        function wrapperMainTakeWeight() {

            var ScalesID = $scope.CurrentWeightSheet.WeightBridgeID;
            var WeightSheetID = $scope.CurrentWeightSheet.WeightSheetID;

            return mainTakeWeight().then(function (resp) {
                $scope.TakeWeightBtnDisabled = false;
                // if checkWagonExists was rejected
                if (resp === false) {
                    return;
                }
                // после взятия веса
                if (flagClose && $scope.CurrentWeightSheet.WeightSheetID != undefined && $scope.CurrentWeightSheet.WeightSheetID != null) {
                    vmCloseWS($scope.CurrentWeightSheet.WeightSheetID);
                } else {
                    $scope.InformationMessage = "Отвесная успешно сохранена";
                    $('#InformationModal').modal('show');
                    $scope.DisableAllButtons = false;
                    $scope.WS_Exit_Fin();
                }
            })
            //.error(function (err) {
            //    alert(err);
            //})

            // проверка существования номера вагона
            function checkWagonExists(wagon_type_id, wagon_number) {
                var queryPackagingUnits = "PackagingUnits?$filter=PackagingClassID eq {0} and Description eq '{1}' &$orderby=ID".format(wagon_type_id, wagon_number);
                return indexService.getInfo(queryPackagingUnits).then(function (response) {
                    var Wagon = response.data.value;
                    var WagonID = null;
                    var respObj = { WagonNumber: wagon_number, WagonID: null };
                    // если не существует - предлагаем добавить вагон в БД
                    if (Wagon[0] == null) {
                        return insertNewWagon(wagon_type_id, wagon_number).then(function (response) {
                            //console.log(new Date() + ". " + "New wagon has been created.");
                            if (response.data.ActionParameters) {
                                WagonID = response.data.ActionParameters[0]['Value'];
                            }
                            respObj.WagonID = WagonID;
                            return respObj;
                        })
                    }
                        // если существует - создаем новое взвешивание в БД
                    else {
                        //console.log(new Date() + ". " + "checkWagonExists: Wagon exists.");
                        WagonID = Wagon[0]['ID'];
                        respObj.WagonID = WagonID;
                        return respObj;
                    }
                });
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
            function ins_TakeWeightTare(WagonTask) {
                return indexService.sendInfo('ins_DW_TakeWeightTare', {
                    WeightsheetID: $scope.CurrentWeightSheet.WeightSheetID,
                    ScalesID: $scope.CurrentWeightSheet.WeightBridgeID,
                    PackagingUnitsID: WagonTask.WagonID,
                    WeightTare: WagonTask.CurrentWeight,
                    DWWagonID: WagonTask.WagonOriginalID,
                    PackagingUnitsDocsID: 0
                });
            };

            // вставка Загрузки в БД
            function ins_TakeWeightLoading(WagonTask) {
                return indexService.sendInfo('ins_DW_TakeWeightLoading', {
                    WeightsheetID: $scope.CurrentWeightSheet.WeightSheetID,
                    ScalesID: $scope.CurrentWeightSheet.WeightBridgeID,
                    WaybillID: WagonTask.WaybillID,
                    WeightBrutto: WagonTask.CurrentWeight,
                    DWWagonID: WagonTask.WagonOriginalID
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
            function ins_TakeWeightBrutto(WagonTask) {
                return indexService.sendInfo('ins_TakeWeightBrutto', {
                    WeightsheetID: $scope.CurrentWeightSheet.WeightSheetID,
                    ScalesID: $scope.CurrentWeightSheet.WeightBridgeID,
                    WeightBrutto: WagonTask.CurrentWeight,
                    PackagingUnitsID: WagonTask.WagonID,
                    MaterialDefinitionID: WagonTask.CargoTypeID
                });
            };

            // взятие веса в зависимости от вида отвесной
            function ins_TakeWeight(WagonTask) {
                switch ($scope.CurrentWeightSheet.WeightingMode.Description) {
                    case 'Тарирование': {
                        return ins_TakeWeightTare(WagonTask);
                    }
                    case 'Погрузка': {
                        return ins_TakeWeightLoading(WagonTask);
                    }
                    case 'Разгрузка': {
                        return ins_TakeWeightUnloading();
                    }
                    case 'Контроль брутто': {
                        return ins_TakeWeightBrutto(WagonTask);
                    }
                    default: return $q.when(false);
                }
            }

            // главная функция взятия веса
            function mainTakeWeight() {
                // проверяем существование вагона
                //[checkWagonExists(WagonTypeID, WagonNumber), checkWagonExists(WagonTypeID, WagonNumber)]
                Tasks = [];
                $scope.CurrentWeightSheet.Weighings.forEach(function (elem) {
                    var obj = new Object();
                    obj.query = checkWagonExists(elem.WagonType.ID, elem.NewRecNumber); //"PackagingUnits?$filter=PackagingClassID eq {0} and Description eq '{1}' &$orderby=ID".format(elem.WagonType.ID, elem.NewRecNumber);
                    obj.queryTakeWeight = null;
                    obj.WagonOriginalID = elem.WagonOriginalID;
                    obj.WagonTypeID = elem.WagonType.ID;
                    obj.WagonNumber = elem.NewRecNumber;
                    obj.CurrentWeight = elem.Weight;
                    obj.WaybillID = elem.WayBill ? elem.WayBill.ID : null;
                    obj.WagonID = null;
                    obj.CargoTypeID = elem.Material ? elem.Material.ID : null;
                    Tasks.push(obj);
                });
                return $q.all(Tasks.map(function (item) { return item['query'] })).then(function (responses) {
                    var arr = [];
                    responses.forEach(function (e, i) {
                        Tasks[i]['WagonID'] = e['WagonID'];
                        Tasks[i]['queryTakeWeight'] = ins_TakeWeight(Tasks[i]);
                    });
                    return $q.all(Tasks.map(function (item) { return item['queryTakeWeight'] })).then(function (responsesWeight) {
                        var Answ = null;
                        responsesWeight.forEach(function (e, i) {
                            if ($scope.CurrentWeightSheet.WeightingMode.Description == "Контроль брутто") {
                                if (e.data.Value === undefined || e.data.Value == null) {
                                    Answ = false;
                                }
                            }
                            if ($scope.CurrentWeightSheet.WeightingMode.Description == "Погрузка") {
                                if (e.data.value === undefined || e.data.value == null) {
                                    Answ = false;
                                }
                            }
                            else {
                                if (e.data.ActionParameters[0].Value === undefined || e.data.ActionParameters[0].Value === null) {
                                    Answ = false;
                                }
                            }
                        });
                        if (Answ == false) {
                            return false;
                        } else {
                            return true;
                        }
                    });
                });
            }
        }

    }

    //////////////////////////////////////////функции выбора путевой
    $scope.SelectWayBillForWagon = function (wagon) {
        $scope.ModifyObject = wagon;
        var query = "v_WGT_WaybillWagonMatching?$filter= WagonNumber eq '{0}' &$orderby=ID desc".format(wagon.NewRecNumber);
        indexService.getInfo(query)
            .then(function (response) {
                WBs_Wagons = response.data.value;
                if (WBs_Wagons.length) {
                    WBs_Wagons.forEach(function (e) {
                        e.StartTime = moment(e.StartTime).subtract(3, 'h').format("DD.MM.YYYY H:m:s");
                    });
                    $scope.CurrentWagonWayBillList = WBs_Wagons;
                }
                else {
                    $scope.CurrentWagonWayBillList = [];
                }
                $scope.SelectionWagonNunber = wagon.NewRecNumber;
                $('#SelectWayBillModal').modal({
                    backdrop: 'static',
                    keyboard: false
                });
        });
    }

    $scope.ViewSelectWayBill = function (waybill) {
        $scope.SelectionWaybillID = waybill.WaybillID;
        $scope.WayBillObject = waybill;
        $scope.ShowWaybillModal = true;
    }

    $scope.ViewSelectWayBill = function (waybill) {
        $scope.SelectionWaybillID = waybill.WaybillID;
        $scope.WayBillObject = waybill;
        $scope.ShowWaybillModal = true;
    }

    $scope.AddWBtoCurrentWagon = function () {
        var waybill_id = $scope.WayBillObject.WaybillID;
        consignersService.GetWaybillObject(waybill_id)
           .then(function (waybill_obj) {
               
               $scope.ModifyObject.WayBill = waybill_obj;
               $scope.ModifyObject.Material = waybill_obj.CargoType;
               $scope.ModifyObject.WagonType = waybill_obj.WagonType;

               if ($scope.SetSRWB_box) {
                   if ($scope.WeightSheet.WS_WagonsList.length < 1 || $scope.WeightSheet.WS_WagonsList[0].WayBill == null || $scope.WeightSheet.WS_WagonsList[0].WayBill === undefined) {
                       return;
                   }

                   var Sender = $scope.WeightSheet.WS_WagonsList[0].WayBill.SenderShop;
                   var Receiver = $scope.WeightSheet.WS_WagonsList[0].WayBill.ReceiverShop;

                   if (Sender != null && Sender != undefined) {
                       $scope.WeightSheet.WS_SenderShop = Sender;
                   } else {
                       $scope.WeightSheet.WS_SenderShop = null;
                   }
                   if (Sender != null && Sender != undefined) {
                       $scope.WeightSheet.WS_ReceiverShop = Receiver;
                   } else {
                       $scope.WeightSheet.WS_ReceiverShop = null;
                   }
               }

               $('#SelectWayBillModal').modal('hide');

        })
    }
    //////////////////////////////////////////////////////////////////////////////
  
    $scope.WS_Finalize = function (type) {
        if ($scope.DisableAllButtons == true) { return; }
        $scope.DisableAllButtons = true;
        var FlagSave = null;
        switch ($scope.WeightSheet.WS_Type_Mode.Description) {
            case "Тарирование":
                $scope.WeightSheet.WS_WagonsList.forEach(function (e) {
                    if (e.WS_ReadyToAdd == false) {
                        FlagSave = 0;
                        return;
                    }
                    if (e.Tara == null || e.Tara === undefined) {
                        FlagSave = 1;
                        return;
                    }
                    if (e.WagonType == null || e.WagonType === undefined) {
                        FlagSave = 2;
                        return;
                    }
                });
                break;
            case "Контроль брутто":
                if ($scope.WeightSheet.WS_WagonsList.length < 1) { FlagSave = 1; } else {
                    $scope.WeightSheet.WS_WagonsList.forEach(function (e) {
                        if (e.WS_ReadyToAdd == false) {
                            FlagSave = 0;
                            return;
                        }
                        if (e.WagonType == null || e.WagonType === undefined) {
                            FlagSave = 0;
                            return;
                        }
                        if (e.Material == null || e.Material === undefined) {
                            FlagSave = 2;
                            return;
                        }
                    });
                }
                break;
            case "Погрузка":
                if ($scope.WeightSheet.WS_WagonsList.length < 1) { FlagSave = 1; } else {
                    $scope.WeightSheet.WS_WagonsList.forEach(function (e) {
                        if (e.WS_ReadyToAdd == false) {
                            FlagSave = 0;
                            return;
                        }
                        if (e.WagonType == null || e.WagonType === undefined) {
                            FlagSave = 2;
                            return;
                        }
                        if (e.Tara == null || e.Tara === undefined || e.Netto == null || e.Netto === undefined) {
                            FlagSave = 1;
                            return;
                        }
                        if ($scope.WeightSheet.WS_SenderShop == null || $scope.WeightSheet.WS_SenderShop === undefined) {
                            FlagSave = 6;
                            return;
                        }
                        if ($scope.WeightSheet.WS_ReceiverShop == null || $scope.WeightSheet.WS_ReceiverShop === undefined) {
                            FlagSave = 7;
                            return;
                        }
                        if (e.WayBill == null || e.WayBill === undefined) {
                            FlagSave = 5;
                            return;
                        }
                        if (e.Material == null || e.Material === undefined) {
                            FlagSave = 3;
                            return;
                        }
                    });
                }
                break;
            default:
                FlagSave = 0;
                break;
        }
        switch (FlagSave) {
            case 0:
                $scope.InformationMessage = "Обнаружено несоответствие типа вагона и его номера";
                $('#InformationModal').modal('show');
                $scope.DisableAllButtons = false;
                break;
            case 1:
                $scope.InformationMessage = "У вагона(ов) отсутствует нетто";
                $scope.DisableAllButtons = false;
                $('#InformationModal').modal('show');
                break;
            case 2:
                $scope.InformationMessage = "У вагона(ов) не выбран тип вагона";
                $scope.DisableAllButtons = false;
                $('#InformationModal').modal('show');
                break;
            case 3:
                $scope.InformationMessage = "У вагона(ов) не выбран вид груза";
                $scope.DisableAllButtons = false;
                $('#InformationModal').modal('show');
                break;
            case 4:
                $scope.InformationMessage = "В отвесной должен быть хотя бы один вагон";
                $scope.DisableAllButtons = false;
                $('#InformationModal').modal('show');
                break;
            case 5:
                $scope.InformationMessage = "Необходимо выбрать путевые для каждого из вагонов";
                $scope.DisableAllButtons = false;
                $('#InformationModal').modal('show');
                break;
            case 6:
                $scope.InformationMessage = "Выберите цех отправитель";
                $scope.DisableAllButtons = false;
                $('#InformationModal').modal('show');
                break;
            case 7:
                $scope.InformationMessage = "Выберите цех получатель";
                $scope.DisableAllButtons = false;
                $('#InformationModal').modal('show');
                break;
            default:
                vmCreateWS(true);
        }
        //alert("Готово к записи: "+$scope.WeightSheet.WS_WagonsList.length + " вагона(ов)");
    }
    
    $scope.WS_Save = function (type) {
        if ($scope.DisableAllButtons == true) { return; }
        $scope.DisableAllButtons = true;
        var FlagSave = null;
        switch ($scope.WeightSheet.WS_Type_Mode.Description) {
            case "Тарирование":
                if ($scope.WeightSheet.WS_WagonsList.length < 1) { FlagSave = 1; } else {
                    $scope.WeightSheet.WS_WagonsList.forEach(function (e) {
                        if (e.WS_ReadyToAdd == false) {
                            FlagSave = 0;
                            return;
                        }
                        if (e.WagonType == null || e.WagonType === undefined) {
                            FlagSave = 0;
                            return;
                        }
                    });
                }
                break;
            case "Контроль брутто":
                if ($scope.WeightSheet.WS_WagonsList.length < 1) { FlagSave = 1; } else {
                    $scope.WeightSheet.WS_WagonsList.forEach(function (e) {
                        if (e.WS_ReadyToAdd == false) {
                            FlagSave = 0;
                            return;

                        }
                        if (e.WagonType == null || e.WagonType === undefined) {
                            FlagSave = 0;
                            return;
                        }
                        if (e.Material == null || e.Material === undefined) {
                            FlagSave = 2;
                            return;
                        }
                    });
                }
                break;
            default:
                FlagSave = 999;
                break;
        }
        switch (FlagSave) {
            case 0:
                $scope.InformationMessage = "Необходимо заполнить поля с номером вагона и выбрать тип";
                $('#InformationModal').modal('show');
                $scope.DisableAllButtons = false;
                break;
            case 1:
                $scope.InformationMessage = "В создаваемой отвесной нет вагонов";
                $('#InformationModal').modal('show');
                $scope.DisableAllButtons = false;
                break;
            case 2:
                $scope.InformationMessage = "Необходимо заполнить поле вид груза";
                $('#InformationModal').modal('show');
                $scope.DisableAllButtons = false;
                break;
            case 999:
                $scope.InformationMessage = "Возникла ошибка при переходе";
                $('#InformationModal').modal('show');
                $scope.DisableAllButtons = false;
                break
            default:
                vmCreateWS();
        }
    }

    $scope.WS_Exit = function () {
        if ($scope.DisableAllButtons == true) { return; }
        $scope.ShowCreatorWS = false;
        $scope.SizeTable = false;
        $scope.WeightSheet =
        {
           WS_Number: "--",
           WS_SenderShop: null,
           WS_ReceiverShop: null,
           WS_Creater: "",
           WS_TrainNumber: null,
           WS_WagonsList: [],
           WS_Type_Mode: "",
           WS_ReadyToCreate: false
        };
        ////////////////////////
        $scope.ShowWayBillPreview = false;
        $scope.CurrentWagonWayBillList = [];
        $scope.ShowWaybillModal = false;
        $scope.SelectionWaybillID = null;
        $scope.SelectionWagonNunber = "--";
        $scope.ModifyObject = null;
        $scope.WayBillObject = null;
        $scope.SetSRWB_box = false;
        ////////////////////////
        $scope.HidePreviewTable();
        WeightSheetTree.jstree('deselect_all', true);
        $state.go('app.WeightAnalytics.WBDynamic', { wb_id: wb_id, ws_id: null }, { notify: false })
        //$scope.RefreshTrainsList();
        //$scope.RefreshWeightSheetList();
    }

    $scope.WS_Exit_Fin = function () {
        $scope.DetectViewerWS = false;
        if ($scope.DisableAllButtons == true) { return; }
        $scope.ShowCreatorWS = false;
        $scope.SizeTable = false;
        $scope.ShowFinalizeViewerWS = false;
        $scope.WeightSheet =
        {
            WS_Number: "--",
            WS_SenderShop: null,
            WS_ReceiverShop: null,
            WS_Creater: "",
            WS_TrainNumber: null,
            WS_WagonsList: [],
            WS_Type_Mode: "",
            WS_ReadyToCreate: false
        };
        ////////////////////////
        $scope.ShowWayBillPreview = false;
        $scope.CurrentWagonWayBillList = [];
        $scope.ShowWaybillModal = false;
        $scope.SelectionWaybillID = null;
        $scope.SelectionWagonNunber = "--";
        $scope.ModifyObject = null;
        $scope.WayBillObject = null;
        $scope.SetSRWB_box = false;
        ////////////////////////
        $scope.CurrentWeightSheet =
        {
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
                WagonNumber: null,
                WagonID: null,
                WagonNumberPattern: null,
                CargoTypeID: null,
            },
            WagonsList: [],
        };
        $scope.CurrentWeightSheetTotals = {
            TotalBrutto: 0,
            TotalTara: 0,
            TotalNetto: 0
        }
        $scope.HidePreviewTable();
        WeightSheetTree.jstree('deselect_all', true);
        $state.go('app.WeightAnalytics.WBDynamic', { wb_id: wb_id, ws_id: null }, { notify: false })
        //$scope.RefreshTrainsList();
        //$scope.RefreshWeightSheetList();
    }

    $scope.WS_Print_Fin = function (checker) {
        $scope.CreateWSToPrint = false;
        if (checker == true) {
            $scope.PrintAfterOpen = true;
        } else {
            $scope.PrintAfterOpen = false;
        }
        if ($scope.CurrentWeightSheet.WeightSheetID == null) {
            return;
        }
        $scope.CreateWSToPrint = true;
    }

    $scope.WS_open_to_view = function () {
        if ($scope.CurrentWeightSheet.WeightSheetID == null) {
            return;
        }
        weightanalyticsService.GetWSInfo($scope.CurrentWeightSheet.WeightSheetID).then(function (weightsheet_object) {
            var ttt = weightsheet_object;
            if (weightsheet_object) {
                $scope.CurrentWeightSheet.Weighings = [];
                $scope.CurrentWeightSheet = weightsheet_object;
                $scope.CurrentWeightSheetTotals.TotalBrutto = null;
                $scope.CurrentWeightSheetTotals.TotalNetto = null;
                $scope.CurrentWeightSheetTotals.TotalTara = null;

                if ($scope.CurrentWeightSheet.Weighings.length > 0) {
                    indexService.getInfo("v_DW_GetTrainSerial?$top=1&$filter=WagonID eq {0}".format($scope.CurrentWeightSheet.Weighings[0].DWWagonID)).then(function (response) {
                        var answ = response.data.value;
                        if (answ == null || answ === undefined || answ.length < 1) {
                            return;
                        }
                        $scope.CurrentTrainNumber = answ[0].TrainSerial;
                        $scope.SpecialDTForOpenWS = answ[0].DTBegin;
                        $scope.WeightSheet.WS_TrainNumber = answ[0].TrainSerial;
                        var CalculateTara = false, CalculateBrutto = false, CalculateAll = false;
                        switch ($scope.CurrentWeightSheet.WeightingMode.Description) {
                            case "Тарирование": {
                                CalculateTara = true;
                                $scope.CurrentWeightSheetTotals.TotalTara = 0;
                                break;
                            }
                            case "Контроль брутто": {
                                CalculateBrutto = true;
                                $scope.CurrentWeightSheetTotals.TotalBrutto = 0;
                                break;
                            }
                            case "Погрузка": {
                                CalculateAll = true;
                                $scope.CurrentWeightSheetTotals.TotalBrutto = 0;
                                $scope.CurrentWeightSheetTotals.TotalTara = 0;
                                $scope.CurrentWeightSheetTotals.TotalNetto = 0;
                                break;
                            }
                        }

                        $scope.CurrentWeightSheet.Weighings.forEach(function (e, i) {
                            if (CalculateTara) {
                                $scope.CurrentWeightSheetTotals.TotalTara += e.Tara;
                            }
                            if (CalculateBrutto) { $scope.CurrentWeightSheetTotals.TotalBrutto += e.Brutto; }
                            if (CalculateAll) {
                                $scope.CurrentWeightSheetTotals.TotalBrutto += e.Brutto;
                                $scope.CurrentWeightSheetTotals.TotalTara += e.Tara;
                                $scope.CurrentWeightSheetTotals.TotalNetto += e.Netto;
                                //e.Netto = e.Netto.toFixed(2);
                            }
                        });

                        //////////////////////////////////////////////////////// Финализированная отвесная
                        $scope.ShowCreatorWS = false;
                        $scope.SizeTable = false;
                        $scope.ShowFinalizeViewerWS = true;
                        $scope.DetectViewerWS = true;
                        $scope.DisableAllButtons = false;
                    });
                }
            }
        });
    }
}])

/*
// контроллер печати отвесной
.controller('WeightAnalyticsWSPrintCtrl', ['$http', '$scope', 'weightanalyticsService', 'printService', '$state', '$translate', 'user', function ($http, $scope, weightanalyticsService, printService, $state, $translate, user) {

    $scope.toprint = true;
    $scope.ReadyToPrint = vmReadyToPrint;
    
    // если Weighings заполнена (т.е. вызываем печать из открытой отвесной)
    weightanalyticsService.GetWSInfo($scope.CurrentWeightSheet.WeightSheetID).then(function (weightsheet_object) {
        var ttt = weightsheet_object;
        if (weightsheet_object) {
            //$scope.CurrentWeightSheet = null;
            
            if ($scope.PrintAfterOpen) {
                $scope.CurrentWeightSheet.Weighings.Totals = null;
            } 
            $scope.CurrentWeightSheet = weightsheet_object;
            //$scope.CurrentWeightSheet.Weighings = weightsheet_object.Weighings;
            //$scope.WeightSheetForPrint = weightsheet_object.Weighings;
            //$scope.WeightSheetForPrint.Totals = null;
            $scope.CurrentWeightSheet.Weighings.Totals = null;
            $scope.PrintAfterOpen = false;
            //vmCheckWSToPrint();
        }
    });

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
        //if ($scope.RemotePrint) {
            //SendToPrintService(inner_html, $scope.CurrentWeightSheet, 185);
        //}
        //else {
            // Открыть документ в новом окне (или послать inner_html в сервис печати)
            var printWindow = window.open('', '_blank');
            printWindow.document.open();
            printWindow.document.write(inner_html);
            printWindow.document.close();
        //}
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
*/

/*
.controller('WaybillPreviewCtrl', ['$scope', 'consignersService', function ($scope, consignersService) {

    $scope.CurrentWaybill = {};
    var waybill_id = $scope.waybill_id;
    //$scope.$parent.WaybillInfoReady = false;
    consignersService.GetWaybillObject(waybill_id)
    .then(function (waybill_obj) {
        $scope.CurrentWaybill = waybill_obj;
        //$scope.$parent.WaybillInfoReady = true;
        $('#ModalLoading').css("display", "none");
    })


}])
*/

.directive('dynamicUrl', function () {
    return {
        restrict: 'A',
        link: function postLink(scope, element, attr) {
            element.attr('src', attr.dynamicUrlSrc);
        }
    };
});

//.directive('repeatDone', function ($timeout) {
//    return function (scope, element, attr) {
//        if (scope.$last === true) {
//            // call after rendered
//            $timeout(function () {
//                scope.$eval(attr.repeatDone);
//            });
//        }
//    }
//});


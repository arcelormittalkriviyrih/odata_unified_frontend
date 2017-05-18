
angular.module('indexApp')

.config(['$stateProvider', function ($stateProvider) {

    $stateProvider

        .state('app.Consigners.Index', {

            url: '/index',
            //templateUrl: 'Static/consigners/index.html',
            //controller: 'ConsignersIndexCtrl',
            //params: { ddd: 0000, id:'9999' },
            views: {
                "": {
                    templateUrl: "Static/consigners/index.html",
                    controller: 'ConsignersIndexCtrl',
                    //params: { ttt: 1111 }
                },
                "waybill_toprint@app.Consigners.Index": {
                    templateUrl: "Static/consigners/waybill.html",
                    //controller: 'ConsignersPrintCtrl',
                    //params: { rrr: 2222 }
                }
            }
        })

        .state('app.Consigners.Create', {

            url: '/create',
            templateUrl: 'Static/consigners/create.html',
            controller: 'ConsignersCreateCtrl',
            params: { copy_id: null, waybill_object: null },

        })

        .state('app.Consigners.Print', {

            url: '/toprint/:print_id?',
            templateUrl: 'Static/consigners/waybill.html',
            controller: 'ConsignersPrintCtrl',
            params: { waybill_object: null },

        })

}])


.controller('ConsignersCtrl', ['$scope', '$translate', 'indexService', '$state', function ($scope, $translate, indexService, $state) {

    console.log("ConsignersCtrl");

    console.log("go to app.Consigners.Index");
    $state.go('app.Consigners.Index');

}])







.controller('ConsignersIndexCtrl', ['$q', '$scope', '$translate', 'indexService', 'consignersService', '$state', '$stateParams', function ($q, $scope, $translate, indexService, consignersService, $state, $stateParams) {

    //alert("ConsignersIndexCtrl");
    console.log("ConsignersIndexCtrl");

    //$state.go('app.Consigners.Index');

    //$scope.common_var = null;
    $scope.WaybillShops = [];
    $scope.CurrentWaybill = {};
    var WaybillList = $('#waybill_list').jstree('destroy');
    var RWStations = [];
    var CargoTypes = [];
    var CargoSenders = [];
    var CargoReceivers = [];

    vmGetConsignersServiceArrays();
    vmGetWaybillTree();

    // нажатие кнопки "Создать"
    $scope.Create = function () {
        //alert("Create");
        console.log("go to app.Consigners.Create");
        $state.go('app.Consigners.Create', { copy_id: 55 });

    }

    // нажатие кнопки "Создать как копию"
    $scope.CreateCopy = function () {
        //alert("Create");
        console.log("go to app.Consigners.Create");
        $state.go('app.Consigners.Create', { copy_id: $scope.CurrentWaybill.ID, waybill_object: $scope.CurrentWaybill });

    }

    // нажатие кнопки "Печать"
    $scope.Print = function () {

        if ($scope.CurrentWaybill.ID) {
            console.log("go to app.Consigners.Print");
            $state.go('app.Consigners.Print', { print_id: $scope.CurrentWaybill.ID, waybill_object: $scope.CurrentWaybill });
        }
        else {
            alert("$scope.CurrentWaybill.ID is null");
        }
    }


    // получение списков отправителей, получателей, станция, видов груза
    function vmGetConsignersServiceArrays() {
        $q.all([consignersService.GetRWStations(),
                consignersService.GetCargoTypes(),
                consignersService.GetCargoSenders(),
                consignersService.GetCargoReceivers()])
        .then(function (responses) {
            var resp_1 = responses[0].data.value;
            var resp_2 = responses[1].data.value;
            var resp_3 = responses[2].data.value;
            var resp_4 = responses[3].data.value;
            if (resp_1) {
                RWStations = resp_1;
            }
            if (resp_2) {
                CargoTypes = resp_2;
            }
            if (resp_3) {
                CargoSenders = resp_3;
            }
            if (resp_4) {
                CargoReceivers = resp_4;
            }
            // после получения списков фильтруем (уникальные значения) цеха-получатели
            vmGetWaybillShops();
        })
    }


    // получение дерева архивных отвесных
    function vmGetWaybillTree(weightsheetID) {

        WaybillList = $('#waybill_list').jstree('destroy');
        indexService.getInfo('v_WGT_WaybillList').then(function (response) {

            if (response.data.value.length) {
                response.data.value.forEach(function (e) {
                    e.id = e.ID;
                    e.parent = e.ParentID;
                    e.text = e.Description;
                    if (e.DocumentationsID) {
                        e.icon = 'jstree-file';
                    };
                    delete e.ID;
                    delete e.ParentID;
                    delete e.Description;
                });

                $scope.ArchiveWeightSheets = response.data.value;

                WaybillList.jstree({
                    core: {
                        data: $scope.ArchiveWeightSheets
                    },
                    search: {
                        "case_insensitive": true,
                        "show_only_matches": true
                    },
                    plugins: ["search"]
                });
            };
        });
        /*
        // загрузка дерева отвесных
        $WaybillList.on('loaded.jstree', function (e, data) {
            //alert('loaded');
            // при загрузке данные убираем выделение эл-тов и сворачиваем дерево
            $WaybillList.jstree('close_all');
            $WaybillList.jstree('deselect_all', true);

            // при первой загрузке дерева выделяем год, содержащий последнюю путевую
            var node = $scope.ArchiveWeightSheets.filter(function (element) {
                return element.parent == '#' &&
                        element.DocumentationsID == null &&
                        !isNaN(element.text)
            });
            if (node[0]) {
                node = node[0].id;
                $WaybillList.jstree('select_node', node, false);
                $WaybillList.jstree('open_node', node);
            }
        });
        */
        /*
        // выбор элемента в дереве отвесных
        $WaybillList.on('select_node.jstree', function (e, data) {
            //alert('select_node');
            $scope.ArchiveWaybillSelected = false;
            if (data.node.original.DocumentationsID) {
                $scope.SelectedArchiveWeightSheetID = data.node.original.DocumentationsID;
                $scope.ArchiveWaybillSelected = true;

                $scope.common_var = data.node.original.DocumentationsID;
                //$state.params.id = data.node.original.WorkPerfomanceID;
                var waybill_id = data.node.original.DocumentationsID;

                $scope.CurrentWaybill.WaybillNumber = 1000050000;
                $scope.$apply();

                ///!!! get full waybill info here

                $q.all([indexService.getInfo('Documentations?$filter=ID eq {0}'.format(waybill_id)),
                        indexService.getInfo("DocumentationsProperty?$filter=DocumentationsID eq {0} &$orderby=ID".format(waybill_id)),
                        indexService.getInfo("PackagingUnitsDocs?$filter=DocumentationsID eq {0} &$orderby=ID".format(waybill_id)),
                        indexService.getInfo("v_WGT_WaybillProperty?$filter=DocumentationsID eq {0} &$orderby=ID".format(waybill_id))])
                        .then(function (responses) {
                            var resp_1 = responses[0].data.value;
                            var resp_2 = responses[1].data.value;
                            var resp_3 = responses[2].data.value;
                            var resp_4 = responses[3].data.value;

                            var waybill_object = [];
                            waybill_object.ID = waybill_id;

                            for (i = 0; i < resp_2.length; i++) {
                                if (resp_2[i]['Description'] == "Приемосдатчик") {
                                    //alert("Приемосдатчик: " + resp_2[i].Value);
                                }
                                if (resp_2[i]['Description'] == "Цех отправления") {
                                    //alert("Цех отправления: " + resp_2[i].Value);
                                }
                            }

                            for (i = 0; i < resp_3.length; i++) {
                                $scope.CurrentWaybill.WagonNumber = resp_3[i]['Description'];
                            }

                            for (i = 0; i < resp_4.length; i++) {
                                //$scope.CurrentWaybill.WagonNumber = resp_3[i]['Description'];
                                var prop = resp_4[i];


                                switch (resp_4[i]['Description2']) {
                                    case "ScrapType": {
                                        var prop_id = resp_4[i]['Value'];
                                        indexService.getInfo("v_KP4_ScrapTypes?$filter=ID eq {0} &$orderby=ID".format(prop_id))
                                        .then(function (response) {
                                            var uu = response.data.value;
                                            if (uu[0]) {
                                                waybill_object['ScrapType'] = uu[0];
                                            }
                                        })
                                        break;
                                    }
                                    default: {
                                        waybill_object[prop['Description2']] = resp_4[i]['Value2'];
                                    }
                                }

                            }

                            var g = $scope.CurrentWaybill;

                            //  continue here  


                            
                            //console.log("go to app.Consigners.Print");
                            //$state.go('app.Consigners.Print', { print_id: waybill_id, waybill_object: $scope.CurrentWaybill });
                            




                        })

                alert(data.node.original.DocumentationsID);
            };
        });
*/

    };

    // загрузка дерева отвесных
    WaybillList.on('loaded.jstree', function (e, data) {
        //alert('loaded');
        // при загрузке данных убираем выделение эл-тов и сворачиваем дерево
        WaybillList.jstree('close_all');
        WaybillList.jstree('deselect_all', true);

        // при первой загрузке дерева выделяем год, содержащий последнюю путевую
        var node = $scope.ArchiveWeightSheets.filter(function (element) {
            return element.parent == '#' &&
                    element.DocumentationsID == null &&
                    !isNaN(element.text)
        });
        if (node[0]) {
            node = node[0].id;
            WaybillList.jstree('select_node', node, false);
            WaybillList.jstree('open_node', node);
        }
    });

    // выбор элемента в дереве отвесных
    WaybillList.on('select_node.jstree', function (e, data) {
        //alert('select_node');
        $scope.CurrentWaybill = {};
        $scope.ArchiveWaybillSelected = false;
        //$scope.SelectedArchiveWeightSheetID = null;
        $scope.$applyAsync();
        if (data.node.original.DocumentationsID) {
            //$scope.SelectedArchiveWeightSheetID = data.node.original.DocumentationsID;
            $scope.ArchiveWaybillSelected = true;

            //$scope.common_var = data.node.original.DocumentationsID;
            //$state.params.id = data.node.original.WorkPerfomanceID;
            var waybill_id = data.node.original.DocumentationsID;

            /* !!! get full waybill info here */
            $q.all([indexService.getInfo('Documentations?$filter=ID eq {0}'.format(waybill_id)),
                    indexService.getInfo("DocumentationsProperty?$filter=DocumentationsID eq {0} &$orderby=ID".format(waybill_id)),
                    indexService.getInfo("PackagingUnitsDocs?$filter=DocumentationsID eq {0} &$orderby=ID".format(waybill_id)),
                    indexService.getInfo("v_WGT_WaybillProperty?$filter=DocumentationsID eq {0} &$orderby=ID".format(waybill_id))])
                    .then(function (responses) {
                        var resp_1 = responses[0].data.value;
                        var resp_2 = responses[1].data.value;
                        var resp_3 = responses[2].data.value;
                        var resp_4 = responses[3].data.value;

                        var waybill_object = {};

                        for (i = 0; i < resp_3.length; i++) {
                            waybill_object.WagonNumber = resp_3[i]['Description'];
                        }

                        var prop_queries_array = [
                            { prop: "CargoType", query: "v_KP4_ScrapTypes?$filter=ID eq {0} &$orderby=ID" },
                            { prop: "WagonType", query: "PackagingClass?$filter=ID eq {0}&$orderby=ID" },
                            { prop: "SenderShop", query: "Equipment?$filter=ID eq {0}&$orderby=ID" },
                            { prop: "SenderDistrict", query: "Equipment?$filter=ID eq {0}&$orderby=ID" },
                            { prop: "SenderRWStation", query: "Equipment?$filter=ID eq {0}&$orderby=ID" },
                            { prop: "ReceiverShop", query: "Equipment?$filter=ID eq {0}&$orderby=ID" },
                            { prop: "ReceiverDistrict", query: "Equipment?$filter=ID eq {0}&$orderby=ID" },
                            { prop: "ReceiverRWStation", query: "Equipment?$filter=ID eq {0}&$orderby=ID" },
                        ];
                        var actual_prop_queries_array = [];
                        for (i = 0; i < resp_4.length; i++) {
                            //$scope.CurrentWaybill.WagonNumber = resp_3[i]['Description'];
                            var prop = resp_4[i];

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
                                waybill_object[prop['Description2']] = prop['Value2'];
                            }

                        }
                        //alert(actual_prop_queries_array.length);

                        $q.all(actual_prop_queries_array.map(function (item) { return indexService.getInfo(item['query']) }))
                        .then(function (responses) {
                            console.log("!");
                            actual_prop_queries_array.forEach(function (item, i) {
                                //console.log(item);
                                item['response'] = responses[i].data.value[0];
                                if (item['response']) {
                                    waybill_object[actual_prop_queries_array[i]['prop']] = item['response'];
                                }
                            })
                            
                            /*  continue here  */

                            waybill_object.ID = waybill_id;
                            if (waybill_object && waybill_object.SenderShop && waybill_object.SenderDistrict) {
                                var CargoSenderObject = {};
                                CargoSenderObject['ID'] = waybill_object.SenderDistrict['ID'];
                                CargoSenderObject['Description'] = waybill_object.SenderDistrict['Description'];
                                CargoSenderObject['ParentID'] = waybill_object.SenderShop['ID'];
                                CargoSenderObject['ParentDescription'] = waybill_object.SenderShop['Description'];
                                waybill_object.CargoSender = CargoSenderObject;
                            }
                            if (waybill_object && waybill_object.ReceiverShop && waybill_object.ReceiverDistrict) {
                                var CargoReceiverObject = {};
                                CargoReceiverObject['ID'] = waybill_object.ReceiverDistrict['ID'];
                                CargoReceiverObject['Description'] = waybill_object.ReceiverDistrict['Description'];
                                CargoReceiverObject['ParentID'] = waybill_object.ReceiverShop['ID'];
                                CargoReceiverObject['ParentDescription'] = waybill_object.ReceiverShop['Description'];
                                waybill_object.CargoReceiver = CargoReceiverObject;
                            }

                            $scope.CurrentWaybill = waybill_object;
                        })
                        
                        //console.log("go to app.Consigners.Print");
                        //$state.go('app.Consigners.Print', { print_id: waybill_id, waybill_object: $scope.CurrentWaybill });
                        
                    })

            //alert(data.node.original.DocumentationsID);
        };
    });


    // получение списка цехов-отправителей
    function vmGetWaybillShops() {
        var elementId = [];
        // выбираем уникальные значения цехов из списка участков отправления
        CargoSenders.filter(function (el) {
            if (elementId.indexOf(el.ParentID) === -1) {
                var rr = {};
                rr.ID = el.ParentID;
                rr.Description = el.ParentDescription;
                $scope.WaybillShops.push(rr);
                elementId.push(el.ParentID);
                return true;
            }
            else {
                return false;
            }
        })
    };

    // выбор цеха-отправителя в фильтре цехов
    $scope.WaybillShopSelect = function (item) {
        var shop = item ? item["Description"] : '';
        //alert(shop);
        WaybillList.jstree('search', shop);
        //$scope.ArchiveWaybillSelected = false;
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


}])






.controller('ConsignersCreateCtrl', ['$scope', 'indexService', 'consignersService', '$state', '$q', 'roles', 'user', function ($scope, indexService, consignersService, $state, $q, roles, user) {
    //alert("ConsignersCreateCtrl");
    console.log("ConsignersCreateCtrl");
    // throw main tab change
    //$scope.$emit('mainTabChange', 'Consigners');
    var copy_id = null;
    $scope.copy_id = $state.params.copy_id;

    $scope.message = "Waybill creating";

    var CargoSenders = [];          // Districts
    var CargoReceivers = [];        // Districts
    $scope.CargoSenderShops = [];   // unique shops from Districts
    $scope.CargoReceiverShops = []; // unique shops from Districts
    $scope.CargoTypes = [];
    $scope.RWStations = [];
    $scope.WagonTypes = [];

    $scope.SelectedObjects = {};


    $scope.CurrentWaybill = {
        ID: null,
        WaybillNumber: null,
        WagonNumber: null,
        CargoSender: null,
        CargoReceiver: null,
        SenderRWStation: null,
        ReceiverRWStation: null,

        SenderArriveDT: null,
        SenderStartLoadDT: null,
        SenderEndLoadDT: null,
        ReceiverArriveDT: null,
        ReceiverStartLoadDT: null,
        ReceiverEndLoadDT: null
    };
    //$scope.CurrentWaybill.ID = null;
    //$scope.CurrentWaybill.WagonNumber = null;
    //$scope.CurrentWaybill.CargoSender = null;
    //$scope.CurrentWaybill.CargoReceiver = null;
    //$scope.CurrentWaybill.CargoType = null;
    //$scope.CurrentWaybill.SenderRWStation = null;
    //$scope.CurrentWaybill.ReceiverRWStation = null;
    $scope.WagonNumberPattern = null;

    $scope.GetWagonNumberPattern = vmGetWagonNumberPattern;
    $scope.CargoSenderShopSelect = vmCargoSenderShopSelect;
    $scope.CargoReceiverShopSelect = vmCargoReceiverShopSelect;

    $scope.SavePrint = vmSavePrint;
    $scope.SaveOnly = vmSaveOnly;
    $scope.Reject = vmReject;


    vmDTPsInit();

    //vmGetWagonTypes();
    //vmGetCargoSenders();
    //vmGetCargoReceivers();
    //vmGetCargoTypes();
    //vmGetRWStations();

    vmGetConsignersServiceArrays();

    /*
    $scope.yyyy = function (event) {

        $('#' + event.target.id).datetimepicker({
            stepMinute: 10,
            //dateFormat: "dd.mm.yy",
            oneLine: true,
        });
    }
    */
    // инициализация календарей
    function vmDTPsInit() {

        var DTPs_array = ['dtp_sender_arrive_dt', 'dtp_sender_start_load_dt', 'dtp_sender_end_load_dt', 'dtp_receiver_arrive_dt', 'dtp_receiver_start_load_dt', 'dtp_receiver_end_load_dt'];

        // Russian
        $.datepicker.regional['ru'] = {
            closeText: 'Закрыть',
            prevText: '<Пред',
            nextText: 'След>',
            currentText: 'Сегодня',
            monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
            monthNamesShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
            'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
            dayNames: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
            dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
            weekHeader: 'Не',
            dateFormat: 'dd.mm.yy',
            firstDay: 1,
            showMonthAfterYear: false,
            yearSuffix: '',
            showButtonPanel: true
        };
        $.timepicker.regional['ru'] = {
            timeOnlyTitle: 'Выберите время',
            timeText: 'Время',
            hourText: 'Часы',
            minuteText: 'Минуты',
            secondText: 'Секунды',
            millisecText: 'Миллисекунды',
            timezoneText: 'Часовой пояс',
            currentText: 'Сейчас',
            closeText: 'Закрыть',
            timeFormat: 'HH:mm'
        };
        // Ukrainian
        $.datepicker.regional['ua'] = {
            closeText: 'Закрити',
            prevText: '&#x3C;Попер.',
            nextText: 'Наст.&#x3E;',
            currentText: 'Сьогодні',
            monthNames: ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'],
            monthNamesShort: ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'],
            dayNames: ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', 'п’ятниця', 'субота'],
            dayNamesShort: ['нед', 'пнд', 'вів', 'срд', 'чтв', 'птн', 'сбт'],
            dayNamesMin: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
            weekHeader: 'Тиж',
            dateFormat: 'dd.mm.yy',
            firstDay: 1,
            isRTL: false,
            showMonthAfterYear: false,
            yearSuffix: ''
        };
        $.timepicker.regional['ua'] = {
            timeOnlyTitle: 'Оберіть час',
            timeText: 'Час',
            hourText: 'Години',
            minuteText: 'Хвилини',
            secondText: 'Секунди',
            millisecText: 'Мілісекунди',
            timezoneText: 'Часовой пояс',
            currentText: 'Зараз',
            closeText: 'Закрити',
            timeFormat: 'HH:mm'
        };

        var lang = $state.params.locale;
        $.datepicker.setDefaults($.datepicker.regional[lang]);
        $.timepicker.setDefaults($.timepicker.regional[lang]);

        for (var i = 0; i < DTPs_array.length; i++) {
            $('#' + DTPs_array[i]).datetimepicker({
                stepMinute: 10,
                dateFormat: "dd.mm.yy",
                //controlType: 'select',
                oneLine: true,
                //useUtc: false
            });
        }
    }

    // получение списков отправителей, получателей, станция, видов груза
    function vmGetConsignersServiceArrays() {
        $q.all([consignersService.GetWagonTypes(),
                consignersService.GetCargoTypes(),
                consignersService.GetRWStations(),
                consignersService.GetCargoSenders(),
                consignersService.GetCargoReceivers()])
        .then(function (responses) {
            var resp_1 = responses[0].data.value;
            var resp_2 = responses[1].data.value;
            var resp_3 = responses[2].data.value;
            var resp_4 = responses[3].data.value;
            var resp_5 = responses[4].data.value;
            if (resp_1) {
                // получение списка ЖД вагонов
                $scope.WagonTypes = resp_1;
            }
            if (resp_2) {
                // получение списка видов лома
                $scope.CargoTypes = resp_2;
            }
            if (resp_3) {
                // получение списка ЖД станций
                $scope.RWStations = resp_3;
            }
            if (resp_4) {
                // получение списка поставщиков груза
                CargoSenders = resp_4;
                // получение уникальных цехов поставщиков груза
                vmGetCargoClient(CargoSenders, $scope.CargoSenderShops);
            }
            if (resp_5) {
                // получение списка получателей груза
                CargoReceivers = resp_5;
                // получение уникальных цехов получателей груза
                vmGetCargoClient(CargoReceivers, $scope.CargoReceiverShops);
            }
        })
    }

    /*
    // получение списка ЖД вагонов
    function vmGetWagonTypes() {
        var filter_str = "ЖД вагоны";
        filter_str = encodeURI(filter_str);
        var pathWagonTypes = "v_PackagingClass?$filter=ParentDescription eq '{0}'&$orderby=ID".format(filter_str);
        indexService.getInfo(pathWagonTypes)
        .then(function (response) {
            $scope.WagonTypes = response.data.value;
        });
    };
    */

    // получение шаблона номера вагона при выборе вида ЖД вагона
    function vmGetWagonNumberPattern(wagon) {
        var wagon_id = wagon['ID'];
        //$scope.WagonNumberPattern = "^[0-9]{1,3}-[0-9]{1,3}$";
        //$scope.WagonNumberPattern = "^[0-9]{3,6}$";
        //$scope.WagonNumberPattern = "^[0-9]{8}$";
        var pathWagonTypes = "PackagingClassProperty?$filter=Description eq '{0}'and PackagingClassID eq {1} &$orderby=ID".format('Wagon number template', wagon_id);
        indexService.getInfo(pathWagonTypes)
        .then(function (response) {
            pattern = response.data.value;
            if (pattern[0] != null) {
                $scope.WagonNumberPattern = pattern[0]['Value'];
            }
        });
    }
    /*
    // получение списка видов лома
    function vmGetCargoTypes() {
        indexService.getInfo('v_KP4_ScrapTypes')
        .then(function (response) {
            $scope.CargoTypes = response.data.value;
        });
    };
    */

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

    /*
    // получение списка поставщиков груза
    function vmGetCargoSenders() {
        indexService.getInfo("v_WGT_Consigners?$filter=PropertyDescription eq 'CONSIGNEE'&$orderby=Description")
        .then(function (response) {
            CargoSenders = response.data.value;
            $scope.CargoSenderShops = [];
            for (i = 0; i < CargoSenders.length; i++) {
                var CargoSenderShop = {};
                CargoSenderShop['ID'] = CargoSenders[i]['ParentID'];
                CargoSenderShop['Description'] = CargoSenders[i]['ParentDescription'];

                if ($scope.CargoSenderShops.map(function (elem) { return elem['ID']; }).indexOf(CargoSenderShop['ID']) == -1) {
                    $scope.CargoSenderShops.push(CargoSenderShop);
                }
            }
        });
    };

    // получение списка получателей груза
    function vmGetCargoReceivers() {
        indexService.getInfo("v_WGT_Consigners?$filter=PropertyDescription eq 'CONSIGNER'&$orderby=Description")
        .then(function (response) {
            CargoReceivers = response.data.value;
            $scope.CargoReceiverShops = [];
            for (i = 0; i < CargoReceivers.length; i++) {
                var CargoReceiverShop = {};
                CargoReceiverShop['ID'] = CargoReceivers[i]['ParentID'];
                CargoReceiverShop['Description'] = CargoReceivers[i]['ParentDescription'];

                if ($scope.CargoReceiverShops.map(function (elem) { return elem['ID']; }).indexOf(CargoReceiverShop['ID']) == -1) {
                    $scope.CargoReceiverShops.push(CargoReceiverShop);
                }
            }
        });
    };

    // получение списка ЖД станций
    function vmGetRWStations() {
        indexService.getInfo("v_WGT_RailwayStations")
        .then(function (response) {
            $scope.RWStations = response.data.value;
        });
    };
    */

    // заполнение участков при выборе цеха из списка
    function vmCargoClientShopSelect(shop) {
        //$scope.CargoSenderDistricts = [];
        $scope.CurrentWaybill.CargoSender = null;
        // фильтрация в списке участков в зависимости от выбранного цеха
        if (CargoSenders != null) {
            $scope.CargoSenderDistricts = CargoSenders.filter(function (item) {
                return item['ParentID'] == shop['ID'];
            });
        }
    };

    // выбор цеха-отправителя из списка
    function vmCargoSenderShopSelect(shop) {
        $scope.CargoSenderDistricts = [];
        $scope.CurrentWaybill.CargoSender = null;
        // фильтрация в списке участков в зависимости от выбранного цеха
        if (CargoSenders != null) {
            $scope.CargoSenderDistricts = CargoSenders.filter(function (item) {
                return item['ParentID'] == shop['ID'];
            });
        }
    };

    // выбор цеха-получателя из списка
    function vmCargoReceiverShopSelect(shop) {
        $scope.CargoReceiverDistricts = [];
        $scope.CurrentWaybill.CargoReceiver = null;
        // фильтрация в списке участков в зависимости от выбранного цеха
        if (CargoReceivers != null) {
            $scope.CargoReceiverDistricts = CargoReceivers.filter(function (item) {
                return item['ParentID'] == shop['ID'];
            });
        }
    };


    // сохранение отвесной
    function vmSave() {
        console.log(new Date() + ". " + "Begin vmSave.");

        //
        function stringToDatetimeUTCCorrect(dt_string) {
            if (!dt_string) return null;
            var DT = $.datepicker.parseDateTime("dd.mm.yy", "hh:mm", dt_string);
            //new Date().setMinutes(
            var utc = DT.getTimezoneOffset();
            DT.setMinutes(DT.getMinutes() - utc);
            return DT;
        }

        // проверка заполнения формы
        var error_str = "";
        error_str += $scope.CurrentWaybill.WaybillNumber ? "" : "-- WaybillNumber is empty \n";
        error_str += $scope.CurrentWaybill.WagonType ? "" : "-- Wagon type is empty \n";
        error_str += $scope.CurrentWaybill.WagonNumber ? "" : "-- Wagon number is empty \n";
        error_str += $scope.CurrentWaybill.CargoType ? "" : "-- Cargo type is empty \n";
        error_str += $scope.CurrentWaybill.CargoSender ? "" : "-- Sender is empty \n";
        error_str += $scope.CurrentWaybill.SenderRWStation ? "" : "-- Sender RW station is empty \n";
        error_str += $scope.CurrentWaybill.CargoReceiver ? "" : "-- Receiver is empty \n";
        error_str += $scope.CurrentWaybill.ReceiverRWStation ? "" : "-- Receiver RW station is empty \n";

        // если форма не валидна, возвращаем FALSE
        if (error_str.length > 0) {
            error_str = "The next errors have been found: \n" + error_str;
            alert(error_str);
            return $q.when(false);
        }
        var WaybillNumber = $scope.CurrentWaybill.WaybillNumber.toString();
        var Consigner = user.toString();
        var WagonType = $scope.CurrentWaybill.WagonType ? $scope.CurrentWaybill.WagonType['ID'] : null;
        var WagonNumber = $scope.CurrentWaybill.WagonNumber.toString();
        var CargoType = $scope.CurrentWaybill.CargoType ? $scope.CurrentWaybill.CargoType['ID'] : null;
        var SenderShop = $scope.CurrentWaybill.CargoSender ? $scope.CurrentWaybill.CargoSender['ParentID'] : null;
        var SenderDistrict = $scope.CurrentWaybill.CargoSender ? $scope.CurrentWaybill.CargoSender['ID'] : null;
        var SenderRWStation = $scope.CurrentWaybill.SenderRWStation ? $scope.CurrentWaybill.SenderRWStation['ID'] : null;
        var SenderArriveDT = stringToDatetimeUTCCorrect($scope.CurrentWaybill.SenderArriveDT);//$.datepicker.parseDateTime("dd.mm.yy", "hh:mm", $scope.CurrentWaybill.SenderArriveDT || "");
        var SenderStartLoadDT = $.datepicker.parseDateTime("dd.mm.yy", "hh:mm", $scope.CurrentWaybill.SenderStartLoadDT || "");
        var SenderEndLoadDT = $.datepicker.parseDateTime("dd.mm.yy", "hh:mm", $scope.CurrentWaybill.SenderEndLoadDT || "");
        var ReceiverShop = $scope.CurrentWaybill.CargoReceiver ? $scope.CurrentWaybill.CargoReceiver['ParentID'] : null;
        var ReceiverDistrict = $scope.CurrentWaybill.CargoReceiver ? $scope.CurrentWaybill.CargoReceiver['ID'] : null;
        var ReceiverRWStation = $scope.CurrentWaybill.ReceiverRWStation ? $scope.CurrentWaybill.ReceiverRWStation['ID'] : null;
        var ReceiverArriveDT = $.datepicker.parseDateTime("dd.mm.yy", "hh:mm", $scope.CurrentWaybill.ReceiverArriveDT || "");
        var ReceiverStartLoadDT = $.datepicker.parseDateTime("dd.mm.yy", "hh:mm", $scope.CurrentWaybill.ReceiverStartLoadDT || "");
        var ReceiverEndLoadDT = $.datepicker.parseDateTime("dd.mm.yy", "hh:mm", $scope.CurrentWaybill.ReceiverEndLoadDT || "");
        var WagonID = null;
        var WaybillID = null;

        // проверка существования номера вагона
        function checkWagonExists(wagon_type, wagon_number) {
            var queryPackagingUnits = "PackagingUnits?$filter=PackagingClassID eq {0} and Description eq '{1}' &$orderby=ID".format(wagon_type, wagon_number);
            return indexService.getInfo(queryPackagingUnits);
        };

        // вставка нового вагона в БД
        function insertNewWagon(wagon_type, wagon_number) {
            return indexService.sendInfo('ins_PackagingUnits', {
                WagonNumber: wagon_number,
                PackagingClass: wagon_type,
                PackagingUnitsID: 0
            });
        };

        // вставка новой отвесной в БД
        function insertNewWaybill() {
            return indexService.sendInfo('ins_SaveWaybill', {
                WaybillNumber: WaybillNumber,
                Consigner: Consigner,
                WagonType: WagonType,
                WagonNumber: WagonID,
                CargoType: CargoType,
                SenderShop: SenderShop,
                SenderDistrict: SenderDistrict,
                SenderRWStation: SenderRWStation,
                SenderArriveDT: SenderArriveDT,
                SenderStartLoadDT: SenderStartLoadDT,
                SenderEndLoadDT: SenderEndLoadDT,
                ReceiverShop: ReceiverShop,
                ReceiverDistrict: ReceiverDistrict,
                ReceiverRWStation: ReceiverRWStation,
                ReceiverArriveDT: ReceiverArriveDT,
                ReceiverStartLoadDT: ReceiverStartLoadDT,
                ReceiverEndLoadDT: ReceiverEndLoadDT,
                DocumentationsID: 0
            });
        };

        function mainSaveWaybill() {
            // проверяем существование вагона
            return checkWagonExists(WagonType, WagonNumber).then(function (response) {
                var Wagon = response.data.value;
                // если не существует - предлагаем добавить в БД
                if (Wagon[0] == null) {
                    console.log(new Date() + ". " + "checkWagonExists: Wagon does not exist.");
                    var confirm_string = "Wagon #{0} doesnt exist!\n".format(WagonNumber) +
                                         "Do you want to add this wagon to DB?\n" +
                                         "If 'Cancel' waybill will not be created.";
                    if (confirm(confirm_string)) {
                        console.log(new Date() + ". " + "Confirm accepted.");
                        return insertNewWagon(WagonType, WagonNumber).then(function (response) {
                            console.log(new Date() + ". " + "New wagon has been created.");
                            if (response.data.ActionParameters) {
                                WagonID = response.data.ActionParameters[0]['Value'];
                                return insertNewWaybill();
                            }
                            else {
                                alert("Error during creating new wagon!");
                            }
                        })
                    }
                    else {
                        console.log("Confirm rejected");
                    }
                }
                    // если существует - создаем новую отвесную в БД
                else {
                    console.log(new Date() + ". " + "checkWagonExists: Wagon exists.");
                    WagonID = Wagon[0]['ID'];
                    return insertNewWaybill();
                }
                console.log("-----");
                return false;
            });
        };

        return mainSaveWaybill()
            .then(function (response) {
                if (response.data && response.data.ActionParameters) {
                    $scope.CurrentWaybill.ID = response.data.ActionParameters[0]['Value'];
                    var returned_object = $scope.CurrentWaybill;
                    console.log(new Date() + ". " + "Saving success.");
                    alert('Saving success!');
                    //alert("WaybillID = " + $scope.CurrentWaybill.ID);
                    //resetWaybillNumber();
                    return returned_object;
                }
                else {
                    alert('Saving has been rejected!');
                }
            })

        //window.open('/Static/consigners/waybill.html');
    }

    // нажатие "Сохранить"
    function vmSaveOnly() {
        vmSave().then(function (response) {
            // если возвращается NULL - выходим
            if (response === null || response === undefined || response.ID === undefined) {
                console.log("Errors or rejected");
                return;
            }
            // при успешном сохранении отвесной очищаем номер вагона и инкрементируем номер отвесной
            console.log("resetWaybillNumber");
            resetWaybillNumber();
        })

        function resetWaybillNumber() {
            $scope.CurrentWaybill.WagonNumber = null;
            $scope.CurrentWaybill.ID = null;
            if ($scope.CurrentWaybill.WaybillNumber) {
                $scope.CurrentWaybill.WaybillNumber = parseInt($scope.CurrentWaybill.WaybillNumber) + 1;
            }
        };
    }

    // нажатие "Сохранить и печатать"
    function vmSavePrint() {

        alert("Save and Print");
        vmSave().then(function (response) {
            // если возвращается NULL - выходим
            if (response === null || response === undefined || response.ID === undefined) {
                console.log("Errors or rejected");
                return;
            }
            // при успешном сохранении отвесной получаем ID записи и печатаем
            var waybill_object = response;
            //if (waybill_object == null) return;
            console.log("WaybillID = " + response.ID);
            console.log("go to app.Consigners.Print");
            $state.go('app.Consigners.Print', { print_id: waybill_object.ID, waybill_object: waybill_object });

        })
    }

    // нажатие "Забраковать"
    function vmReject() {
        alert("Reject");
        //window.open('/Static/consigners/waybill.html');
    }

}])






.controller('ConsignersPrintCtrl', ['$scope', '$translate', 'indexService', '$state', '$stateParams', function ($scope, $translate, indexService, $state, $stateParams) {

    console.log("ConsignersPrintCtrl");

    $scope.CurrentWaybill = [];
    // если переданный объект отвесной не пуст
    if ($state.params.waybill_object != null) {
        $scope.CurrentWaybill = $state.params.waybill_object;
    }
        // если ID в адресе не пуст
    else if ($state.params.print_id != null) {
        $scope.CurrentWaybill['ID'] = $state.params.print_id;
        // получаем все данные по этому ID и заполняем CurrentWaybill
        console.log("Get waybill data from DB here");

    }
        // если все значения пустые, переходим на Consigners.Index
    else {
        console.log("waybill_object is NULL");
        console.log("go to app.Consigners.Index");
        $state.go('app.Consigners.Index');
    }

    //var CurrentWaybillID = $scope.common_var;
    //var common_var_from_Ctrl = $scope.$parent.common_var;
    //$scope.CurrentWaybillID = $scope.common_var;
    //$scope.id = $state.params.print_id;
    //$scope.CurrentWaybill = CurrentWaybill;
    //$scope.common_var
    //alert($scope.common_var);
    //alert("CurrentWaybill:" + CurrentWaybill + "; common_var_from_Ctrl = " + common_var_from_Ctrl);

}])





.filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            var keys = Object.keys(props);

            items.forEach(function (item) {
                var itemMatches = false;

                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
})
/*
.filter('unique', function () {

    return function (items, filterOn) {

        if (filterOn === false) {
            return items;
        }

        if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
            var hashCheck = {}, newItems = [];

            var extractValueToCompare = function (item) {
                if (angular.isObject(item) && angular.isString(filterOn)) {
                    return item[filterOn];
                } else {
                    return item;
                }
            };

            angular.forEach(items, function (item) {
                var valueToCheck, isDuplicate = false;

                for (var i = 0; i < newItems.length; i++) {
                    if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
                        isDuplicate = true;
                        break;
                    }
                }
                if (!isDuplicate) {
                    newItems.push(item);
                }

            });
            items = newItems;
        }
        return items;
    };
})
*/
.directive('placeholder', function ($timeout) {
    var i = document.createElement('input');
    if ('placeholder' in i) {
        return {}
    }
    return {
        link: function (scope, elm, attrs) {
            if (attrs.type === 'password') {
                return;
            }
            $timeout(function () {
                elm.val(attrs.placeholder);
                elm.bind('focus', function () {
                    if (elm.val() == attrs.placeholder) {
                        elm.val('');
                    }
                }).bind('blur', function () {
                    if (elm.val() == '') {
                        elm.val(attrs.placeholder);
                    }
                });
            });
        }
    }
})

.service('consignersService', ['indexService', function (indexService) {

    this.GetCargoTypes = function () {
        var request = indexService.getInfo('v_KP4_ScrapTypes');
        return request;
    };

    this.GetWagonTypes = function () {
        var filter_str = "ЖД вагоны";
        filter_str = encodeURI(filter_str);
        var pathWagonTypes = "v_PackagingClass?$filter=ParentDescription eq '{0}'&$orderby=ID".format(filter_str);
        var request = indexService.getInfo(pathWagonTypes);
        return request;
    };

    this.GetRWStations = function () {
        var request = indexService.getInfo('v_WGT_RailwayStations');
        return request;
    };

    this.GetCargoSenders = function () {
        var request = indexService.getInfo("v_WGT_Consigners?$filter=PropertyDescription eq 'CONSIGNEE'&$orderby=Description");
        return request;
    };

    this.GetCargoReceivers = function () {
        var request = indexService.getInfo("v_WGT_Consigners?$filter=PropertyDescription eq 'CONSIGNER'&$orderby=Description");
        return request;
    };

    /*
    // получение списка поставщиков груза
    function vmGetCargoSenders() {
        indexService.getInfo("v_WGT_Consigners?$filter=PropertyDescription eq 'CONSIGNEE'&$orderby=Description")
        .then(function (response) {
            CargoSenders = response.data.value;
            $scope.CargoSenderShops = [];
            for (i = 0; i < CargoSenders.length; i++) {
                var CargoSenderShop = {};
                CargoSenderShop['ID'] = CargoSenders[i]['ParentID'];
                CargoSenderShop['Description'] = CargoSenders[i]['ParentDescription'];

                if ($scope.CargoSenderShops.map(function (elem) { return elem['ID']; }).indexOf(CargoSenderShop['ID']) == -1) {
                    $scope.CargoSenderShops.push(CargoSenderShop);
                }
            }
        });
    };

    // получение списка получателей груза
    function vmGetCargoReceivers() {
        indexService.getInfo("v_WGT_Consigners?$filter=PropertyDescription eq 'CONSIGNER'&$orderby=Description")
        .then(function (response) {
            CargoReceivers = response.data.value;
            $scope.CargoReceiverShops = [];
            for (i = 0; i < CargoReceivers.length; i++) {
                var CargoReceiverShop = {};
                CargoReceiverShop['ID'] = CargoReceivers[i]['ParentID'];
                CargoReceiverShop['Description'] = CargoReceivers[i]['ParentDescription'];

                if ($scope.CargoReceiverShops.map(function (elem) { return elem['ID']; }).indexOf(CargoReceiverShop['ID']) == -1) {
                    $scope.CargoReceiverShops.push(CargoReceiverShop);
                }
            }
        });
    };
    */



}])
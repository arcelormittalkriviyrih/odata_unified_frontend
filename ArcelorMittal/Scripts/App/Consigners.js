
angular.module('indexApp')

.config(['$stateProvider', function ($stateProvider) {

    $stateProvider

        .state('app.Consigners.Index', {

            url: '/index',
            //templateUrl: 'Static/consigners/index.html',
            //controller: 'ConsignersIndexCtrl',
            params: { waybill_id: null },
            views: {
                "": {
                    templateUrl: "Static/consigners/index.html",
                    controller: 'ConsignersIndexCtrl',
                    //params: { waybill_id: 1111 }
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
            params: { copy_id: null, modify_id: null, waybill_object: null },

        })

        .state('app.Consigners.Print', {

            url: '/toprint/:print_id?',
            templateUrl: 'Static/consigners/waybill.html',
            controller: 'ConsignersPrintCtrl',
            params: { waybill_object: null },

        })

}])


.controller('ConsignersCtrl', ['$scope', '$translate', 'indexService', '$state', function ($scope, $translate, indexService, $state) {

    //console.log("ConsignersCtrl");

    //console.log("go to app.Consigners.Index");
    $state.go('app.Consigners.Index');

}])







.controller('ConsignersIndexCtrl', ['$q', '$scope', '$translate', 'indexService', 'consignersService', '$state', '$stateParams', function ($q, $scope, $translate, indexService, consignersService, $state, $stateParams) {

    //alert("ConsignersIndexCtrl");
    //console.log("ConsignersIndexCtrl");

    //$state.go('app.Consigners.Index');
    var enter_waybill_id = $state.params.waybill_id;
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
        //console.log("go to app.Consigners.Create");
        $state.go('app.Consigners.Create', { copy_id: null });

    }

    // нажатие кнопки "Создать как копию"
    $scope.CreateCopy = function () {
        //alert("Create");
        //console.log("go to app.Consigners.Create");
        $state.go('app.Consigners.Create', { copy_id: $scope.CurrentWaybill.ID, waybill_object: $scope.CurrentWaybill });

    }

    // нажатие кнопки "Редактировать"
    $scope.Modify = function () {
        //alert("Create");
        //console.log("go to app.Consigners.Create (modify)");
        $state.go('app.Consigners.Create', { modify_id: $scope.CurrentWaybill.ID, waybill_object: $scope.CurrentWaybill });

    }

    // нажатие кнопки "Печать"
    $scope.Print = function () {

        if ($scope.CurrentWaybill.ID) {

            var waybill_toprint_html = document.getElementById('waybill_toprint');
            var inner_html = waybill_toprint_html.innerHTML;
            var outer_html = waybill_toprint_html.outerHTML;
            //var inner_html = waybill_toprint_html.innerHTML;
            //alert(inner_html);
            //alert(outer_html);
            var str = "\n\
            <!DOCTYPE html>\n\
            <html>\n\
            <head>\n\
                <meta http-equiv=\"content-type\" content=\"text/html; charset=UTF-8\">\n\
                <meta name=\"viewport\" content=\"width=device-width\">\n\
                <meta http-equiv=\"X-UA-Compatible\" content=\"IE=9\">\n\
                <title>Путевая № {0}</title>\n\
            </head>\n\
            <body>\n\
            ".format($scope.CurrentWaybill.WaybillNumber);
            inner_html = str + inner_html + "</body></html>"

            // Открыть документ в новом окне (или послать inner_html в сервис печати)
            window.open().document.write(inner_html);
            // Открыть в app.Consigners
            //console.log("go to app.Consigners.Print");
            $state.go('app.Consigners.Print', { print_id: $scope.CurrentWaybill.ID, waybill_object: $scope.CurrentWaybill });
        }
        else {
            alert($translate.instant('consigners.Messages.noWaybill')); //alert("$scope.CurrentWaybill.ID is null");
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


    // получение дерева архивных путевых
    function vmGetWaybillTree() {

        WaybillList = $('#waybill_list').jstree('destroy');
        indexService.getInfo('v_WGT_WaybillList').then(function (response) {

            if (response.data.value.length) {
                response.data.value.forEach(function (e) {
                    e.id = e.ID;
                    e.parent = e.ParentID;
                    e.text = e.Description;
                    if (e.DocumentationsID) {
                        e.icon = 'jstree-file';
                        if (e.Status == 'reject') {
                            e.icon = 'jstree-reject';
                        }
                        if (e.Status == 'used') {
                            e.icon = 'jstree-finalize';
                        }
                    };
                    delete e.ID;
                    delete e.ParentID;
                    delete e.Description;
                });

                $scope.ArchiveWaybills = response.data.value;

                WaybillList.jstree({
                    core: {
                        data: $scope.ArchiveWaybills
                    },
                    search: {
                        "case_insensitive": true,
                        "show_only_matches": true
                    },
                    plugins: ["search"]
                });
            };
        });
    };

    // загрузка дерева путевых
    WaybillList.on('loaded.jstree', function (e, data) {
        //alert('loaded');
        // при загрузке данных убираем выделение эл-тов и сворачиваем дерево
        WaybillList.jstree('close_all');
        WaybillList.jstree('deselect_all', true);

        // при первой загрузке дерева выделяем год, содержащий последнюю путевую
        var node = $scope.ArchiveWaybills.filter(function (element) {
            if (enter_waybill_id) {
                return element.parent != '#' && element.DocumentationsID == enter_waybill_id;
            }
            else {
                return element.parent == '#' && element.DocumentationsID == null && !isNaN(element.text);
            }
        });
        if (node[0]) {
            node = node[0].id;
            WaybillList.jstree('select_node', node, false);
            WaybillList.jstree(true).get_node(node, true).children('.jstree-anchor').focus();
            WaybillList.jstree('open_node', node);
        }
    });

    // выбор элемента в дереве путевых
    WaybillList.on('select_node.jstree', function (e, data) {
        //alert('select_node');
        $scope.CurrentWaybill = {};
        $scope.ArchiveWaybillSelected = false;
        $scope.$applyAsync();
        if (data.node.original.DocumentationsID) {
            $scope.ArchiveWaybillSelected = true;

            //$scope.common_var = data.node.original.DocumentationsID;
            //$state.params.id = data.node.original.WorkPerfomanceID;
            var waybill_id = data.node.original.DocumentationsID;

            /* !!! get full waybill info here */
            consignersService.GetWaybillObject(waybill_id)
            .then(function (waybill_obj) {
                $scope.CurrentWaybill = waybill_obj;
            })
            /*
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

                        for (i = 0; i < resp_1.length; i++) {
                            //var start_time = resp_1[i]['StartTime'];
                            var start_time = new Date(resp_1[i]['StartTime']);
                            start_time.setMinutes(start_time.getMinutes() + start_time.getTimezoneOffset());
                            waybill_object.CreateDT = start_time;
                            //waybill_object.CreateDT = resp_1[i]['StartTime'];

                            //var tttt = new Date(resp_1[i]['StartTime']);
                            //var qqq = tttt.toGMTString();
                            //var www = tttt.toISOString();
                            //var eee = tttt.toJSON();
                            //var rrr = tttt.toLocaleString();
                            //var yyy = tttt.toUTCString();
                            //var uuu = tttt.getUTCDate();
                            //var iii = tttt.toString();
                            //var ooo = tttt.getUTCHours();
                            //var ppp = tttt.getTimezoneOffset();
                            //var kkk = tttt.setMinutes(tttt.getMinutes() + tttt.getTimezoneOffset());
                            //var utc = DT.getTimezoneOffset();
                            //DT.setMinutes(DT.getMinutes() - utc);

                            if (resp_1[i]['EndTime'] != resp_1[i]['StartTime']) {
                                var end_time = new Date(resp_1[i]['EndTime']);
                                end_time.setMinutes(end_time.getMinutes() + end_time.getTimezoneOffset());
                                waybill_object.EditDT = end_time;
                                //waybill_object.EditDT = resp_1[i]['EndTime'];
                            }
                            waybill_object.Status = resp_1[i]['Status'];
                        }
                        for (i = 0; i < resp_3.length; i++) {
                            if (resp_3[i]['Status'] == 'reject') continue;
                            waybill_object.WagonNumber = resp_3[i]['Description'].trim();
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
                            //console.log("!");
                            actual_prop_queries_array.forEach(function (item, i) {
                                //console.log(item);
                                item['response'] = responses[i].data.value[0];
                                if (item['response']) {
                                    waybill_object[actual_prop_queries_array[i]['prop']] = item['response'];
                                }
                            })

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
            */
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






.controller('ConsignersCreateCtrl', ['$scope', 'indexService', 'consignersService', '$state', '$q', '$filter', '$translate', 'roles', 'user', function ($scope, indexService, consignersService, $state, $q, $filter, $translate, roles, user) {
    //alert("ConsignersCreateCtrl");
    //console.log("ConsignersCreateCtrl");
    // throw main tab change
    //$scope.$emit('mainTabChange', 'Consigners');
    var copy_id = $state.params.copy_id;
    var modify_id = $state.params.modify_id;
    var waybill_object = $state.params.waybill_object;
    $scope.copy_id = copy_id;
    $scope.modify_id = modify_id;

    var last_waybill_id = copy_id || modify_id;

    // заголовок окна
    //$scope.message = "Waybill " + (modify_id ? "modifying" : "creating") + (copy_id ? " as copy" : "");
    $scope.message = modify_id ? $translate.instant('consigners.Labels.waybillModifying') : $translate.instant('consigners.Labels.waybillCreating');


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
    $scope.WagonNumberPattern = null;

    $scope.GetWagonNumberPattern = vmGetWagonNumberPattern;
    $scope.CargoSenderShopSelect = vmCargoSenderShopSelect;
    $scope.CargoReceiverShopSelect = vmCargoReceiverShopSelect;
    $scope.DistrictSelect = vmDistrictSelect;

    $scope.Back = vmBack;
    $scope.SavePrint = vmSavePrint;
    $scope.SaveOnly = vmSaveOnly;
    $scope.Reject = vmReject;


    vmDTPsInit();
    vmGetConsignersServiceArrays();

    //vmGetWagonTypes();
    //vmGetCargoSenders();
    //vmGetCargoReceivers();
    //vmGetCargoTypes();
    //vmGetRWStations();


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

        // для каждого DTP устанавливаем формат
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
                if (waybill_object) {
                    // заполнение CurrentWaybill из waybill_object
                    vmParseWaybillObject();
                    //alert("Create as copy");
                }
            }
        })
    }

    // заполнение CurrentWaybill из waybill_object
    function vmParseWaybillObject() {

        //
        if (waybill_object && waybill_object['WagonType']) {
            vmGetWagonNumberPattern(waybill_object['WagonType']);
        }
        //
        if (waybill_object && waybill_object['SenderShop']) {
            var shop_object = {};
            shop_object['ID'] = waybill_object['SenderShop']['ID'];
            shop_object['Description'] = waybill_object['SenderShop']['Description'];
            $scope.SelectedObjects.SenderShop = shop_object;
            vmCargoSenderShopSelect(shop_object);
        }
        //
        if (waybill_object && waybill_object['ReceiverShop']) {
            var shop_object = {};
            shop_object['ID'] = waybill_object['ReceiverShop']['ID'];
            shop_object['Description'] = waybill_object['ReceiverShop']['Description'];
            $scope.SelectedObjects.ReceiverShop = shop_object;
            vmCargoReceiverShopSelect(shop_object);
        }

        //function FillShop(src_obj, trg_obj) {
        //    var shop_object = {};
        //    shop_object['ID'] = src_obj['ID'];
        //    shop_object['Description'] = src_obj['Description'];
        //    trg_obj = shop_object;
        //    return shop_object;
        //}

        $scope.CurrentWaybill = angular.copy(waybill_object);
        // если создаем как копию - сбрасываем номер вагона и инкрементируем номер путевой
        if (copy_id) {
            $scope.CurrentWaybill.Status = null;
            resetWaybillNumber();
        }
    }

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

    // выбор участка пользователей (поставщиков и получателей) груза
    function vmDistrictSelect(district, cargo_user) {
        //console.log(district['ID'], cargo_user);
        var user_id = district['ID'];
        // определяем ЖД станцию по умолчанию для выбранного участка
        var query = "v_EquipmentProperty?$filter=Property eq '{0}'and EquipmentID eq {1} &$orderby=ID".format('DEFAULT RAILWAY STATION', user_id)
        indexService.getInfo(query).then(function (response) {
            var stations = response.data.value;
            for (i = 0; i < stations.length; i++) {
                var station_id = stations[i]['Value'];
                var station = $scope.RWStations.filter(function (item) { return item['ID'] == station_id; });
                // если станция существует, выбираем ее в списке станций
                if (station.length > 0) {
                    if (cargo_user == 'Sender') {
                        $scope.CurrentWaybill.SenderRWStation = station[0];
                    }
                    else if (cargo_user == 'Receiver') {
                        $scope.CurrentWaybill.ReceiverRWStation = station[0];
                    }
                }
            }
        })


    }


    // сохранение отвесной
    function vmSave(modify) {
        //console.log(new Date() + ". " + "Begin vmSave.");

        // корректировка UTC
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
        error_str += $scope.CurrentWaybill.WaybillNumber ? "" : $translate.instant('consigners.Messages.emptyWaybillNumber');//"-- WaybillNumber is empty \n";
        error_str += $scope.CurrentWaybill.WagonType ? "" : $translate.instant('consigners.Messages.emptyWagonType');//"-- Wagon type is empty \n";
        error_str += $scope.CurrentWaybill.WagonNumber ? "" : $translate.instant('consigners.Messages.emptyWagonNumber');//"-- Wagon number is empty or invalid \n";
        error_str += $scope.CurrentWaybill.CargoType ? "" : $translate.instant('consigners.Messages.emptyCargoType');//"-- Cargo type is empty \n";
        error_str += $scope.CurrentWaybill.CargoSender ? "" : $translate.instant('consigners.Messages.emptySender');//"-- Sender is empty \n";
        error_str += $scope.CurrentWaybill.SenderRWStation ? "" : $translate.instant('consigners.Messages.emptySenderStation');//"-- Sender RW station is empty \n";
        error_str += $scope.CurrentWaybill.CargoReceiver ? "" : $translate.instant('consigners.Messages.emptyReceiver');//"-- Receiver is empty \n";
        error_str += $scope.CurrentWaybill.ReceiverRWStation ? "" : $translate.instant('consigners.Messages.emptyReceiverStation');//"-- Receiver RW station is empty \n";

        // если есть ошибки, возвращаем FALSE
        if (error_str.length > 0) {
            error_str = $translate.instant('consigners.Messages.errorsFound') + error_str;//"The next errors have been found: \n" + error_str;
            alert(error_str);
            return $q.when(false);
        }

        var WaybillNumber = $scope.CurrentWaybill.WaybillNumber.toString();
        var Consigner = user.toString();
        var WagonType = $scope.CurrentWaybill.WagonType ? $scope.CurrentWaybill.WagonType['ID'] : null;
        var WagonNumber = $scope.CurrentWaybill.WagonNumber.toString().trim();
        var CargoType = $scope.CurrentWaybill.CargoType ? $scope.CurrentWaybill.CargoType['ID'] : null;
        var SenderShop = $scope.CurrentWaybill.CargoSender ? $scope.CurrentWaybill.CargoSender['ParentID'] : null;
        var SenderDistrict = $scope.CurrentWaybill.CargoSender ? $scope.CurrentWaybill.CargoSender['ID'] : null;
        var SenderRWStation = $scope.CurrentWaybill.SenderRWStation ? $scope.CurrentWaybill.SenderRWStation['ID'] : null;
        var SenderArriveDT = stringToDatetimeUTCCorrect($scope.CurrentWaybill.SenderArriveDT);//$.datepicker.parseDateTime("dd.mm.yy", "hh:mm", $scope.CurrentWaybill.SenderArriveDT || "");
        var SenderStartLoadDT = stringToDatetimeUTCCorrect($scope.CurrentWaybill.SenderStartLoadDT);//$.datepicker.parseDateTime("dd.mm.yy", "hh:mm", $scope.CurrentWaybill.SenderStartLoadDT || "");
        var SenderEndLoadDT = stringToDatetimeUTCCorrect($scope.CurrentWaybill.SenderEndLoadDT);//$.datepicker.parseDateTime("dd.mm.yy", "hh:mm", $scope.CurrentWaybill.SenderEndLoadDT || "");
        var ReceiverShop = $scope.CurrentWaybill.CargoReceiver ? $scope.CurrentWaybill.CargoReceiver['ParentID'] : null;
        var ReceiverDistrict = $scope.CurrentWaybill.CargoReceiver ? $scope.CurrentWaybill.CargoReceiver['ID'] : null;
        var ReceiverRWStation = $scope.CurrentWaybill.ReceiverRWStation ? $scope.CurrentWaybill.ReceiverRWStation['ID'] : null;
        var ReceiverArriveDT = stringToDatetimeUTCCorrect($scope.CurrentWaybill.ReceiverArriveDT);//$.datepicker.parseDateTime("dd.mm.yy", "hh:mm", $scope.CurrentWaybill.ReceiverArriveDT || "");
        var ReceiverStartLoadDT = stringToDatetimeUTCCorrect($scope.CurrentWaybill.ReceiverStartLoadDT);//$.datepicker.parseDateTime("dd.mm.yy", "hh:mm", $scope.CurrentWaybill.ReceiverStartLoadDT || "");
        var ReceiverEndLoadDT = stringToDatetimeUTCCorrect($scope.CurrentWaybill.ReceiverEndLoadDT);//$.datepicker.parseDateTime("dd.mm.yy", "hh:mm", $scope.CurrentWaybill.ReceiverEndLoadDT || "");
        var WagonID = null;
        var WaybillID = null;

        // проверка существования номера путевой
        function checkWaybillNumber(waybill_number, sender_shop) {
            var query = "v_WGT_WaybillExistCheck?$filter=WaybillNumber eq '{0}' and SenderShop eq '{1}' &$orderby=EndTime desc".format(waybill_number, sender_shop);
            return indexService.getInfo(query);
        }

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

        // определение изменений в путевой (возвращает массив измененных параметров)
        function waybillComparing(orig_wb, mod_wb) {
            var prop_array = [];
            angular.forEach(orig_wb, function (value_orig, key_orig) {
                var value_modify = mod_wb[key_orig];
                if (!angular.equals(value_orig, value_modify)) {
                    var t = {};
                    t[key_orig] = value_modify;
                    prop_array.push(t);
                }
            })
            return prop_array;
        }

        // вставка новой путевой в БД
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

        // редактирование текущей путевой в БД
        function updateCurWaybill() {
            var modifying_waybill = $scope.CurrentWaybill;
            var original_waybill = waybill_object;
            // сравниваем параметры оригинальной путевой и измененной
            var diff_props = waybillComparing(original_waybill, modifying_waybill);
            // если нет изменений - выходим
            if (diff_props.length == 0) {
                alert($translate.instant('consigners.Messages.noChanges'));//alert("Nothing to modify.");
                return $q.when(false);
            }
            else {
                alert($translate.instant('consigners.Messages.parametersModified') + diff_props.length);//alert("{0} parameters has been modified.".format(diff_props.length));
            }

            return indexService.sendInfo('upd_SaveWaybill', {
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
                DocumentationsID: $scope.CurrentWaybill['ID'],
                DocumentationsID_returned: 0
            });

        };

        // основная функция сохранения (или изменения) путевой
        function mainSaveWaybill() {
            // проверяем существование номера путевой
            return checkWaybillNumber(WaybillNumber, SenderShop).then(function (response) {
                existing_waybill = response.data.value;
                // если существует - предлагаем все же добавить в БД
                if (existing_waybill[0] && !modify) {
                    nearest_DT = existing_waybill[0]['EndTime'];
                    var date = new Date(nearest_DT).toLocaleDateString();
                    sender_shop_name = $filter('filter')($scope.CargoSenderShops, { ID: SenderShop })[0]['Description'];
                    //console.log(new Date() + ". " + "checkWaybillNumber: WaybillNumber already exists.");
                    var confirm_string = $translate.instant('consigners.Messages.checkWaybillNumberConfirm').format(WaybillNumber, sender_shop_name, date);
                    //var confirm_string = "Waybill #{0} ({2}) for shop '{1}' already exists!\n".format(WaybillNumber, sender_shop_name, date) +
                    //                     "Do you want to create waybill anyway?\n" +
                    //                     "If 'Cancel' waybill will not be created.";
                    if (!confirm(confirm_string)) {
                        //console.log("checkWaybillNumber confirm rejected");
                        return false;
                    }
                    //console.log(new Date() + ". " + "checkWaybillNumber confirm accepted.");
                }
                // проверяем существование вагона
                return checkWagonExists(WagonType, WagonNumber).then(function (response) {
                    var Wagon = response.data.value;
                    // если не существует - предлагаем добавить в БД
                    if (Wagon[0] == null) {
                        //console.log(new Date() + ". " + "checkWagonExists: Wagon does not exist.");

                        var confirm_string = $translate.instant('consigners.Messages.checkWagonExistsConfirm').format(WagonNumber);
                        //var confirm_string = "Wagon #{0} doesnt exist!\n".format(WagonNumber) +
                        //                     "Do you want to add this wagon to DB?\n" +
                        //                     "If 'Cancel' waybill will not be created.";
                        if (confirm(confirm_string)) {
                            //console.log(new Date() + ". " + "checkWagonExists confirm accepted.");
                            return insertNewWagon(WagonType, WagonNumber).then(function (response) {
                                //console.log(new Date() + ". " + "New wagon has been created.");
                                if (response.data.ActionParameters) {
                                    WagonID = response.data.ActionParameters[0]['Value'];
                                    // если Модифицировать, то возвращаем updateCurWaybill()
                                    if (modify) return updateCurWaybill();
                                    // если Создать, то возвращаем insertNewWaybill()
                                    return insertNewWaybill();
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
                        // если существует - создаем новую отвесную в БД
                    else {
                        //console.log(new Date() + ". " + "checkWagonExists: Wagon exists.");
                        WagonID = Wagon[0]['ID'];
                        // если Модифицировать, то возвращаем updateCurWaybill()
                        if (modify) return updateCurWaybill();
                        return insertNewWaybill();
                    }
                    //console.log("-----");
                    return false;
                });
            });
        };

        // функция vmSave возвращает результат mainSaveWaybill()
        return mainSaveWaybill()
            .then(function (response) {
                // если вернулся результат сохранения (ID записи), то возвращаем сохраненный объект
                if (response.data && response.data.ActionParameters) {
                    if (!modify) {
                        $scope.CurrentWaybill.ID = response.data.ActionParameters[0]['Value'];
                        //console.log(new Date() + ". " + "Saving success.");
                        alert($translate.instant('consigners.Messages.savingSuccess')); //alert("Saving success");
                    }
                    else {
                        waybill_object = angular.copy($scope.CurrentWaybill);
                        //console.log(new Date() + ". " + "Updating success.");
                        alert($translate.instant('consigners.Messages.updatingSuccess')); //alert('Updating success!');
                    }
                    var returned_object = $scope.CurrentWaybill;
                    return returned_object;
                }
                    // если вернулся false, сообщение об отмене
                else {
                    if (!modify) {
                        alert($translate.instant('consigners.Messages.savingRejected')); //alert('Saving has been rejected!');
                    }
                    else {
                        alert($translate.instant('consigners.Messages.updatingRejected')); //alert('Updating has been rejected!');
                    }
                }
            })

        //window.open('/Static/consigners/waybill.html');
    }

    // сброс номера вагона и инкремент номера отвесной
    function resetWaybillNumber() {
        $scope.CurrentWaybill.WagonNumber = null;
        $scope.CurrentWaybill.ID = null;
        if ($scope.CurrentWaybill.WaybillNumber) {
            $scope.CurrentWaybill.WaybillNumber = parseInt($scope.CurrentWaybill.WaybillNumber) + 1;
        }
    };


    // нажатие "Сохранить"
    function vmSaveOnly() {
        var modify = modify_id ? true : false;  // флаг "сохранить" или "изменить"
        vmSave(modify).then(function (response) {
            // если возвращается NULL - выходим
            if (response === null || response === undefined || response.ID === undefined) {
                //console.log("Errors or rejected");
                return;
            }
            last_waybill_id = $scope.CurrentWaybill.ID;
            if (!modify) {
                // при успешном сохранении отвесной очищаем номер вагона и инкрементируем номер отвесной
                //console.log("resetWaybillNumber");
                resetWaybillNumber();
            }
        })
    }

    // нажатие "Сохранить и печатать"
    function vmSavePrint() {
        var modify = modify_id ? true : false;  // флаг "сохранить" или "изменить"
        //if (!copy_id) return;
        //alert("Save and Print");
        vmSave(modify).then(function (response) {
            // если возвращается NULL - выходим
            if (response === null || response === undefined || response.ID === undefined) {
                //console.log("Errors or rejected");
                return;
            }
            // при успешном сохранении отвесной получаем ID записи и печатаем
            var waybill_object = response;
            //if (waybill_object == null) return;
            //console.log("WaybillID = " + response.ID);
            //console.log("go to app.Consigners.Print");
            $state.go('app.Consigners.Print', { print_id: waybill_object.ID, waybill_object: waybill_object });

        })
    }

    // нажатие "Забраковать"
    function vmReject() {
        //alert("Reject");
        if ($scope.CurrentWaybill.Status != 'used') {
            return;
        }
        var reject = false;
        if ($scope.CurrentWaybill.Status != 'reject') {
            reject = true;
        }
        var confirm_string = (reject ?
                            $translate.instant('consigners.Messages.rejectConfirm') :
                            $translate.instant('consigners.Messages.rejectDiscardConfirm')).format($scope.CurrentWaybill.WaybillNumber);
        //var confirm_string = reject ?
        //    "Are you sure to reject waybill #{0}?".format($scope.CurrentWaybill.WaybillNumber) :
        //    "Are you sure to discard reject waybill #{0}?".format($scope.CurrentWaybill.WaybillNumber);
        // если подтвердили забраковку и находимся в режиме редактирования
        if (confirm(confirm_string) && modify_id) {
            DocumentationsID = modify_id;
            var Status = reject ? "reject" : null;
            indexService.sendInfo("upd_Documentations", {
                DocumentationsID: DocumentationsID,
                Status: Status
            }).then(function (response) {
                var message = (reject ?
                    $translate.instant('consigners.Messages.rejectSuccess') :
                    $translate.instant('consigners.Messages.rejectDiscardSuccess')).format($scope.CurrentWaybill.WaybillNumber);
                //var message = reject ?
                //    "Waybill #{0} rejected succesfully.".format($scope.CurrentWaybill.WaybillNumber) :
                //    "Discard rejecting of waybill #{0} succesfully.".format($scope.CurrentWaybill.WaybillNumber);
                $scope.CurrentWaybill.Status = Status;
                alert(message);
            })
        }
        //window.open('/Static/consigners/waybill.html');
    }

    // нажатие "Назад"
    function vmBack() {
        //alert("Back");
        // ID путевой для выделения в дереве при возврате на главную страницу
        var waybill_id = last_waybill_id;
        //console.log("waybill_id = " + waybill_id);
        //console.log("go to app.Consigners.Index");
        $state.go('app.Consigners.Index', { waybill_id: waybill_id });
        //window.open('/Static/consigners/waybill.html');
    }

}])






.controller('ConsignersPrintCtrl', ['$scope', '$translate', 'indexService', '$state', '$stateParams', function ($scope, $translate, indexService, $state, $stateParams) {

    //console.log("ConsignersPrintCtrl");

    $scope.CurrentWaybill = [];
    // если переданный объект отвесной не пуст
    if ($state.params.waybill_object != null) {
        $scope.CurrentWaybill = $state.params.waybill_object;
    }
        // если ID в адресе не пуст
    else if ($state.params.print_id != null) {
        $scope.CurrentWaybill['ID'] = $state.params.print_id;
        // получаем все данные по этому ID и заполняем CurrentWaybill
        //console.log("Get waybill data from DB here");

    }
        // если все значения пустые, переходим на Consigners.Index
    else {
        //console.log("waybill_object is NULL");
        //console.log("go to app.Consigners.Index");
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

.service('consignersService', ['indexService', '$q', function (indexService, $q) {

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

    this.GetWagonNumberPattern = function (wagon) {
        var wagon_id = wagon['ID'];
        var pathWagonTypes = "PackagingClassProperty?$filter=Description eq '{0}'and PackagingClassID eq {1} &$orderby=ID".format('Wagon number template', wagon_id);
        var request = indexService.getInfo(pathWagonTypes)
        return request
            .then(function (response) {
                pattern = response.data.value;
                if (pattern[0] != null) {
                    return pattern[0]['Value'];
                }
            });
    }

    this.GetWaybillObject = function (waybill_id) {

        /* !!! get full waybill info here */
        return $q.all([ indexService.getInfo("PackagingUnitsDocs?$filter=DocumentationsID eq {0} &$orderby=ID".format(waybill_id)),
                        indexService.getInfo("v_WGT_DocumentsProperty?$filter=DocumentationsID eq {0} &$orderby=ID".format(waybill_id))])
                .then(function (responses) {
                    var resp_0 = responses[0].data.value;
                    var resp_1 = responses[1].data.value;

                    var waybill_object = {};

                    //for (i = 0; i < resp_1.length; i++) {
                    //    //var start_time = resp_1[i]['StartTime'];
                    //    var start_time = new Date(resp_1[i]['StartTime']);
                    //    start_time.setMinutes(start_time.getMinutes() + start_time.getTimezoneOffset());
                    //    //waybill_object.CreateDT = start_time;

                    //    if (resp_1[i]['EndTime'] != resp_1[i]['StartTime']) {
                    //        var end_time = new Date(resp_1[i]['EndTime']);
                    //        end_time.setMinutes(end_time.getMinutes() + end_time.getTimezoneOffset());
                    //        //waybill_object.EditDT = end_time;
                    //    }
                    //    //waybill_object.Status = resp_1[i]['Status'];
                    //}
                    for (i = 0; i < resp_0.length; i++) {
                        if (resp_0[i]['Status'] == 'reject') continue;
                        //if there is only one wagon in waybill
                        waybill_object.WagonNumber = resp_0[i]['Description'].trim();
                        //if there is array of wagons in waybill
                        waybill_object.WagonNumbers = [];
                        resp_0[i]['Description'] = resp_0[i]['Description'].trim();
                        waybill_object.WagonNumbers.push(resp_0[i]);
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
                    for (i = 0; i < resp_1.length; i++) {
                        //$scope.CurrentWaybill.WagonNumber = resp_0[i]['Description'];
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
                                case "StartTime": {
                                    waybill_object.CreateDT = prop['Value2'] || null;
                                    break;
                                }
                                case "EndTime": {
                                    waybill_object.EditDT = prop['Value2'] || null;
                                    break;
                                }
                                default: {
                                    waybill_object[prop['Description2']] = prop['Value2'];
                                }
                            }
                            //waybill_object[prop['Description2']] = prop['Value2'];
                        }
                    }
                    //alert(actual_prop_queries_array.length);
                    return $q.all(actual_prop_queries_array.map(function (item) { return indexService.getInfo(item['query']) }))
                    .then(function (responses) {
                        //console.log("!");
                        actual_prop_queries_array.forEach(function (item, i) {
                            //console.log(item);
                            item['response'] = responses[i].data.value[0];
                            if (item['response']) {
                                waybill_object[actual_prop_queries_array[i]['prop']] = item['response'];
                            }
                        })

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

                        return waybill_object;
                    })
                })
    }


}])
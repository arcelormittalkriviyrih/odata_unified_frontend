
angular.module('indexApp')

.config(['$stateProvider', function ($stateProvider) {

    $stateProvider

        .state('app.Consigners.Main', {

            url: '/main',
            //templateUrl: 'Static/consigners/index.html',
            //controller: 'ConsignersMainCtrl',
            params: { waybill_id: null },
            views: {
                "": {
                    templateUrl: "Static/consigners/main.html",
                    controller: 'ConsignersMainCtrl',
                    //params: { waybill_id: 1111 }
                },
                "waybill_toprint@app.Consigners.Main": {
                    templateUrl: "Static/consigners/waybill.html",
                    //controller: 'ConsignersPrintCtrl',
                    //params: { rrr: 2222 }
                },
                "explosion_cert@app.Consigners.Main": {
                    templateUrl: "Static/consigners/explosion_cert.html",
                }
            }
        })

        .state('app.Consigners.Create', {

            url: '/create',
            templateUrl: 'Static/consigners/create.html',
            controller: 'ConsignersCreateCtrl',
            params: { copy_id: null, modify_id: null, waybill_object: null },

        })

        .state('app.Consigners.Find', {

            url: '/find',
            //templateUrl: 'Static/consigners/find.html',
            //controller: 'ConsignersFindCtrl',
            views: {
                "": {
                    templateUrl: "Static/consigners/find.html",
                    controller: 'ConsignersFindCtrl',
                },
                "waybill_toprint@app.Consigners.Find": {
                    templateUrl: "Static/consigners/waybill.html",
                },
                "explosion_cert@app.Consigners.Find": {
                    templateUrl: "Static/consigners/explosion_cert.html",
                }
            }
        })

        .state('app.Consigners.Print', {

            url: '/toprint/:print_id?',
            //templateUrl: 'Static/consigners/waybill.html',
            views: {
                "": {
                    template: "<div><div ui-view=\"waybill_toprint\"></div><div ng-if=\"ckbx.PrintExplCert\" ui-view=\"explosion_cert\"></div></div>",
                    controller: 'ConsignersPrintCtrl',
                },
                "waybill_toprint@app.Consigners.Print": {
                    templateUrl: "Static/consigners/waybill.html",
                },
                "explosion_cert@app.Consigners.Print": {
                    templateUrl: "Static/consigners/explosion_cert.html",
                }
            },
            //controller: 'ConsignersPrintCtrl',
            params: { waybill_object: null },

        })

}])



.controller('ConsignersCtrl', ['$scope', function ($scope) {
    var message = "ConsignersCtrl";
    //console.log(message);
    //alert(message);
}])




.controller('ConsignersMainCtrl', ['$q', '$scope', '$translate', 'indexService', 'consignersService', 'LocalStorageService', 'printService', '$state', 'user', function ($q, $scope, $translate, indexService, consignersService, LocalStorageService, printService, $state, user) {

    //alert("ConsignersMainCtrl");
    //console.log("ConsignersMainCtrl");

    //$state.go('app.Consigners.Index');
    var enter_waybill_id = $state.params.waybill_id;
    //$scope.common_var = null;
    $scope.WaybillShops = [];
    $scope.CurrentWaybill = {};
    var WaybillList = $('#waybill_list').jstree('destroy');
    var ArchiveWaybills = [];
    var RWStations = [];
    var CargoTypes = [];
    var CargoSenders = [];
    var CargoReceivers = [];

    $scope.search = {};
    $scope.ckbx = {};
    $scope.ckbx.PrintExplCert = LocalStorageService.getData("PrintExplCert") == "true" ? true : false;
    $scope.ckbx.HideUsedRejectWB = LocalStorageService.getData("HideUsedRejectWB") == "true" ? true : false;
    //$scope.$applyAsync();

    vmGetConsignersServiceArrays();
    vmCreateWaybillListTree();
    vmGetWaybillTree();

    // создание дерева путевых
    function vmCreateWaybillListTree() {
        WaybillList.jstree({
            search: {
                "case_insensitive": true,
                "show_only_matches": true
            },
            plugins: ["search"]
        });
    };

    // загрузка данных в дерево путевых
    function vmLoadWaybillListTree(data) {
        WaybillList.jstree(true).settings.core.data = data;
        WaybillList.jstree(true).refresh(true, true);
        $scope.WaybillShopSelect($scope.search.SearchedWaybillShop);
    };


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
            // !!!! HERE Checking print sert or not!!!!
            //LocalStorageService.getData();
            var print_cert = $scope.ckbx.PrintExplCert || false;
            LocalStorageService.setData("PrintExplCert", print_cert);
            var explosion_cert_html = document.getElementById('explosion_cert');
            var inner_html = waybill_toprint_html.innerHTML;
            var inner_html_cert = print_cert ? explosion_cert_html.innerHTML : "";

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

            inner_html = str + inner_html + inner_html_cert + "</body></html>"

            // Открыть документ в новом окне (или послать inner_html в сервис печати)
            window.open().document.write(inner_html);
            //SendToPrintService(inner_html, $scope.CurrentWaybill);
            // Открыть в app.Consigners
            //console.log("go to app.Consigners.Print");
            $state.go('app.Consigners.Print', { print_id: $scope.CurrentWaybill.ID, waybill_object: $scope.CurrentWaybill });
        }
        else {
            alert($translate.instant('consigners.Messages.noWaybill')); //alert("$scope.CurrentWaybill.ID is null");
        }
    }

    // функция отправки на сервис печати
    function SendToPrintService(content, wb) {
        var id = wb.ID;
        var data = { ID: id, DocumentName: "Путевая №" + wb.WaybillNumber, Content: content, User: user };
        printService.Print(data)
            .then(function (response) {
                var result = response.data;
                if (result && result["StatusCode"] == 0) {
                    alert("Document has been added to PrintService queue.");
                }
                else {
                    alert("Error during sending to PrintService" + ((result && result["StatusMessage"]) ? (":\n" + result["StatusMessage"] + ".") : "!"));
                }

            }, function (error) {
                alert("Error during sending to PrintService!");
            });
    }

    // выбор чекбокса "Скрыть исп. и брак. путевые"
    $scope.ckbxHideUsedRejectWB = function () {
        var hide_used_wb = $scope.ckbx.HideUsedRejectWB || false;
        LocalStorageService.setData("HideUsedRejectWB", hide_used_wb);
        vmGetWaybillTree();
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

        //WaybillList = $('#waybill_list').jstree('destroy');
        var pathWaybillList = "v_WGT_WaybillList";
        pathWaybillList = pathWaybillList + ($scope.ckbx.HideUsedRejectWB ? "?$filter=Status eq null &" : "?") + "$orderby=ID";
        indexService.getInfo(pathWaybillList).then(function (response) {
            var months = ['December', 'November', 'October', 'September', 'August', 'July', 'June', 'May', 'April', 'March', 'February', 'January'];
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
                    }
                    else {
                        if (months.indexOf(e.Description) != -1) {
                            e.text = $translate.instant('weightanalytics.Months.' + e.Description);
                        }
                    };
                    delete e.ID;
                    delete e.ParentID;
                    delete e.Description;
                });

                ArchiveWaybills = response.data.value;
                vmLoadWaybillListTree(ArchiveWaybills);

                //WaybillList.jstree({
                //    core: {
                //        data: ArchiveWaybills
                //    },
                //    search: {
                //        "case_insensitive": true,
                //        "show_only_matches": true
                //    },
                //    plugins: ["search"]
                //});
                ////WaybillList.jstree(true).redraw(true);
                ////WaybillList.jstree('redraw');
            };
        });
    };

    // загрузка дерева путевых
    WaybillList.on('redraw.jstree', function (e, data) {

        //alert('loaded');
        // при загрузке данных убираем выделение эл-тов и сворачиваем дерево
        WaybillList.jstree('close_all');
        WaybillList.jstree('deselect_all', true);

        // при первой загрузке дерева выделяем год, содержащий последнюю путевую
        //var node = ArchiveWaybills.filter(function (element) {
        //    if (enter_waybill_id) {
        //        return element.parent != '#' && element.DocumentationsID == enter_waybill_id;
        //    }
        //    else {
        //        return element.parent == '#' && element.DocumentationsID == null && !isNaN(element.text);
        //    }
        //});
        //if (node[0]) {
        //    node = node[0].id;
        //    WaybillList.jstree('select_node', node, false);
        //    WaybillList.jstree(true).get_node(node, true).children('.jstree-anchor').focus();
        //    WaybillList.jstree('open_node', node);
        //}
        var node = null;
        for (var i = 0; i < ArchiveWaybills.length; i++) {
            var element = ArchiveWaybills[i];
            if ((enter_waybill_id && element.parent != '#' && element.DocumentationsID == enter_waybill_id)
            || (!enter_waybill_id && element.parent != '#' && element.DocumentationsID == null && isNaN(element.text))) {
                node = element;
                break;
            }
        }
        if (node) {
            node = node['id'];
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

            // get full waybill info here
            consignersService.GetWaybillObject(waybill_id)
            .then(function (waybill_obj) {
                $scope.CurrentWaybill = waybill_obj;
            })
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






.controller('ConsignersCreateCtrl', ['$scope', 'indexService', 'consignersService', 'LocalStorageService', '$state', '$q', '$filter', '$translate', 'roles', 'user', function ($scope, indexService, consignersService, LocalStorageService, $state, $q, $filter, $translate, roles, user) {
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

    $scope.ckbx = {};
    $scope.ckbx.PrintExplCert = LocalStorageService.getData("PrintExplCert") == "true" ? true : false;

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
        CargoTypeNotes: null,
        SenderArriveDT: null,
        SenderStartLoadDT: null,
        SenderEndLoadDT: null,
        ReceiverArriveDT: null,
        ReceiverStartLoadDT: null,
        ReceiverEndLoadDT: null
    };
    $scope.WagonNumberPattern = null;

    $scope.WagonNumberChange = vmWagonNumberChange;
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
        vmWagonNumberChange();
        // если создаем как копию - сбрасываем номер вагона и инкрементируем номер путевой
        if (copy_id) {
            $scope.CurrentWaybill.Status = null;
            resetWaybillNumber();
        }
    }

    // ввод номера вагона
    function vmWagonNumberChange() {
        if (!$scope.CurrentWaybill.WagonNumber) { $scope.CurrentWaybill.WagonType = null; }
        var type = consignersService.WagonNumberCRC($scope.CurrentWaybill.WagonNumber);
        var wtype = $scope.WagonTypes.filter(function (item) { return item['Description'] == type; });
        if (copy_id) return;
        $scope.WagonNumberCRC = type == "Вагон УЗ";
        if (modify_id) return;
        $scope.CurrentWaybill.WagonType = wtype.length ? wtype[0] : null;//$scope.CurrentWaybill.WagonType;
        //console.log($scope.CurrentWaybill.WagonNumber + ' - ' + type);
    }

    // получение шаблона номера вагона при выборе вида ЖД вагона
    function vmGetWagonNumberPattern(wagon) {
        consignersService.GetWagonNumberPattern(wagon)
        .then(function (response) {
            $scope.WagonNumberPattern = response;
            var type = consignersService.WagonNumberCRC($scope.CurrentWaybill.WagonNumber);

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
        var CargoTypeNotes = $scope.CurrentWaybill.CargoTypeNotes ? $scope.CurrentWaybill.CargoTypeNotes.toString() : null;
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
            //var query = "v_WGT_WaybillExistCheck?$filter=WaybillNumber eq '{0}' and SenderShop eq '{1}' &$orderby=EndTime desc".format(waybill_number, sender_shop);
            var query = "v_WGT_DocumentationsExistCheck?$filter=WaybillNumber eq {0} and SenderShop eq '{1}' &$orderby=EndTime desc".format(waybill_number, sender_shop);
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
            //angular.forEach(orig_wb, function (value_orig, key_orig) {
            //    var value_modify = mod_wb[key_orig];
            //    if (!angular.equals(value_orig, value_modify)) {
            //        var t = {};
            //        t[key_orig] = value_modify;
            //        prop_array.push(t);
            //    }
            //})
            angular.forEach(mod_wb, function (value_mod, key_mod) {
                var value_orig = orig_wb[key_mod];
                if (!angular.equals(value_orig, value_mod)) {
                    var t = {};
                    t[key_mod] = value_mod;
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
                CargoTypeNotes: CargoTypeNotes,
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
                CargoTypeNotes: CargoTypeNotes,
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
            var print_cert = $scope.ckbx.PrintExplCert || false;
            LocalStorageService.setData("PrintExplCert", print_cert);
            $state.go('app.Consigners.Print', { print_id: waybill_object.ID, waybill_object: waybill_object });

        })
    }

    // нажатие "Забраковать"
    function vmReject() {
        //alert("Reject");
        if ($scope.CurrentWaybill.Status != null && $scope.CurrentWaybill.Status != 'used') {
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
        $state.go('app.Consigners.Main', { waybill_id: waybill_id });
        //window.open('/Static/consigners/waybill.html');
    }

}])






.controller('ConsignersFindCtrl', ['$scope', '$translate', '$q', 'indexService', 'consignersService', 'LocalStorageService', 'printService', '$state', function ($scope, $translate, $q, indexService, consignersService, LocalStorageService, printService, $state) {

    //console.log("ConsignersFindCtrl");
    $scope.ckbx = {};
    $scope.ckbx.PrintExplCert = LocalStorageService.getData("PrintExplCert") == "true" ? true : false;

    $scope.SelectedObjects = {};
    $scope.CurrentWaybill = {};
    $scope.SenderShops = [];
    $scope.ReceiverShops = [];
    var ArchiveWaybills = [];
    var FoundWaybills = [];
    var WaybillList = $('#waybill_list').jstree('destroy');

    $scope.Find = vmFind;

    vmGetConsignersServiceArrays();
    vmGetAllWaybills();
    vmCreateWaybillListTree();
    //vmGetWaybillTree();



    // создание дерева путевых
    function vmCreateWaybillListTree() {
        WaybillList.jstree({
            search: {
                "case_insensitive": true,
                "show_only_matches": true
            },
            plugins: ["search"]
        });
    };

    // загрузка данных в дерево путевых
    function vmLoadWaybillListTree(data) {
        WaybillList.jstree(true).settings.core.data = data;
        WaybillList.jstree(true).refresh(true, true);
    };


    // получение дерева архивных путевых
    function vmGetWaybillTree(wbs) {
        var months = ['December', 'November', 'October', 'September', 'August', 'July', 'June', 'May', 'April', 'March', 'February', 'January'];
        if (wbs.length) {
            wbs.forEach(function (e) {
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
                }
                else {
                    if (months.indexOf(e.Description) != -1) {
                        e.text = $translate.instant('weightanalytics.Months.' + e.Description);
                    }
                };
                delete e.ID;
                delete e.ParentID;
                delete e.Description;
            });

            //FoundWaybills = wbs;
            //vmLoadWaybillListTree(FoundWaybills);
            vmRemoveEmptyTreeNodes(wbs);
            vmLoadWaybillListTree(wbs);
        }
    };

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

            // get full waybill info here
            consignersService.GetWaybillObject(waybill_id)
            .then(function (waybill_obj) {
                $scope.CurrentWaybill = waybill_obj;
            })
        };
    });

    // заполнение справочников
    function vmGetConsignersServiceArrays() {
        $q.all([consignersService.GetCargoSenders(),
                consignersService.GetCargoReceivers()]).then(function (responses) {
                    var resp_0 = responses[0].data.value;
                    var resp_1 = responses[1].data.value;
                    // получение уникальных цехов поставщиков груза
                    vmGetCargoClient(resp_0, $scope.SenderShops);
                    vmGetCargoClient(resp_1, $scope.ReceiverShops);
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

    // получение всего списка путевых
    function vmGetAllWaybills() {
        $scope.LoadingTree = true;
        return indexService.getInfo("v_WGT_WaybillList?$orderby=ID").then(function (response) {
            ArchiveWaybills = response.data.value;
            vmGetWaybillTree(angular.copy(ArchiveWaybills));
            $scope.LoadingTree = false;
        })
    }

    // главная функция поиска путевых
    function vmFind() {
        var query = "v_WGT_WaybillWagonMatching?$select=WaybillID";
        var filter = "";
        var filter_array = [];
        if ($scope.SelectedObjects.WaybillNumber) {
            filter = "WaybillNumber eq '{0}'".format($scope.SelectedObjects.WaybillNumber);
            filter_array.push(filter);
        }
        if ($scope.SelectedObjects.WagonNumber) {
            filter = "WagonNumber eq '{0}'".format($scope.SelectedObjects.WagonNumber);
            filter_array.push(filter);
        }
        if ($scope.SelectedObjects.SenderShop) {
            filter = "SenderShop eq '{0}'".format($scope.SelectedObjects.SenderShop['ID']);
            filter_array.push(filter);
        }
        if ($scope.SelectedObjects.ReceiverShop) {
            filter = "ReceiverShop eq '{0}'".format($scope.SelectedObjects.ReceiverShop['ID']);
            filter_array.push(filter);
        }
        filter = filter_array.length ? "&$filter=" : "";
        for (var i = 0; i < filter_array.length; i++) {
            var item = filter_array[i];
            filter += (i > 0) ? " and " : "";
            filter += item;
        }
        query += filter;
        //alert(query);
        $scope.CurrentWaybill = {};
        $scope.LoadingTree = true;
        return indexService.getInfo(query).then(function (response) {
            var filtered_wb_ids = response.data.value;
            for (var i = 0; i < filtered_wb_ids.length; i++) {
                filtered_wb_ids[i] = filtered_wb_ids[i]['WaybillID'];
            }
            //if (filtered_wb_ids.length == 0) {
            //    WaybillList.empty();
            //    return false;
            //}
            FoundWaybills.length = 0;
            FoundWaybills = ArchiveWaybills.filter(function (item) {
                return item['DocumentationsID'] == null || filtered_wb_ids.indexOf(item['DocumentationsID']) != -1;
            })
            vmGetWaybillTree(angular.copy(FoundWaybills));
            if (FoundWaybills.length < 800) WaybillList.jstree('open_all');
            $scope.LoadingTree = false;
            return true;
        })

    }

    // удаление неиспользующихся месяцев в дереве при поиске путевых
    function vmRemoveEmptyTreeNodes(wbs) {
        var needed_ids = [];

        for (i = 0; i < wbs.length; i++) {
            var item = wbs[i];
            if (item['DocumentationsID'] != null || item['parent'] == '#') {
                if (needed_ids.indexOf(item['id']) == -1) {
                    needed_ids.push(item['id']);
                }
                if (item['parent'] != '#' && needed_ids.indexOf(parseInt(item['parent'])) == -1) {
                    needed_ids.push(parseInt(item['parent']));
                }
            }
        }
        for (i = wbs.length - 1; i >= 0; i--) {
            var item = wbs[i];
            if (needed_ids.indexOf(item['id']) == -1) {
                wbs.splice(i, 1);
            }
        }
    }

    // нажатие кнопки "Печать"
    $scope.Print = function () {

        if ($scope.CurrentWaybill.ID) {
            var waybill_toprint_html = document.getElementById('waybill_toprint');
            // Проверяем печать сертификата
            var print_cert = $scope.ckbx.PrintExplCert || false;
            LocalStorageService.setData("PrintExplCert", print_cert);
            var explosion_cert_html = document.getElementById('explosion_cert');
            var inner_html = waybill_toprint_html.innerHTML;
            var inner_html_cert = print_cert ? explosion_cert_html.innerHTML : "";

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

            inner_html = str + inner_html + inner_html_cert + "</body></html>"

            // Открыть документ в новом окне (или послать inner_html в сервис печати)
            window.open().document.write(inner_html);
            //SendToPrintService(inner_html, $scope.CurrentWaybill);
            // Открыть в app.Consigners
            //console.log("go to app.Consigners.Print");
            //$state.go('app.Consigners.Print', { print_id: $scope.CurrentWaybill.ID, waybill_object: $scope.CurrentWaybill });
        }
        else {
            alert($translate.instant('consigners.Messages.noWaybill')); //alert("$scope.CurrentWaybill.ID is null");
        }
    }

    // функция отправки на сервис печати
    function SendToPrintService(content, wb) {
        var id = wb.ID;
        var data = { ID: id, DocumentName: "Путевая №" + wb.WaybillNumber, Content: content, User: user };
        printService.Print(data)
            .then(function (response) {
                var result = response.data;
                if (result && result["StatusCode"] == 0) {
                    alert("Document has been added to PrintService queue.");
                }
                else {
                    alert("Error during sending to PrintService" + ((result && result["StatusMessage"]) ? (":\n" + result["StatusMessage"] + ".") : "!"));
                }

            }, function (error) {
                alert("Error during sending to PrintService!");
            });
    }


}])





.controller('ConsignersPrintCtrl', ['$scope', '$translate', 'indexService', 'consignersService', 'LocalStorageService', '$state', function ($scope, $translate, indexService, consignersService, LocalStorageService, $state) {

    //console.log("ConsignersPrintCtrl");
    $scope.ckbx = {};
    $scope.ckbx.PrintExplCert = LocalStorageService.getData("PrintExplCert") == "true" ? true : false;

    $scope.CurrentWaybill = [];
    // если переданный объект отвесной не пуст
    if ($state.params.waybill_object != null) {
        $scope.CurrentWaybill = $state.params.waybill_object;
    }
        // если ID в адресе не пуст
    else if ($state.params.print_id != null) {
        //$scope.CurrentWaybill['ID'] = $state.params.print_id;
        waybill_id = $state.params.print_id;
        // получаем все данные по этому ID и заполняем CurrentWaybill
        //console.log("Get waybill data from DB here");
        consignersService.GetWaybillObject(waybill_id)
            .then(function (waybill_obj) {
                $scope.CurrentWaybill = waybill_obj;
                if ($scope.CurrentWaybill['DocumentType'] != 'Путевая') {
                    $state.go('app.Consigners.Main');
                }
            })
    }
        // если все значения пустые, переходим на Consigners.Index
    else {
        //console.log("waybill_object is NULL");
        //console.log("go to app.Consigners.Index");
        $state.go('app.Consigners.Main');
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


.factory('LocalStorageService', function ($window, $rootScope) {
    return {
        setData: function (name, val) {
            $window.localStorage && $window.localStorage.setItem(name, val);
            return this;
        },
        getData: function (name) {
            return $window.localStorage && $window.localStorage.getItem(name);
        }
    };
})

.service('consignersService', ['indexService', '$q', function (indexService, $q) {

    this.GetCargoTypes = function () {
        var request = indexService.getInfo('v_WGT_Materials');
        return request;
    };

    this.GetWagonTypes = function () {
        var filter_str = "ЖД вагоны";
        filter_str = encodeURI(filter_str);
        var pathWagonTypes = "v_PackagingClass?$filter=ParentDescription eq '{0}'&$orderby=ID".format(filter_str);
        var request = indexService.getInfo(pathWagonTypes);
        return request.then(function (response) {
            if (response.data && response.data.value && response.data.value.length) {
                for (var i = 0; i < response.data.value.length; i++) {
                    var tooltip = "Шаблон номера: ";
                    switch (response.data.value[i]['Description']) {
                        case "Лафет-короб": {
                            tooltip += "XX(X)-XX(X)";
                            break;
                        }
                        case "Вагон местный": {
                            tooltip += "XXX(XXXXX)";
                            break;
                        }
                        case "Вагон УЗ": {
                            tooltip += "XXXXXXXX";
                            break;
                        }
                        case "Платформа":
                        case "Спецвагон": {
                            tooltip += "XXX(XXX)";
                            break;
                        }
                        default: {
                            tooltip += "отсутствует";
                        }
                    }
                    response.data.value[i]['Tooltip'] = tooltip;
                }
            }
            return response;
        });
    };

    this.GetRWStations = function () {
        var request = indexService.getInfo('v_WGT_RailwayStations');
        return request;
    };

    this.GetCargoSenders = function () {
        var request = indexService.getInfo("v_WGT_Consigners?$filter=PropertyDescription eq 'CONSIGNER'&$orderby=Description");
        return request;
    };

    this.GetCargoReceivers = function () {
        var request = indexService.getInfo("v_WGT_Consigners?$filter=PropertyDescription eq 'CONSIGNEE'&$orderby=Description");
        return request;
    };

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

    this.WagonNumberCRC = function (number) {
        var type = 0;
        number = number + '';
        var numArray = number.split('');
        // 8 digits
        if ((new RegExp('^[0-9]{8}$')).test(number)) {
            numArray[0] *= 2;
            numArray[2] *= 2;
            numArray[4] *= 2;
            numArray[6] *= 2;
            var sum = 0;
            for (var i = 0; i < numArray.length - 1; i++) {
                var item = numArray[i];
                sum += (numArray[i] / 10) >> 0;
                sum += numArray[i] % 10;
            }
            sum = sum % 10;
            var CRC = sum == 0 ? 0 : (10 - sum);

            if (CRC == numArray[7] && [0, 1].indexOf(numArray[0] / 2) == -1) {
                type = 1;   // UZ wagons
            }
            else {
                type = 2;   // not UZ wagons
            }
        }
            // 3..6 digits
        else if ((new RegExp('^[0-9]{3,6}$')).test(number)) {
            type = 2;   // not UZ wagons
        }
            // XXX-YYY
        else if ((new RegExp('^[0-9]{1,3}-[0-9]{1,3}$')).test(number)) {
            type = 12;  // Lafet-Korob
        }
            // automobile number (AAA)000(000)(-000)(AAA)(-000)
        else if ((new RegExp('^[A-zА-я]{0,3}[0-9]{1,6}(\-[0-9]{1,3})?[A-zА-я]{0,3}\-?[0-9]{0,3}$')).test(number)) {
            type = 13;  // automobile number
        }
        //type = 0;   // not matches
        //return type;
        var wagon_types = [{ ID: 1, Description: 'Вагон УЗ' }, { ID: 2, Description: 'Вагон местный' }, { ID: 12, Description: 'Лафет-короб' }, { ID: 13, Description: 'Автомобиль' }]
        type = wagon_types.filter(function (item) { return item['ID'] == type; });
        return type[0] ? type[0]['Description'] : null;
    }

    this.GetWaybillObject = function (waybill_id) {
        if (!waybill_id) { return $q.when({}); }
        //-- get full waybill info here
        return $q.all([indexService.getInfo("PackagingUnitsDocs?$filter=DocumentationsID eq {0} &$orderby=ID".format(waybill_id)),
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
                        //{ prop: "CargoType", query: "v_WGT_ScrapTypes?$filter=ID eq {0} &$orderby=ID" },
                        { prop: "CargoType", query: "v_WGT_Materials?$filter=ID eq {0} &$orderby=ID" },
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
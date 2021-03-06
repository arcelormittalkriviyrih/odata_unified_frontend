﻿angular.module('indexApp')

.config(['$stateProvider', function ($stateProvider) {

    $stateProvider
        .state('app.PA.Equipment', {

            url: '/equipment',
            templateUrl: 'Static/pa/equipment.html',
            controller: 'PAequipmentCtrl'
        })

        .state('app.PA.Material', {

            url: '/material',
            templateUrl: 'Static/pa/material.html',
            controller: 'PAmaterialCtrl'
        })

        .state('app.PA.Personnel', {

            url: '/personnel',
            templateUrl: 'Static/pa/personnel.html',
            controller: 'PApersonnelCtrl'
        })

        .state('app.PA.Label', {

            url: '/label',
            templateUrl: 'Static/pa/label.html',
            controller: 'PAlabelCtrl',
            onExit: function ($state, $injector) {

                vmClearGridFilter($("#material_lot"));
            }
        })

        .state('app.PA.Order', {

            url: '/order',
            templateUrl: 'Static/market/order.html',
            controller: 'marketOrderCtrl'
        })

        .state('app.PA.gasCollectionReports', {
            url: '/gcreports',
            templateUrl: 'Static/gascollection/reports.html',
            controller: 'gasCollectionReportsCtrl'
        })

        .state('app.PA.gasCollectionTrends', {
          url: '/gctrends',
          templateUrl: 'Static/gascollection/trends.html',
          controller: 'gasCollectionTrendsCtrl'
        })

        .state('app.PA.gasCollectionBalance', {
          url: '/gcbalance',
          templateUrl: 'Static/gascollection/balance.html',
          controller: 'gasCollectionBalanceCtrl'
        })

        .state('app.PA.LabelTemplate', {

            url: '/labeltemplate',
            templateUrl: 'Static/market/labeltemplate.html',
            controller: 'marketLabelTemplateCtrl',
            params: {
                fileType: 'Excel label'
            }
        })

        .state('app.PA.Logotypes', {

            url: '/logotypes',
            templateUrl: 'Static/market/labeltemplate.html',
            controller: 'marketLabelTemplateCtrl',
            params: {
                fileType: 'Image'
            }
        })

        .state('app.PA.SAPCommunication', {

            url: '/sapcommunication',
            templateUrl: 'Static/pa/sapcommunication.html',
            controller: 'PASAPCommunicationCtrl'
        })

        .state('app.PA.Version', {

            url: '/version',
            templateUrl: 'Static/pa/version.html',
            controller: 'versionCtrl'
        })

        .state('app.PA.Diagnostics', {

            url: '/diagnostics/',
            templateUrl: 'Static/pa/diagnostics.html',
            controller: 'diagnosticsCtrl',
        })

        .state('app.PA.PhysicalAsset', {

            url: '/physicalasset',
            templateUrl: 'Static/pa/physicalasset.html',
            controller: 'PAphysicalassetCtrl'
        })


}])

.controller('PACtrl', ['$scope', 'indexService', '$state', 'roles', function ($scope, indexService, $state, roles) {

}])

.controller('PAequipmentCtrl', ['$scope', '$translate', 'indexService', '$q', function ($scope, $translate, indexService, $q) {

    $treeContainer = $('#hierarchy').empty();

    $equipmentDisable = $('#equipmentDisable').show();
    $equipmentPropertyDisable = $('#equipmentPropertyDisable').show();

    $q.all([indexService.getInfo('Equipment'), indexService.getInfo('EquipmentClass')])
        .then(function (responses) {

            var equipment = responses[0].data.value;
            var equipmentClass = responses[1].data.value;

            equipment = equipment.sort(function (a, b) {

                return vmSort('Description', a, b);
            });
            equipmentClass = equipmentClass.sort(function (a, b) {

                return vmSort('Description', a, b);
            });

            $scope.equipment = equipment;

            $treeContainer.odataTree({
                serviceUrl: serviceUrl,
                table: 'Equipment',
                data: equipment,
                keys: {
                    id: 'ID',
                    parent: 'Equipment1',
                    text: 'Description'
                },
                translates: {
                    nodeName: $translate.instant('tree.nodeName'),
                    parentID: $translate.instant('tree.parentID'),
                    search: $translate.instant('tree.search')
                },
                parentID: {
                    keyField: 'ID',
                    valueField: 'Description',
                },
                additionalFields: [{
                    id: 'EquipmentClassID', //this param MUST be called similar to table field where we get data from this field
                    control: 'combo',
                    data: equipmentClass,
                    keyField: 'ID',
                    valueField: 'Description',
                    required: true,
                    editReadOnly: true,
                    translate: $translate.instant('tree.equipmentClass'),
                }]
            });
        });



    $treeContainer.on('tree-item-selected', function (e, data) {

        var EquipmentID = parseInt(data.id);

        vmGetEquipmentClass(EquipmentID, $scope.equipment);
    });

    $('div#equipment_property').jsGrid({
        width: "620px",
        sorting: false,
        paging: true,
        editing: true,
        filtering: true,
        autoload: true,
        pageLoading: true,
        inserting: true,
        pageIndex: 1,
        pageSize: 20,

        rowClick: vmActiveRow

    }).jsGrid('initOdata', {
        serviceUrl: serviceUrl,
        table: 'EquipmentProperty',

        fields: [{
            id: 'ID',
            name: 'ID',
            title: 'ID',
            readonly: true,
            type: 'number',
            width: 65,
            order: 1
        }, {
            id: 'ClassPropertyID',
            name: 'ClassPropertyID',
            title: $translate.instant('grid.common.property'),
            width: 200,
            order: 2,
            type: 'combo',
            table: {
                name: 'EquipmentClassProperty',
                id: 'ID',
                title: 'Description'
            },
            textField: 'name',
            valueField: 'id'
        },
        {
            id: 'Value',
            name: 'Value',
            title: $translate.instant('grid.common.value'),
            width: 200,
            order: 3
        }],
        controlProperties: {
            type: 'control',
            editButton: true,
            deleteButton: true,
            clearFilterButton: true,
            modeSwitchButton: true
        }
    }).jsGrid('loadOdata', {
        defaultFilter: 'ID eq -1'
    });

    function vmGetEquipmentClass(equipmentID, equipmentList, typeNode) {

        var equipmentClassID;

        var equipment = equipmentList.find(function (item) {

            return item.ID == equipmentID;
        });

        if (equipment) {
            equipmentClassID = equipment.EquipmentClassID;
            vmLoadEquipmentPropertyGrid(equipmentID, equipmentClassID);
        }
        else {
            if (typeNode != 'new') {

                indexService.getInfo('Equipment').then(function (response) {
                    vmGetEquipmentClass(equipmentID, response.data.value, 'new');
                });
            } else return false;

        };

    };

    function vmLoadEquipmentPropertyGrid(EquipmentID, equipmentClassID) {

        $equipmentPropertyDisable.hide();

        $('div#equipment_property').jsGrid('loadOdata', {
            defaultFilter: 'EquipmentID eq ({0})'.format(EquipmentID),
            order: 'EquipmentClassProperty/Description',

            //settings for filtering of oData combobox by EquipmentClassID parent field
            comboFilter: [{
                name: 'ClassPropertyID',
                filter: 'EquipmentClassID eq ({0})'.format(equipmentClassID)
            }],

            //set field 'EquipmentID' from parent grid which will be included in JSON for inserting
            insertedAdditionalFields: [{
                name: 'EquipmentID',
                value: EquipmentID
            }]
        });
    };

}])

.controller('PAmaterialCtrl', ['$scope', '$translate', 'indexService', function ($scope, $translate, indexService) {

    $materialDefinitionDisable = $('#materialDefinitionDisable').show();
    $materialDefinitionPropertyDisable = $('#materialDefinitionPropertyDisable').show();

    $hierarchyMaterialClass = $('#hierarchy_material_class').empty();

    indexService.getInfo('MaterialClass?$orderby=Description').then(function (response) {

        var material = response.data.value;
        material = material.sort(function (a, b) {

            return vmSort('Description', a, b);
        });

        $hierarchyMaterialClass.odataTree({

            serviceUrl: serviceUrl,
            table: 'MaterialClass',
            data: material,
            keys: {
                id: 'ID',
                parent: 'ParentID',
                text: 'Description'
            },
            parentID: {
                keyField: 'ID',
                valueField: 'Description',
            },
            translates: {
                nodeName: $translate.instant('tree.nodeName'),
                parentID: $translate.instant('tree.parentID'),
                search: $translate.instant('tree.search')
            },
            disableControls: true
        });
    })



    $hierarchyMaterialClass.on('tree-item-selected', function (e, data) {

        var MaterialClassID = data.id;

        $materialDefinitionDisable.hide();
        $materialDefinitionPropertyDisable.show();

        $('div#material_definition').jsGrid('loadOdata', {

            defaultFilter: 'MaterialClassID eq ({0})'.format(MaterialClassID),
            order: 'Description',

            //set field 'MaterialClassID' from tree which will be included in JSON for inserting
            insertedAdditionalFields: [{
                name: 'MaterialClassID',
                value: MaterialClassID
            }]
        });

        $('div#material_definition_property').jsGrid('loadOdata', {
            defaultFilter: 'MaterialDefinitionID eq -1'
        });

    });

    $('div#material_definition').jsGrid({
        height: "500px",
        width: "720px",

        sorting: false,
        paging: true,
        editing: true,
        filtering: true,
        autoload: true,
        pageLoading: true,
        inserting: true,
        pageIndex: 1,
        pageSize: 10,
        rowClick: function (args) {

            vmActiveRow(args);

            $materialDefinitionPropertyDisable.hide();

            $('div#material_definition_property').jsGrid('loadOdata', {
                defaultFilter: 'MaterialDefinitionID eq ({0})'.format(args.item.ID),
                order: 'MaterialClassProperty/Description',

                //settings for filtering of oData combobox by EquipmentClassID parent field
                comboFilter: [{
                    name: 'ClassPropertyID',
                    filter: 'MaterialClassID eq ({0})'.format(args.item.MaterialClassID)
                }],

                //set field 'EquipmentID' from parent grid which will be included in JSON for inserting
                insertedAdditionalFields: [{
                    name: 'MaterialDefinitionID',
                    value: args.item.ID
                }]
            });
        },

    }).jsGrid('initOdata', {
        serviceUrl: serviceUrl,
        table: 'MaterialDefinition',

        fields: [{
            id: 'ID',
            name: 'ID',
            title: 'ID',
            readonly: true,
            type: 'number',
            order: 1
        }, {
            id: 'Description',
            name: 'Description',
            title: $translate.instant('pa.grid.material.description'),
            order: 2
        }],

        controlProperties: {
            type: 'control',
            editButton: true,
            deleteButton: true,
            clearFilterButton: true,
            modeSwitchButton: true
        }
    }).jsGrid('loadOdata', {
        defaultFilter: 'ID eq -1',
        order: 'Description'
    });

    $('div#material_definition').on('oDataGrid.removed', function (e) {

        $('div#material_definition_property').jsGrid('loadOdata', {
            defaultFilter: 'ID eq -1'
        });
    })

    $('div#material_definition_property').jsGrid({
        height: "500px",
        width: "720px",

        sorting: false,
        paging: true,
        editing: true,
        filtering: true,
        autoload: true,
        pageLoading: true,
        inserting: true,
        pageIndex: 1,
        pageSize: 10,

        rowClick: vmActiveRow

    }).jsGrid('initOdata', {
        serviceUrl: serviceUrl,
        table: 'MaterialDefinitionProperty',

        fields: [{
            id: 'ID',
            name: 'ID',
            title: 'ID',
            readonly: true,
            type: 'number',
            order: 1
        }, {
            id: 'ClassPropertyID',
            name: 'ClassPropertyID',
            title: $translate.instant('grid.common.property'),
            width: 250,
            order: 2,
            type: 'combo',
            table: {
                name: 'MaterialClassProperty',
                id: 'ID',
                title: 'Description'
            },
            textField: 'name',
            valueField: 'id'
        },
        {
            id: 'Value',
            name: 'Value',
            title: $translate.instant('grid.common.value'),
            width: 250,
            order: 3
        }],
        controlProperties: {
            type: 'control',
            editButton: true,
            deleteButton: true,
            clearFilterButton: true,
            modeSwitchButton: true
        }
    }).jsGrid('loadOdata', {
        defaultFilter: 'ID eq -1'
    });


}])

.controller('PApersonnelCtrl', ['$scope', '$translate', 'indexService', function ($scope, $translate, indexService) {

    $personDisable = $('#personDisable').show();
    $personPropertyDisable = $('#personPropertyDisable').show();

    $personnelClass = $('#personnel_class').empty();

    indexService.getInfo('PersonnelClass?$orderby=Description').then(function (response) {

        $personnelClass.odataTree({

            serviceUrl: serviceUrl,
            table: 'PersonnelClass',
            data: response.data.value,
            keys: {
                id: 'ID',
                parent: 'ParentID',
                text: 'Description'
            },
            parentID: {
                keyField: 'ID',
                valueField: 'Description',
            },
            translates: {
                nodeName: $translate.instant('tree.nodeName'),
                parentID: $translate.instant('tree.parentID'),
                search: $translate.instant('tree.search')
            },
            disableControls: true
        });
    })



    $personnelClass.on('tree-item-selected', function (e, data) {

        var PersonnelClassID = data.id;

        $personDisable.hide();
        $personPropertyDisable.show();

        $('div#person').jsGrid('loadOdata', {

            defaultFilter: 'PersonnelClassID eq ({0})'.format(PersonnelClassID),
            order: 'PersonName',

            //set field 'MaterialClassID' from tree which will be included in JSON for inserting
            insertedAdditionalFields: [{
                name: 'PersonnelClassID',
                value: PersonnelClassID
            }]
        });

        $('div#person_property').jsGrid('loadOdata', {
            defaultFilter: 'PersonID eq -1'
        });

    });

    $('div#person').jsGrid({
        height: "500px",
        width: "720px",

        sorting: false,
        paging: true,
        editing: true,
        filtering: true,
        autoload: true,
        pageLoading: true,
        inserting: true,
        pageIndex: 1,
        pageSize: 10,
        rowClick: function (args) {

            vmActiveRow(args);

            $personPropertyDisable.hide();

            $('div#person_property').jsGrid('loadOdata', {
                defaultFilter: 'PersonID eq ({0})'.format(args.item.ID),
                order: 'PersonnelClassProperty/Description',

                //settings for filtering of oData combobox by EquipmentClassID parent field
                comboFilter: [{
                    name: 'ClassPropertyID',
                    filter: 'PersonnelClassID eq ({0})'.format(args.item.PersonnelClassID)
                }],

                //set field 'EquipmentID' from parent grid which will be included in JSON for inserting
                insertedAdditionalFields: [{
                    name: 'PersonID',
                    value: args.item.ID
                }]
            });
        },

    }).jsGrid('initOdata', {
        serviceUrl: serviceUrl,
        table: 'Person',

        fields: [{
            id: 'ID',
            name: 'ID',
            title: 'ID',
            readonly: true,
            type: 'number',
            order: 1
        }, {
            id: 'PersonName',
            name: 'PersonName',
            title: $translate.instant('grid.common.name'),
            order: 2
        }, {
            id: 'Description',
            name: 'Description',
            title: $translate.instant('grid.common.description'),
            order: 3
        }],

        controlProperties: {
            type: 'control',
            editButton: true,
            deleteButton: true,
            clearFilterButton: true,
            modeSwitchButton: true
        }
    }).jsGrid('loadOdata', {
        defaultFilter: 'ID eq -1'
    });

    $('div#person_property').jsGrid({
        height: "500px",
        width: "720px",

        sorting: false,
        paging: true,
        editing: true,
        filtering: true,
        autoload: true,
        pageLoading: true,
        inserting: true,
        pageIndex: 1,
        pageSize: 10,

        rowClick: vmActiveRow

    }).jsGrid('initOdata', {
        serviceUrl: serviceUrl,
        table: 'PersonProperty',

        fields: [{
            id: 'ID',
            name: 'ID',
            title: 'ID',
            readonly: true,
            type: 'number',
            order: 1
        }, {
            id: 'ClassPropertyID',
            name: 'ClassPropertyID',
            title: $translate.instant('grid.common.property'),
            width: 250,
            order: 2,
            type: 'combo',
            table: {
                name: 'PersonnelClassProperty',
                id: 'ID',
                title: 'Description'
            },
            textField: 'name',
            valueField: 'id'
        },
        {
            id: 'Value',
            name: 'Value',
            title: $translate.instant('grid.common.value'),
            width: 250,
            order: 3
        }],
        controlProperties: {
            type: 'control',
            editButton: true,
            deleteButton: true,
            clearFilterButton: true,
            modeSwitchButton: true
        }
    }).jsGrid('loadOdata', {
        defaultFilter: 'ID eq -1'
    });

}])

.controller('PAlabelCtrl', ['$scope', '$translate', 'indexService', function ($scope, $translate, indexService) {

    $scope.labelList = [];
    $scope.labelPrintAction = vmLabelPrintAction;
    $scope.refreshInfo = vmRefreshInfo;
    $scope.isCtrlHolded = false;
    $scope.isShiftHolded = false;
    $scope.intervalLabelNumbers = [];
    $scope.intervalSelectedRows = [];
    $scope.showGrid = true;

    var _data, _filter, _gridObj;

    function vmLabelPrintAction(action) {

        $scope.isLoading = true;

        var labelList = $scope.labelList.join(',');

        indexService.sendInfo(action, {

            MaterialLotIDs: labelList
        }).then(function () {

            $scope.isLoading = false;

            vmRefreshInfo();
        });

    };

    function vmRefreshInfo() {

        $scope.labelList = [];

        $('div#material_lot').jsGrid('loadOdata', {
            order: 'ID desc'
        });

        if (_filter) {

            $scope.showGrid = false;

            //load data for grid after refresh if before refresh grid had filter 
            _gridObj.loadData(_filter);

            //after data loading get filter object and fill filter row items by this object value
            $('#material_lot').on('oDataGrid.dataLoadedSuccessfull', function (e) {

                var filterControls = $('#material_lot').find('.jsgrid-filter-row').find('input, select').toArray();

                for (var prop in _filter) {

                    var i = Object.keys(_filter).indexOf(prop);
                    $(filterControls[i]).val(_filter[prop]);
                };

                $scope.showGrid = true;

                $scope.$apply();
            });
        }

        $('div#material_lot_property').jsGrid('loadOdata', {
            defaultFilter: 'MaterialLotID eq (-1)',
        });
    }

    var $materialLotPropertyDisable = $('#materialLotPropertyDisable').show();

    $('div#material_lot').jsGrid({
        height: "500px",
        width: "940px",

        sorting: false,
        paging: true,
        editing: false,
        filtering: true,
        autoload: true,
        pageLoading: true,
        inserting: false,
        pageIndex: 1,
        pageSize: 10,

        onDataLoaded: function (args) {

            _data = args.data.data;
            $scope.intervalLabelNumbers = [];
            $scope.intervalSelectedRows = [];
            $scope.labelList = [];

            $scope.$apply();
        },

        rowClick: function (args) {

            var labelID = args.item.ID;
            var $tr = $(args.event.currentTarget);

            if ($scope.isCtrlHolded && !$scope.isShiftHolded) {

                $scope.intervalLabelNumbers = [];
                $scope.intervalSelectedRows = [];

                vmChangeActiveRowToSelected($('div#material_lot'), $tr);
                vmPushDataShift($('div#material_lot'), $tr[0], $scope.intervalLabelNumbers, $scope.intervalSelectedRows, _data, $scope.labelList);

            } else if (!$scope.isCtrlHolded && $scope.isShiftHolded) {

                vmChangeActiveRowToSelected($('div#material_lot'), $tr);
                vmPushDataShift($('div#material_lot'), $tr[0], $scope.intervalLabelNumbers, $scope.intervalSelectedRows, _data, $scope.labelList);
            }
            else {

                var selectedRows = $('div#material_lot').find('tr.selected-row');

                if (selectedRows.length > 0) {
                    selectedRows.removeClass('selected-row');

                    $scope.labelList = [];

                    $scope.intervalLabelNumbers = [];
                    $scope.intervalSelectedRows = [];

                    vmPushDataShift($('div#material_lot'), $tr[0], $scope.intervalLabelNumbers, $scope.intervalSelectedRows, _data, $scope.labelList);

                }
                else {

                    $scope.intervalLabelNumbers = [];
                    $scope.intervalSelectedRows = [];

                    vmPushDataShift($('div#material_lot'), $tr[0], $scope.intervalLabelNumbers, $scope.intervalSelectedRows, _data, $scope.labelList);

                }

                vmActiveRow(args);
            }

            $materialLotPropertyDisable.hide();

            var index = $scope.labelList.indexOf(labelID);

            if (index == -1)
                $scope.labelList.push(labelID);

            else {

                $scope.labelList = $scope.labelList.filter(function (item) {
                    return item != labelID;
                });
            };

            $('div#material_lot_property').jsGrid('initOdata', {
                serviceUrl: serviceUrl,
                table: 'v_MaterialLotPropertySimple',

                fields: [{
                    id: 'PropertyType',
                    name: 'PropertyType',
                    title: $translate.instant('grid.common.property'),
                    order: 1
                },
                {
                    id: 'Value',
                    name: 'Value',
                    title: $translate.instant('grid.common.value'),
                    order: 2
                }]

            }).jsGrid('loadOdata', {
                defaultFilter: 'MaterialLotID eq ({0})'.format(args.item.ID),
                order: 'PropertyType',
            });

            $scope.$apply();

        }

    }).jsGrid('initOdata', {
        serviceUrl: serviceUrl,
        table: 'v_MaterialLot',

        fields: [{
            id: 'FactoryNumber',
            name: 'FactoryNumber',
            title: $translate.instant('pa.grid.labels.number'),
            order: 1
        }, {
            id: 'Quantity',
            name: 'Quantity',
            title: $translate.instant('pa.grid.labels.quantity'),
            order: 2
        },
        {
            id: 'StatusName',
            name: 'StatusName',
            title: $translate.instant('pa.grid.labels.status'),
            order: 3
        },
        {
            id: 'CreateTime',
            name: 'CreateTime',
            title: $translate.instant('marker.date'),
            order: 4
        },
        {
            id: 'isPrinted',
            name: 'isPrinted',
            title: $translate.instant('pa.grid.labels.isPrinted'),
            type: 'indication',
            order: 5
        }]

    }).jsGrid('loadOdata', {

        order: 'ID desc'
    });

    $('div#material_lot_property').jsGrid({
        width: "940px",
        sorting: false,
        paging: true,
        editing: false,
        filtering: true,
        autoload: true,
        pageLoading: true,
        inserting: false,
        pageIndex: 1,
        pageSize: 30,

        rowClick: vmActiveRow

    });

    $('div#material_lot').on('oDataGrid.getFilter', function (e, data) {

        _gridObj = data.grid;
        _filter = data.filter;
    });

    $(document).on('oDataGrid.filterEmpty', function (e, data) {

        _filter = null;
    })

    $(document).keydown(function (event) {
        if (event.keyCode == 17) {
            $scope.isCtrlHolded = true;
            $scope.$apply();
        }

        if (event.keyCode == 16) {

            $scope.isShiftHolded = true;
            $scope.$apply();
        }

    }).keyup(function (event) {
        if (event.keyCode == 17) {

            $scope.isCtrlHolded = false;
            $scope.$apply();
        }

        if (event.keyCode == 16) {

            $scope.isShiftHolded = false;
            $scope.$apply();
        }


    });


}])

.controller('PASAPCommunicationCtrl', ['$scope', '$translate', 'indexService', function ($scope, $translate, indexService) {

    $scope.updateSAP = vmUpdateSAP;

    indexService.getInfo('v_SAPOrderRequest').then(function (responce) {

        $scope.sapUrl = responce.data.value[0].Value;
        $scope.login = responce.data.value[1].Value;
        $scope.password = responce.data.value[2].Value;
    });

    function vmUpdateSAP() {

        if ($scope.sapUrl && $scope.login.length > 0 && $scope.password.length > 0) {

            $scope.isLoading = true;

            indexService.sendInfo('upd_JobOrderSAPOrderRequest', {

                ServiceURL: $scope.sapUrl,
                Login: $scope.login,
                Password: $scope.password
            }).then(function () {

                $scope.isLoading = false;
                alert($translate.instant('pa.sap.communicationSuccess'));
            })
        }
    }
}])

.controller('versionCtrl', ['$scope', '$translate', 'indexService', function ($scope, $translate, indexService) {

    indexService.getInfo('GetServiceInfo').then(function (responce) {

        $scope.versionData = responce.data;

        $scope.AssemblyDictionaryData = vmPrepareData($scope.versionData.AssemblyDictionary)
                                                .map(function (item) {

                                                    var itemToArray = item.split(',');
                                                    itemToArray = itemToArray.map(vmMapData);

                                                    return vmBuildDataobj(itemToArray);
                                                });

        $scope.AppSettingsData = vmPrepareData($scope.versionData.AppSettings)
                                                .map(vmMapData);

        $scope.AppSettingsDataObj = vmBuildDataobj($scope.AppSettingsData);

    });

    function vmPrepareData(string) {

        var arr = string.split('\r\n');
        arr = arr.filter(function (item) {

            return item.length > 0;
        });

        return arr;
    };

    function vmMapData(itemArray) {

        itemArray = itemArray.split('=');
        itemArray[0] = itemArray[0].replace(/\W/g, '');

        return itemArray;
    }

    function vmBuildDataobj(arr) {

        var obj = {};

        for (var i = 0; i < arr.length; i++) {

            obj[arr[i][0]] = arr[i][1];
        };

        return obj;
    };

}])

.controller('diagnosticsCtrl', ['$scope', '$translate', 'indexService', '$state', function ($scope, $translate, indexService, $state) {

    $scope.changeSide = vmChangeSide;
    $scope.printSystemOnOff = vmPrintSystemOnOff;

    $scope.side = $state.params.side;
    var sidesListUrl = 'v_AvailableSidesAll';
    
    if ($scope.side)        
        sidesListUrl += '?$filter=ID eq {0}'.format(parseInt($scope.side));
    
    indexService.getInfo(sidesListUrl).then(function (response) {

        $scope.availableSides = response.data.value;

        if ($scope.side)
            vmChangeSide(parseInt($scope.side));
        
    });
    
    // get list of Global options
    var globalOptionsURL = 'v_GlobalOptions';
    indexService.getInfo(globalOptionsURL)
        .then(function (response) {

            // get "Print System Enabled" option
            var printSystemEnabled = response.data.value.find(function (item) {

                return item.OptionCode == 'PRINT_SYSTEM_ENABLED';
            });

            // if option is missing than treat it as true
            $scope.printSystemEnabled = !printSystemEnabled || !printSystemEnabled.OptionValue || printSystemEnabled.OptionValue == 'true';

        });

    function vmChangeSide(sideID) {        

        $scope.selectedSide = $scope.availableSides.find(function (item) {

            return item.ID == sideID;
        });

        indexService.getInfo('v_DiagInfo?$filter=SideID eq {0}'.format(sideID))
                    .then(function (response) {

                        $scope.diagnosticsInfo = response.data.value;
                    });
    };

    function vmPrintSystemOnOff() {

        var state = $scope.printSystemEnabled;
        var conf = state ? 'pa.diagnostics.printSystemTurnOn' : 'pa.diagnostics.printSystemTurnOff';

        if (confirm($translate.instant(conf))) {

            indexService.sendInfo('upd_EnablePrintSystem', {

                Enabled: state

            }).then(function () {

                if (state)
                    alert($translate.instant('pa.diagnostics.printSystemOn'));
                else
                    alert($translate.instant('pa.diagnostics.printSystemOff'));
            });

        } else {

            // rejected return to previous state
            $scope.printSystemEnabled = !state;
        };
    };
}])

.controller('PAphysicalassetCtrl', ['$scope', '$translate', 'indexService', '$q', function ($scope, $translate, indexService, $q) {

    var sales_action_json;

    var PAid;


    var db = {

        loadData: function (filter) {

            //alert(JSON.stringify(filter));
            var d = $.Deferred();

            $.ajax({
                url: serviceUrl + "v_PhysicalAssetTab ",
                dataType: "json"
            }).done(function (response) {

                if (filter.Description == "" && filter.FixedAssetID == 0 && filter.PhysicalAssetClassID == 0) {

                    d.resolve(response.value);
                    sort_grid();
                }
                else {
                    result = $.grep(response.value, function (item) {
                        return (!filter.Description || item.Description.toLowerCase().indexOf(filter.Description.toLowerCase()) > -1)
                         && (!filter.FixedAssetID || item.FixedAssetID === filter.FixedAssetID)
                        && (!filter.PhysicalAssetClassID || item.PhysicalAssetClassID === filter.PhysicalAssetClassID);
                    });
                    d.resolve(result);
                    sort_grid();
                }

                sort_grid();
            });

            return d.promise();
        },

        insertItem: function (item) {
            if (item.Description == "" && item.PhysicalAssetClassID == 0) {
                alert("Заполните поля Название и ClassID");
            }
            else {
                return $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    url: serviceUrl + "ins_ForGridPhysicalAsset",
                    data: JSON.stringify(item)
                }).done(function () {
                    $("#physicalAssetTable").jsGrid("loadData");
                    $materialDefinitionPropertyDisable = $('#materialDefinitionPropertyDisable').show();
                });
            }

        },

        updateItem: function (item) {
            return $.ajax({
                xhrFields: {
                    withCredentials: true
                },
                type: "POST",
                contentType: "application/json;odata=verbose",
                url: serviceUrl + "upd_ForGridPhysicalAsset",
                data: JSON.stringify(item)
            }).done(function () {

                $("#physicalAssetTable").jsGrid("loadData");
                $materialDefinitionPropertyDisable = $('#materialDefinitionPropertyDisable').show();

            }).fail(handleError);
        },

        deleteItem: function (item) {
            return $.ajax({
                type: "POST",
                contentType: "application/json",
                url: serviceUrl + "del_ForGridPhysicalAsset",
                data: JSON.stringify(item)
            }).done(function () {
                $("#physicalAssetTable").jsGrid("loadData");
                $materialDefinitionPropertyDisable = $('#materialDefinitionPropertyDisable').show();
            });
        }
    };
    //window.db = db;
    //$materialDefinitionDisable = $('#materialDefinitionDisable').show();
    $materialDefinitionPropertyDisable = $('#materialDefinitionPropertyDisable').show();

    //$('div#physicalAssetTable').jsGrid("destroy");
    //$('div#physicalAssetPropertyTable').jsGrid("destroy");
    //$('div#physicalAssetTable').on('oDataGrid.removed', function (e) {

    //    $('div#physicalAssetPropertyTable').jsGrid('loadOdata', {
    //        defaultFilter: 'ID eq -1'
    //    });
    //})
    function sort_grid() {
        $("#physicalAssetTable").jsGrid("sort", { field: "ID", order: "desc" });
    }

    $.ajax({
        url: serviceUrl + "PhysicalAssetClass",
        dataType: "json"
    }).done(function (response) {
        response.value.unshift({ ID: 0, Description: "" });

        var a = response.value;
        //alert(a);
        //a.sort(); // сортируем массив
        //for (var i = a.length - 1; i > 0; i--) {
        //    if (a[i].Description == a[i - 1].Description) a.splice(i, 1);
        //}
        $("#physicalAssetTable").jsGrid({
            height: "auto",
            width: "100%",

            filtering: true,
            paging: true,
            editing: true,
            autoload: true,
            inserting: true,
            deleteConfirm: "Вы действительно хотите удалить эту запись?",

            rowClick: function (args) {
                vmActiveRow(args);

                $materialDefinitionPropertyDisable.hide();

                $('div#physicalAssetPropertyTable').jsGrid('loadOdata', {
                    defaultFilter: 'PhysicalAssetID eq ({0})'.format(args.item.ID),

                    //set field 'EquipmentID' from parent grid which will be included in JSON for inserting
                    insertedAdditionalFields: [{
                        name: 'PhysicalAssetID',
                        value: args.item.ID
                    }]
                });
            },

            pageSize: 10,
            pageButtonCount: 5,

            controller: db,

            fields: [
                { name: "ID", title: "ID", type: "number", width: "50px", readOnly: true },
                { name: "Description", title: "Название", type: "text", width: "150px" },
                { name: "FixedAssetID", title: "Номер", type: "number", align: "center", width: "50px" },
                { name: "PAClassID", title: "ClassID", type: "number", align: "center", width: "50px", readOnly: true },
                {


                    name: "PhysicalAssetClassID", title: "Класс", type: "select", align: "center",
                    width: "150px", filtering: true, items: a,
                    valueField: "ID", textField: "Description"
                },
                 {
                     type: 'control',
                     editButton: true,
                     deleteButton: true,
                     clearFilterButton: true,
                     modeSwitchButton: true
                 }
            ]
        });

        sort_grid();
    });



    $('div#physicalAssetPropertyTable').jsGrid({
        height: "auto",
        width: "100%",

        sorting: false,
        paging: true,
        editing: true,
        filtering: true,
        autoload: true,
        pageLoading: true,
        inserting: true,
        pageIndex: 1,
        pageSize: 10,

        rowClick: vmActiveRow

    }).jsGrid('initOdata', {
        serviceUrl: serviceUrl,
        table: 'PhysicalAssetProperty',

        fields: [{
            id: 'ID',
            name: 'ID',
            title: 'ID',
            readonly: true,
            type: 'number',
            order: 1
        }, {
            id: 'Description',
            name: 'Description',
            title: $translate.instant('pa.grid.material.description'),
            width: 150,
            order: 2
        },
        {
            id: 'Value',
            name: 'Value',
            title: $translate.instant('grid.common.value'),

            order: 3
        }],
        controlProperties: {
            type: 'control',
            editButton: true,
            deleteButton: true,
            clearFilterButton: true,
            modeSwitchButton: true
        }
    }).jsGrid('loadOdata', {
        defaultFilter: 'ID eq -1'
    });




}]);
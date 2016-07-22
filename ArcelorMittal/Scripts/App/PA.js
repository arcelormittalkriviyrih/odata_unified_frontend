angular.module('indexApp')

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
            controller: 'PAlabelCtrl'
        })

        .state('app.PA.Order', {

            url: '/order',
            templateUrl: 'Static/market/order.html',
            controller: 'marketOrderCtrl'
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
                    parentID: $translate.instant('tree.parentID')
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
                parentID: $translate.instant('tree.parentID')
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
            keys : {
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
                parentID: $translate.instant('tree.parentID')
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

.controller('PAlabelCtrl', ['$scope', '$translate', function ($scope, $translate) {

    $materialLotPropertyDisable = $('#materialLotPropertyDisable').show();

    $('div#material_lot').jsGrid({
        height: "500px",
        width: "1000px",

        sorting: false,
        paging: true,
        editing: false,
        filtering: true,
        autoload: true,
        pageLoading: true,
        inserting: false,
        pageIndex: 1,
        pageSize: 10,

        rowClick: function (args) {

            vmActiveRow(args);

            $materialLotPropertyDisable.hide();

            $('div#material_lot_property').jsGrid('loadOdata', {
                defaultFilter: 'MaterialLotID eq ({0})'.format(args.item.ID),
                order: 'PropertyType',
            });

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
        }]

    }).jsGrid('loadOdata', {

        order: 'ID desc'
    });

    $('div#material_lot_property').jsGrid({
        width: "1000px",
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

    }).jsGrid('initOdata', {
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

    });

}]);
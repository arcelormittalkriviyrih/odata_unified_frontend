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

.controller('PAequipmentCtrl', ['$scope', '$translate', function ($scope, $translate) {

    $treeContainer = $('#hierarchy').empty();

    $equipmentDisable = $('#equipmentDisable').show();
    $equipmentPropertyDisable = $('#equipmentPropertyDisable').show();

    $treeContainer.odataTree({
        serviceUrl: serviceUrl,
        table: 'EquipmentClass',
        keys: {
            id: 'ID',
            parent: 'ParentID',
            text: 'Description'
        }
    });

    $treeContainer.on('tree-item-selected', function (e, data) {

        var EquipmentClassID = data.id;

        $equipmentDisable.hide();
        $equipmentPropertyDisable.show();

        $('div#equipment').jsGrid('loadOdata', {

            defaultFilter: 'EquipmentClassID eq ({0})'.format(EquipmentClassID),

            //set field 'EquipmentClassID' from tree which will be included in JSON for inserting
            insertedAdditionalFields: [{
                name: 'EquipmentClassID',
                value: EquipmentClassID
            }]
        });

        $('div#equipment_property').jsGrid('loadOdata', {
            defaultFilter: 'EquipmentID eq -1'
        });

    });

    $('div#equipment').jsGrid({
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

            $equipmentPropertyDisable.hide();

            $('div#equipment_property').jsGrid('loadOdata', {
                defaultFilter: 'EquipmentID eq ({0})'.format(args.item.ID),

                //settings for filtering of oData combobox by EquipmentClassID parent field
                comboFilter: [{
                    name: 'ClassPropertyID',
                    filter: 'EquipmentClassID eq ({0})'.format(args.item.EquipmentClassID)
                }],

                //set field 'EquipmentID' from parent grid which will be included in JSON for inserting
                insertedAdditionalFields: [{
                    name: 'EquipmentID',
                    value: args.item.ID
                }]
            });
        },

    }).jsGrid('initOdata', {
        serviceUrl: serviceUrl,
        table: 'Equipment',

        fields: [{
            id: 'ID',
            name: 'ID',
            title: 'ID',
            readonly: true,
            type: 'number',
            order: 1
        },{
            id: 'Description',
            name: 'Description',
            title: $translate.instant('grid.common.name'),
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
        defaultFilter: 'ID eq -1'
    });



    $('div#equipment_property').jsGrid({
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
        table: 'EquipmentProperty',

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
            width: 150,
            order: 3
        },
        {
            id: 'Description',
            name: 'Description',
            title: $translate.instant('grid.common.description'),
            width: 200,
            order: 4
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

.controller('PAmaterialCtrl', ['$scope', '$translate', function ($scope, $translate) {

    $materialDefinitionDisable = $('#materialDefinitionDisable').show();
    $materialDefinitionPropertyDisable = $('#materialDefinitionPropertyDisable').show();

    $hierarchyMaterialClass = $('#hierarchy_material_class').empty();

    $hierarchyMaterialClass.odataTree({
        serviceUrl: serviceUrl,
        table: 'MaterialClass',
        keys: {
            id: 'ID',
            parent: 'ParentID',
            text: 'Description'
        }
    });

    $hierarchyMaterialClass.on('tree-item-selected', function (e, data) {

        var MaterialClassID = data.id;

        $materialDefinitionDisable.hide();
        $materialDefinitionPropertyDisable.show();

        $('div#material_definition').jsGrid('loadOdata', {

            defaultFilter: 'MaterialClassID eq ({0})'.format(MaterialClassID),

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
        defaultFilter: 'ID eq -1'
    });

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
            width: 200,
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
            width: 150,
            order: 3
        },
        {
            id: 'Description',
            name: 'Description',
            title: $translate.instant('grid.common.description'),
            width: 200,
            order: 4
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

.controller('PApersonnelCtrl', ['$scope', '$translate', function ($scope, $translate) {

    $personDisable = $('#personDisable').show();
    $personPropertyDisable = $('#personPropertyDisable').show();

    $personnelClass = $('#personnel_class').empty();

    $personnelClass.odataTree({
        serviceUrl: serviceUrl,
        table: 'PersonnelClass',
        keys: {
            id: 'ID',
            parent: 'ParentID',
            text: 'Description'
        }
    });

    $personnelClass.on('tree-item-selected', function (e, data) {

        var PersonnelClassID = data.id;

        $personDisable.hide();
        $personPropertyDisable.show();

        $('div#person').jsGrid('loadOdata', {

            defaultFilter: 'PersonnelClassID eq ({0})'.format(PersonnelClassID),

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
            width: 200,
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
            width: 150,
            order: 3
        },
        {
            id: 'Description',
            name: 'Description',
            title: $translate.instant('grid.common.description'),
            width: 200,
            order: 4
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
        editing: true,
        filtering: true,
        autoload: true,
        pageLoading: true,
        inserting: true,
        pageIndex: 1,
        pageSize: 10,

        rowClick: function (args) {

            vmActiveRow(args);

            $materialLotPropertyDisable.hide();

            $('div#material_lot_property').jsGrid('loadOdata', {
                defaultFilter: 'MaterialLotID eq ({0})'.format(args.item.ID),

            });

        }

    }).jsGrid('initOdata', {
        serviceUrl: serviceUrl,
        table: 'MaterialLot',

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
            id: 'Status',
            name: 'Status',
            title: $translate.instant('pa.grid.labels.status'),
            order: 3
        },
        {
            id: 'Description',
            name: 'Description',
            title: $translate.instant('grid.common.description'),
            order: 4
        }],

        controlProperties: {
            type: 'control',
            editButton: true,
            deleteButton: true,
            clearFilterButton: true,
            modeSwitchButton: true
        }
    }).jsGrid('loadOdata', {});

    $('div#material_lot_property').jsGrid({
        height: "500px",
        width: "1000px",

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
        table: 'MaterialLotProperty',

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
        },
        {
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
    });

}]);
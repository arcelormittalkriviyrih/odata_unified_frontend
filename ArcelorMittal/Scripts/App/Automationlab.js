angular.module('indexApp')

.config(['$stateProvider', function ($stateProvider) {

    $stateProvider
        .state('app.AutomationLab.Acceptance', {

            url: '/acceptance',
            templateUrl: 'Static/automationlab/acceptance.html',
            controller: 'AutomationLabacceptanceCtrl'
        })

        .state('app.AutomationLab.Repair', {

            url: '/repair',
            templateUrl: 'Static/automationlab/repair.html',
            controller: 'AutomationLabrepairCtrl'
        })

        .state('app.AutomationLab.Material', {

            url: '/material',
            templateUrl: 'Static/automationlab/material.html',
            controller: 'AutomationLabmaterialCtrl'
        })


}])

.controller('AutomationlabCtrl', ['$scope', 'indexService', '$state', 'roles', function ($scope, indexService, $state, roles) {

}])

.controller('AutomationLabacceptanceCtrl', ['$scope', '$translate', 'indexService', '$q', function ($scope, $translate, indexService, $q) {

    $materialDefinitionDisable = $('#materialDefinitionDisable').show();
    //$materialDefinitionPropertyDisable = $('#materialDefinitionPropertyDisable').show();

    //$hierarchyMaterialClass = $('#hierarchy_material_class').empty();
    $scope.count = "";
   
    $("#material_definition").jsGrid({
        height: "400px",
        width: "940px",

        sorting: false,
        paging: true,
        editing: true,
        filtering: true,
        autoload: true,
        pageLoading: true,
        inserting: true,
        pageIndex: 1,
        pageSize: 30,

        onDataLoaded: function (args) {
                
        },

        rowClick: function (args) {
        },

        rowClass: function (item, itemIndex) {
            //// чередование цвета строк для разных вагонов
            //var rowclass = "";
            //if (item.WagonIndex % 2 == 1) {
            //    rowclass = "jsgrid-weight-odd-row td";
            //}
            //else {
            //    rowclass = "jsgrid-weight-even-row td";
            //};
            //if (item.WeightingIndex == 1) {
            //    rowclass += " jsgrid-weight-border-row td";
            //};

            //return rowclass;
                
        }

    }).jsGrid('initOdata', {
        serviceUrl: serviceUrl,
        table: 'v_AcceptanceMaterial',

        fields: [{
            id: 'ID',
            name: 'ID',
            title: 'ID',
            order: 1
        }, {
            id: 'FactoryNumber',
            name: 'FactoryNumber',
            title: 'Factory Number',
            order: 2
        }, {

            id: 'Description',
            name: 'Description',
            title: 'Description',
            order: 3
        }, {
            id: 'Status',
            name: 'Status',
            title: 'Status',
            order: 4
        }, {
            id: 'Location',
            name: 'Location',
            title: 'Location',
            order: 5
        }],

        controlProperties: {
            type: 'control',
            editButton: false,
            deleteButton: false,
            clearFilterButton: true,
            modeSwitchButton: true
        }
    }).jsGrid('loadOdata', {
        defaultFilter: 'FactoryNumber eq \'{0}\''.format(-1)
    });



    $scope.vmCreateMaterialTable = function () {
        $materialDefinitionDisable.hide();
        var Facnum = $scope.count;
        $("#material_definition").jsGrid({
            //height: "400px",
            width: "940px",

            sorting: true,
            paging: true,
            editing: false,
            filtering: true,
            autoload: true,
            pageLoading: true,
            inserting: false,
            pageIndex: 1,
            pageSize: 30,

            onDataLoaded: function (args) {
                
            },

            rowClick: function (args) {
            },

            rowClass: function (item, itemIndex) {
                //// чередование цвета строк для разных вагонов
                //var rowclass = "";
                //if (item.WagonIndex % 2 == 1) {
                //    rowclass = "jsgrid-weight-odd-row td";
                //}
                //else {
                //    rowclass = "jsgrid-weight-even-row td";
                //};
                //if (item.WeightingIndex == 1) {
                //    rowclass += " jsgrid-weight-border-row td";
                //};

                //return rowclass;
                
            }

        }).jsGrid('initOdata', {
            serviceUrl: serviceUrl,
            table: 'v_AcceptanceMaterial',

            fields: [{
                id: 'ID',
                name: 'ID',
                title: 'ID',
                order: 1
            }, {
                id: 'FactoryNumber',
                name: 'FactoryNumber',
                title: 'Factory Number',
                order: 2
            }, {

                id: 'Description',
                name: 'Description',
                title: 'Description',
                order: 3
            }, {
                id: 'Status',
                name: 'Status',
                title: 'Status',
                order: 4
            }, {
                id: 'Location',
                name: 'Location',
                title: 'Location',
                order: 5
            }],

            controlProperties: {
                type: 'control',
                editButton: false,
                deleteButton: false,
                clearFilterButton: true,
                modeSwitchButton: true
            
            }
        }).jsGrid('loadOdata', {
            defaultFilter: 'FactoryNumber eq \'{0}\''.format(Facnum)
        });

    }

    


}])




.controller('AutomationLabmaterialCtrl', ['$scope', '$translate', 'indexService', '$q', 'marketService', '$rootScope', function ($scope, $translate, indexService, $q, marketService, $rootScope) {

     $scope.orderDetails = [];

     $scope.isShowModal = false;
     $scope.toggleModal = vmToggleModal;

     $scope.createForm = vmCreateForm;
     $scope.deleteRow = vmDeleteRow;
     
     $scope.loadingModalData = false;
    

     function vmCreateForm(type, procedure, id, keyField) {

         vmToggleModal(true);

         //$scope.loadingModalData = true;
         //$scope.orderCaption = $translate.instant('market.Order.caption.{0}'.format(type));

         //var oDataAPI = [indexService.getInfo("Files?$filter=FileType eq 'Excel label' and Status eq '%D0%98%D1%81%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5'")];

         //if (id) {

         //    oDataAPI.push(indexService.getInfo('v_OrderPropertiesAll?$filter=OperationsRequest eq ({0})'.format(id)))
         //}

         //$q.all(oDataAPI)
         //    .then(function (responce) {

         //        $scope.loadingModalData = false;

         //        var rowData;

         //        var templateData = responce[0].data.value;

         //        if (id)
         //            rowData = responce[1].data.value;

         //        marketService.createForm(type, procedure, id, keyField, templateData, rowData);

         //    });
     }


     function vmDeleteRow(order) {

         //if (confirm('Are you sure?')) {

         //    $.ajax({
         //        url: serviceUrl + 'del_Order',
         //        type: 'POST',
         //        data: JSON.stringify({ COMM_ORDER: order }),
         //        contentType: "application/json"
         //    }).done(function (result) {

         //        $('#orders').jsGrid('loadOdata', {});
         //        $("#orderDetails").jsGrid('loadOdata', {
         //            defaultFilter: 'OperationsRequest eq (-1)',
         //        });

         //    }).fail(handleError);
         //}

     }

     function vmToggleModal(expr) {

         $scope.isShowModal = expr;
     }


    
    
     //$('#orderForm').on('oDataForm.success', function (e, data) {

     //    $scope.isLoading = false;

     //    vmToggleModal(false);

     //    $('#orders').jsGrid('loadOdata', {
     //        order: 'id desc'
     //    });

     //    $("#orderDetails").jsGrid('loadOdata', {
     //        defaultFilter: 'OperationsRequest eq (-1)',
     //    });

     //    $scope.$apply();
     //});

     $('#orderForm').on('oDataForm.cancel', function (e) { // button Cancel

         vmToggleModal(false);
         $scope.$apply();
     });

    
     $('#orderForm').on('oDataForm.outerDataReceipt', function (e) {

         $scope.isLoading = true;
         $scope.processingOuterDataReceipt = true;
         $scope.$apply();
     });

     $('#orderForm').on('oDataForm.OuterDataReceived', function (e) {

         $scope.isLoading = false;
         $scope.processingOuterDataReceipt = false;
         $scope.$apply();
     });

     $('#orderForm').on('oDataForm.OuterDataReceiptFailed', function (e) {

         $scope.isLoading = false;
         $scope.processingOuterDataReceipt = false;
         $scope.$apply();
     });

     $('#cancel').click(function () {
         vmToggleModal(false);
         $scope.$apply();

     });

    //-----------------------------------------------------------------------------------
    $materialDefinitionDisable = $('#materialDefinitionDisable').show();
    $materialDefinitionPropertyDisable = $('#materialDefinitionPropertyDisable').show();

    $hierarchyMaterialClass = $('#hierarchy_material_class').empty();

    indexService.getInfo('MaterialClass?$filter=ID gt 99999 ').then(function (response) {

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


.controller('AutomationLabrepairCtrl', ['$scope', '$translate', 'indexService', '$q', function ($scope, $translate, indexService, $q) {

}])


angular.module('indexApp')

.config(['$stateProvider', function ($stateProvider) {

    $stateProvider
        .state('app.AutomationLab.Income', {

            url: '/income',
            templateUrl: 'Static/automationlab/income.html',
            controller: 'AutomationLabincomeCtrl'
        })

        .state('app.AutomationLab.Repair', {

            url: '/repair',
            templateUrl: 'Static/automationlab/repair.html',
            controller: 'AutomationLabrepairCtrl'
        })

        .state('app.AutomationLab.Device', {

            url: '/device',
            templateUrl: 'Static/automationlab/device.html',
            controller: 'AutomationLabdeviceCtrl'
        })


}])

.controller('AutomationlabCtrl', ['$scope', 'indexService', '$state', 'roles', function ($scope, indexService, $state, roles) {

}])

.controller('AutomationLabincomeCtrl', ['$scope', '$translate', 'indexService', '$q', function ($scope, $translate, indexService, $q) {

    $materialDefinitionDisable = $('#materialDefinitionDisable').show();
    $scope.set_id;
    $scope.chek_click = false;
   
    

    $scope.checkIfEnterKeyWasPressed = function ($event) {
        var keyCode = $event.which || $event.keyCode;
        if (keyCode === 13) {
            $scope.chek_click = false;
            $scope.vmCreateMaterialTable();
           
        }

    };
  

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
            vmActiveRow(args);
            $scope.set_id = args.item.ID;
            $scope.chek_click = true;
            $scope.$apply();
        },

        rowClass: function (item, itemIndex) {
            

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
    }).jsGrid("loadOdata", { defaultFilter: 'FactoryNumber eq \'-1\'' });
  
    $scope.vmCreateMaterialTable = function () {
        $materialDefinitionDisable.hide();
        $scope.chek_click = false;
        $("#material_definition").jsGrid("loadOdata", { defaultFilter: 'FactoryNumber eq \'' + $scope.count + '\'' });
        $("#material_definition").jsGrid("refresh");

    }

    $scope.SetStatus = function (id_ss, status) {
        
    

        var mesage_in = {
            F_number: id_ss,
            Op_Type: status
         };
<<<<<<< HEAD
        
=======
       
>>>>>>> refs/remotes/origin/master
        $.ajax({
            url: serviceUrl + 'ins_OperationsAcceptence',
            type: 'POST',
            async: false,
            data: JSON.stringify(mesage_in),
            contentType: "application/json"
        }).done(function (result) {
            $('#material_definition').jsGrid('loadOdata', {
                defaultFilter: 'FactoryNumber eq \'{0}\''
            });
        });
        $scope.chek_click = false;
        $scope.count = "";
    }
    
}])




.controller('AutomationLabdeviceCtrl', ['$scope', '$translate', 'indexService', '$q', 'marketService', '$rootScope', function ($scope, $translate, indexService, $q, marketService, $rootScope) {

     $scope.orderDetails = [];

     $scope.isShowModal = false;
     $scope.toggleModal = vmToggleModal;

     $scope.createForm = vmCreateForm;
     $scope.deleteRow = vmDeleteRow;
     
     $scope.loadingModalData = false;
    

     function vmCreateForm(type, procedure, id, keyField) {

         vmToggleModal(true);

         
     }


     function vmDeleteRow(order) {

        

     }

     function vmToggleModal(expr) {

         $scope.isShowModal = expr;
     }

      
    

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


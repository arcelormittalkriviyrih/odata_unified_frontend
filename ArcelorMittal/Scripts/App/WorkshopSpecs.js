var activePage = 'WorkshopSpecs';

$(function () {
    $treeContainer = $('#hierarchy');

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

        $('div#equipment').removeClass('disabled-grid');

        $('div#equipment').jsGrid('loadOdata', {
           
            defaultFilter: 'EquipmentClassID eq ({0})'.format(EquipmentClassID),

            //set field 'EquipmentClassID' from tree which will be included in JSON for inserting
            insertedAdditionalFields: [{
                name: 'EquipmentClassID',
                value: EquipmentClassID
            }]
        });
       
    });

    $('div#equipment').addClass('disabled-grid').jsGrid({
        height: "500px",
        width: "500px",

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

            $('div#equipment_property').removeClass('disabled-grid');
            
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
                id: 'Description',
                name: 'Description',
                title: 'Имя',
                order: 1
            }],

            controlProperties: {
                type: 'control',
                editButton: true,
                deleteButton: true,
                clearFilterButton: true,
                modeSwitchButton: true
            }
    })



    $('div#equipment_property').addClass('disabled-grid').jsGrid({
        height: "500px",
        width: "500px",

        sorting: false,
        paging: true,
        editing: true,
        filtering: true,
        autoload: true,
        pageLoading: true,
        inserting: true,
        pageIndex: 1,
        pageSize: 10,

    }).jsGrid('initOdata', {
        serviceUrl: serviceUrl,
        table: 'EquipmentProperty',

        fields: [{
            id: 'ClassPropertyID',
            name: 'ClassPropertyID',
            title: 'Свойство',
            order: 1,
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
            title: 'Значение',
            order: 2
        },
        {
            id: 'Description',
            name: 'Description',
            title: 'Описание',
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

});
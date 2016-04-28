var activePage = 'WorkshopSpecs';
//create empty variable where 
//will be state of editing 
//row in Equipment grid
var editedEquipment;

//create empty variable where 
//will be state of editing row 
//in EquipmentProperty grid
var editedEquipmentProperty; 


$(function () {
    $treeContainer = $('#hierarchy');

    $treeContainer.odataTree({
        serviceUrl: '../../ODataRestierDynamic/api/Dynamic/',
        table: 'EquipmentClass',
        keys: {
            id: 'ID',
            parent: 'ParentID',
            text: 'Description'
        }
    });

    $treeContainer.on('tree-item-selected', function (e, data) {

        //before removing old grid check it has currently editing rows
        //and cancel their editing
        if (editedEquipment) {

            editedEquipment.grid.cancelEdit();
        };

        if (editedEquipmentProperty) {

            editedEquipmentProperty.grid.cancelEdit();
        };
        
        //then remove old grid     
        $('div#equipment').empty();

        //and create new
        $('div#equipment_property').empty();

        if (data.action != 'delete_node') {

            $('div#equipment').jsGrid({
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

                    //when new row checked
                    //before removing old grid
                    //check it has currently editing rows
                    //and cancel their editing
                    if (editedEquipmentProperty) {

                        editedEquipmentProperty.grid.cancelEdit();
                    };
                   
                    //then remove old grid
                    $('div#equipment_property').empty();
                    
                    //and create new
                    $('div#equipment_property').jsGrid({
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
                        onItemEditing: function (args) {
                            editedEquipmentProperty = args;
                        }

                    }).jsGrid('initOdata', {
                        serviceUrl: '../../ODataRestierDynamic/api/Dynamic/',
                        table: 'EquipmentProperty',
                        defaultFilter: 'EquipmentID eq ({0})'.format(args.item.ID),
                        fields: [{
                            id: 'Value',
                            name: 'Value',
                            title: 'Значение',
                            order: 1
                        },
                        {
                            id: 'ClassPropertyID',
                            name: 'ClassPropertyID',
                            title: 'Свойство',
                            order: 2,
                            filter: {
                                property: 'EquipmentClassID',
                                value: args.item.EquipmentClassID
                            },
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
                            id: 'Description',
                            name: 'Description',
                            title: 'Описание',
                            order: 3
                        }]
                    });

                },
                onItemEditing: function (args) {
                    editedEquipment = args;
                }

            }).jsGrid('initOdata', {
                serviceUrl: '../../ODataRestierDynamic/api/Dynamic/',
                table: 'Equipment',
                defaultFilter: 'EquipmentClassID eq ({0})'.format(data.id),
                fields: [{
                    id: 'Description',
                    name: 'Description',
                    title: 'Имя',
                    order: 1
                },
                {
                    id: 'EquipmentClassID',
                    name: 'EquipmentClassID',
                    title: 'Класс Оборудования',
                    order: 2,
                    type: 'combo',
                    table: {
                        name: 'EquipmentClass',
                        id: 'ID',
                        title: 'Description'
                    },
                    textField: 'name',
                    valueField: 'id'
                }]
            });
            
        }

    });

});
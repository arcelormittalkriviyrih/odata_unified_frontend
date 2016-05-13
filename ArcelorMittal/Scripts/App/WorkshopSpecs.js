var activePage = 'WorkshopSpecs';

$(function () {

    $('.tab1-content').hide();
    $('.tab2-content').hide();
    $('.tab3-content').hide();

    $('.tab1').click(function () {

        $(this).addClass('active');
        $('.tab2').removeClass('active');
        $('.tab3').removeClass('active');

        $('.tab1-content').show();
        $('.tab2-content').hide();
        $('.tab3-content').hide();

        $treeContainer = $('#hierarchy').empty();

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

            $('div#equipment_property').jsGrid('loadOdata', {
                defaultFilter: 'EquipmentID eq -1'
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

                vmActiveRow(args);

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
        }).jsGrid('loadOdata', {
            defaultFilter: 'ID eq -1'
        });



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

            rowClick: vmActiveRow

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
        }).jsGrid('loadOdata', {
            defaultFilter: 'ID eq -1'
        });
    });


    $('.tab2').click(function () {

        $(this).addClass('active');
        $('.tab1').removeClass('active');
        $('.tab3').removeClass('active');

        $('.tab2-content').show();
        $('.tab1-content').hide();
        $('.tab3-content').hide();

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

            $('div#material_definition').removeClass('disabled-grid');

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

        $('div#material_definition').addClass('disabled-grid').jsGrid({
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
               
                vmActiveRow(args);

                $('div#material_definition_property').removeClass('disabled-grid');

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
                id: 'Description',
                name: 'Description',
                title: 'Название',
                order: 1
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

        $('div#material_definition_property').addClass('disabled-grid').jsGrid({
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

            rowClick: vmActiveRow

        }).jsGrid('initOdata', {
            serviceUrl: serviceUrl,
            table: 'MaterialDefinitionProperty',

            fields: [{
                id: 'ClassPropertyID',
                name: 'ClassPropertyID',
                title: 'Свойство',
                order: 1,
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
        }).jsGrid('loadOdata', {
            defaultFilter: 'ID eq -1'
        });


    });

    $('.tab3').click(function () {

        $(this).addClass('active');
        $('.tab1').removeClass('active');
        $('.tab2').removeClass('active');

        $('.tab3-content').show();
        $('.tab1-content').hide();
        $('.tab2-content').hide();

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

            $('div#person').removeClass('disabled-grid');

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

        $('div#person').addClass('disabled-grid').jsGrid({
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

                vmActiveRow(args);

                $('div#person_property').removeClass('disabled-grid');

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
                id: 'PersonName',
                name: 'PersonName',
                title: 'Имя',
                order: 1
            },{
                id: 'Description',
                name: 'Description',
                title: 'Описание',
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

        $('div#person_property').addClass('disabled-grid').jsGrid({
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

            rowClick: vmActiveRow

        }).jsGrid('initOdata', {
            serviceUrl: serviceUrl,
            table: 'PersonProperty',

            fields: [{
                id: 'ClassPropertyID',
                name: 'ClassPropertyID',
                title: 'Свойство',
                order: 1,
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
        }).jsGrid('loadOdata', {
            defaultFilter: 'ID eq -1'
        });


    });

    function vmActiveRow(args) {

        var $tr = $(args.event.currentTarget);

        $tr.addClass('active-row');
        $tr.siblings('tr').removeClass('active-row');

    }

    

});
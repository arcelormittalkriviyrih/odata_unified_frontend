$(function () {

    $treeContainer = $('#jstree');

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
        
        $('div#treeGrid').empty();

        if (data.action != 'delete_node') {

            $('div#treeGrid').jsGrid({
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

            }).jsGrid('initOdata', {
                serviceUrl: serviceUrl,
                table: 'Equipment',
                defaultFilter: 'EquipmentClassID eq ({0})'.format(data.id)
            });
        }
            
    });

});

$(function () {

    $treeContainer = $('#jstree');

    //params of create Tree method:
    //1. container - DOM element used as container for tree
    //2. table name - name of table whose data will be used to build tree
    //3. list of tree params
    // it's always array of 3 params - id, parentId and node name
    //and each item of array is name of table field
    //corresponding to these tree parameters
    createTree($treeContainer, 'EquipmentClass', ['ID', 'ParentID', 'Description']);

    function createTree(container, table, fields) {

        $('.createNodeControls').hide();

        $.get(serviceUrl + table).then(function (data) {

            var treeData = data.value.map(function (item, index, arr) {

                return {

                    'id': item[fields[0]],
                    'parent': item[fields[1]] == null ? '#' : item[fields[1]],
                    'text': item[fields[2]]
                };

            });

            container.jstree({
                'core': {

                    'data': treeData,
                    'check_callback': true
                },
                check_callback: true
            }).on('changed.jstree', function (e, data) {

                container.trigger('tree-item-selected', { id: data.node.id });
            });

        });
    };


    $treeContainer.on('tree-item-selected', function (e, data) {

        vmCreateGrid($("div#treeGrid"), 'Equipment', null, 'EquipmentClassID eq ({0})'.format(data.id));

        $('#removeNode').attr('disabled', false);
    });
    

    //hide main treegrid controls and show create node controls
    $('#createTreeItem').click(function () {

        $('.createNodeControls').show();
        $('.mainButtonsControls').hide();
    });

    //creating node
    $('#accept').click(function () {

        $('.createNodeControls').hide();
        $('.mainButtonsControls').show();

        var sel = $.jstree.reference('#jstree').get_selected(true)[0] || '#';

        var nodeText = $('#nodeName').val();
        var parentId = sel ? parseInt(sel.id) : null;

        var node = {

            text: nodeText
        };

        vmGetMetadata()
            .done(function (metadata) {

                // find action by name
                var table = vmGetTables(metadata).filter(function (ind, table) {

                    return table.name == 'EquipmentClass';
                })
                .get(0);

                var fields = table.fields.map(function (i, field) {

                    return {
                        name: field.name,
                        type: field.type
                    };
                }).toArray();

                var data = {};

                for (var i = 0; i < fields.length; i++) {
                    
                    if (fields[i].name == 'Description')
                        data[fields[i].name] = nodeText;
                    else if (fields[i].name == 'ParentID')
                        data[fields[i].name] = parentId;

                    else {

                        if (fields[i].type == 'Edm.Int32' || fields[i].type == 'Edm.Single')
                            data[fields[i].name] = 0;
                        else if (data[fields[i].name] == 'Edm.String')
                            data[fields[i].name] = '';
                    }
                        
                };
                
                $.ajax({
                    url: serviceUrl + 'EquipmentClass',
                    type: "POST",
                    data: JSON.stringify(data),
                    contentType: "application/json;odata=verbose"
                }).success(function () {

                    var new_node = $('#jstree').jstree(true).create_node(sel, node);
                }).fail(handleError)

            });
        
    });

    $('#cancel').click(function () {

        $('.createNodeControls').hide();
        $('.mainButtonsControls').show();
    });

    $('#removeNode').click(function () {

        var sel = $.jstree.reference('#jstree').get_selected(true)[0];

        if (sel) {

            if (confirm('Are You sure?')) {

                $.ajax({
                    type: "DELETE",
                    url: serviceUrl + 'EquipmentClass' + '(' + sel.id + ')'
                }).success(function () {

                    ref.delete_node(sel);
                })
                .fail(handleError);
            };
        };
    });


});

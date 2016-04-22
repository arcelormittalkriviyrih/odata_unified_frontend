(function ($) {

    jQuery.fn.odataTree = function (options) {

        var self = this,
            serviceUrl = options.serviceUrl,
            tableName = options.table,
            keys = options.keys,
            navigationBar = $('<div />').attr('id', 'navigationBar').appendTo(self),
            treeRoot = $('<div />').attr('id', 'treeRoot').appendTo(self),
            mainButtonsRoot = $('<div />').addClass('mainButtonsControls').appendTo(navigationBar),
            createNodeControlsRoot = $('<div />').addClass('createNodeControls').appendTo(navigationBar).hide(),
            createBtn = $('<button />').attr('id', 'createTreeItem')
                                        .addClass('btn')
                                        .text('Create new node')
                                        .appendTo(mainButtonsRoot)
                                        .on('click', vmCreate),
            renameBtn = $('<button />').attr({
                                            'id': 'renameNode',
                                            'disabled': true
                                        })
                                        .addClass('btn')
                                        .text('Rename node')
                                        .appendTo(mainButtonsRoot)
                                        .on('click', vmEdit),
            removeBtn = $('<button />').attr({
                                            'id': 'removeNode',
                                            'disabled': true
                                        })
                                        .addClass('btn')
                                        .text('Delete node')
                                        .appendTo(mainButtonsRoot)
                                        .on('click', vmRemove),
            nodeNameInput = $('<input />').attr({
                                                'id': 'createTreeItem',
                                                'type': 'text'
                                            })
                                            .appendTo(createNodeControlsRoot)
                                            .on('keyup', vmValidate),
            acceptBtn = $('<button />').attr({
                                            'id': 'accept',
                                            'disabled': true
                                        })
                                        .addClass('btn')
                                        .text('create')
                                        .appendTo(createNodeControlsRoot)
                                        .on('click', vmAccept),
            cancelBtn = $('<button />').attr({ 'id': 'cancel' })
                                        .addClass('btn')
                                        .text('cancel')
                                        .appendTo(createNodeControlsRoot)
                                        .on('click', vmCancel);

        $.get(serviceUrl + tableName).then(function (data) {

            vmInit(data);
        });

        function vmInit(data) {

            var treeData = data.value.map(function (item, index, arr) {

                return {

                    'id': item[keys.id],
                    'parent': item[keys.parent] == null ? '#' : item[keys.parent],
                    'text': item[keys.text]
                };

            });

            treeRoot.jstree({
                'core': {

                    'data': treeData,
                    'check_callback': true
                },
                check_callback: true
            }).on('changed.jstree', function (e, data) {

                self.trigger('tree-item-selected', { id: data.node.id, action: data.action });

                renameBtn.attr('disabled', false);
                removeBtn.attr('disabled', false);
            });

        };

        function vmCreate() {

            mainButtonsRoot.hide();
            createNodeControlsRoot.show();
        };

        function vmAccept() {

            mainButtonsRoot.show();
            createNodeControlsRoot.hide();

            var sel = $.jstree.reference('#treeRoot').get_selected(true)[0] || '#';

            var nodeText = nodeNameInput.val();
            var parentId = sel ? parseInt(sel.id) : null;

            var node = {

                text: nodeText
            };

            vmGetMetadata()
                .done(function (metadata) {

                    var table = vmGetTables(metadata).filter(function (ind, table) {

                        return table.name == tableName;
                    })
                    .get(0);

                    var fields = table.fields.toArray();

                    var data = {};

                    for (var i = 0; i < fields.length; i++) {

                        if (fields[i].name == keys.text)
                            data[fields[i].name] = nodeText;
                        else if (fields[i].name == keys.parent)
                            data[fields[i].name] = parentId;

                        else {

                            if (fields[i].type == 'Edm.Int32' || fields[i].type == 'Edm.Single')
                                data[fields[i].name] = 0;
                            else if (data[fields[i].name] == 'Edm.String')
                                data[fields[i].name] = '';
                        }

                    };

                    $.ajax({
                        url: serviceUrl + tableName,
                        type: "POST",
                        data: JSON.stringify(data),
                        contentType: "application/json;odata=verbose"
                    }).success(function (responce) {

                        node.id = responce[keys.id];

                        var ref = treeRoot.jstree(true),
                                    sel = ref.get_selected();
                        if (!sel.length) { return false; }
                        sel = sel[0];
                        sel = ref.create_node(sel, node);

                        location.reload();

                    }).fail(handleError)

                });
        };

        function vmEdit() {

            var ref = treeRoot.jstree(true),
				sel = ref.get_selected();

            if (!sel.length) { return false; }
            sel = sel[0];
            ref.edit(sel);

            treeRoot.on('rename_node.jstree', function (e, data) {

                $.get(serviceUrl + tableName + '(' + data.node.id + ')')
                      .then(function (json) {

                          delete json['@odata.context'];
                          json[keys.text] = data.text;

                          $.ajax({
                              url: serviceUrl + tableName + '(' + data.node.id + ')',
                              type: "PUT",
                              data: JSON.stringify(json),
                              contentType: "application/json;odata=verbose"

                          }).fail(handleError);
                      }).fail(handleError);
            })
        };

        function vmRemove() {

            var sel = $.jstree.reference('#treeRoot').get_selected(true)[0];

            if (sel) {

                if (confirm('Are You sure?')) {

                    $.ajax({
                        type: "DELETE",
                        url: serviceUrl + tableName + '(' + sel.id + ')'
                    }).success(function () {

                        var ref = treeRoot.jstree(true),
                                    sel = ref.get_selected();
                        if (!sel.length) { return false; }
                        ref.delete_node(sel);

                    })
                    .fail(handleError);
                };
            };
        };

        function vmCancel() {

            mainButtonsRoot.show();
            createNodeControlsRoot.hide();
        };

        function vmValidate() {

            var val = $(this).val();

            if (val.length > 0)
                acceptBtn.attr('disabled', false)
            else
                acceptBtn.attr('disabled', true)
        };

    };

})(jQuery);
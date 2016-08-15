(function ($) {

    jQuery.fn.odataTree = function (options) {

        var self = this,
            _data = options.data,
            serviceUrl = options.serviceUrl,
            tableName = options.table,
            keys = options.keys,
            translates = options.translates,
            parentID = options.parentID,
            additionalFields = options.additionalFields,
            navigationBar = $('<div />').attr('id', 'navigationBar')
            .css({

                display: options.disableControls ? 'none' : 'block'
            })
            .appendTo(self),
            treeRoot = $('<div />').attr('id', 'treeRoot').appendTo(self),
            mainButtonsRoot = $('<div />').addClass('mainButtonsControls').appendTo(navigationBar),
            blackWrapper = $('<div />').addClass('black-wrapper').appendTo('body').hide();
            controlsRootModal = $('<div />').addClass('modal treeControls')
                                        .appendTo(blackWrapper),
            createBtn = $('<button />').attr('id', 'createTreeItem')
                                        .addClass('btn')
                                        .append('<span class="glyphicon glyphicon-plus"></span>')
                                        .appendTo(mainButtonsRoot)
                                        .on('click', vmShowModal),
            renameBtn = $('<button />').attr({
                                            'id': 'renameNode',
                                            'disabled': true
                                        })
                                        .addClass('btn')
                                        .append('<span class="glyphicon glyphicon-pencil"></span>')
                                        .appendTo(mainButtonsRoot)
                                        .on('click', vmShowModal),
            removeBtn = $('<button />').attr({
                                            'id': 'removeNode',
                                            'disabled': true
                                        })
                                        .addClass('btn')
                                        .append('<span class="glyphicon glyphicon-remove"></span>')
                                        .appendTo(mainButtonsRoot)
                                        .on('click', vmRemove),

            nodeNameLabel = $('<label />').text(translates.nodeName)
                                        .appendTo(controlsRootModal),

            nodeNameInput = $('<input />').attr({
                                            'id': 'createTreeItem',
                                            'type': 'text',
                                            'required': 'required'
                                        }).focus(vmClear)
                                        .addClass('form-control')
                                        .appendTo(controlsRootModal),

            parentNodeLabel = $('<label />').text(translates.parentID)
                                                    .appendTo(controlsRootModal),

            parentNodeTree = $('<div />').attr({
                                            'id': 'parentID'
                                            }).focus(vmClear)
                                              .appendTo(controlsRootModal),

            additionalFieldsRoot = $('<div />').addClass('additionalFields')
                                        .appendTo(controlsRootModal),

            acceptBtn = $('<button />').attr({
                                            'id': 'accept'
                                        })
                                        .addClass('btn')
                                        .append('<span class="glyphicon glyphicon-ok"></span>')
                                        .appendTo(controlsRootModal),
            cancelBtn = $('<button />').attr({ 'id': 'cancel' })
                                        .addClass('btn')
                                        .append('<span class="glyphicon glyphicon-remove"></span>')
                                        .appendTo(controlsRootModal)
                                        .on('click', vmCancel),
            parentNodeID = null, _isCancel = false;
            
        vmInit(_data);

        function vmInit(data) {

            var treeData = data.map(function (item, index, arr) {

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
            parentNodeTree.jstree({
                'core': {

                    'data': treeData,
                    'check_callback': true
                },
                check_callback: true
            }).on('changed.jstree', function (e, data) {

                if (!_isCancel)
                    parentNodeID = data.node.id;
                else
                    parentNodeID = null;
            });

            if (additionalFields)
                vmAddAdditionalFields();
           
        };
               
        function vmAddAdditionalFields() {

            additionalFields.forEach(function (item) {

                var label = $('<label />').text(item.translate).appendTo(additionalFieldsRoot);
                var control;
                switch (item.control) {

                    case 'combo':
                        
                        control = $('<select />').attr({
                                                        'id': item.id,
                                                        'required': item.required
                                                    })
                                                 .addClass('form-control')
                                                 .focus(vmClear)
                                                 .append('<option />')
                                            .appendTo(additionalFieldsRoot);
                         
                        item.data.forEach(function (field) {

                            var option = $('<option />')
                                            .val(field[item.keyField])
                                            .text(field[item.valueField])
                                            .appendTo(control);
                        });

                      
                        break;
                };
            });
        };

        function vmShowModal(e) {

            _isCancel = false;

            var buttonId = $(e.currentTarget).attr('id');
            var sel = $.jstree.reference('#treeRoot').get_selected(true)[0] || '#';

            switch (buttonId) {
                case 'createTreeItem':

                    acceptBtn.on('click', vmCreate);
                    nodeNameInput.val('');

                    if (sel) 
                        parentNodeTree.jstree('select_node', sel.id);
                                                            
                    vmHandleAdditionalFields(controlsRootModal, additionalFields, sel, 'create');

                    break;

                case 'renameNode':

                    acceptBtn.on('click', vmEdit);
                    nodeNameInput.val(sel.text);

                    if (sel && sel.parent != '#') 
                        parentNodeTree.jstree('select_node', sel.parent);
                    
                                           
                    vmHandleAdditionalFields(controlsRootModal, additionalFields, sel, 'edit');
                    break;
            };

            blackWrapper.show();
        };

        function vmCreate() {

            if (!vmCheckRequiredFields(controlsRootModal)) {

                alert('You must fill all required fields!');

                //acceptBtn.off('click');
                return false;
            }

            var nodeText = nodeNameInput.val();
            var parentId = parentNodeID || null;

            var node = {

                text: nodeText,
                parentId: parentId
            };

            vmGetMetadata()
                .done(function (metadata) {

                    var table = vmGetTables(metadata).filter(function (ind, table) {

                        return table.name == tableName;
                    })
                    .get(0);

                    var fields = table.fields.toArray();

                    var json = {};

                    for (var i = 0; i < fields.length; i++) {

                        if (fields[i].name == keys.text)
                            json[fields[i].name] = nodeText;
                        else if (fields[i].name == keys.parent)
                            json[fields[i].name] = parentId;

                    };

                    if (additionalFields) {

                        additionalFields.forEach(function (field) {

                            var id = field.id;
                            var control = controlsRootModal.find('#' + id);

                            json[id] = control.val();
                        });
                    };
                    
                    $.ajax({
                        url: serviceUrl + tableName,
                        type: "POST",
                        data: JSON.stringify(json),
                        contentType: "application/json;odata=verbose"
                    }).success(function (responce) {
                        
                        node.id = responce[keys.id];

                        var ref = treeRoot.jstree(true),
                                    sel = ref.get_selected();
                        if (!sel.length) { location.reload() }
                        sel = sel[0];
                        sel = ref.create_node(sel, node);

                        vmCancel();
                        //location.reload();

                    }).fail(handleError)

                });
        };
        
        function vmEdit() {

            var sel = $.jstree.reference('#treeRoot').get_selected(true)[0] || '#';

            if (!vmCheckRequiredFields(controlsRootModal)) {

                alert('You must fill all required fields!');
                //acceptBtn.off('click');
                return false;
            }
            
            $.get(serviceUrl + tableName + '(' + parseInt(sel.id) + ')')
                    .then(function (json) {

                        delete json['@odata.context'];
                        json[keys.text] = nodeNameInput.val();
                        json[keys.parent] = parentNodeID;
                        
                        if (additionalFields) {

                            additionalFields.forEach(function (field) {

                                var id = field.id;
                                var control = controlsRootModal.find('#' + id);
                               
                                json[id] = control.val();
                            });
                        };

                        if (json[keys.parent] == sel.id) {

                            alert('Parent cannot be the same with node name! Please, select another parent');
                            parentNodeID = null;
                            return false;
                        }
                        $.ajax({
                            url: serviceUrl + tableName + '(' + sel.id + ')',
                            type: "PUT",
                            data: JSON.stringify(json),
                            contentType: "application/json;odata=verbose"

                        }).then(function () {

                            location.reload();
                        }).fail(handleError);
                    }).fail(handleError);
                     
        };

        function vmRemove() {

            var sel = $.jstree.reference('#treeRoot').get_selected(true)[0] || '#';

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

            controlsRootModal.find('input, select').each(function (i, item) {
                vmClear(item);
            });

            _isCancel = true;

            parentNodeTree.jstree('deselect_all');
            acceptBtn.off('click');

            blackWrapper.hide();
            
        };

        function vmClear(e) {

            var elem;

            if (e.currentTarget)
                elem = $(e.currentTarget);
            else
                elem = $(e);

            if (elem.hasClass('wrong'))
                elem.removeClass('wrong');

        }

        function vmHandleAdditionalFields(controlsRootModal, additionalFields, sel, mode) {
            if (additionalFields) {

                additionalFields.forEach(function (field) {

                    var id = field.id;
                    var control = controlsRootModal.find('#' + id);

                    if (sel && sel != '#') 
                        vmGetActiveAdditionalFieldValue(sel, _data, control, field, mode);                   
                });
            };
        };

        function vmGetActiveAdditionalFieldValue(sel, data, control, field, mode) {

            var id = sel.id;
            var fieldData = data.filter(function (item) {
                return item.ID == id;
            });

            var val = fieldData[0][field.id];

            if (field.editReadOnly)
                vmHandleReadOnly(field, mode, control);
                                         
            control.val(val);
        };

        function vmHandleReadOnly(field, mode, control) {
            switch (mode) {
                case 'create':
                    control.removeAttr('disabled')
                    break;
                case 'edit':
                    control.attr('disabled', 'disabled')
                    break;
            };
        };

    };

})(jQuery);
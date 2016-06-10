﻿(function ($) {

    jQuery.fn.odataTree = function (options) {

        var self = this,
            _sel = null,
            _data = options.data,
            serviceUrl = options.serviceUrl,
            tableName = options.table,
            keys = options.keys,
            translates = options.translates,
            parentID = options.parentID,
            additionalFields = options.additionalFields,
            navigationBar = $('<div />').attr('id', 'navigationBar').appendTo(self),
            treeRoot = $('<div />').attr('id', 'treeRoot').appendTo(self),
            mainButtonsRoot = $('<div />').addClass('mainButtonsControls').appendTo(navigationBar),
            blackWrapper = $('<div />').addClass('black-wrapper').appendTo('body').hide();
            controlsRootModal = $('<div />').addClass('modal treeControls')
                                        .appendTo(blackWrapper),
            createBtn = $('<button />').attr('id', 'createTreeItem')
                                        .addClass('btn')
                                        .append('<i class="icon-plus"></i>')
                                        .appendTo(mainButtonsRoot)
                                        .on('click', vmShowModal),
            renameBtn = $('<button />').attr({
                                            'id': 'renameNode',
                                            'disabled': true
                                        })
                                        .addClass('btn')
                                        .append('<i class="icon-pencil"></i>')
                                        .appendTo(mainButtonsRoot)
                                        .on('click', vmShowModal),
            removeBtn = $('<button />').attr({
                                            'id': 'removeNode',
                                            'disabled': true
                                        })
                                        .addClass('btn')
                                        .append('<i class="icon-remove"></i>')
                                        .appendTo(mainButtonsRoot)
                                        .on('click', vmRemove),

            nodeNameLabel = $('<label />').text(translates.nodeName)
                                        .appendTo(controlsRootModal)

            nodeNameInput = $('<input />').attr({
                                            'id': 'createTreeItem',
                                            'type': 'text',
                                            'required': 'required'
                                        }).focus(vmClear)
                                        .appendTo(controlsRootModal)

            parentNodeLabel = $('<label />').text(translates.parentID)
                                                    .appendTo(controlsRootModal)

            parentNodeInput = $('<select />').attr({
                                            'id': 'parentID'
                                            }).focus(vmClear)
                                              .appendTo(controlsRootModal)

            additionalFieldsRoot = $('<div />').addClass('additionalFields')
                                        .appendTo(controlsRootModal),

            acceptBtn = $('<button />').attr({
                                            'id': 'accept'
                                        })
                                        .addClass('btn')
                                        .append('<i class="icon-ok"></i>')
                                        .appendTo(controlsRootModal),
            cancelBtn = $('<button />').attr({ 'id': 'cancel' })
                                        .addClass('btn')
                                        .append('<i class="icon-remove"></i>')
                                        .appendTo(controlsRootModal)
                                        .on('click', vmCancel);
            
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
                _sel = $.jstree.reference('#treeRoot').get_selected(true)[0] || '#';
            });

            parentNodeInput.append('<option />');

            data.forEach(function (field) {

                var option = $('<option />')
                                .val(field[parentID.keyField])
                                .text(field[parentID.valueField])
                                .appendTo(parentNodeInput);
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
                        
                        control = $('<select />').attr(
                                                    {
                                                        'id': item.id,
                                                        'required': item.required
                                                    })
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

            var buttonId = $(e.currentTarget).attr('id');

            switch (buttonId) {
                case 'createTreeItem':

                    acceptBtn.on('click', vmCreate);
                    nodeNameInput.val('');

                    if (_sel)
                        parentNodeInput.val(_sel.id);
                                        
                    vmHandleAdditionalFields(controlsRootModal, additionalFields, _sel, 'create');

                    break;

                case 'renameNode':

                    acceptBtn.on('click', vmEdit);


                    nodeNameInput.val(_sel.text);

                    if (_sel && _sel.parent!= '#')
                        parentNodeInput.val(_sel.parent);
                    
                    vmHandleAdditionalFields(controlsRootModal, additionalFields, _sel, 'edit');
                    break;
            };

            blackWrapper.show();
        };

        function vmCreate() {

            if (!vmCheckRequiredFields(controlsRootModal)) {

                alert('You must fill all required fields!');
                return false;
            }

            var nodeText = nodeNameInput.val();
            var parentId = parentNodeInput.val() || null;

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

                    }).fail(handleError)

                });
        };
        
        function vmEdit() {

            if (!vmCheckRequiredFields(controlsRootModal)) {

                alert('You must fill all required fields!');
                return false;
            }
            
            $.get(serviceUrl + tableName + '(' + parseInt(_sel.id) + ')')
                    .then(function (json) {

                        delete json['@odata.context'];
                        json[keys.text] = nodeNameInput.val();
                        json[keys.parent] = parentNodeInput.val();
                        
                        if (additionalFields) {

                            additionalFields.forEach(function (field) {

                                var id = field.id;
                                var control = controlsRootModal.find('#' + id);
                               
                                json[id] = control.val();
                            });
                        };

                        if (json[keys.parent] == _sel.id) {

                            alert('Parent cannot be the same with node name! Please, select another parent');
                            parentNodeInput.val('');
                            return false;
                        }
                        $.ajax({
                            url: serviceUrl + tableName + '(' + _sel.id + ')',
                            type: "PUT",
                            data: JSON.stringify(json),
                            contentType: "application/json;odata=verbose"

                        }).then(function () {

                            location.reload();
                        }).fail(handleError);
                    }).fail(handleError);
                     
        };

        function vmRemove() {

            if (_sel) {

                if (confirm('Are You sure?')) {

                    $.ajax({
                        type: "DELETE",
                        url: serviceUrl + tableName + '(' + _sel.id + ')'
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

                    if (sel) 
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
                vmHAndleReadOnly(field, mode, control);
                                         
            control.val(val);
        };

        function vmHAndleReadOnly(field, mode, control) {
            switch (mode) {
                case 'create':
                    control.removeAttr('readonly')
                    break;
                case 'edit':
                    control.attr('readonly', 'readonly')
                    break;
            };
        };

    };

})(jQuery);
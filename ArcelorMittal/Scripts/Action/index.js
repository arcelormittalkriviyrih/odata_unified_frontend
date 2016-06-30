(function ($) {

    jQuery.fn.oDataAction = function (options) {

        var self = $(this),
            procedureName = options.action,
            fieldsList = options.fields,
            keyField = options.keyField,
            rowData = options.rowData,
            formType = options.type,
            controlCaptions = options.controlCaptions,
            additionalFields = options.additionalFields,
            escapedFields = options.escapedFields,
            _fields = null;

           
        vmGetMetadata()
        .done(function (metadata) {

            // find action by name
            var action = vmGetActions(metadata).filter(function (ind, action) {

                return action.name == procedureName;
            })
            .get(0);

            vmBuildForm(self, action);
        });

        function vmBuildForm(container, action) {

            // clear form
            var $form = container.empty();

            var controlGroup = $('<div />').addClass('control-group');

            // build fields
           
            var actionFields = action.fields.toArray();
            
            if (escapedFields) {

                actionFields = actionFields.filter(function (item) {

                    if (escapedFields.indexOf(item.name) == -1)
                        return item;
                });
            };
                
            actionFields.forEach(function (field) {

                var fieldData = fieldsList.filter(function (item) {

                    if (item.name == field.name)
                        return item;
                })[0];

                var properties = fieldData.properties;

                var controlsControlGroup = controlGroup.clone().appendTo($form);

                $('<label />').addClass('control-label').text(properties.translate)
                    .appendTo(controlsControlGroup);

                switch (properties.control) {

                    case 'text':

                        field.input = $('<input />').attr('type', 'text');
                           
                        break;

                    case 'combo':

                        var control = $('<select />');
                        control.append('<option></option>')

                        //map data array to key-value array for building select
                        data = properties.data.map(function (item) {

                            return {
                                key: item[properties.keyField],
                                value: item[properties.valueField]
                            };
                        }).forEach(function (item) {
                                
                            if (item.value == '')
                                item.value = 'no name';

                            var option = $('<option />').attr('value', item.key)
                                                        .text(item.value)
                                                        .appendTo(control);
                        });

                        field.input = control;

                        break;

                }

                if (properties.required) {

                    field.input.attr('required', 'required') // for IE
                    field.input.prop('required', true)
                        .focus(function (e) {

                            if ($(this).hasClass('wrong'))
                                $(this).removeClass('wrong');

                        })
                }
                                       
                    
                //fill field if there is data for this field (in edit mode)
                if (rowData) {

                    //get data for field
                    var fieldEditedData = rowData.filter(function (item) {

                        if (item.Property == field.name)
                            return item;
                    });

                    //fill field if there is available data
                    //or leave this field as empty if no available data 
                    if (fieldEditedData.length > 0)
                        field.input.val(fieldEditedData[0].Value);
                    else
                        field.input.val('');

                    //set keyfield as readonly if we build edit form
                    if (formType == 'edit') {

                        if (field.name == keyField)
                            field.input.attr('readonly', 'readonly').val(fieldEditedData[0].Value);
                    };

                    //fill keyfield as empty if we build copy form
                    if (formType == 'copy') {

                        if (field.name == keyField)
                            field.input.val('');
                    };
                                                   
                };
                                                               
                field.input.appendTo(controlsControlGroup);
            });
            
            
            var controlsSubmitGroup = $('<div />').addClass('control-row').appendTo($form);

            // create submit button
            $('<button />').addClass('btn runAction').text(controlCaptions.OK)
                .appendTo(controlsSubmitGroup)
                .click(function () {

                    if (!vmCheckRequiredFields($form)) {

                        alert('You must fill all required fields!');
                        return false;
                    }
                    
                    vmCallAction(action)

                        .done(function (result) {

                            self.find('input, select').each(function (i, item) {

                                $(item).val(null);
                            });

                            self.trigger('oDataForm.success', {

                                type: formType,
                                fields: _fields
                            })
                        })
                        .fail(handleError);

                   
                    // prevent default action
                    return false;
                });

            $('<button />').addClass('btn cancelAction').text(controlCaptions.Cancel)
                .appendTo(controlsSubmitGroup).click(function () {

                    self.find('input, select').each(function (i, item) {

                        $(item).val(null);
                    });

                    self.trigger('oDataForm.cancel');
                })
        };

        function vmCallAction(action) {
                        
            // collect param values
            var data = action.fields
                            .toArray()
                            .reduce(function (p, n) {

                                if (n.input)
                                    p[n.name] = n.input.val();

                                return p;

                            }, {});

            if (additionalFields) {

                additionalFields.forEach(function (item) {

                    data[item.name] = item.value;
                })
            }

            _fields = data;

            for (var prop in data) {

                if (data[prop] == '')
                    data[prop] = null;
            }

             //call service action
            return $.ajax({
                url: serviceUrl + action.name,
                type: 'POST',
                data: JSON.stringify(data),
                contentType: "application/json"
            })
        };

        

    }
   
})(jQuery);

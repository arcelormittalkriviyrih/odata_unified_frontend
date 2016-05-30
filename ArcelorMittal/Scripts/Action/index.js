(function ($) {

    jQuery.fn.oDataAction = function (options) {

        var self = $(this),
            procedureName = options.action,
            fieldsList = options.fields,
            keyParam = options.keyParam,
            rowData = options.rowData;

           
        vmGetMetadata()
        .done(function (metadata) {

            // find action by name
            var action = vmGetActions(metadata).filter(function (ind, action) {

                return action.name == procedureName;
            })
            .get(0);

            vmBuildForm(self, action, formType);
        });

        function vmBuildForm(container, action, formType) {

            // clear form
            var $form = container.empty();

            var controlGroup = $('<div />').addClass('control-group');

            // build fields

            action.fields.toArray()
                .forEach(function (field) {

                    var fieldData = fieldsList.filter(function (item) {

                        if (item.name == field.name)
                            return item;
                    });

                    var properties = fieldData[0].properties;

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
                    
                    //set field as readonly if we build edit form and current field has id of edited row
                    if (keyParam) {

                        if (field.name == keyParam.name)
                            field.input.attr('readonly', 'readonly');
                    };

                    //fill field if there is data for this field (in edit mode)
                    if (rowData) {

                        var fieldEditedData = rowData.filter(function (item) {

                            if (item.Property == field.name)
                                return item;
                        });

                        field.input.val(fieldEditedData[0].Value);
                    };

                    
                                           
                    field.input.appendTo(controlsControlGroup);
                });
            
            
            var controlsSubmitGroup = $('<div />').addClass('control-row').appendTo($form);

            // create submit button
            $('<button />').addClass('btn offset4 runAction').text('Run')
                .appendTo(controlsSubmitGroup)
                .click(function () {

                    if (!vmCheckRequiredFields()) {

                        alert('You must fill all required fields!');
                        return false;
                    }
                    
                    vmCallAction(action)

                        .done(function (result) {

                            $(document).trigger('oDataForm.success')
                        })
                        .fail(handleError);

                   
                    // prevent default action
                    return false;
                });
        };

        function vmCallAction(action) {
                        
            // collect param values
            var data = action.fields
                            .toArray()
                            .reduce(function (p, n) {

                                p[n.name] = n.input.val();
                                return p;

                            }, {});

             //call service action
            return $.ajax({
                url: serviceUrl + action.name,
                type: 'POST',
                data: JSON.stringify(data),
                contentType: "application/json"
            })
        };

        function vmCheckRequiredFields() {

            var unFilledFields = $(document).find('input, select')
                                    .filter("[required]")
                                    .filter(function () { return this.value == ''; })

            if (unFilledFields.length > 0){

                vmShowUnfilledRequiredFields(unFilledFields);
                return false;
            } else return true;
        }

        function vmShowUnfilledRequiredFields(unFilledFields) {

            unFilledFields.each(function (i, item) {

                $(item).addClass('wrong');

            })
        }

    }
   
})(jQuery);

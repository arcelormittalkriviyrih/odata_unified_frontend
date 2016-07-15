﻿(function ($) {

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
            additionalActionFields = options.additionalActionFields,
            controlList = options.controlList,
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
            
            //there is totally shit must be rewrited
            //must be correctly data from outer sources
            if (escapedFields) {

                actionFields = actionFields.filter(function (item) {

                    if (escapedFields.indexOf(item.name) == -1)
                        return item;
                });
            };

            
            if (additionalActionFields) {

                additionalActionFields.forEach(function (item) {

                    actionFields.push(item);
                });
            };

            actionFields.forEach(function (field) {

                var fieldData = fieldsList.filter(function (item) {

                    if (item.name == field.name)
                        return item;
                })[0];

                if (fieldData)
                    field.order = fieldData.properties.order;
            });
            //end of totally shit

            actionFields = actionFields.sort(function (a, b) {

                if (a.order < b.order)
                    return -1;
                else if (a.order > b.order)
                    return 1;
                else
                    return 0;
            })
            
                               
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

                    case 'date':

                        field.input = $("<input type='text'>").datepicker({ defaultDate: '', dateFormat: 'dd.mm.yy' });

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
                            field.input.attr('disabled', 'disabled').val(fieldEditedData[0].Value);
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
            var submitBtn = $('<button />').addClass('btn runAction').text(controlCaptions.OK)
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

            var cancelBtn = $('<button />').addClass('btn cancelAction').text(controlCaptions.Cancel)
                .appendTo(controlsSubmitGroup).click(function () {

                    self.find('input, select').each(function (i, item) {

                        $(item).val(null);
                    });

                    self.trigger('oDataForm.cancel');
                });


            if (controlList){
                controlList.forEach(function (control) {

                    if (control.type == 'additional') {

                        var additionalControl = $('<button />').addClass('btn {0}'.format(control.name))
                                                               .text(control.text)
                                                               .click(function () {

                                                                   if (!vmCheckRequiredFields($form)) {

                                                                       alert('You must fill all required fields!');
                                                                       return false;
                                                                   }

                                                                   self.trigger('oDataForm.procedureProcessing');

                                                                   vmCallAction(action, control.procedure)
                                                                        .done(function (result) {

                                                                            self.trigger('oDataForm.procedureProcessed');
                                                                        }).fail(handleError);
                                                               });

                        cancelBtn.before(additionalControl);
                    }

                    if (control.type == 'submit' && control.hide) {

                        submitBtn.hide();
                    }
                })
            } 

        };

        function vmCallAction(action, procedure) {
            
            var url = serviceUrl;
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

            if (procedure)
                url += procedure;
            else
                url += action.name;

             //call service action
            return $.ajax({
                url: url,
                type: 'POST',
                data: JSON.stringify(data),
                contentType: "application/json"
            })
        };
        
    }
   
})(jQuery);

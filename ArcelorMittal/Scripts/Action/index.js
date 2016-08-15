(function ($) {

    jQuery.fn.oDataAction = function (options) {

        var self = $(this),
            procedureName = options.action,
            fieldsList = options.fields,
            keyField = options.keyField,
            formType = options.type,
            controlCaptions = options.controlCaptions,
            controlList = options.controlList,
            translates = options.translates,
            preventEnterSubmit = options.preventEnterSubmit,
            _fields = null;

        vmBuildForm(self);

        function vmBuildForm(container) {

            // clear form
            var $form = container.empty();

            //prevent submit form on enter
            if (preventEnterSubmit) {

                $form.on('keyup keypress', function (e) {
                    var keyCode = e.keyCode || e.which;
                    if (keyCode === 13) {
                        e.preventDefault();
                        return false;
                    }
                });
            }
            

            var controlGroup = $('<div />').addClass('control-group');

            // build fields            
            fieldsList = fieldsList.sort(function (a, b) {

                if (a.properties.order < b.properties.order)
                    return -1;
                else if (a.properties.order > b.properties.order)
                    return 1;
                else
                    return 0;
            })
            
                               
            fieldsList.forEach(function (field) {

                var properties = field.properties;

                var controlsControlGroup = controlGroup.clone().appendTo($form);

                if (!properties.show)
                    controlsControlGroup.css('display', 'none');

                var label = $('<label />').addClass('control-label').text(properties.translate)
                    .appendTo(controlsControlGroup);

                

                switch (properties.control) {

                    case 'text':

                        field.input = $('<input />').addClass('form-control')
                                                    .attr('type', 'text');
                           
                        break;

                    case 'date':

                        field.input = $("<input type='text'>").addClass('form-control')
                                                              .datepicker({
                                                                  defaultDate: '',
                                                                  dateFormat: 'dd.mm.yy'
                                                              });

                        break;

                    case 'combo':


                        controlsControlGroup.append(dropBoxTmpl.format('selectedComboTextValue', 'selectedComboDataValue', 'oDataFormCombo'));

                        var selectedComboTextValue = $('#selectedComboTextValue');
                        var selectedComboDataValue = $('#selectedComboDataValue');

                        var ul = $('#oDataFormCombo');

                        var data = properties.data.map(function (item) {

                            return {
                                key: item[properties.keyField],
                                value: item[properties.valueField]
                            };
                        }).forEach(function (item) {
                                
                            if (item.value == '')
                                item.value = 'no name';
                           
                            var li = $('<li />').appendTo(ul);


                            var a = $('<a />').attr({
                                                    href: '#',
                                                    dataValue: item.key                            
                                                    })
                                                    .text(item.value)
                                                    .on('click', function(e){

                                                        e.preventDefault();

                                                        selectedComboTextValue.val($.trim($(this).text()));
                                                        selectedComboDataValue.val($(this).attr('dataValue'));

                                                        $(this).closest('.dropdown').removeClass('wrong');
                                                    })
                                                    .appendTo(li);
                        });

                        field.input = selectedComboDataValue;

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
                                       
                    
                //fill field if there is data for this field (in edit and copy mode)
                
                if (formType != 'create') {

                    if (field.input.attr('data-parent') == 'dropDown') {

                        var defaultValue = field.properties.data.find(function (item) {

                            return item.ID == field.properties.defaultValue;
                        });
                        
                        field.input.siblings('.dropdown-input').val(defaultValue.Name);
                    }

                    field.input.val(field.properties.defaultValue);
                }
                    
                
                if (formType == 'create' && properties.enterAction) {

                    field.input.on('keyup', function (e) {

                        if (e.keyCode == 13) {

                            self.trigger('oDataForm.outerDataReceipt');

                            vmFillFieldsOuterData(properties.enterAction, fieldsList, field.input.val());
                        }
                    })
                }


                if (properties.disable)
                    field.input.attr('disabled', 'disabled');

                if (properties.maxlength)
                    field.input.attr('maxlength', properties.maxlength)

                if (properties.countOnly)
                    field.input.on("keydown keypress", function (event) {

                        if (!((event.which >= 48 && event.which <= 57) || (event.which >= 96 && event.which <= 105))
                            && event.which != 8 && event.which != 46 && event.which != 13 && event.which != 37
                            && event.which != 38 && event.which != 39 && event.which != 40 && event.which != 9) {

                            return false;
                        };
                    });

                //set keyfield as readonly if we build edit form
                if (formType == 'edit') {

                    if (field.name == keyField)
                        field.input.attr('disabled', 'disabled');
                };

                //fill keyfield as empty if we build copy form
                if (formType == 'copy') {

                    if (field.name == keyField)
                        field.input.val('');
                };
                                                               
                field.input.appendTo(controlsControlGroup);
            });
            
            
            var controlsSubmitGroup = $('<div />').addClass('control-row').appendTo($form);
            
            // create submit button
            var submitBtn = $('<button />').addClass('btn btn-default runAction').text(controlCaptions.OK)
                .appendTo(controlsSubmitGroup)
                .click(function (e) {

                    if (!vmCheckRequiredFields($form)) {

                        alert(translates.fillRequired);
                        return false;
                    }
                    
                    vmCallAction(procedureName)

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

            var cancelBtn = $('<button />').addClass('btn btn-default cancelAction').text(controlCaptions.Cancel)
                .appendTo(controlsSubmitGroup).click(function () {

                    self.find('input, select').each(function (i, item) {

                        $(item).val(null);
                    });

                    self.trigger('oDataForm.cancel');
                });


            if (controlList){
                controlList.forEach(function (control) {

                    if (control.type == 'additional') {

                        var additionalControl = $('<button />').addClass('btn btn-default {0}'.format(control.name))
                                                               .text(control.text)
                                                               .click(function () {

                                                                   if (!vmCheckRequiredFields($form)) {

                                                                       alert(translates.fillRequired);
                                                                       return false;
                                                                   }

                                                                   self.trigger('oDataForm.procedureProcessing');

                                                                   vmCallAction(control.procedure)
                                                                        .done(function (result) {

                                                                            self.trigger('oDataForm.procedureProcessed');
                                                                        }).fail(function(err){
                                                                        
                                                                            self.trigger('oDataForm.procedureFailed');
                                                                            handleError(err);

                                                                        });
                                                               });

                        cancelBtn.before(additionalControl);
                    }

                    if (control.type == 'submit' && control.hide) {

                        submitBtn.hide();
                    }
                })
            } 

        };

        function vmFillFieldsOuterData(procedure, fields, param) {

            $.ajax({

                url: procedure + param,
                xhrFields: {
                    withCredentials: true
                }
            }).then(function (response) {

                var data = response.value;

                self.trigger('oDataForm.OuterDataReceived');

                data.forEach(function (item) {

                    var field = fields.find(function (field) {

                        return field.properties.sapName == item.Name
                    });

                    if (field && field.input && item.Value) {

                        field.input.val(item.Value);

                        field.input.animate({
                            borderColor: 'green',
                            backgroundColor: '#d0fadd'
                        }, 100)
                        .animate({
                            borderColor: '#ccc',
                            backgroundColor: 'transparent'
                        }, 1000)

                    }
                        

                })
            }).fail(function (err) {

                self.trigger('oDataForm.OuterDataReceiptFailed');

                handleError(err);
            })
        }

        function vmCallAction(procedure) {
            
            var url = serviceUrl;

            var data = fieldsList
                            .reduce(function (p, n) {

                                if (n.input && n.properties.send)
                                    p[n.name] = n.input.val();

                                return p;

                            }, {});

            _fields = data;

            for (var prop in data) {

                if (data[prop] == '')
                    data[prop] = null;
            }

             //call service action
            return $.ajax({
                url: url + procedure,
                type: 'POST',
                data: JSON.stringify(data),
                contentType: "application/json"
            })
        };
        
    }
   
})(jQuery);

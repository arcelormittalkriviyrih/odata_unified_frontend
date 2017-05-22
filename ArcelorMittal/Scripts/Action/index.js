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
            _fields = null,
            _isNoZeroValuesFields = []; //array of fieds name. There are fields must be not '0' value but still have 0

        vmBuildForm(self);

        function vmBuildForm(container) {

            // clear form
            var $form = container.empty();

            //prevent submit form on enter
            if (preventEnterSubmit) {

                $form.on('keyup keypress', function (e) {
                    var keyCode = e.keyCode || e.which;
                    if (keyCode === 13 && e.target.localName != 'textarea') {
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

                        switch (field.name) {
                            case 'CONTRACT_NO':
                            case 'DIRECTION':
                            case 'CLASS':
                            case 'STEEL_CLASS':
                            case 'BUYER_ORDER_NO':
                            case 'STANDARD':
                            case 'CHEM_ANALYSIS':
                                field.input = $('<textarea />').addClass('form-control')
                                                                                    .attr('rows', '2');
                                break;
                            default:
                                field.input = $('<input />').addClass('form-control').attr('type', 'text');

                        }
                           
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

                        if (properties.className) //large
                            controlsControlGroup.addClass(properties.className);

                        var selectedComboTextValue = controlsControlGroup.find('#selectedComboTextValue');
                        var selectedComboDataValue = controlsControlGroup.find('#selectedComboDataValue');

                        var ul = controlsControlGroup.find('#oDataFormCombo');

                        var data = properties.data.map(function (item) {

                            return {
                                key: item[properties.keyField],
                                value: item[properties.valueField]
                            };
                        }).sort(function (a, b) {
                            if (a.value < b.value)
                                return -1;
                            if (a.value > b.value)
                                return 1;
                            return 0;
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
                        var filterField = controlsControlGroup.find('#filter');

                        if (!properties.filter)
                            filterField.hide();
                        else {
                            filterField.keyup(function () {

                                var comboList = ul.find('li a');
                                var val = $(this).val().toLowerCase();

                                if (val.length > 0) {

                                    var notEqual = 0;//hack for ie9
                                    var itemLength = comboList.length;//hack for ie9

                                    comboList.each(function (i, item) {

                                        $(item).parent().show();
                                    });

                                    comboList.each(function (i, item) {

                                        if ($(item).text().toLowerCase().indexOf(val) == -1) {

                                            notEqual++;//hack for ie9
                                            $(item).parent().hide();
                                        }

                                    });

                                    if (notEqual == itemLength)//hack for ie9 
                                        ul.addClass('zeroHeight'); //hack for ie9                              
                                    else//hack for ie9
                                        ul.removeClass('zeroHeight');//hack for ie9

                                } else {

                                    comboList.each(function (i, item) {

                                        $(item).parent().show();
                                    });


                                    ul.removeClass('zeroHeight');//hack for ie9
                                }

                            })
                        }                                               

                        field.input = selectedComboDataValue;

                        break;

                }

                field.input.attr('name', field.name);

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
                        
                        if (defaultValue)
                            field.input.siblings('.dropdown-input').val(defaultValue.Name);
                    }
                   
                    field.input.val(field.properties.defaultValue);
                }

                //set default value for combo in create form mode if available
                if (formType == 'create' && field.input.attr('data-parent') == 'dropDown' && properties.defaultValue) {

                    field.input.val(properties.defaultValue);
                    field.input.siblings('.dropdown-input').val(properties.defaultValue);
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

                if (properties.notZeroValue) {

                    field.input
                        .focus(function (e) {

                            if ($(this).hasClass('wrong'))
                                $(this).removeClass('wrong');

                        })
                        .on("keyup", function (event) {

                            var indexNoZero = _isNoZeroValuesFields.indexOf(properties.translate);

                            if (!vmCheckNullableField($form, field.input)) {
                                if (indexNoZero == -1)
                                _isNoZeroValuesFields.push(properties.translate);
                            } else {
                                if (indexNoZero > -1)
                                    _isNoZeroValuesFields.splice(indexNoZero, 1);
                            }
                            

                    })
                }
                    

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

                    if (_isNoZeroValuesFields.length > 0) {

                        var zeroFieldsNames = _isNoZeroValuesFields.join();

                        alert(translates.noZeroValue.format(zeroFieldsNames));
                        return false;
                    }

                    self.trigger('oDataForm.processing');

                    
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
                        .fail(function(data){
                        
                            handleError(data, options.translates);
                            self.trigger('oDataForm.failed');
                        });

                   
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

                                                                   if (control.name == 'preview') {

                                                                       var blackWrapper = $('<div />').attr({ 'id': 'fullImageModalPreview' })
                                                                                                   .addClass('black-wrapper')
                                                                                                   .appendTo('body').hide(),

                                                                       controlsRootModal = $('<div />').addClass('modal fullImage modalPreview')
                                                                                                .appendTo(blackWrapper),

                                                                       fullImageZone = $('<div />').addClass('scaleZone')
                                                                                                .appendTo(controlsRootModal),

                                                                       loadingContainer = $('<div />').addClass('tableContainer')
                                                                           .appendTo(fullImageZone),

                                                                       loadingMsg = $('<span />').addClass('loading-msg')
                                                                           .text(translates.loadingMsg || 'loading...').appendTo(loadingContainer),

                                                                       fullImage = $('<img />').appendTo(fullImageZone).hide(),

                                                                       cancelBtn = $('<button />')
                                                                                                .addClass('btn btn-circle')
                                                                                                .append('<span class="glyphicon glyphicon-remove"></span>')
                                                                                                .appendTo(controlsRootModal)
                                                                                                .click(function () {

                                                                                                    //fullImage.removeAttr('src');
                                                                                                    blackWrapper.hide();
                                                                                                })
                                                                   };                                                                   

                                                                   self.trigger('oDataForm.procedureProcessing');

                                                                   var arguments = [control.procedure];

                                                                   if (control.procedureParams) {

                                                                       if (control.procedureParams.additionalProcedureParams) {
                                                                           arguments.push(control.procedureParams.additionalProcedureParams);
                                                                       } else {
                                                                           arguments.push(null);
                                                                       }

                                                                       if (control.procedureParams.escapedProcedureParam) {

                                                                           arguments.push(control.procedureParams.escapedProcedureParam);
                                                                       } else {
                                                                           arguments.push(null);
                                                                       }

                                                                   }
                                                                   
                                                                   vmCallAction.apply(this, arguments)
                                                                        .done(function (result) {

                                                                            if (control.name == 'preview') {
                                                                                blackWrapper.show();
                                                                                loadingContainer.show();

                                                                                var materialLotID = result.ActionParameters.find(function(item){
                                                                                    return item.Name == "MaterialLotID"
                                                                                });
                                                                                var src = domainURL + '/api/MediaData/GenerateExcelPreview?materialLotID=' + materialLotID.Value;

                                                                                fullImage.attr('src', src)
                                                                                         .on('load', function () {

                                                                                             loadingContainer.hide();
                                                                                             fullImage.show();
                                                                                         }).on('error', function () {

                                                                                             loadingContainer.show();
                                                                                             loadingMsg.text(options.translates.notAcceptable);
                                                                                             
                                                                                         });                                                                                                                                                                
                                                                            }

                                                                            if (control.procedureParams.callBack) {
                                                                                control.procedureParams.callBack();
                                                                            }
                                                                            

                                                                            self.trigger('oDataForm.procedureProcessed');
                                                                        }).fail(function(err){
                                                                        
                                                                            self.trigger('oDataForm.procedureFailed');
                                                                            handleError(err, options.translates);

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

                handleError(err, options.translates);
            })
        }

        function vmCallAction(procedure, additionalParam, escapedParam) {
            
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

            if (additionalParam)
                data[additionalParam.prop] = additionalParam.value;

            if (escapedParam) {
                var newData = jQuery.extend({}, data);

                escapedParam.forEach(function (item) {
                    delete newData[item];
                });

                
            }
                
             //call service action
            return $.ajax({
                url: url + procedure,
                type: 'POST',
                data: newData ? JSON.stringify(newData) : JSON.stringify(data),
                contentType: "application/json",
                timeout: 15000
            })
        };
        
    }
   
})(jQuery);

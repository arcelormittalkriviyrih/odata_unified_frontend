$(function () {

    vmGetMetadata()
        .done(function (metadata) {

            // read tables from metadata
            var tables = vmGetTables(metadata);

            // populate item list
            vmPopulateList(tables);
        });


});

function vmLoadItem(name) {

    console.log('> Loading table: ' + name);

    vmGetMetadata()
        .done(function (metadata) {

            // find action by name
            var table = vmGetTables(metadata).filter(function (ind, table) {

                return table.name == name;
            })
            .get(0);

            vmBuildForm(table, $('.form_container'));

        });
};

function vmBuildForm(table, root) {

    root.empty();

    var $form = $('form#form').clone();

    $form.appendTo(root).show();

    var $rowIdControl = $form.children('input#rowId');
    var $getRowButton = $form.children('button#getRow');
    var $errorMsg = $form.children('#error').hide();

    var $rowForm = $('<form id="row" />').addClass('form-horizontal').appendTo(root);

    $rowIdControl.focus(function () {

        $errorMsg.hide();
    });

    $getRowButton.click(function (e) {

        e.preventDefault();
        $rowForm.empty();

        _key = $rowIdControl.val();
        vmGetTableRowInfo(table.name, _key).done(function (row) {

            var controlGroup = $('<div />').addClass('control-group');
            for (field in row) {

                if (field != '@odata.context') {
                    var controlsControlGroup = controlGroup.clone().appendTo($rowForm);

                    $('<label />').addClass('control-label').text(field+":")
                        .appendTo(controlsControlGroup);

                    var fieldProperties = $.grep(table.fields, function (e) {
                        return e.name == field;
                    })[0];


                    var input;

                    if (field != table.key) {

                        var createField;
                        switch (fieldProperties.type) {

                            case 'Edm.Int32':

                                createField = vmCreateFieldInt32;
                                break;

                            case 'Edm.Single':

                                createField = vmCreateFieldSingle;
                                break;

                            case 'Edm.String':

                                createField = vmCreateFieldString;
                                break;

                            case 'Edm.Date':

                                createField = vmCreateFieldDate;
                                break;

                            case 'Edm.DateTimeOffset':

                                createField = vmCreateFieldDateTimeOffset;
                                break;

                            case 'Edm.Boolean':

                                createField = vmCreateFieldBoolean;
                                break;

                            case 'Edm.Binary':
                                
                                createField = vmCreateFieldBinary;
                                break;
                        }

                        // create field
                        var input = createField(fieldProperties, row[field]);

                        input.attr('required', fieldProperties.mandatory)
                             .appendTo(controlsControlGroup);

                        if (input.attr('data-type') != 'Edm.DateTimeOffset') {

                            input.on('change', function () {

                                vmUpdateRow(table, _key, $(this));
                            });
                        }


                        var state = $('<span class="state" />').appendTo(controlsControlGroup).hide();

                        table.fields.each(function (i, item) {

                            if (item.name == field) {
                                item.input = input;
                                item.state = state;
                            };
                        });

                    }else {

                        $('<p class="not-editable-field" />').text(row[field])
                            .appendTo(controlsControlGroup);

                    };
                    
                };

            };

        }).fail(function () {

            $errorMsg.show();
        });

    });

    function vmCreateFieldInt32(properties, value) {

        return $('<input />').addClass('form').attr({
            'type': 'number',
            'data-type': properties.type
        })
        .val(value);
    };

    function vmCreateFieldSingle(properties, value) {

        return $('<input />').addClass('form').attr({
            'type': 'number',
            'step': '0.0000000001',
            'data-type': properties.type
        })
        .val(value);
    };

    function vmCreateFieldString(properties, value) {

        var input = $('<input />').addClass('form')
            .attr({
                'type': 'text'
            })
            .val(value);

        if (properties.maxlength && properties.maxlength > 0)
            input.attr('maxlength', properties.maxlength);

        return input;
    };

    function vmCreateFieldDate(properties, value) {

        var input = $('<input />').addClass('form')
            .attr({
                'type': 'text',
                'data-type': properties.type
            })
            .val(value)
            .datepicker({
                dateFormat: 'yy-mm-dd'
            });

        return input;
    };

    function vmCreateFieldDateTimeOffset(properties, value) {

        var myControl = {
            create: function (tp_inst, obj, unit, val, min, max, step) {
                $('<input type="text" class="ui-timepicker-input" value="' + val + '" style="width:80%">')
                    .appendTo(obj)
                    .spinner({
                        min: 0,
                        max: unit == 'hour' ? 23 : 59,
                        step: step,
                        change: function (e, ui) { // key events
                            // don't call if api was used and not key press
                            if (e.originalEvent !== undefined) {

                                tp_inst._onTimeChange();
                            }

                            if (tp_inst.hour && tp_inst.hour > 23)
                                tp_inst.hour = 23;
                            if (tp_inst.minute && tp_inst.minute > 59)
                                tp_inst.minute = 59;
                            if (tp_inst.second && tp_inst.second > 59)
                                tp_inst.second = 59;

                            tp_inst._onSelectHandler();
                        },
                        spin: function (e, ui) { // spin events
                            tp_inst.control.value(tp_inst, obj, unit, ui.value);
                            tp_inst._onTimeChange();
                            tp_inst._onSelectHandler();
                        }
                    });
                return obj;
            },
            options: function (tp_inst, obj, unit, opts, val) {
                if (typeof (opts) == 'string' && val !== undefined)
                    return obj.find('.ui-timepicker-input').spinner(opts, val);
                return obj.find('.ui-timepicker-input').spinner(opts);
            },
            value: function (tp_inst, obj, unit, val) {
                if (val !== undefined) {

                    unit == 'hour' ? (val > 23 ? val = 23 : val = val) : (val > 59 ? val = 59 : val = val);

                    return obj.find('.ui-timepicker-input').spinner('value', val);
                }

                return obj.find('.ui-timepicker-input').spinner('value');
            }
        };

        var input = $('<input type="text"/>').addClass('form');

        var _input = input.attr({
            'required': properties.mandatory,
            'data-type': properties.type
            })
            .datetimepicker({
                defaultDate: new Date(value),
                dateFormat: 'yy-mm-dd',
                timeFormat: 'HH:mm:ss',
                controlType: myControl,
                onClose: function (date) {

                    vmUpdateRow(table, _key, _input);
                },
            })
            .datetimepicker("setDate", new Date(value));

        return input;
    };

    function vmCreateFieldBoolean(properties, value) {

        return $('<input type="checkbox" class="bool-checkbox"/>').attr('checked', Boolean(value));
    };

    function vmCreateFieldBinary(properties, value) {

        var input = $('<input type="file" name="file" id="file" class="inputfile" />').attr({ 'data-type': properties.type });
        var label = $('<label for="file" class="btn" disabled>Choose a file</label>');

        var data = 'data:application/octet-stream;base64,' + value;
        var link = $('<a>Load</a>').attr('href', data);

        return input.add(label).add(link);
    };
}

function vmGetTableRowInfo(table, key) {

    // call service action
    return $.ajax({
        url: serviceUrl + table + '(' + key + ')',
        type: "GET",
        contentType: "application/json"
    });
};

function vmUpdateRow(table, id, input) {

    var updatedField = $.grep(table.fields.toArray(), function (e) {

        if (e.input)
            return e.input[0] == input[0];

    })[0];

    var state = updatedField.state.show(0).text('saving...');

    var data = table.fields
                   .toArray()
                   .filter(function (x) {
                       return x.name != table.key;
                      }
                   )
                   .reduce(function (p, n) {

                       if (n.input.attr('type') == 'checkbox')
                           p[n.name] = n.input.is(':checked');
                       
                       else if (n.input.attr('type') == 'file') {

                           var file = $('#file').get(0).files;

                           if (file.length > 0) {
                               
                               var reader = new FileReader();

                               p[n.name] = reader.readAsDataURL(file);
                           }
                       }
                       else {
                           if (n.input.attr('data-type') == 'Edm.DateTimeOffset') {

                               var time = getTimeToUpdate(n.input.val());
                               p[n.name] = '{0}-{1}-{2}T{3}:{4}:{5}.000Z'.format(time.year, time.month, time.day, time.hour, time.minute, time.second);
                           }
                           else {

                               // get value from input
                               // if field is optional than set null for empty
                               var val = n.input.val();
                               if (!n.mandatory && val == '')
                                   val = null;

                               p[n.name] = val;
                           }                               
                       }                           

                       return p;

                   }, {});
    
    return $.ajax({
        url: serviceUrl + table.name + '(' + id + ')',
        type: "PUT",
        data: JSON.stringify(data),
        contentType: "application/json;odata=verbose"
    })
    .done(function () {
      
        state.addClass('success').text('saved').delay(5000).fadeOut(1000);
    })
    .fail(function (err) {

        state.addClass('failed').text('failed');

        handleError(err);
    });

}
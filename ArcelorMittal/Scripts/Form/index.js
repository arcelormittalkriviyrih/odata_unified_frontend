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

                        switch (fieldProperties.type) {

                            case 'Edm.Int32':

                                input = $('<input />').addClass('form').attr({
                                    'type': 'number',
                                    'required': fieldProperties.mandatory
                                })
                                .val(row[field]);

                                break;

                            case 'Edm.Single':

                                input = $('<input />').addClass('form').attr({
                                    'type': 'number',
                                    'step': '0.0000000001'
                                })
                                .val(row[field]);
                                break;

                            case 'Edm.String':

                                input = $('<input />').addClass('form').attr({
                                    'type': 'text',
                                    'required': fieldProperties.mandatory
                                })
                                .val(row[field]);

                                if (fieldProperties.maxlength && fieldProperties.maxlength > 0)
                                    input.attr('maxlength', fieldProperties.maxlength);

                                break;

                            case 'Edm.Date':

                                input = $('<input />').addClass('form')
                                .attr('type', 'text')
                                .val(row[field])
                                .datepicker({
                                    dateFormat: 'yy-mm-dd'
                                });
                                break;

                            case 'Edm.Boolean':

                                input = $('<input type="checkbox" class="bool-checkbox"/>')
                                            .attr('checked', Boolean(row[field]));

                                break;

                            case 'Edm.Binary':

                                input = $('<input type="file" name="file" id="file" class="inputfile" /><label for="file" class="btn" disabled>Choose a file</label>');

                                break;
                        }

                        input.attr('required', fieldProperties.mandatory)
                             .appendTo(controlsControlGroup).on('change', function () {

                                 vmUpdateRow(table, _key, $(this));

                             });

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
                   .filter(x =>x.name!= table.key)
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
                       else
                           p[n.name] = n.input.val();

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
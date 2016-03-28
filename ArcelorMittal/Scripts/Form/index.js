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

            vmBuildForm(table);

        });
};

function vmBuildForm(table) {

    console.log(table);
    // clear form
    var $form = $('form#form').show();

    var $rowIdControl = $('input#rowId');
    var $getRowButton = $('button#getRow');
    var $errorMsg = $('#error').hide();

    var $rowForm = $('form#row').empty();

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

                    $('<label />').addClass('control-label').text(field)
                        .appendTo(controlsControlGroup);

                    var input = $('<input />').addClass('form').attr('type', 'text')
                        .val(row[field])
                        .appendTo(controlsControlGroup);

                    table.fields.each(function (i, item) {

                        if (item.name == field)
                            item.input = input;
                    })
                }                

            };

            var controlsSubmitGroup = controlGroup.clone().appendTo($rowForm);

            $('<button />').attr('id', 'update-row').addClass('btn offset4').text('Update')
                            .appendTo(controlsSubmitGroup)
                            .click(function (e) {

                                e.preventDefault();
                                
                                vmUpdateRow(table, _key).done(function () {

                                    alert('row is updated!')
                                }).fail(function () {

                                    alert('update is failed')
                                });
                            })

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

function vmUpdateRow(table, id) {

    var data = table.fields
                   .toArray()
                   .reduce(function (p, n) {

                       p[n.name] = n.input.val();
                       return p;

                   }, {});
    
    return $.ajax({
        url: serviceUrl + table.name + '(' + id + ')',
        type: "PUT",
        data: JSON.stringify(data),
        contentType: "application/json;odata=verbose"
    })
    .fail(function () {
        alert('Update failed');
    });

}
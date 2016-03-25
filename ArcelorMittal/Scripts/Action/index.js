$(function () {

    vmGetMetadata()
        .done(function (metadata) {

            // read actions from metadata
            var actions = vmGetActions(metadata);

            // populate item list
            vmPopulateList(actions);
        });
});

function vmLoadItem(name) {

    console.log('> Loading action: ' + name);

    vmGetMetadata()
        .done(function (metadata) {

            // find action by name
            var action = vmGetActions(metadata).filter(function (ind, action) {

                return action.name == name;
            })
            .get(0);

            vmBuildForm(action);
        });
};

function vmBuildForm(action) {

    // clear form
    var $form = $('form#action').empty();

    var controlGroup = $('<div />').addClass('control-group');
                                    
    // build fields
    action.fields.each(function (ind, field) {

        var controlsControlGroup = controlGroup.clone().appendTo($form);

        $('<label />').addClass('control-label').text(field.name)
            .appendTo(controlsControlGroup);

        field.input = $('<input />').addClass('form').attr('type', 'text')
            .appendTo(controlsControlGroup);
    });

    var controlsSubmitGroup = controlGroup.clone().appendTo($form);

    // create submit button
    $('<button />').addClass('btn offset4').text('Run')
        .appendTo(controlsSubmitGroup)
        .click(function () {

            vmCallAction(action)

                .done(function (result) {
                    alert('Success: ' + result.value);
                })
                .fail(function () {

                    alert('Action failed');
                });

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

    // call service action
    return $.ajax({
        url: serviceUrl + action.name,
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json"
    })
};
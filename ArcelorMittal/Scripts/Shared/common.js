//var serviceUrl = '../../ODataWebApp/api/Static/';
var serviceUrl = '../../ODataRestierDynamic/api/Dynamic/';
var interval = 300000; //grid auto refresh interval (5 min)
var _intervalID; //initiate interval ID

$(function () {

    // if there is table name in hash
    if (location.hash) {

        // get item name from hash value
        var item = location.hash.replace('#', '');

        // load item by hash
        vmLoadItem(item); 
    };

    //build grid from tables list    
    $("ul#item_list").on("click", "a", function (e) {

        //cancelling standard behavior of web link element
        e.preventDefault();

        // get item name
        var item = $(this).attr('href');

        // set hash value as current selected item
        location.hash = item;

        vmLoadItem(item);

        if (_intervalID)
            clearInterval(_intervalID);
    });

    $('div#grid').on("click", "*", function (e) {

        if (_intervalID)
            clearInterval(_intervalID);
    });

    $('div#grid').on('grid_is_loaded', function (e, table) {

        autoRefreshGrid(table, interval);
    });

});

function vmGetMetadata() {

    // get metadata xml by service url
    // service requires user credentials
    return $.ajax({
                url: serviceUrl + '$metadata',
                xhrFields: {
                    withCredentials: true
                }
            })            
            // show alert message in case of error
            .error(function () {
                alert('failed to read metadata');
            });
};

function vmReadTable(table) {

    return $.ajax({
        url: serviceUrl + table,
        dataType: "json"
    });
};

function vmGetActions(metadata) {

    // find actions (action information)
    // in metadata xml file
    return $(metadata).find('Action')
                .map(function (ind, entity) {

                    var fields = $(entity).find('Parameter')
                                        .map(function (idx, param) {

                                            return {
                                                name: $(param).attr('Name'),
                                                type: $(param).attr('Type'),
                                                maxlength: $(param).attr('MaxLength'),
                                                mandatory: $(param).attr('Nullable') ? true : false
                                            };
                                        });

                    return {
                        name: $(entity).attr('Name'),
                        fields: fields
                    };
                });
};

function vmGetTables(metadata) {

    // find entities (table information)
    // in metadata xml file
    return $(metadata).find('EntityType')
                .map(function (ind, entity) {

                    var fields = $(entity).find('Property')
                                    .map(function (idx, param) {

                                        return {
                                            name: $(param).attr('Name'),
                                            type: $(param).attr('Type'),
                                            maxlength: $(param).attr('MaxLength'),
                                            mandatory: $(param).attr('Nullable') ? true : false
                                        };
                                    });

                    var key = $(entity).find('Key')
                                    .children('PropertyRef')
                                    .attr('Name');

                    return {
                        name: $(entity).attr('Name'),
                        key: key,
                        fields: fields
                    };
                });
};

function vmPopulateList(items) {

    var $ul = $('ul#item_list').empty();

    items.each(function (ind, item) {

        var $li = $('<li />').appendTo($ul);

        $('<a />').attr('href', item.name)
            .text(item.name)
            .appendTo($li);
    });
};

function vmLoadItem(name) {

    // empty function
    // should be overriden
    // with specific load case
};

//method for finding last child object in JSON
//uses for finding most priorited 
function getLastChild(obj, parents, child) {

    var message = null;

    parents.forEach(function (parent) {

        if (obj.hasOwnProperty(parent)) {
            message = getLastChild(obj[parent], parents, child);
        }
    })

    return message || obj[child];

};

//method for handling AJAX errors
function handleError(err) {

    err = JSON.parse(err.responseText);
    var msg = getLastChild(err, ['error', 'innererror', 'internalexception'], 'message');
    alert(msg);
}

function getTimeToUpdate(time) {

    var date = new Date(time);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();

    return {

        year: year,
        month: addZero(month),
        day: addZero(day),
        hour: addZero(hour),
        minute: addZero(minute),
        second: addZero(second)
    }
}

function addZero(item) {

    if (item < 10)
        return item = '0' + item;
    else
        return item;

}

//add bootstrap class to buttons 'now' and 'done' in datetimepicker
function addBootstrapClassToControls(input) {
    setTimeout(function () {
        var btn = $(input).datepicker("widget").find(".ui-datepicker-buttonpane button");

        btn.each(function (i, btn) {

            $(btn).addClass('btn');
        })
    }, 1)
}

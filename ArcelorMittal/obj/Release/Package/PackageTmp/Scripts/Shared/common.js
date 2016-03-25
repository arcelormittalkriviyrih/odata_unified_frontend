var serviceUrl = '../../ODataWebApp/api/Static/';
var interval = 5000; //grid auto refresh interval (30 sec)
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
                                                mandatory: $(param).attr('Nullable')
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
                                            mandatory: $(param).attr('Nullable')
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

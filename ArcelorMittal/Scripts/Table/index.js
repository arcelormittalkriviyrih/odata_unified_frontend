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

            vmBuildGrid(table);

            $("div#grid").trigger('grid_is_loaded', table);
        });
};

function vmBuildGrid(table) {

    var fields = table.fields
                    .map(function (ind, item) {

                        var field = {
                            name: item.name,
                            width: vmGetWidth(item.name),
                            maxlength: item.maxlength,
                        };

                        var validatorString = {
                            validator: "maxLength",
                            param: item.maxlength
                        };

                        switch (item.type) {

                            case 'Edm.Int32':
                                field.type = 'number';

                                if (item.mandatory == true)
                                    field.validate = 'required';

                                break;

                            case 'Edm.Single':
                                field.type = 'floatNumber';

                                if (item.mandatory == true)
                                    field.validate = 'required';

                                break;

                            case 'Edm.String':
                                field.type = 'text';

                                if (item.mandatory == true && field.maxlength > 0) 
                                    field.validate = ['required', validatorString]
                                
                                if (item.mandatory == true && field.maxlength == 0)
                                    field.validate = 'required';

                                if (item.mandatory == false && field.maxlength > 0)
                                    field.validate = validatorString;

                                break;

                            case 'Edm.Date':
                                field.type = 'date';

                                if (item.mandatory == true)
                                    field.validate = 'required';

                                break;

                            case 'Edm.DateTimeOffset':
                                field.type = 'dateTime';

                                if (item.mandatory == true)
                                    field.validate = 'required';

                                break;

                            case 'Edm.Boolean':

                                field = {
                                    name: item.name,
                                    autosearch: true,
                                    type: "select",
                                    items: [
                                         { Name: "", Id: "" },
                                         { Name: 'false', Id: false },
                                         { Name: 'true', Id: true },
                                    ],
                                    valueField: "Id",
                                    textField: "Name"
                                };

                                if (item.mandatory == true)
                                    field.validate = 'required';

                                break;
                        };

                        return field;
                    });

    fields.push({ type: "control" });    

    // clear grid component
    // create jsGrid
    $('div#grid').empty()
                .jsGrid({
                    height: "500px",
                    width: "1000px",

                    sorting: false,
                    paging: true,
                    editing: true,
                    filtering: true,
                    autoload: true,
                    pageLoading: true,
                    inserting: true,
                    pageIndex: 1,
                    pageSize: 10,

                    controller: {
                        loadData: loadData,
                        insertItem: insertItem,
                        updateItem: updateItem,
                        deleteItem: deleteItem
                    },

                    fields: fields
                });   

    //$.extend(jsGrid.Grid.prototype, {
    //    red: function () {
    //        console.log('red');
    //    }
    //});

    //$grid.jsGrid('red');

    function loadData(filter) {

        var data = {
            $filter: vmGetFilter(filter, fields),
            $count: true,
            $top: filter.pageSize,
            $skip: (filter.pageIndex - 1) * filter.pageSize
        };
       
        return $.ajax({
            url: serviceUrl + table.name,
            dataType: "json",
            data: data,
        }).then(function (response) {

            return {
                itemsCount: response['@odata.count'],
                data: response.value
            };
        });
    };

    function vmGetFilter(conditions, fields) {

        var filter = [];
       
        for (field in conditions)
            if (conditions[field]) {

                var field = fields.toArray().find(function (x) {
                    return x.name == field
                });

                if (field && field.type) {
                    if (field.type == 'text')
                        filter.push("contains({0},'{1}')".format(field.name, conditions[field.name]));

                    else if (field.type == 'date') {

                        getDateFilterParams(['year', 'month', 'day'], filter, field, new Date(conditions[field.name]));
                    }

                    else if (field.type == 'dateTime') {

                        getDateFilterParams(['year', 'month', 'day', 'hour', 'minute', 'second'], filter, field, new Date(conditions[field.name]));
                    }
                        
                    else if (field.type == 'number' || field.type == 'select')
                        filter.push("{0} eq {1}".format(field.name, conditions[field.name]));

                    else if (field.type == 'floatNumber')
                        filter.push("{0} eq {1}f".format(field.name, conditions[field.name]));
                    else
                        alert('Filtering by {0} not supported'.format(field.type));
                }               
            };

        return filter.length > 1 ? filter.join(' and ') : filter[0];
    };

    function insertItem(item) {

        var isEmpty = isEmptyRow(item);
        
        if (!isEmpty && (item[table.key] != 0 || item[table.key] != '')) {

            return $.ajax({
                url: serviceUrl + table.name,
                type: "POST",
                data: JSON.stringify(item),
                contentType: "application/json;odata=verbose"
            })
            .fail(
                handleError);
        }
        else if (item[table.key] == 0 || item[table.key] == '') {

            alert('you cannot push empty ' + table.key + ' field!');
        }
        else {
            alert('You cannot push empty row!');
        }
        
    };

    function updateItem(item) {

        var id = item[table.key];

        return $.ajax({
            url: serviceUrl + table.name + '(' + id + ')',
            type: "PUT",
            data: JSON.stringify(item),
            contentType: "application/json;odata=verbose"
        })
        .fail(handleError);
    };

    function deleteItem(item) {

        var id = item[table.key];

        return $.ajax({
            type: "DELETE",
            url: serviceUrl + table.name + '(' + id + ')'
        })
        .fail(handleError);
    };    
};

function isEmptyRow(row) {

    var isEmpty = true;

    for (prop in row) {

        if (row[prop] != 0 || row[prop] != '')
            isEmpty = false;
    }

    return isEmpty;
}

function vmGetWidth(name) {
    return getTextWidth(name, "regular 14pt Helvetica")+20;
    /*if (name.length <= 15)
        return "150px"
    else if (name.length > 15 && name.length <= 25)
        return "220px"
    else if (name.length > 25 && name.length <= 35)
        return "250px"
    else
        return "300px"*/
}

/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 * 
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 * 
 * @see http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
function getTextWidth(text, font) {
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
};

function autoRefreshGrid(table, interval) {

    //set interval and every interval time
    //read current situation for table data
    _intervalID = setInterval(function () {

        vmBuildGrid(table);
        console.log('>refresh');
    }, interval);
};

function getDateFilterParams(timeProperties, filter, field, time) {

    var date = getTimeToUpdate(time);

    for (var i in date) {

        if (timeProperties.indexOf(i) > -1) {

            filter.push("{0}({1}) eq {2}".format(i, field.name, date[i].toString()));
        }            
    }
}








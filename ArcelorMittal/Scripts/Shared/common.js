var domainURL = '../../odata_unified_svc';
//var domainURL = 'http://mssql2014srv/odata_unified_svc';
var serviceUrl = domainURL + '/api/Dynamic/';
var sapUrl = '../../odata_sap_svc/GetSAPInfo?orderNo=';
var interval = 5000; //grid auto refresh interval (5 sec)
var _intervalID; //initiate interval ID
var scalesRefresh = 1000; //scales autorefresh interval (1 sec)
var workRequestRefresh = 1000; //last Work Refresh for scales;
var dropBoxTmpl = '<div class="dropdown form-control">' +
                                       '<div class="dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">' +
                                       '<input type="text" class="dropdown-input" id="{0}" />' +
                                       '<input type="hidden" id="{1}" data-parent="dropDown"/>' +
                                       '<span class="caret"></span>' +
                                       '</div>' +
                                       '<ul class="dropdown-menu" id="{2}" aria-labelledby="dropdownMenu1">' +
                                       '</ul>' +
                                       '</div>';
var dateTimePickerControl = {
    create: function (tp_inst, obj, unit, val, min, max, step) {
        $('<input type="text" class="ui-timepicker-input form-control" value="' + val + '" style="width:80%">')
            .appendTo(obj)
            .spinner({
                min: 0,
                max: unit == 'hour' ? 23 : 59,
                step: step,
                change: function (e, ui) { // key events
                    // don't call if api was used and not key press
                    if (e.originalEvent !== undefined)
                        tp_inst._onTimeChange();

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

            if (unit == 'hour') {

                if (val > 23)
                    val = 23;
            } else {

                if (val > 59)
                    val = 59;
            }

            return obj.find('.ui-timepicker-input').spinner('value', val);
        }

        return obj.find('.ui-timepicker-input').spinner('value');
    }
};

jQuery.ajaxSetup({
    global: true,
    error: function (xhr, status, statusText) {

            $(document).trigger('ajaxError', {

                status: xhr.status,
                statusText: statusText,
                responseText: xhr.responseText
            });      
    }
});

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

    //set focus for element with autofocus attribute in IE 9
    $(document).delegate('.specialLabelMode', 'click', function () {

        $('.labelNumber').focus();
    });

    //set btn and btn-default bootstrap classes fot buttons in datepicker and datetimepicker component
    $("body").bind("DOMNodeInserted", function () {
        $(this).find('.ui-datepicker-current, .ui-datepicker-close').addClass('btn btn-default');
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

function getTimeToUpdate(time, toUTC) {

    var date, year, month, day, hour, minute, second;


    if (time)
        date = new Date(time);
    else
        date = new Date();

    if (toUTC) {

        year = date.getUTCFullYear();
        month = date.getUTCMonth() + 1;
        day = date.getUTCDate();
        hour = date.getUTCHours();
        minute = date.getUTCMinutes();
        second = date.getUTCSeconds();
    } else {

        year = date.getFullYear();
        month = date.getMonth() + 1;
        day = date.getDate();
        hour = date.getHours();
        minute = date.getMinutes();
        second = date.getSeconds();
    }

    

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

//change active row in grid
function vmActiveRow(args) {

    var $tr = $(args.event.currentTarget);

    $tr.addClass('active-row');
    $tr.siblings('tr').removeClass('active-row');

}

function vmCheckRequiredFields(form) {

    var unFilledFields = form.find('input, select')
                            .filter("[required]")
                            .filter(function () { return this.value == ''; })

    if (unFilledFields.length > 0) {

        vmShowUnfilledRequiredFields(form, unFilledFields);
        return false;
    } else return true;
}

function vmShowUnfilledRequiredFields(form, unFilledFields) {

    unFilledFields.each(function (i, item) {

        if ($(item).attr('data-parent') == 'dropDown') {

            form.find('.dropdown').addClass('wrong');
        } else
            $(item).addClass('wrong');

    });
}

function vmSort(property, a, b) {

    if (a[property] < b[property])
        return -1;
    else if (a[property] > b[property])
        return 1;
    else
        return 0;
}

function vmGetChunks(arr, chunkSize) {
    var groups = [], i;
    for (i = 0; i < arr.length; i += chunkSize) {
        groups.push(arr.slice(i, i + chunkSize));
    }
    return groups;
}

//show selected rows when we use pagination
function vmShowSelectedRows(args, list, key, property) {

    var selectedRowsList = [];

    var data = args.data.data.filter(function (item) {

        if (list.indexOf(item[key]) > -1)
            return item[key]

    });

    if (data.length > 0) {
        data = data.map(function (item) {
            return item[property]
        }).forEach(function (item) {

            var row = args.grid._body.find('td:contains("{0}")'.format(item))
                                     .parent().addClass('selected-row');

            selectedRowsList.push(row);
        });

        return selectedRowsList;
    };
}

//set active row as selected in ctrl or shift mode
function vmChangeActiveRowToSelected(container, tr) {

    tr.toggleClass('selected-row');

    container.find('tr.active-row')
             .removeClass('active-row')
             .addClass('selected-row');
}

//in shift mode we work with next data:
//array of extreme selected rows between which we must select all
//array of extreme item ID.  
function vmPushDataShift(container, currentTr, intervalLabelNumbers, intervalSelectedRows, data, labelList) {

    var rows = container.find('tr.jsgrid-row, tr.jsgrid-alt-row');
    rows = rows.toArray();

    var index = rows.indexOf(currentTr);
    var selectedRowData = data[index];

    if (selectedRowData) {

        intervalLabelNumbers.push(selectedRowData.ID);
        intervalSelectedRows.push(index);

        intervalSelectedRows.sort();
        intervalLabelNumbers.sort();
    };

    if (intervalLabelNumbers.length == 2 && intervalSelectedRows.length == 2) 
        fillShiftedData(data, rows, intervalSelectedRows, intervalLabelNumbers, labelList);
    
};

//fill list of labels in shift mode
function fillShiftedData(data, rows, intervalSelectedRows, intervalLabelNumbers, labelList) {

    rows.forEach(function (row, i) {

        if (i > intervalSelectedRows[0] && i < intervalSelectedRows[1])
            $(row).addClass('selected-row');
    });

    data.forEach(function (item) {

        if (item.ID > intervalLabelNumbers[0] && item.ID < intervalLabelNumbers[1]) {

            labelList.push(item.ID);
        };
    });

    intervalLabelNumbers.shift();
    intervalSelectedRows.shift();

    labelList = labelList.unique();
}

function groupBy(array, f) {
    var groups = {};
    array.forEach(function (item) {
        var group = JSON.stringify(f(item));
        groups[group] = groups[group] || [];
        groups[group].push(item);
    });
    return Object.keys(groups).map(function (group) {
        return groups[group];
    })
}

function vmLoadStaticData(filter, data) {

    var dataFilter = data;

    var d = $.Deferred();

    if (filter) {
        for (var i in filter) {

            if (filter[i])
                dataFilter = dataFilter.filter(function (item) {

                    if (item[i]) {

                        if (typeof item[i] == 'number')
                            return item[i] == filter[i]
                        else if (typeof item[i] == 'string')
                            return item[i].toString().indexOf(filter[i]) > -1

                    } else return false;
                });
        };
    };

    d.resolve(dataFilter);

    return d.promise();
}


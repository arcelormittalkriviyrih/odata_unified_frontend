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

    // clear grid
    var $grid = $('div#grid').empty();

    _$grid = $grid;

    var fields = table.fields
                    .map(function (ind, item) {

                        var field = {
                            name: item.name,
                            width: vmGetWidth(item.name)
                        };

                        switch (item.type) {

                            case 'Edm.Int32':
                                field.type = 'number';
                                break;
                            case 'Edm.String':
                                field.type = 'text';
                                break;
                        };

                        return field;
                    });

    fields.push({ type: "control" });

    $grid.jsGrid({
        height: "500px",
        width: "1000px",

        sorting: true,
        paging: true,
        editing: true,
        filtering: true,
        autoload: true,
        pageLoading: true,
        inserting: true,
        pageIndex: 1,
        pageSize: 5,

        controller: {
            loadData: loadData,
            insertItem: insertItem,
            updateItem: updateItem,
            deleteItem: deleteItem
        },

        fields: fields
    });   

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
                    else if (field.type == 'number')
                        filter.push("{0} eq {1}".format(field.name, conditions[field.name]));
                    else
                        alert('Filtering by {0} not supported'.format(field.type));
                }               
            };

        return filter.length > 1 ? filter.join(' and ') : filter[0];
    };

    function insertItem(item) {

        return $.ajax({
            url: serviceUrl + table.name,
            type: "POST",
            data: JSON.stringify(item),
            contentType: "application/json;odata=verbose"
        })
        .fail(function () {
            alert('Insert failed');
        });
    };

    function updateItem(item) {

        var id = item[table.key];

        return $.ajax({
            url: serviceUrl + table.name + '(' + id + ')',
            type: "PUT",
            data: JSON.stringify(item),
            contentType: "application/json;odata=verbose"
        })
        .fail(function () {
            alert('Update failed');
        });
    };

    function deleteItem(item) {

        var id = item[table.key];

        return $.ajax({
            type: "DELETE",
            url: serviceUrl + table.name + '(' + id + ')'
        })
        .fail(function () {
            alert('Delete failed');
        });
    };    
};

function vmGetWidth(name) {

    if (name.length <= 15)
        return "150px"
    else if (name.length > 15 && name.length <= 25)
        return "220px"
    else if (name.length > 25 && name.length <= 35)
        return "250px"
    else
        return "300px"
}

function autoRefreshGrid(table, interval) {

    //set interval and every interval time
    //read current situation for table data
    _intervalID = setInterval(function () {

        vmBuildGrid(table);
        console.log('>refresh');
    }, interval);
}






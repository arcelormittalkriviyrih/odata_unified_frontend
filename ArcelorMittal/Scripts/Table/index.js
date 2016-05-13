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

    $('div#grid')
            .empty()
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

            }).jsGrid('initOdata', {
                serviceUrl: serviceUrl,
                table: name,
                defaultFilter: '',
                autoRefresh: 5000
            });
};









(function ($) {
    jQuery.fn.odataPlotLine = function (options) {

        var self = this,
            serviceUrl = options.serviceUrl,
            tableName = options.table,
            keys = options.keys,
            navigationBar = $('<div />').attr('id', 'navigationBar').appendTo(self),

            mainButtonsRoot = $('<div />').addClass('createNodeControls').appendTo(navigationBar),

            dateBegin = $('<input />').attr({
                'id': 'dateBegin',
                'type': 'text'
            }).datepicker().appendTo(mainButtonsRoot),

            dateEnd = $('<input />').attr({
                'id': 'dateEnd',
                'type': 'text'
            }).datepicker().appendTo(mainButtonsRoot),

            selScales = $('<select />').attr({
                'id': 'selScales'
            })
                                        .append('<option value="1">Ваги № 1</option>')
                                        .append('<option value="2">Ваги № 2</option>')
                                        .appendTo(mainButtonsRoot),

            refreshBtn = $('<button />').attr('id', 'refresh')
                                        .addClass('btn')
                                        .append('<i class="icon-refresh"></i>')
                                        .appendTo(mainButtonsRoot)
                                        .on('click', vmRefresh),
            plot = $('<div />').attr({
                'id': 'plot'
            }).appendTo(mainButtonsRoot),

        plotLine = $.jqplot('plot', [], {
            title: 'Line Data Renderer',
            dataRenderer: function () {
                var ret = [[0]];
                return ret;
            }
        });


        $.ajax({
            url: serviceUrl + tableName,
            xhrFields: {
                withCredentials: true
            }
        }).then(function (data) {

            vmInit(data);
        });

        function vmInit(data) {
            
        };

        function vmCreate() {
            navigationBar.show();
            mainButtonsRefresh.show();
        };

        function vmRefresh() {
            var filter = '$top=20&$orderby=WEIGHT__FIX_TIMESTAMP&$filter=WEIGHT__FIX_TIMESTAMP%20ge%20' + dateBegin.val() +
                '%20and%20WEIGHT__FIX_TIMESTAMP%20le%20' + dateEnd.val() +
                '%20and%20WEIGHT__FIX_NUMERICID%20eq%20' + selScales.val();
            vmPlot('v_kep_logger_all_', filter);
        };

        function vmPlot(tableName, filter) {
            refreshBtn.attr('disabled', true);
            tableName = tableName || 'v_kep_logger_all_';
            filter = filter || '$top=20&$orderby=WEIGHT__FIX_TIMESTAMP%20desc';
            var odataUrl = serviceUrl || 'http://mssql2014srv/odata_unified_svc/api/Dynamic/';
            var dataJson = {};

            $.ajax({
                url: odataUrl + tableName + '?' + filter,   //'http://mssql2014srv/odata_unified_svc/api/Dynamic/v_kep_logger_all?$top=100',
                xhrFields: {
                    withCredentials: true
                },
                type: 'GET',
                data: {
                    format: 'json'
                },
                error: function (a, b, c) {
                    console.log('<p>vmPlotLine - An error has occurred</p>');
                    refreshBtn.attr('disabled', false);
                },
                dataType: 'json',
                success: function (data) {
                    dataJson = data;
                }
            }).then(function () {
                var ret = [[]];
                for (var i = 0; i <= dataJson.value.length - 1; i++) {
                    ret[0].push([i, dataJson.value[i].WEIGHT__FIX_VALUE]);
                    plotLine.data = ret;
                    plotLine.replot(ret);
                };
                refreshBtn.attr('disabled', false);
            });
        };

    };
})(jQuery);
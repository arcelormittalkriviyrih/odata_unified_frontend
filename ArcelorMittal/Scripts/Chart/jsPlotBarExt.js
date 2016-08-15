(function ($) {
    jQuery.fn.odataPlotBar = function (options) {

        var self = this,
            serviceUrl = options.serviceUrl,
            title = options.title,
            navigationBar = $('<div />').attr({ 'id': 'navigationBar' })
                                        .appendTo(self),

            mainButtonsRoot = $('<div />').addClass('createPlotLine')
                                          .appendTo(navigationBar),

            textBegin = $('<label />').text('Date begin')
                                      .appendTo(mainButtonsRoot),

            dateBegin = $('<input />').attr({
                'id': 'dateBegin',
                'type': 'text'
            })
                                      .datepicker({
                                          'dateFormat': 'yy-mm-dd',
                                          'firstDay': '1'
                                      })
                                      .appendTo(mainButtonsRoot),

            textBegin = $('<label />').text('Date begin')
                                      .appendTo(dateBegin),

            textEnd = $('<label />').text('Date end')
                                    .appendTo(mainButtonsRoot),

            dateEnd = $('<input />').attr({
                'id': 'dateEnd',
                'type': 'text'
            })
                                      .datepicker({
                                          'dateFormat': 'yy-mm-dd',
                                          'firstDay': '1'
                                      })
                                      .appendTo(mainButtonsRoot),

            textScales = $('<label />').text('Scales')
                                      .appendTo(mainButtonsRoot),

            selScales = $('<select />').attr({ 'id': 'selScales' })
                                       .append('<option value="1">Scales 1</option>')
                                       .append('<option value="2">Scales 2</option>')
                                       .appendTo(mainButtonsRoot),

            refreshBtn = $('<button />').attr('id', 'refresh')
                                        .addClass('btn')
                                        .append('<span class="glyphicon glyphicon-refresh"></span>')
                                        .appendTo(mainButtonsRoot)
                                        .on('click', vmRefresh),
            plot = $('<div />').attr({ 'id': 'plot' })
                               .appendTo(mainButtonsRoot),

            plotBar = $.jqplot('plot', [[0]], {
                title: title,
                animate: !$.jqplot.use_excanvas,
                seriesDefaults: {
                    renderer: $.jqplot.BarRenderer,
                    rendererOptions: {
                       varyBarColor: true
                    },
                    pointLabels: {
                        show: true
                    }
                },
                axes: {
                    xaxis: {
                        renderer: $.jqplot.CategoryAxisRenderer
                   }
               },
               highlighter: {
                   show: false
               }
           });

        vmInit(options);

        function vmInit(data) {
            dateBegin.datepicker('option', $.datepicker.regional['uk']);
            dateEnd.datepicker('option', $.datepicker.regional['uk']);
            dateBegin.datepicker('setDate', new Date());
            dateEnd.datepicker('setDate', new Date());
            $.jqplot.config.enablePlugins = true;
        };

        function vmRefresh() {
            var startDate = $.datepicker.formatDate('yy-mm-dd', dateBegin.datepicker('getDate'));
            var finishDate = $.datepicker.formatDate('yy-mm-dd', dateEnd.datepicker('getDate')) + 'T23:59:59Z';
            var filter = '$top=100&$orderby=WEIGHT__FIX_TIMESTAMP&$filter=WEIGHT__FIX_TIMESTAMP%20ge%20' + startDate +
                '%20and%20WEIGHT__FIX_TIMESTAMP%20le%20' + finishDate +
                '%20and%20WEIGHT__FIX_NUMERICID%20eq%20' + selScales.val();
            vmPlot('v_kep_logger_all_', filter);
        };

        function vmPlot(tableName, filter) {
            refreshBtn.attr('disabled', true);
            tableName = tableName || 'v_kep_logger_all_';
            filter = filter || '$top=100&$orderby=WEIGHT__FIX_TIMESTAMP';
            var odataUrl = serviceUrl || 'http://mssql2014srv/odata_unified_svc/api/Dynamic/';
            var dataJson = {};

            $.ajax({
                url: odataUrl + tableName + '?' + filter,  
                xhrFields: {
                    withCredentials: true
                },
                type: 'GET',
                data: {
                    format: 'json'
                },
                error: function () {
                    console.log('<p>vmPlotBar - An error has occurred</p>');
                    refreshBtn.attr('disabled', false);
                },
                dataType: 'json',
                success: function (data) {
                    dataJson = data;
                }
            }).then(function () {
                var barValue = [];
                for (i = 0; i <= dataJson.value.length - 1; i++) {
                    barValue.push([dataJson.value[i].WEIGHT__FIX_TIMESTAMP, dataJson.value[i].WEIGHT__FIX_VALUE]);
                };

                plotBar.data = [barValue];
                plotBar.replot(barValue);
                refreshBtn.attr('disabled', false);
            });
        };

    };
})(jQuery);
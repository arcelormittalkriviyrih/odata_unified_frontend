(function ($) {
    jQuery.fn.odataPlotGauge = function (options) {

        var self = this,
            serviceUrl = options.serviceUrl,
            maxValue = options.maxValue,
            redValue = options.redValue,
            interval = options.interval || 5000,
            title = options.title,
            timerId = 0,
            navigationBar = $('<div />').attr({ 'id': 'navigationBar' })
                                        .appendTo(self),

            mainButtonsRoot = $('<div />').addClass('createPlotLine')
                                          .appendTo(navigationBar),

            textScales = $('<label />').text('Scales')
                                      .appendTo(mainButtonsRoot),

            selScales = $('<select />').attr({ 'id': 'selScales' })
                                       .append('<option value="1">Scales 1</option>')
                                       .append('<option value="2">Scales 2</option>')
                                       .on('change', vmRefresh)
                                       .appendTo(mainButtonsRoot),

            plot = $('<div />').attr({ 'id': 'plot' })
                               .appendTo(mainButtonsRoot),

           plotGauge = $.jqplot('plot', [[0]], {
               title: title,
               seriesDefaults: {
                   renderer: $.jqplot.MeterGaugeRenderer,
                   rendererOptions: {
                       min: 0,
                       max: maxValue,
                       intervals: [redValue, Math.round(redValue * 1.1), maxValue],
                       intervalColors: ['#66cc66', '#E7E658', '#cc6666'],
                       smooth: true,
                       animation: {
                           show: true
                       }
                   }
               }
           });

        vmRefresh();

        function vmRefresh() {
            var filter = '$filter=WEIGHT__FIX_NUMERICID%20eq%20' + selScales.val();
            clearInterval(timerId);
            timerId = setInterval(function replot() {
                vmPlot('v_kep_logger_top', filter);
            }, interval);
        };

        function vmPlot(tableName, filter) {
            var dataJson = {};

            $.ajax({
                url: serviceUrl + tableName + '?' + filter,   //'http://mssql2014srv/odata_unified_svc/api/Dynamic/v_kep_logger_all?$top=1&$orderby=WEIGHT__FIX_TIMESTAMP%20desc',
                xhrFields: {
                    withCredentials: true
                },
                type: 'GET',
                data: {
                    format: 'json'
                },
                error: function (request) {
                    console.log(request.responseText + '<p>getPlotGauge - An error has occurred</p>');
                },
                dataType: 'json',
                success: function (data) {
                    dataJson = data;
                }
            }).then(function () {
                ret = [dataJson.value[0].WEIGHT__FIX_VALUE];
                plotGauge.series[0].data[0] = [1, ret];
                plotGauge.replot();
            });
        };

    };
})(jQuery);
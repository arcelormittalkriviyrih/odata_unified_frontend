/* Written by Kozerenko Roman                                                                            */
/* Звернути увагу на те, що при великій кількості точок (> 1000) графік зливається в суцільну заливку    */
/* Час обробки даних суттєво збільшується, інформаційність графіка падає до нуля                         */
/* Тому потрібно вводити обмеження на кількість записів або виводити дані за період в хвилинах\годинах   */

(function ($) {
    jQuery.fn.odataPlotLine = function (options) {
            
        var self = this,
            serviceUrl = options.serviceUrl,
            title = options.title,
            navigationBar = $('<div />').attr({'id': 'navigationBar'})
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

            selScales = $('<select />').attr({'id': 'selScales'})
                                       .append('<option value="1">Scales 1</option>')
                                       .append('<option value="2">Scales 2</option>')
                                       .appendTo(mainButtonsRoot),

            refreshBtn = $('<button />').attr('id', 'refresh')
                                        .addClass('btn')
                                        .append('<span class="glyphicon glyphicon-refresh"></span>')
                                        .appendTo(mainButtonsRoot)
                                        .on('click', vmRefresh),
            plot = $('<div />').attr({'id': 'plot' })
                               .appendTo(mainButtonsRoot),

            plotLine = $.jqplot('plot', [], {
                title: title,
                dataRenderer: function () {
                    var ret = [[0]];
                    return ret;
                }
            });

        vmInit(options);

        function vmInit(data) {
            dateBegin.datepicker('option', $.datepicker.regional['uk']);
            dateEnd.datepicker('option', $.datepicker.regional['uk']);
            dateBegin.datepicker('setDate', new Date());
            dateEnd.datepicker('setDate', new Date());
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
                };
                plotLine.data = ret;
                plotLine.replot(ret);
                refreshBtn.attr('disabled', false);
            });
        };

    };
})(jQuery);
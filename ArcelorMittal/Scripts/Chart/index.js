function getPlotLine(tableName, filter) {
    tableName = tableName || 'v_kep_logger_all';
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
            console.log('<p>getPlotLine - An error has occurred</p>');
        },
        dataType: 'json',
        success: function (data) {
            dataJson = data;
        }
    }).then(function () {
        var plot1 = $.jqplot('Line', [], {
            title: 'Line Data Renderer',
            dataRenderer: function () {
                var ret = [[]];
                for (i = 0; i <= dataJson.value.length - 1; i++) {
                    ret[0].push([i, dataJson.value[i].WEIGHT__FIX_VALUE]);
                };
                return ret;
            }
        }
        );
    });
};

function getPlotAxis(tableName, filter) {
    tableName = tableName || 'v_kep_logger_all';
    filter = filter || '$top=10&$orderby=WEIGHT__FIX_TIMESTAMP';
    var odataUrl = serviceUrl || 'http://mssql2014srv/odata_unified_svc/api/Dynamic/';
    var dataJson = {};

    $.ajax({
        url: odataUrl + tableName + '?' + filter,   //'http://mssql2014srv/odata_unified_svc/api/Dynamic/v_kep_logger_all?$top=100',
        type: 'GET',
        xhrFields: {
            withCredentials: true
        },
        data: {
            format: 'json'
        },
        error: function () {
            console.log('<p>getPlotAxis - An error has occurred</p>');
        },
        dataType: 'json',
        success: function (data) {
            dataJson = data;
        }
    }).then(function () {
        var ret = [];
        for (i = 0; i <= dataJson.value.length - 1; i++) {
            ret.push([Date.parse(dataJson.value[i].WEIGHT__FIX_TIMESTAMP), dataJson.value[i].WEIGHT__FIX_VALUE]);
        };

        var plot2 = $.jqplot('Axis', [ret], {
            title: 'Customized Date Axis',
            axes: {
                xaxis: {
                    renderer: $.jqplot.DateAxisRenderer,
                    tickOptions: { formatString: '%b %#d, %#I %p' },
                    tickInterval: '1 day'
                }
            },
            series: [{ lineWidth: 4, markerOptions: { style: 'square' } }]
        });
    });
};

function getPlotBar(tableName, filter) {
    tableName = tableName || 'v_kep_logger_all_';
    filter = filter || '$top=100&$orderby=WEIGHT__FIX_TIMESTAMP';
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
        error: function () {
            console.log('<p>getPlotBar - An error has occurred</p>');
        },
        dataType: 'json',
        success: function (data) {
            dataJson = data;
        }
    }).then(function () {
        $.jqplot.config.enablePlugins = true;

        var barValue = [];
        var ticks = [];

        for (i = 0; i <= dataJson.value.length - 1; i++) {
            barValue.push(dataJson.value[i].WEIGHT__FIX_VALUE);
            ticks.push(dataJson.value[i].WEIGHT__FIX_TIMESTAMP);
        };

        plot1 = $.jqplot('Bar', [barValue], {
            title: 'Bar Data Renderer',
            animate: !$.jqplot.use_excanvas,
            seriesDefaults: {
                renderer: $.jqplot.BarRenderer,
                rendererOptions: {
                    // Set the varyBarColor option to true to use different colors for each bar.
                    // The default series colors are used.
                    varyBarColor: true
                },
                pointLabels: {
                    show: true
                }
            },
            axes: {
                xaxis: {
                    renderer: $.jqplot.CategoryAxisRenderer,
                    ticks: ticks
                }
            },
            highlighter: {
                show: false
            }
        });

        $('#chart1').bind('jqplotDataClick',
            function (ev, seriesIndex, pointIndex, data) {
                $('#info1').html('series: ' + seriesIndex + ', point: ' + pointIndex + ', data: ' + data);
            }
        );
    });
};

function getPlotGauge(interval, tableName, filter, redValue, maxValue) {
    interval = interval || 500;
    tableName = tableName || 'v_kep_logger_top';
    filter = filter || '$top=1&$orderby=WEIGHT__FIX_TIMESTAMP%20desc';
    maxValue = maxValue || 1000;
    redValue = redValue || 750;

    var odataUrl = serviceUrl || 'http://mssql2014srv/odata_unified_svc/api/Dynamic/'; 
    var ret = [0];
    var plotGauge = $.jqplot('Gauge', [ret], {
        title: 'Gauge Data Renderer',
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

    var dataJson = {};

    setInterval(function replot() {
        $.ajax({
            url: odataUrl + tableName + '?' + filter,   //'http://mssql2014srv/odata_unified_svc/api/Dynamic/v_kep_logger_all?$top=1&$orderby=WEIGHT__FIX_TIMESTAMP%20desc',
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
    }, interval);

};
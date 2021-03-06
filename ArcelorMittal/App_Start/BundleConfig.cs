﻿using System.Web.Optimization;

public class BundleConfig
{
    public static void RegisterBundles(BundleCollection bundles)
    {
        bundles.Add(new Bundle("~/bundles/js/vendor").Include(
            "~/scripts/vendor/bootstrap.min.js",
            "~/scripts/vendor/angular.min.js",
            "~/scripts/vendor/angular-ui-router.js",
            "~/scripts/vendor/angular-translate.min.js",
            "~/scripts/vendor/angular-sanitize.min.js",
            "~/scripts/vendor/jquery-2.2.3.min.js",
            "~/scripts/vendor/jquery-ui.min.js",
            "~/scripts/vendor/jquery-ui-timepicker-addon.js",
            "~/scripts/vendor/jsgrid.js",
            //"~/scripts/vendor/jstree.js",
            //"~/scripts/vendor/jstree.search.js",
            "~/scripts/vendor/jstree/jstree.min.js",
            "~/scripts/vendor/jstree/jstree.search.js",
            "~/scripts/vendor/jqplot/jquery.jqplot.min.js",
            "~/scripts/vendor/jqplot/plugins/jqplot.meterGaugeRenderer.js",
            "~/scripts/vendor/jqplot/plugins/jqplot.barRenderer.js",
            "~/scripts/vendor/jqplot/plugins/jqplot.dateAxisRenderer.js",
            "~/scripts/vendor/jqplot/plugins/jqplot.enhancedLegendRenderer.js",
            "~/scripts/vendor/jqplot/plugins/jqplot.highlighter.js",
            "~/scripts/vendor/dhtmlxscheduler.js",
            "~/scripts/vendor/dhtmlxscheduler_year_view.js",
            "~/scripts/vendor/select.js",
            "~/scripts/vendor/moment.js"
            //"~/scripts/vendor/printPreview.js"
            //"~/scripts/vendor/backbone.js",
            //"~/scripts/vendor/joint.min.js",
            //"~/scripts/vendor/lodash.js"
        ));

        bundles.Add(new Bundle("~/bundles/js/app").Include(
            "~/scripts/shared/common.js",
            "~/scripts/shared/util.js",
            "~/scripts/shared/gasCollectionUtils.js",
            "~/scripts/app/resources.js",
            "~/scripts/app/index.js",
            "~/scripts/app/marker.js",
            "~/scripts/app/market.js",
            "~/scripts/app/pa.js",
            "~/scripts/app/workshopspecs.js",
            "~/scripts/app/weightanalytics.js",
            "~/scripts/app/weightanalytics_dw.js",
            "~/scripts/app/consigners.js",
            "~/scripts/app/gasCollection.js",
            "~/scripts/app/automationlab.js",
            "~/scripts/treeGrid/treeExt.js",
            "~/scripts/table/jsGridExt.js",
            "~/scripts/table/jsGridNewFields.js",
            "~/scripts/action/index.js",
            "~/scripts/diagram/diagramExt.js"
        ));

        bundles.Add(new StyleBundle("~/bundles/css/app").Include(
            "~/content/table/jsgrid.css",
            "~/content/table/jsgrid-theme.css",
            "~/content/shared/datetimepicker.css",
            "~/content/shared/layout.css",
            //"~/content/shared/layoutWAD.css",
            "~/content/chart/jquery.jqplot.css",
            "~/content/shared/select.css"
        ));
    }
}
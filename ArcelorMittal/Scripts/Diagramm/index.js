$(document).ready(function () {

    $('.odataDiagramm').odataDiagramm({

        serviceUrl: serviceUrl,
        diagrammsList: 'v_Diagram',
        diagramNodes: 'v_DiagramNode',
        diagrammConnections: 'v_DiagramConnection',
        diagrammUpdateTable: ''
    });
});

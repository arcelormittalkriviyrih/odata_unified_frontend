$(document).ready(function () {

    var _width, _height;

    var select = $('#diagramList').on('change', function () {

        var diagramID = $(this).val();

        $('.odataDiagram').odataDiagram({

            serviceUrl: serviceUrl,
            diagramID: diagramID,
            diagramNodes: 'v_DiagramNode',
            diagramConnections: 'v_DiagramConnection',
            paperWidth: _width,
            paperHeight: _height,
            translates: {

                saveBtn: 'save changes',
                saving: 'saving...',
                acceptChangeSize: 'apply',
                declineChangeSize: 'cancel'
            }
        });
    });

    $.ajax({

        url: serviceUrl + 'v_Diagram',
        method: 'get'
    }).then(function (response) {

        var data = response.value;

        if (data[0].json) {

            var diagramJSON = JSON.parse(data[0].json);

            _width = diagramJSON.width;
            _height = diagramJSON.height;
        }

        for (var i = 0; i < data.length; i++) {

            var option = $('<option />')
                .attr('value', data[i].ID).text(data[i].Description)
                .appendTo(select);
        }

    });

    
});

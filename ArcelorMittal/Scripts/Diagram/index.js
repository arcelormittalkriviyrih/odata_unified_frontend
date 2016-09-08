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

                saveBtn: 'Save changes',
                undoBtn: 'Undo',
                saving: 'Saving...',
                accept: 'Apply',
                decline: 'Cancel',
                changeItemName: 'Change item name',
                changePaperSize: 'Change paper size',
                changePaperWidth: 'Change paper width',
                changePaperHeight: 'Change paper height',
                width: 'Width',
                height: 'Height',
                createLink: 'Create link',
                from: 'From',
                to: 'To',
                createNode: 'Create node',
                removeNode: 'Remove node',
                cannotRemoveNode: 'You cannot remove this node!',
                confirmRemoveNode: 'Do you really want remove this node?'
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

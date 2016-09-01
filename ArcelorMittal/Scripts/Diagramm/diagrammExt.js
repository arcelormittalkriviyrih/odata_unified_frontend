(function ($) {

    jQuery.fn.odataDiagramm = function (options) {

        var self = this,
            urlDiagrammsList = options.serviceUrl + options.diagrammsList,
            urlDiagrammNodes = options.serviceUrl + options.diagramNodes,
            urlDiagrammConnections = options.serviceUrl + options.diagrammConnections,
            select = $('<select />').attr('id', 'diagrammList')
                                    .appendTo(self).change(vmBuildDiagramm),
            diagrammRoot = $('<div />').attr('id', 'paper')
                                    .appendTo(self),
            controlsRoot = $('<div />').addClass('controls')
                                    .appendTo(self).hide(),
            createNodeBtn = $('<button />').addClass('btn btn-default')
                                    .text('create node')
                                    .click(vmCreateDiagrammNode)
                                    .appendTo(controlsRoot),
            createLinkBtn = $('<button />').addClass('btn btn-default')
                                    .text('create link')
                                    .click(vmCreateDiagrammLink)
                                    .appendTo(controlsRoot),
            updateBtn = $('<button />').addClass('btn btn-default')
                                    .text('update')
                                    .click(vmUpdateDiagramm)
                                    .appendTo(controlsRoot),
            removeBtn = $('<button />').addClass('btn btn-default')
                                    .text('remove')
                                    .click(vmRemoveNode)
                                    .appendTo(controlsRoot),
            blackWrapper = $('<div />').addClass('black-wrapper').appendTo(self).hide();
            controlsRootModal = $('<div />').addClass('modal treeControls')
                                          .appendTo(blackWrapper),
            createNodeRoot = $('<div />').attr('id', 'createNode')
                                        .appendTo(controlsRootModal),
            createLinkRoot = $('<div />').attr('id', 'createLink')
                                        .appendTo(controlsRootModal),
            cancelBtn = $('<button />').attr({ 'id': 'cancel' })
                                    .addClass('btn')
                                    .append('<span class="glyphicon glyphicon-remove"></span>')
                                    .appendTo(controlsRootModal)
                                    .on('click', vmCancel),
            graph = null, paper = null, diagramItems = [], diagrammVertices = [],
            nodeChangeCoordinates = [], arrowChangeCoordinates = [];

        $.ajax({

            url: urlDiagrammsList,
            method: 'get'
        }).then(function (response) {

            var data = response.value;

            select.append('<option />');

            for (var i = 0; i < data.length; i++) {

                var option = $('<option />')
                    .attr('value', data[i].ID).text(data[i].Description)
                    .appendTo(select);
            }

        });

        function vmBuildDiagramm() {

            diagrammRoot.empty();

            graph = new joint.dia.Graph();                       

            paper = new joint.dia.Paper({
                el: diagrammRoot,
                width: 800,
                height: 600,
                gridSize: 1,
                model: graph
            });

            controlsRoot.show()            

            $.ajax({

                url: urlDiagrammNodes,
                method: 'get'
            }).then(function (response) {

                vmBuildStates(response.value);
                
            })

            graph.on('change:position', function (node, coordinates) {

                var isNodeChanged = nodeChangeCoordinates.find(function (item) {

                    return item.node == node
                });
                if (isNodeChanged) {

                    isNodeChanged.x = coordinates.x;
                    isNodeChanged.y = coordinates.y
                } else {

                    nodeChangeCoordinates.push({

                        node: node,
                        x: coordinates.x,
                        y: coordinates.y
                    });
                };

            });

            graph.on('change:vertices', function (arrow, coordinates) {

                var isArrowChanged = arrowChangeCoordinates.find(function (item) {

                    return item.arrow == arrow
                })

                if (isArrowChanged) {

                    isArrowChanged.coordinates = coordinates;
                } else {

                    arrowChangeCoordinates.push({

                        arrow: arrow,
                        coordinates: coordinates
                    });
                };

            });

            paper.on('cell:pointerdown', function (cellView, evt, x, y) {
                console.log('cell view ' + cellView.model.id + ' was clicked');
            });
        }

        function vmBuildStates(data) {

            

            var x = 0, y = 100;

            data.forEach(function (item) {


                if (item.json) {

                    var nodeStyle = JSON.parse(item.json);
                    x = nodeStyle.x;
                    y = nodeStyle.y
                } else {

                    x = x + 200;
                    y = y;
                }
                var diagramItem = vmState(x, y, item.Description);

                diagramItems.push({
                    item: diagramItem,
                    ID: item.ID,
                    properties: item,
                    coordinates: { x: x, y: y }
                });
            });

            $.ajax({

                url: serviceUrl + 'WorkflowSpecificationConnection',
                method: 'get'
            }).then(function (response) {

                vmBuildLinks(response.value, diagramItems);
            })
        }

        function vmBuildLinks(data, diagramItems) {

            var vertice = null;

            data.forEach(function (item) {

                var fromNode = diagramItems.find(function (diagramItem) {

                    return diagramItem.ID == item.FromNodeID;
                });

                var toNode = diagramItems.find(function (diagramItem) {

                    return diagramItem.ID == item.ToNodeID;
                });

                if (!item.json) {

                    if (fromNode.ID == toNode.ID) {

                        var coordinates = fromNode.coordinates;
                        vertice = vmLink(fromNode.item, toNode.item, item.Description, [{ x: coordinates.x - 50, y: coordinates.y }, { x: coordinates.x + 50, y: coordinates.y - 50 }]);

                    }
                    else 
                        vertice = vmLink(fromNode.item, toNode.item, item.Description);
                    
                } else {

                    var coordinates = JSON.parse(item.json);
                    vertice = vmLink(fromNode.item, toNode.item, item.Description, coordinates);
                }         

                diagrammVertices.push({

                    id: item.ID,
                    vertice: vertice
                })

            });
        }

        function vmState(x, y, label) {

            var cell = new joint.shapes.fsa.State({
                position: { x: x, y: y },
                size: { width: 60, height: 60 },
                attrs: {
                    text: { text: label, fill: '#000000', 'font-weight': 'normal' },
                    'circle': {
                        fill: '#f6f6f6',
                        stroke: '#000000',
                        'stroke-width': 2
                    }
                }
            });
            graph.addCell(cell);
            return cell;
        };

        function vmLink(source, target, label, vertices) {

            var cell = new joint.shapes.fsa.Arrow({
                source: { id: source.id },
                target: { id: target.id },
                labels: [{ position: 0.5, attrs: { text: { text: label || '', 'font-weight': 'bold' } } }],
                vertices: vertices || []
            });
            graph.addCell(cell);
            return cell;
        };

        function vmCreateDiagrammNode() {


        }

        function vmCreateDiagrammLink() {


        }

        function vmUpdateDiagramm() {

            nodeChangeCoordinates.forEach(function (item) {

                var nodeChanged = diagramItems.find(function (diagramItem) {

                    return diagramItem.item == item.node;
                });

                var nodeNewCoordinates = {

                    x: item.x,
                    y: item.y
                };

                var data = {
                    DiagramID: nodeChanged.ID,
                    //NodeType: 1,
                    //WorkflowSpecification: 1,
                    json: JSON.stringify(nodeNewCoordinates),
                    //WorkDefinition: 1,
                    //Description: ''
                };

                $.ajax({

                    url: urlDiagrammNodes + '(' + nodeChanged.ID + ')',
                    type: 'PATCH',
                    contentType: "application/json",
                    data: JSON.stringify(data)
                    
                }).then(function () {

                    alert('uraaa1');
                });

            });

            arrowChangeCoordinates.forEach(function (item) {

                var arrowChanged = diagrammVertices.find(function (vertice) {

                    return vertice.vertice = item.arrow;
                })

                var data = {

                    json: JSON.stringify(item.coordinates)
                };

                $.ajax({

                    url: urlDiagrammConnections + '(' + arrowChanged.id + ')',
                    contentType: "application/json",
                    data: JSON.stringify(data),
                    type: 'PATCH'

                }).then(function () {

                    alert('uraaa2');
                });

            });
        }

        function vmRemoveNode() {

        }

        function vmCancel() {

            blackWrapper.hide()
        }        

    }

})(jQuery);
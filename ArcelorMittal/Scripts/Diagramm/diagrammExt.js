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
            nodeInputRoot = $('<div />').addClass('col-md-2').appendTo(controlsRoot).hide(),
            changeNodeName = $('<input />').attr({
                                                'type': 'text',
                                                'placeholder': 'change node name'
                                            })
                                           .addClass('form-control')
                                           .appendTo(nodeInputRoot),

            arrowInputRoot = $('<div />').addClass('col-md-2').appendTo(controlsRoot).hide(),
            changeArrowName = $('<input />').attr({
                                                'type': 'text',
                                                'placeholder': 'change arrow name'
                                            })
                                           .addClass('form-control')
                                           .appendTo(arrowInputRoot),

            updateBtn = $('<button />').addClass('btn btn-default')
                                    .text('save changes')
                                    .click(vmUpdateDiagramm)
                                    .appendTo(controlsRoot),


            graph = null, paper = null, diagramItems = [], diagrammVertices = [],
            changedNodesArray = [], changedArrowsArray = [];

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

            controlsRoot.show();

            $.ajax({

                url: urlDiagrammNodes,
                method: 'get'
            }).then(function (response) {

                vmBuildStates(response.value);
                
            })

            graph.on('change:position', function (node, coordinates) {

                var isNodeChanged = changedNodesArray.find(function (x) {

                    return x.item == node
                });

                if (isNodeChanged) {

                    isNodeChanged.coordinates = {
                        x: coordinates.x,
                        y: coordinates.y
                    }
                } else {

                    changedNodesArray.push({

                        item: node,
                        coordinates: {
                            x: coordinates.x,
                            y: coordinates.y
                        }
                        
                    });
                };
                                               
            });

            graph.on('change:vertices', function (arrow, coordinates) {

                var isArrowChanged = changedArrowsArray.find(function (x) {

                    return x.item == arrow
                })

                if (isArrowChanged) {

                    isArrowChanged.coordinates = coordinates;
                } else {

                    changedArrowsArray.push({

                        item: arrow,
                        coordinates: coordinates
                    });
                };

            });

            paper.on('cell:pointerdown', function (cellView, evt, x, y) {

                vmChangeDiagrammItemName(cellView.model.id, changeNodeName, diagramItems, changedNodesArray);
                vmChangeDiagrammItemName(cellView.model.id, changeArrowName, diagrammVertices, changedArrowsArray);
               
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
                    DiagramID: item.DiagramID
                });
            });

            $.ajax({

                url: urlDiagrammConnections,
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

                    ID: item.ID,
                    description: item.Description,
                    item: vertice
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


        function vmUpdateDiagramm() {

            vmUpdateDiagramItems(changedNodesArray, diagramItems, 'node', urlDiagrammNodes);
            vmUpdateDiagramItems(changedArrowsArray, diagrammVertices, 'arrow', urlDiagrammConnections);
        };

        function vmChangeDiagrammItemName(id, changeNameCtrl, itemStructure, changedItemsArray) {

            //get html elemend for caption (change it in realtime by control value change)
            var changedElem = $('[model-id=' + id + '] tspan');

            //hide container of control value element
            changeNameCtrl.parent().hide();

            //unbind keyup event to escape data duplicating 
            changeNameCtrl.off('keyup');

            //change element from array of items (it can be array of nodes or array of arrows)
            //by unique id we can select at current time just node or just arrow
            var isStructured = itemStructure.find(function (x) {
                return x.item.id == id
            });


            //if element is selected
            if (isStructured) {                

                //show control for this type
                changeNameCtrl.parent().show();

                //bind keyup event and change in realtime html caption 
                //and description value for dynamic array structure
                changeNameCtrl.val(isStructured.description).on('keyup', function () {

                    changedElem.text($(this).val());
                    isStructured.description = $(this).val();
                });

                //and finally fill array of items where we changed description
                //(this array will be used for update, it creates dynamically)
                var isItemChangeLabelChanged = changedItemsArray.find(function (x) {

                    return x.item.id == id;
                });

                if (!isItemChangeLabelChanged)
                    changedItemsArray.push(isStructured);
                else {
                    changedItemsArray.description = isStructured.description;
                }


            }
        }

        function vmUpdateDiagramItems(changedItemArray, structureArray, itemType, url) {

            changedItemArray.forEach(function (x) {

                var data = {};

                if (x.coordinates) 
                    data.json = JSON.stringify(x.coordinates);
                

                if (x.description)
                    data.Description = x.description;

                if (itemType == 'node') {

                    var itemChanged = structureArray.find(function (node) {

                        return node.item == x.node;
                    })

                    if (itemChanged)
                        data.DiagramID = itemChanged.DiagramID;

                };

                vmPatchSave(url + '(' + x.ID + ')', data);

            });

        };

        function vmPatchSave(url, data) {

            $.ajax({

                url: url,
                contentType: "application/json",
                data: JSON.stringify(data),
                type: 'PATCH'

            }).then(function () {

                alert('uraaa');
            });
        }

    }

})(jQuery);
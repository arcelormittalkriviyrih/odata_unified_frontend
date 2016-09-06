(function ($) {

    jQuery.fn.odataDiagram = function (options) {

        var self = this,
            translates = options.translates,
            filterByDiagram = '?$filter=DiagramID eq {0}'.format(options.diagramID),
            urlDiagramNodes = options.serviceUrl + options.diagramNodes,
            urlDiagramConnections = options.serviceUrl + options.diagramConnections,
            paperWidth = options.paperWidth,
            paperHeight = options.paperHeight,
            diagramRoot = $('<div />').attr('id', 'paper')
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
            showChangePaperSizeFormBtn = $('<button />').addClass('btn btn-default')
                                           .text('change paper size')
                                           .click(vmShowChangePaperSizeForm)
                                           .appendTo(controlsRoot),
            showChangePaperSizeForm = $('<div />').addClass('changePaperSizeForm col-md-4')
                                          .appendTo(controlsRoot).hide(),
            changeWidthRoot = $('<div />').addClass('col-md-6').appendTo(showChangePaperSizeForm),
            changeHeightRoot = $('<div />').addClass('col-md-6').appendTo(showChangePaperSizeForm),

            changeWidthCtrl = $('<input />').attr({
                                                'type': 'text',
                                                'placeholder': 'change paper width'
                                           })
                                           .val(paperWidth)
                                           .addClass('form-control')
                                           .appendTo(changeWidthRoot),

            changeHeightCtrl = $('<input />').attr({
                                                'type': 'text',
                                                'placeholder': 'change paper height'
                                           })
                                           .val(paperHeight)
                                           .addClass('form-control')
                                           .appendTo(changeHeightRoot),

            changeSizeButtonsRoot = $('<div />').addClass('col-md-12')
                                            .appendTo(showChangePaperSizeForm),

            acceptChangePaperSizeBtn = $('<button />').addClass('btn btn-default')
                                           .text(translates.acceptChangeSize)
                                           .click(vmAcceptChangePaperSize)
                                           .appendTo(changeSizeButtonsRoot),

            declineChangePaperSizeBtn = $('<button />').addClass('btn btn-default')
                                           .text(translates.declineChangeSize)
                                           .click(vmDeclineChangePaperSize)
                                           .appendTo(changeSizeButtonsRoot),

            updateBtn = $('<button />').addClass('btn btn-default')
                                    .text(translates.saveBtn)
                                    .click(vmUpdateDiagram)
                                    .appendTo(controlsRoot),
            graph = null, paper = null, diagramItems = [], diagramVertices = [],
            changedNodesArray = [], changedArrowsArray = []

        vmBuildDiagram(paperWidth, paperHeight);

        function vmBuildDiagram(width, height) {

            diagramRoot.empty();

            graph = new joint.dia.Graph();                       

            paper = new joint.dia.Paper({
                el: diagramRoot,
                width: width || 800,
                height: height || 600,
                gridSize: 1,
                model: graph
            });

            controlsRoot.show();

            $.ajax({

                url: urlDiagramNodes + filterByDiagram,
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

            //graph.on('remove', function (cell) {
                
            //    if (cell.isLink()) {
            //        var removedLink = diagramVertices.find(function (x) {

            //            return x.item.id = cell.id
            //        });

                      
            //        if (removedLink) {

            //            if (confirm('Do you really want remove this link?'))
            //                vmDeleteItem(urlDiagramConnections + '(' + removedLink.ID + ')');
            //        }
                        
            //    }
                
            //})

            paper.on('cell:pointerdown', function (cellView, evt, x, y) {

                vmChangeDiagramItemName(cellView.model.id, changeNodeName, diagramItems, changedNodesArray);
                vmChangeDiagramItemName(cellView.model.id, changeArrowName, diagramVertices, changedArrowsArray);
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
                    DiagramID: item.DiagramID,
                    description: item.Description,
                });
            });

            $.ajax({

                url: urlDiagramConnections + filterByDiagram,
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

                diagramVertices.push({

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
            }).on('change:source', function (arrow, newSourse) {

                if (newSourse.id) {

                    vmChangeArrowEnd(arrow, newSourse, 'FromNodeID');
                };
                    
            }).on('change:target', function (arrow, newTarget) {

                 if (newTarget.id) {

                     vmChangeArrowEnd(arrow, newTarget, 'ToNodeID');
                 };
                 
            });
            graph.addCell(cell);
            return cell;
        };

        function vmChangeArrowEnd(arrow, newEnd, reConnectionType) {

            var isarrowChangedItem = changedArrowsArray.find(function (x) {

                return x.item.id == arrow.id;
            });

            var newEndItem = diagramItems.find(function (x) {

                return x.item.id == newEnd.id;
            });

            if (isarrowChangedItem) {

                isarrowChangedItem[reConnectionType] = newEndItem.ID;
            } else {

                var changedArrow = {};

                changedArrow.item = cell;
                changedArrow[reConnectionType] = newEndItem.ID;

                changedArrowsArray.push(changedArrow);
            }

        }

        function vmShowChangePaperSizeForm() {

            showChangePaperSizeForm.show();
            showChangePaperSizeFormBtn.hide();
        }

        function vmAcceptChangePaperSize() {

            var newWidth = parseInt(changeWidthCtrl.val());
            var newHeight = parseInt(changeHeightCtrl.val());

            if (newWidth && newHeight) {
                
                var data = {

                    json: {

                        width: newWidth,
                        height: newHeight
                    }
                };

                data.json = JSON.stringify(data.json);

                vmPatchSave(options.serviceUrl + 'v_Diagram(' + options.diagramID + ')', data, {

                    btn: acceptChangePaperSizeBtn,
                    defaultText: translates.acceptChangeSize,
                    textOnSaving: translates.saving
                }, function () {

                    location.reload();
                });
            }
        }

        function vmDeclineChangePaperSize() {

            showChangePaperSizeForm.hide();
            showChangePaperSizeFormBtn.show();
        }

        function vmUpdateDiagram() {

            vmUpdateDiagramItems(changedNodesArray, diagramItems, 'node', urlDiagramNodes);
            vmUpdateDiagramItems(changedArrowsArray, diagramVertices, 'arrow', urlDiagramConnections);
        };

        function vmChangeDiagramItemName(id, changeNameCtrl, itemStructure, changedItemsArray) {

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

                if (x.FromNodeID)
                    data.FromNodeID = parseInt(x.FromNodeID);

                if (x.ToNodeID)
                    data.ToNodeID = parseInt(x.ToNodeID);

                if (itemType == 'node') {

                    var itemChanged = structureArray.find(function (node) {

                        return node.item == x.node;
                    })

                    if (itemChanged)
                        data.DiagramID = itemChanged.DiagramID;

                };

                vmPatchSave(url + '(' + x.ID + ')', data, {

                    btn: updateBtn,
                    defaultText: translates.saveBtn,
                    textOnSaving: translates.saving
                });

            });

        };

        function vmPatchSave(url, data, btnOptions, callBack) {

            btnOptions.btn.text(btnOptions.textOnSaving);

            $.ajax({

                url: url,
                contentType: "application/json",
                data: JSON.stringify(data),
                type: 'PATCH'

            }).then(function () {

                btnOptions.btn.text(btnOptions.defaultText);

                if (callBack)
                    callBack();
            });
        }

        function vmDeleteItem(url) {

            $.ajax({

                url: url,
                type: 'DELETE'
            })
        }

    }

})(jQuery);
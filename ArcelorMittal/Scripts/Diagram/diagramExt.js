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

            formsRoot = $('<div />').addClass('forms')
                                    .appendTo(self).hide(),

            renameInputRoot = $('<div />').addClass('col-md-2').appendTo(formsRoot).hide(),

            changeNameCtrl = $('<input />').attr({
                                                'type': 'text',
                                                'placeholder': 'change item name'
                                            })
                                           .addClass('form-control')
                                           .appendTo(renameInputRoot),
            
            showChangePaperSizeFormBtn = $('<button />').addClass('btn btn-default')
                                           .text('change paper size')
                                           .click(function(){
                                               vmShowForm(changePaperSizeForm, showChangePaperSizeFormBtn);
                                           })
                                           .appendTo(controlsRoot),

            changePaperSizeForm = $('<div />').addClass('changePaperSizeForm col-md-4')
                                          .appendTo(formsRoot).hide(),

            changeWidthRoot = $('<div />').addClass('col-md-6').appendTo(changePaperSizeForm),

            changeHeightRoot = $('<div />').addClass('col-md-6').appendTo(changePaperSizeForm),

            widthLabel = $('<label />').text('Width:').appendTo(changeWidthRoot),

            heightLabel = $('<label />').text('Height:').appendTo(changeHeightRoot),

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

            changeSizeButtonsRoot = $('<div />').addClass('changeSizeButtonsRoot col-md-12')
                                            .appendTo(changePaperSizeForm),

            acceptChangePaperSizeBtn = $('<button />').addClass('btn btn-default')
                                           .text(translates.acceptChangeSize)
                                           .click(vmAcceptChangePaperSize)
                                           .appendTo(changeSizeButtonsRoot),

            declineChangePaperSizeBtn = $('<button />').addClass('btn btn-default')
                                           .text(translates.declineChangeSize)
                                           .click(function(){
                                               vmDecline(changePaperSizeForm, showChangePaperSizeFormBtn);
                                           })
                                           .appendTo(changeSizeButtonsRoot),

            showCreateLinkFormBtn = $('<button />').addClass('btn btn-default')
                                           .text('create link')
                                           .click(function () {
                                               vmShowForm(showCreateLinkForm, showCreateLinkFormBtn);
                                           })
                                           .appendTo(controlsRoot),

            showCreateLinkForm = $('<div />').addClass('showCreateLinkForm col-md-4')
                                          .appendTo(formsRoot).hide(),

            fromNodeRoot = $('<div />').addClass('col-md-6').appendTo(showCreateLinkForm),

            toNodeRoot = $('<div />').addClass('col-md-6').appendTo(showCreateLinkForm),

            fromNodeLabel = $('<label />').text('From:').appendTo(fromNodeRoot),

            toNodeLabel = $('<label />').text('To:').appendTo(toNodeRoot),

            fromNodeCtrl = $('<select></select>').addClass('form-control')
                                        .appendTo(fromNodeRoot),

            toNodeCtrl = $('<select></select>').addClass('form-control')
                                        .appendTo(toNodeRoot),
          
            createLinkButtonsRoot = $('<div />').addClass('changeSizeButtonsRoot col-md-12')
                                            .appendTo(showCreateLinkForm),

            acceptCreateLinkBtn = $('<button />').addClass('btn btn-default')
                                           .text(translates.acceptChangeSize)
                                           .click(vmAcceptCreateLink)
                                           .appendTo(createLinkButtonsRoot),

            declineCreateLinkBtn = $('<button />').addClass('btn btn-default')
                                           .text(translates.declineChangeSize)
                                           .click(function(){
                                               vmDecline(showCreateLinkForm, showCreateLinkFormBtn);
                                           })
                                           .appendTo(createLinkButtonsRoot),

            createNodeBtn = $('<button />').addClass('btn btn-default')
                                           .text('create node')
                                           .click(vmCreateNode)
                                           .appendTo(controlsRoot),

            updateBtn = $('<button />').addClass('btn btn-default pull-right')
                                           .text(translates.saveBtn)
                                           .click(vmUpdateDiagram)
                                           .appendTo(controlsRoot)
                                           .hide(),

            removeNodeBtn = $('<button />').addClass('btn btn-default')
                                           .text('remove node')
                                           .click(vmRemoveNode)
                                           .appendTo(controlsRoot)
                                           .hide(),

            graph = null, paper = null, diagramNodes = [], diagramArrows = [],
            changedNodesArray = [], changedArrowsArray = [], _selectedNode;

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
            formsRoot.show();

            $.ajax({

                url: urlDiagramNodes + filterByDiagram,
                method: 'get'
            }).then(function (response) {

                vmBuildStates(response.value);

            });

            graph.on('change:position', function (node, coordinates) {               

                updateBtn.show();
                vmHideForms();
                vmRemoveActiveClassFromControls();

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

                updateBtn.show();
                vmHideForms();
                vmRemoveActiveClassFromControls();

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

            graph.on('remove', function (cell) {

                if (cell.isLink()) {
                    var removedLink = diagramArrows.find(function (x) {

                        return x.item.id == cell.id
                    });

                    if (removedLink) {

                        vmDeleteItem(urlDiagramConnections + '(' + removedLink.ID + ')').then(function () {

                            vmRefreshDiagram(paperWidth, paperHeight);
                        });
                    };
                };
            });

            paper.on('cell:pointerdown', function (cellView, evt, x, y) {

                vmHideForms();
                vmRemoveActiveClassFromControls();

                renameInputRoot.show();

                if (cellView.model.isLink()) {

                    vmChangeDiagramItemName(cellView.model.id, changeNameCtrl, diagramArrows, changedArrowsArray);
                } else {

                    removeNodeBtn.show();

                    //$(V(paper.findViewByModel(cellView.model).el)).find('circle').attr('fill', '#000000');
                    
                    _selectedNode = vmChangeDiagramItemName(cellView.model.id, changeNameCtrl, diagramNodes, changedNodesArray);
                }
                                
            });

        }

        function vmBuildStates(data) {
           
            var x = 0, y = 100;

            fromNodeCtrl.empty().append('<option />');
            toNodeCtrl.empty().append('<option />');

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

                var optionFrom = $('<option />').attr('value', item.ID).text(item.Description);
                var optionTo = optionFrom.clone();
                fromNodeCtrl.append(optionFrom);
                toNodeCtrl.append(optionTo);

                diagramNodes.push({
                    item: diagramItem,
                    ID: item.ID,
                    DiagramID: item.DiagramID,
                    description: item.Description,
                    coordinates: {
                        x: x,
                        y: y
                    }
                });

                
            });

            $.ajax({

                url: urlDiagramConnections + filterByDiagram,
                method: 'get'
            }).then(function (response) {

                vmBuildLinks(response.value, diagramNodes);
            })
        }

        function vmBuildLinks(data, diagramNodes) {

            var vertice = null;

            data.forEach(function (item) {

                var fromNode = diagramNodes.find(function (diagramItem) {

                    return diagramItem.ID == item.FromNodeID;
                });

                var toNode = diagramNodes.find(function (diagramItem) {

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

                diagramArrows.push({

                    ID: item.ID,
                    description: item.Description,
                    fromNode: fromNode.ID,
                    toNode: toNode.ID,
                    item: vertice
                })

            });
        }

        function vmCreateNode() {

            vmCreateItem(options.serviceUrl + 'v_DiagramNode_insert', {

                Description: 'New',
                json: JSON.stringify({

                    x: 10,
                    y: 10
                }),
                DiagramID: options.diagramID
            }).then(function (response) {

                vmRefreshDiagram(paperWidth, paperHeight);
            });
            
        };

        function vmAcceptCreateLink() {

            var fromNodeVal = fromNodeCtrl.val();
            var toNodeVal = toNodeCtrl.val();

            var fromNode = diagramNodes.find(function (diagramItem) {

                return diagramItem.ID == fromNodeVal;
            });

            var toNode = diagramNodes.find(function (diagramItem) {

                return diagramItem.ID == toNodeVal;
            });

            if (fromNode && toNode) {

                vmCreateItem(serviceUrl + 'v_DiagramConnection_insert', {

                    FromNodeID: fromNodeVal,
                    ToNodeID: toNodeVal,
                    DiagramID: options.diagramID,
                    json: null,
                    Description: 'New'
                }).then(function () {

                    vmDecline(showCreateLinkForm, showCreateLinkFormBtn);
                    vmRefreshDiagram(paperWidth, paperHeight);
                });
            };
                

        };

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

            var newEndItem = diagramNodes.find(function (x) {

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

                    vmDecline(changePaperSizeForm, showChangePaperSizeFormBtn);
                    vmRefreshDiagram(newWidth, newHeight);
                });
            }
        }       

        function vmRemoveNode() {

            var isUsedNode = diagramArrows.find(function (x) {

                return x.toNode == _selectedNode.ID || x.fromNode == _selectedNode.ID
            });

            if (isUsedNode)
                alert('You cannot remove this node!');
            else {
                if (confirm('Do you really want remove this node?')) {

                    vmDeleteItem(urlDiagramNodes + '(' + _selectedNode.ID + ')').then(function () {

                        _selectedNode.item.remove();
                        removeNodeBtn.hide();
                        vmHideForms();
                        diagramNodes.splice(diagramNodes.indexOf(_selectedNode), 1);

                        
                        vmFindNodeInCombo(_selectedNode.ID, 'remove');
                    });
                };
            };
        };

        function vmUpdateDiagram() {

            vmUpdateDiagramItems(changedNodesArray, diagramNodes, 'node', urlDiagramNodes);
            vmUpdateDiagramItems(changedArrowsArray, diagramArrows, 'arrow', urlDiagramConnections);
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

                    var text = $(this).val();

                    updateBtn.show();

                    changedElem.text(text);
                    isStructured.description = text;

                    vmFindNodeInCombo(_selectedNode.ID, 'rename', text);
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

            return isStructured;
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

        function vmCreateItem(url, data) {

            return $.ajax({

                url: url,
                type: 'POST',
                data: JSON.stringify(data),
                contentType: "application/json"
            })
        }

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

            return $.ajax({

                url: url,
                type: 'DELETE'
            })
        }

        function vmShowForm(form, showBtn) {

            vmHideForms();
            vmRemoveActiveClassFromControls();

            form.show();
            showBtn.addClass('active');
        }

        function vmDecline(form, showBtn) {

            form.hide();
            showBtn.removeClass('active');
        }

        function vmRemoveActiveClassFromControls() {

            showChangePaperSizeFormBtn.removeClass('active');
            showCreateLinkFormBtn.removeClass('active');
        };

        function vmHideForms() {

            renameInputRoot.hide();
            showCreateLinkForm.hide();
            changePaperSizeForm.hide();
        };

        function vmFindNodeInCombo(id, action, newName) {

            var optionFrom = fromNodeCtrl.find('[value="' + id + '"]');
            var optionTo = toNodeCtrl.find('[value="' + id + '"]');

            switch (action) {

                case 'rename':
                    optionFrom.text(newName);
                    optionTo.text(newName);
                    break;

                case 'remove':

                    optionFrom.remove();
                    optionTo.remove();
                    break;
            };

        };

        function vmRefreshDiagram(width, height) {

            graph = null;
            paper = null;
            diagramNodes = [];
            diagramArrows = [];
            changedNodesArray = [];
            changedArrowsArray = [];
            _selectedNode = null;

            vmHideForms();
            vmRemoveActiveClassFromControls();

            vmBuildDiagram(width, height);
        };

    }

})(jQuery);
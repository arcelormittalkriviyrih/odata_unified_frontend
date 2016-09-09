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

            leftGroup = $('<div />').addClass('pull-left').appendTo(controlsRoot),
            rightGroup = $('<div />').addClass('pull-right').appendTo(controlsRoot).hide(),

            formsRoot = $('<div />').addClass('forms')
                                    .appendTo(self).hide(),

            renameInputRoot = $('<div />').addClass('renameInputRoot col-md-7').appendTo(formsRoot).hide(),

            renameLabel = $('<label />').appendTo(renameInputRoot),

            changeNameCtrl = $('<input />').attr({
                                                'type': 'text',
                                                'placeholder': translates.changeItemName
                                            })
                                           .addClass('form-control')
                                           .appendTo(renameInputRoot),
            changeNameAcceptBtn = $('<button />').addClass('btn btn-default')
                                           .text(translates.accept)
                                           .appendTo(renameInputRoot),

            declineNameAcceptBtn = $('<button />').addClass('btn btn-default')
                                           .text(translates.decline)
                                           .click(function () {
                                               vmDecline(renameInputRoot);
                                           })
                                           .appendTo(renameInputRoot),
            
            showChangePaperSizeFormBtn = $('<button />').addClass('btn btn-default')
                                           .text(translates.changePaperSize)
                                           .click(function () {

                                               vmShowForm(changePaperSizeForm, showChangePaperSizeFormBtn);
                                           })
                                           .appendTo(leftGroup),

            changePaperSizeForm = $('<div />').addClass('changePaperSizeForm col-md-6')
                                          .appendTo(formsRoot).hide(),

            changeWidthRoot = $('<div />').addClass('col-md-6').appendTo(changePaperSizeForm),

            changeHeightRoot = $('<div />').addClass('col-md-6').appendTo(changePaperSizeForm),

            widthLabel = $('<label />').text(translates.width + ':').appendTo(changeWidthRoot),

            heightLabel = $('<label />').text(translates.height + ':').appendTo(changeHeightRoot),

            changeWidthCtrl = $('<input />').attr({
                                                'type': 'text',
                                                'placeholder': translates.changePaperWidth
                                            })
                                           .val(paperWidth)
                                           .addClass('form-control')
                                           .appendTo(changeWidthRoot),

            changeHeightCtrl = $('<input />').attr({
                                                'type': 'text',
                                                'placeholder': translates.changePaperHeight
                                            })
                                           .val(paperHeight)
                                           .addClass('form-control')
                                           .appendTo(changeHeightRoot),

            changeSizeButtonsRoot = $('<div />').addClass('changeSizeButtonsRoot col-md-12')
                                            .appendTo(changePaperSizeForm),

            acceptChangePaperSizeBtn = $('<button />').addClass('btn btn-default')
                                           .text(translates.accept)
                                           .click(vmAcceptChangePaperSize)
                                           .appendTo(changeSizeButtonsRoot),

            declineChangePaperSizeBtn = $('<button />').addClass('btn btn-default')
                                           .text(translates.decline)
                                           .click(function () {
                                               changeWidthCtrl.val(paperWidth);
                                               changeHeightCtrl.val(paperHeight);
                                               vmDecline(changePaperSizeForm, showChangePaperSizeFormBtn);
                                           })
                                           .appendTo(changeSizeButtonsRoot),

            showCreateLinkFormBtn = $('<button />').addClass('btn btn-default')
                                           .text(translates.createLink)
                                           .click(function () {

                                               vmShowForm(showCreateLinkForm, showCreateLinkFormBtn);
                                           })
                                           .appendTo(leftGroup),

            showCreateLinkForm = $('<div />').addClass('showCreateLinkForm col-md-6')
                                          .appendTo(formsRoot).hide(),

            fromNodeRoot = $('<div />').addClass('col-md-6').appendTo(showCreateLinkForm),

            toNodeRoot = $('<div />').addClass('col-md-6').appendTo(showCreateLinkForm),

            fromNodeLabel = $('<label />').text(translates.from + ':').appendTo(fromNodeRoot),

            toNodeLabel = $('<label />').text(translates.to + ':').appendTo(toNodeRoot),

            fromNodeCtrl = $(dropBoxTmpl.format('fromNodeVal', 'fromNodeKey', 'fromNode'))
                                      .appendTo(fromNodeRoot),
            toNodeCtrl = $(dropBoxTmpl.format('toNodeVal', 'toNodeKey', 'toNode'))
                                    .appendTo(toNodeRoot),
          
            createLinkButtonsRoot = $('<div />').addClass('changeSizeButtonsRoot col-md-12')
                                            .appendTo(showCreateLinkForm),

            acceptCreateLinkBtn = $('<button />').addClass('btn btn-default')
                                           .text(translates.accept)
                                           .click(vmAcceptCreateLink)
                                           .appendTo(createLinkButtonsRoot),

            declineCreateLinkBtn = $('<button />').addClass('btn btn-default')
                                           .text(translates.decline)
                                           .click(function(){
                                               vmDecline(showCreateLinkForm, showCreateLinkFormBtn);
                                           })
                                           .appendTo(createLinkButtonsRoot),

            createNodeBtn = $('<button />').addClass('btn btn-default')
                                           .text(translates.createNode)
                                           .click(vmCreateNode)
                                           .appendTo(leftGroup),

            updateBtn = $('<button />').addClass('btn btn-default')
                                           .text(translates.saveBtn)
                                           .click(vmUpdateDiagram)
                                           .appendTo(rightGroup),

            undoBtn = $('<button />').addClass('btn btn-default')
                                           .text(translates.undoBtn)
                                           .click(function () {

                                               leftGroup.show();
                                               rightGroup.hide();

                                               vmRefreshDiagram(paperWidth, paperHeight)
                                           })
                                           .appendTo(rightGroup),

            removeNodeBtn = $('<button />').addClass('btn btn-default')
                                           .text(translates.removeNode)
                                           .click(vmRemoveNode)
                                           .appendTo(renameInputRoot)
                                           .hide(),

            removeArrowBtn = $('<button />').addClass('btn btn-default')
                                           .text(translates.removeLink)
                                           .click(vmRemoveArrow)
                                           .appendTo(renameInputRoot)
                                           .hide(),

            graph = null, paper = null, diagramNodes = [], diagramArrows = [],
            changedNodesArray = [], changedArrowsArray = [], _selectedNode, _newWidth, _newHeight;

        vmBuildDiagram(paperWidth, paperHeight);

        function vmBuildDiagram(width, height) {

            diagramRoot.empty();

            graph = new joint.dia.Graph();

            paper = new joint.dia.Paper({
                el: diagramRoot,
                width: _newWidth || width || 800,
                height:_newHeight || height || 600,
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

                vmHideControls();
                vmHideForms();
                vmRemoveActiveClassFromControls();

                rightGroup.show();

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

                vmHideControls();
                vmHideForms();
                vmRemoveActiveClassFromControls();

                rightGroup.show();

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

                    vmRemoveArrow();
                };
            });

            paper.on('cell:pointerdown', function (cellView, evt, x, y) {

                vmHideForms();
                vmRemoveActiveClassFromControls();
                renameInputRoot.show();
                changeNameAcceptBtn.off('click');

                var caption = $('[model-id=' + cellView.model.id + '] tspan');
                changeNameCtrl.val(caption.text());

                var htmlElement = V(paper.findViewByModel(cellView.model).el).node;

                vmClearActiveElements();

                if (cellView.model.isLink()) {

                    removeNodeBtn.hide();
                    removeArrowBtn.show();
                    renameLabel.text(translates.renameLink + ': ');

                    _selectedArrow = diagramArrows.find(function (x) {
                        return x.item.id == cellView.model.id
                    });

                    $(htmlElement).find('path.connection').addClass('activeArrow');

                    changeNameAcceptBtn.on('click', function () {

                        vmChangeDiagramItemName(cellView.model.id, _selectedArrow, caption, changeNameCtrl, diagramArrows, changedArrowsArray, 'arrow', urlDiagramConnections, $(htmlElement));
                    });

                } else {

                    removeNodeBtn.show();
                    removeArrowBtn.hide();
                    renameLabel.text(translates.renameNode + ': ');

                    _selectedNode = diagramNodes.find(function (x) {
                        return x.item.id == cellView.model.id
                    });

                    $(htmlElement).find('circle').addClass('activeNode');

                    changeNameAcceptBtn.on('click', function () {

                        vmChangeDiagramItemName(cellView.model.id, _selectedNode, caption, changeNameCtrl, diagramNodes, changedNodesArray, 'node', urlDiagramNodes, $(htmlElement));
                    });

                }

            });

        };

        function vmBuildStates(data) {
           
            var x = 0, y = 100;

            var fromNodeCombo = $(fromNodeCtrl).find('ul');
            var toNodeCombo = $(toNodeCtrl).find('ul');

            fromNodeCombo.empty();
            toNodeCombo.empty();

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

                var optionWrapperFrom = $('<li />');
                var optionWrapperTo = $('<li />');

                var optionFrom = $('<a />').attr({
                    'href': '',
                    'data-id': item.ID
                }).text(item.Description).appendTo(optionWrapperFrom)
                
                var optionTo = optionFrom.clone().appendTo(optionWrapperTo);

                optionFrom.on('click', function (e) {

                    e.preventDefault();

                    $('#fromNodeVal').val($(this).text());
                    $('#fromNodeKey').val($(this).attr('data-id'));
                });

                optionTo.on('click', function (e) {

                    e.preventDefault();

                    $('#toNodeVal').val($(this).text());
                    $('#toNodeKey').val($(this).attr('data-id'));
                });

                fromNodeCombo.append(optionWrapperFrom);
                toNodeCombo.append(optionWrapperTo);

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

                alert(translates.nodeCreated);
                vmRefreshDiagram(paperWidth, paperHeight);
            });
            
        };

        function vmAcceptCreateLink() {

            var fromNodeVal = $('#fromNodeKey').val();
            var toNodeVal = $('#toNodeKey').val();

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

                    alert(translates.linkCreated);

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

            rightGroup.show();

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

                changedArrow.item = arrow;
                changedArrow[reConnectionType] = newEndItem.ID;

                changedArrowsArray.push(changedArrow);
            }

        }        

        function vmAcceptChangePaperSize() {

            var newWidth = parseInt(changeWidthCtrl.val());
            var newHeight = parseInt(changeHeightCtrl.val());

            if (newWidth && newHeight) {

                _newWidth = newWidth;
                _newHeight = newHeight;
                
                var data = {

                    json: {

                        width: newWidth,
                        height: newHeight
                    }
                };

                data.json = JSON.stringify(data.json);

                vmPatchSave(options.serviceUrl + 'v_Diagram(' + options.diagramID + ')', data, {

                    btn: acceptChangePaperSizeBtn,
                    defaultText: translates.accept,
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
                alert(translates.cannotRemoveNode);
            else {
                if (confirm(translates.confirmRemoveNode)) {

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

        function vmRemoveArrow() {

            vmDeleteItem(urlDiagramConnections + '(' + _selectedArrow.ID + ')').then(function () {

                vmRefreshDiagram(paperWidth, paperHeight);
            });
        };

        function vmUpdateDiagram() {
           
            var callBack = function () {

                leftGroup.show();
                rightGroup.hide();

                vmClearActiveElements();
            };

            vmUpdateDiagramItems(changedNodesArray, diagramNodes, 'node', urlDiagramNodes, callBack);
            vmUpdateDiagramItems(changedArrowsArray, diagramArrows, 'arrow', urlDiagramConnections, callBack);
        };

        function vmChangeDiagramItemName(id, selected, caption, changeNameCtrl, itemStructure, changedItemsArray, itemType, url, $htmlElement) {

            var text = changeNameCtrl.val();

            caption.text(text);
            selected.description = text;

            vmFindNodeInCombo(selected.ID, 'rename', text);

            //and finally fill array of items where we changed description
            //(this array will be used for update, it creates dynamically)
            var isItemChangeLabelChanged = changedItemsArray.find(function (x) {

                return x.item.id == id;
            });

            if (!isItemChangeLabelChanged)
                changedItemsArray.push(selected);
            else {
                changedItemsArray.description = selected.description;
            }

            vmUpdateDiagramItems(changedItemsArray, itemStructure, itemType, url, function () {

                vmClearActiveElements();
                vmHideForms();
            });

        };

        function vmUpdateDiagramItems(changedItemArray, structureArray, itemType, url, callback) {

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


                var itemChanged = structureArray.find(function (node) {

                    return node.item == x.item;
                })

                if (itemChanged) {

                    data.DiagramID = itemChanged.DiagramID;
                };
                        

                vmPatchSave(url + '(' + itemChanged.ID + ')', data, {

                    btn: updateBtn,
                    defaultText: translates.saveBtn,
                    textOnSaving: translates.saving
                }, callback);

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
            vmClearActiveElements();

            form.show();
            showBtn.addClass('active');
        }

        function vmDecline(form, showBtn) {

            form.hide();
            vmClearActiveElements();

            if (showBtn)
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

        function vmHideControls() {

            leftGroup.hide();
            rightGroup.hide();
        };

        function vmClearActiveElements() {

            self.find('svg').find('circle.activeNode, path.connection.activeArrow').each(function (i, item) {
                $(item).removeClass('activeNode');
                $(item).removeClass('activeArrow');
            });
        };

        function vmFindNodeInCombo(id, action, newName) {

            var optionFrom = fromNodeCtrl.find('[data-id="' + id + '"]');
            var optionTo = toNodeCtrl.find('[data-id="' + id + '"]');

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
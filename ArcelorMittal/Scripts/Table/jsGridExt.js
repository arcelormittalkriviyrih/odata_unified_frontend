$.extend(jsGrid.Grid.prototype, {
    initOdata: function (properties) {

        var self = this;
        var _table, _fields;

        
            
        vmGetMetadata(properties.serviceUrl)
            .done(function (metadata) {

                //get list of fields must be shown
                var fields = properties.fields;
                
                // get table information
                // from metadata
                _table = vmGetTableInfo(metadata, properties.table);


                var fieldsIds = fields.map(function (item) {

                    return item.id;
                });

                var fieldsOrder = fields.map(function (item) {

                    return {
                        id: item.id,
                        order: item.order
                    };
                })
                                
                //there we must get fom table only shown fields
                _fields = _table.fields
                                .filter(function (item) {
                                    
                                    if (fieldsIds.indexOf(item.name) > -1)
                                        return item;
                                                                                                           
                                })
                                .map(function (item) {

                                    var field = {
                                        name: item.name,
                                        width: vmGetWidth(fields, item.name),
                                        maxlength: item.maxlength,
                                    };

                                    var validatorString = {
                                        validator: "maxLength",
                                        param: item.maxlength
                                    };

                                   
                                    var filteredFields = fields.filter(function (field) {

                                        if (field.id == item.name)
                                            return field;
                                    })[0];

                                    //init fields controls types
                                    //1. we leave only shown fields
                                    //2. id shown field has not property type - get this property from _table.fields
                                    //3. else set type as property

                                    if (filteredFields.title)
                                        field.title = filteredFields.title;

                                    if (!filteredFields.type) {
                                        switch (item.type) {

                                            case 'Edm.Int32': 

                                                field.type = 'number';

                                                if (item.mandatory == true)
                                                    field.validate = 'required';
                                                else
                                                    field.nullable = true;

                                                break;

                                            case 'Edm.Single':

                                                field.type = 'floatNumber';

                                                if (item.mandatory == true)
                                                    field.validate = 'required';
                                                else
                                                    field.nullable = true;

                                                break;

                                            case 'Edm.String':

                                                field.type = 'text';

                                                if (item.mandatory == true && field.maxlength > 0)
                                                    field.validate = ['required', validatorString]

                                                if (item.mandatory == true && field.maxlength == 0)
                                                    field.validate = 'required';

                                                // this validation is conflicting
                                                // with nullable field functionality
                                                //if (item.mandatory == false && field.maxlength > 0)
                                                //    field.validate = validatorString;

                                                field.nullable = !item.mandatory;

                                                break;

                                            case 'Edm.Date':

                                                field.type = 'date';

                                                if (item.mandatory == true)
                                                    field.validate = 'required';

                                                break;

                                            case 'Edm.DateTimeOffset':

                                                field.type = 'dateTime';

                                                if (item.mandatory == true)
                                                    field.validate = 'required';

                                                break;

                                            case 'Edm.Boolean':

                                                field = {
                                                    name: item.name,
                                                    autosearch: true,
                                                    type: "select",
                                                    items: [
                                                            { Name: "", Id: "" },
                                                            { Name: 'false', Id: false },
                                                            { Name: 'true', Id: true },
                                                    ],
                                                };

                                                if (item.mandatory == true)
                                                    field.validate = 'required';

                                                break;

                                            case 'Edm.Binary':

                                                field.type = 'binary';

                                                break;
                                        };
                                    }
                                    else {
                                        field.type = filteredFields.type;
                                        field.tableInfo = filteredFields.table;
                                        field.name = filteredFields.name;
                                        field.id = filteredFields.id;
                                        field.valueField = filteredFields.valueField;
                                        field.textField = filteredFields.textField;
                                        field.serviceUrl = properties.serviceUrl;
                                        field.filter = filteredFields.filter;
                                        
                                        if (typeof (filteredFields.readonly != "undefined")) {
                                            field.readOnly = filteredFields.readonly;
                                        }
                                    }
                                                                                                             
                                    return field;
                                });

                fieldsOrder.forEach(function (item) {

                    _fields.find(function (el) {

                        if (el.name == item.id)
                            el.order = item.order;
                    });
                });

                _fields = _fields.sort(function (a, b) {

                    if (a.order < b.order)
                        return -1;
                    else if (a.order > b.order)
                        return 1;
                    else
                        return 0;
                });

                if (properties.controlProperties) 
                    _fields.push(properties.controlProperties)
               
                self.fields = _fields;
                self.table = _table;

                //initialize grid, then clear old data and render grid
                self._init();
                self.data = [];
                self.render();
                
            });

        function vmGetTableInfo(metadata, table) {

            // filter metadata to find requested table
            // build table information object
            return $(metadata).find('EntityType')
                        .filter(function (ind, item) {

                            // filter by table name
                            return $(item).attr('Name') == table;
                        })                        
                        .map(function (ind, entity) {

                            // get table fields
                            var fields = $(entity).find('Property')
                                            .map(function (idx, param) {

                                                return {
                                                    name: $(param).attr('Name'),
                                                    type: $(param).attr('Type'),
                                                    maxlength: $(param).attr('MaxLength'),
                                                    mandatory: $(param).attr('Nullable') ? true : false
                                                };
                                            });

                            // get table key
                            var key = $(entity).find('Key')
                                            .children('PropertyRef')
                                            .attr('Name');

                            return {
                                name: $(entity).attr('Name'),
                                key: key,
                                fields: fields.toArray()
                            };
                        })
                        .get(0);
        };

        function vmGetWidth(fields, name) {

            var field = $.grep(fields, function (e) {
                return e.id == name
            });

            if (field.length > 0 && field[0].width)
                return field[0].width;
            else
                return getTextWidth(name, "regular 14pt Helvetica") + 20;
        }

        function getTextWidth(text, font) {
            // re-use canvas object for better performance
            var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
            var context = canvas.getContext("2d");
            context.font = font;
            var metrics = context.measureText(text);
            return metrics.width;
        };
    },

    loadOdata: function(properties){

        var self = this;
        var COMPONENT_KEY = 'vmArselorGrid';

        var _table = self.table;
        var _fields = self.fields;

        //if we want filter our oData combobox 
        //1.we get comboFilter array from properties.
        //This array is array of objects.
        //Each object has 2 property - name of grid field where we want filter oData combobox
        //and filter property.
        //2. Add this filter as additional setting of combobox field
        if (properties.comboFilter) {

            var combosFiltered = properties.comboFilter.map(function (item) {

                return item.name;
            })

            _fields.forEach(function (item) {

                var index = combosFiltered.indexOf(item.name);

                if (index > -1)
                    item.comboFilter = properties.comboFilter[index].filter;
            })

        }

        $.data(self, COMPONENT_KEY, {
            defaultFilter: properties.defaultFilter
        });

        self.controller.loadData = loadData;
        self.controller.insertItem = insertItem;
        self.controller.updateItem = updateItem;
        self.controller.deleteItem = deleteItem;

        self._init();
        self.render();

        if (properties.autoRefresh) {

            console.log('>refresh:' + self.table.name);

            //
            // REMOVE THIS INTERVALID VARIABLE
            //
            _intervalID = setInterval(function () {

                self.loadData();

            }, properties.autoRefresh);
        }
        
        function loadData(filter) {
            
            //for save filter data after refresh check filter
            var isEmptyFilter = vmCheckFilterForEmpty(filter);

            if (!isEmptyFilter) {
                
                //and trigger event with this filter value
                //for handling in outer sources
                $(self._container).trigger('oDataGrid.getFilter', {
                    grid: self,
                    filter: filter
                });
            }

            // if not initialized
            // than skip and do nothing
            if (!self.table)
                return;

            var defaultFilter = $.data(self, COMPONENT_KEY).defaultFilter;

            var table = self.table;
            var fields = self.fields;

            var data = {
                $filter: vmGetFilter(filter, fields, defaultFilter),
                $count: true,
                $top: filter.pageSize,
                $skip: (filter.pageIndex - 1) * filter.pageSize
            };

            if (properties.order) {

                data.$orderby = properties.order;
            }


            return $.ajax({

                url: serviceUrl + table.name,
                dataType: "json",
                data: data,
                xhrFields: {
                    withCredentials: true
                }
            }).then(function (response) {

                var data = response.value;

                $(self._container).trigger('oDataGrid.dataLoadedSuccessfull');

                return {
                    itemsCount: response['@odata.count'],
                    data: data
                };

            });

            //this method is checking filter object on emptyness
            //there are ignored 'pageIndex' and 'pageSize' properties
            //because they are already exists
            //so we check other properties
            function vmCheckFilterForEmpty(filter) {

                for (var i in filter) {

                    if (i != 'pageIndex' && i != 'pageSize') {

                        if (filter[i])
                            return false
                        else
                            return true
                    };
                };
            };
        };

        function vmGetFilter(conditions, fields, defaultFilter) {

            var filter = [];

            if (defaultFilter) {

                filter.push(defaultFilter)
            };

            for (key in conditions) {

                var field = fields.find(function (x) {
                    return x.name == key
                });

                if (!field || !field.type)
                    continue;

                var condition = conditions[field.name];

                if ((field.nullable && condition != null) || (!field.nullable && condition)) {

                    if (field.type == 'text') {

                        filter.push("contains({0},'{1}')".format(field.name, condition));

                    } else if (field.type == 'date' || field.type == 'dateTime') {

                        var date = condition.split('.').reverse().join('-');
                        
                        var dateStart = date + 'T00:00:00.000Z';
                        var dateEnd = date + 'T23:59:59.999Z';

                        filter.push('{0} ge {1} and {0} le {2}'.format(field.name, dateStart, dateEnd));

                    }

                    else if (field.type == 'number' || field.type == 'select') {

                        filter.push("{0} eq {1}".format(field.name, condition));

                    } else if (field.type == 'floatNumber') {

                        filter.push("{0} eq {1}f".format(field.name, condition));

                    } else if (field.type == 'combo') {

                        filter.push("{0} eq {1}".format(field.name, condition));

                    } else {

                        alert('Filtering by {0} not supported'.format(field.type));
                    };
                };
            };

            filter = filter.length > 1 ? filter.join(' and ') : filter[0];

            return filter;
        };

        function insertItem(item) {

            //inserting additional value from outer sourse
            //(for example, we select item in tree
            //and show grid data agree with this selection.
            //Then, if we want add new row in grid according selected tree item
            //we add this item meaning as property of JSON object)
            if (properties.insertedAdditionalFields) {

                properties.insertedAdditionalFields.forEach(function (field) {

                    item[field.name] = field.value;
                })                
            }

            var table = self.table;

            var isEmpty = isEmptyRow(item);


            if (isReadOnly(self.fields, table))
                delete item[table.key];

            if (!isEmpty && (item[table.key] != 0 || item[table.key] != '')) {

                return $.ajax({
                    url: serviceUrl + table.name,
                    type: "POST",
                    data: JSON.stringify(item),
                    contentType: "application/json;odata=verbose",
                    //xhrFields: {
                    //    withCredentials: true
                    //}
                })
                .fail(handleError);
            }
            else if (item[table.key] == 0 || item[table.key] == '') {
                
                alert('you cannot push empty ' + table.key + ' field!');
            }
            else {
                alert('You cannot push empty row!');
            }

        };

        function updateItem(item) {

            var table = self.table;

            var id = item[table.key];

            return $.ajax({
                url: serviceUrl + table.name + '(' + id + ')',
                xhrFields: {
                    withCredentials: true
                },
                type: "PUT",
                data: JSON.stringify(item),
                contentType: "application/json;odata=verbose",
                
            })
            .fail(handleError);
        };

        function deleteItem(item) {

            var table = self.table;

            var id = item[table.key];

            return $.ajax({
                type: "DELETE",
                url: serviceUrl + table.name + '(' + id + ')',
                //xhrFields: {
                //    withCredentials: true
                //}
            })
            .success(function () {
                $(self._container).trigger('oDataGrid.removed');
            })
            .fail(handleError);
        };


        function isEmptyRow(row) {

            var isEmpty = true;

            for (prop in row) {

                if (row[prop] != 0 || row[prop] != '')
                    isEmpty = false;
            }

            return isEmpty;
        }

        function isReadOnly(fields, table) {

            var fieldProperties = fields.filter(function (item) {

                if (item.id == table.key)
                    return item;

            });

            if (fieldProperties.length > 0 && fieldProperties[0].readOnly)
                return true;
            else return false;
        }

    }


});
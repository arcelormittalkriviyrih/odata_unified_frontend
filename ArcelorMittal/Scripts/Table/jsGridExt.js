$.extend(jsGrid.Grid.prototype, {
    initOdata: function (properties) {

        var self = this;

        vmGetMetadata(properties.serviceUrl)
            .done(function (metadata) {

                // find action by name
                var table = vmGetTables(metadata).filter(function (ind, table) {

                    return table.name == properties.table;
                })
                .get(0);

                _table = table;

                var fields = table.fields
                .map(function (ind, item) {

                    var field = {
                        name: item.name,
                        width: vmGetWidth(item.name),
                        maxlength: item.maxlength,
                    };

                    var validatorString = {
                        validator: "maxLength",
                        param: item.maxlength
                    };

                    switch (item.type) {

                        case 'Edm.Int32':
                            field.type = 'number';

                            if (item.mandatory == true)
                                field.validate = 'required';

                            break;

                        case 'Edm.Single':
                            field.type = 'floatNumber';

                            if (item.mandatory == true)
                                field.validate = 'required';

                            break;

                        case 'Edm.String':
                            field.type = 'text';

                            if (item.mandatory == true && field.maxlength > 0)
                                field.validate = ['required', validatorString]

                            if (item.mandatory == true && field.maxlength == 0)
                                field.validate = 'required';

                            if (item.mandatory == false && field.maxlength > 0)
                                field.validate = validatorString;

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
                                valueField: "Id",
                                textField: "Name"
                            };

                            if (item.mandatory == true)
                                field.validate = 'required';

                            break;
                    };

                    return field;
                });

                fields.push({ type: "control" });

                _fields = fields.toArray();

                self.fields = _fields;
                self.controller.loadData = loadData;
                self.controller.insertItem = insertItem;
                self.controller.updateItem = updateItem;
                self.controller.deleteItem = deleteItem;

                // re-initialize properties
                // re-render control with new properties
                self._init();
                self.render();
            });

        function vmGetMetadata(serviceUrl) {

            // get metadata xml by service url
            // service requires user credentials
            return $.ajax({
                url: serviceUrl + '$metadata',
                xhrFields: {
                    withCredentials: true
                }
            })
                    // show alert message in case of error
                    .error(function () {
                        alert('failed to read metadata');
                    });
        };

        function vmGetTables(metadata) {

            // find entities (table information)
            // in metadata xml file
            return $(metadata).find('EntityType')
                        .map(function (ind, entity) {

                            var fields = $(entity).find('Property')
                                            .map(function (idx, param) {

                                                return {
                                                    name: $(param).attr('Name'),
                                                    type: $(param).attr('Type'),
                                                    maxlength: $(param).attr('MaxLength'),
                                                    mandatory: $(param).attr('Nullable') ? true : false
                                                };
                                            });

                            var key = $(entity).find('Key')
                                            .children('PropertyRef')
                                            .attr('Name');

                            return {
                                name: $(entity).attr('Name'),
                                key: key,
                                fields: fields
                            };
                        });
        };

        function loadData(filter) {

            var table = _table;
            var fields = _fields;

            var data = {
                $filter: vmGetFilter(filter, fields, properties.defaultFilter),
                $count: true,
                $top: filter.pageSize,
                $skip: (filter.pageIndex - 1) * filter.pageSize
            };

            return $.ajax({
                url: serviceUrl + table.name,
                dataType: "json",
                data: data,
            }).then(function (response) {

                return {
                    itemsCount: response['@odata.count'],
                    data: response.value
                };
            });
        };

        function vmGetFilter(conditions, fields, defaultFilter) {

            var filter = [];

            if (defaultFilter) {

                filter.push(defaultFilter)
            };

            for (field in conditions)
                if (conditions[field]) {

                    var field = fields.find(function (x) {
                        return x.name == field
                    });

                    if (field && field.type) {
                        if (field.type == 'text')
                            filter.push("contains({0},'{1}')".format(field.name, conditions[field.name]));

                        else if (field.type == 'date') {

                            getDateFilterParams(['year', 'month', 'day'], filter, field, new Date(conditions[field.name]));
                        }

                        else if (field.type == 'dateTime') {

                            getDateFilterParams(['year', 'month', 'day', 'hour', 'minute', 'second'], filter, field, new Date(conditions[field.name]));
                        }

                        else if (field.type == 'number' || field.type == 'select')
                            filter.push("{0} eq {1}".format(field.name, conditions[field.name]));

                        else if (field.type == 'floatNumber')
                            filter.push("{0} eq {1}f".format(field.name, conditions[field.name]));
                        else
                            alert('Filtering by {0} not supported'.format(field.type));
                    }
                };

            return filter.length > 1 ? filter.join(' and ') : filter[0];
        };

        function insertItem(item) {

            var table = _table;

            var isEmpty = isEmptyRow(item);

            if (!isEmpty && (item[table.key] != 0 || item[table.key] != '')) {

                return $.ajax({
                    url: serviceUrl + table.name,
                    type: "POST",
                    data: JSON.stringify(item),
                    contentType: "application/json;odata=verbose"
                })
                .fail(
                    handleError);
            }
            else if (item[table.key] == 0 || item[table.key] == '') {

                alert('you cannot push empty ' + table.key + ' field!');
            }
            else {
                alert('You cannot push empty row!');
            }

        };

        function updateItem(item) {

            var table = _table;

            var id = item[table.key];

            return $.ajax({
                url: serviceUrl + table.name + '(' + id + ')',
                type: "PUT",
                data: JSON.stringify(item),
                contentType: "application/json;odata=verbose"
            })
            .fail(handleError);
        };

        function deleteItem(item) {

            var table = _table;

            var id = item[table.key];

            return $.ajax({
                type: "DELETE",
                url: serviceUrl + table.name + '(' + id + ')'
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

        function vmGetWidth(name) {
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

        function getDateFilterParams(timeProperties, filter, field, time) {

            var date = getTimeToUpdate(time);

            for (var i in date) {

                if (timeProperties.indexOf(i) > -1) {

                    filter.push("{0}({1}) eq {2}".format(i, field.name, date[i].toString()));
                }
            }
        }
    }


});
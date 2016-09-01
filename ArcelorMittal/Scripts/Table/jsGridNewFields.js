// control for String
(function (jsGrid, $, undefined) {

    var Field = jsGrid.Field;

    function TextField(config) {
        Field.call(this, config);
    }

    TextField.prototype = new Field({

        autosearch: true,
        readOnly: false,

        filterTemplate: function () {
            if (!this.filtering)
                return "";

            var grid = this._grid,
                $result = this.filterControl = this._createTextBox();

            if (this.autosearch) {
                $result.on("keypress", function (e) {
                    if (e.which === 13) {

                        if ($(this).val() == '')
                            $(document).trigger('oDataGrid.filterEmpty');

                        grid.search();
                        e.preventDefault();
                    }
                });
            }

            return $result;
        },

        insertTemplate: function () {
            if (!this.inserting)
                return "";

            return this.insertControl = this._createTextBox();
        },

        editTemplate: function (value) {
            if (!this.editing)
                return this.itemTemplate(value);

            var $result = this.editControl = this._createTextBox();
            $result.val(value);
            return $result;
        },

        filterValue: function () {

            var val = this.filterControl.val();
            if (this.nullable && val == '')
                return null
            else
                return this.filterControl.val();
        },

        insertValue: function () {
            
            var val = this.insertControl.val();
            if (this.nullable && val == '')
                return null
            else
                return this.insertControl.val();
        },

        editValue: function () {
            
            var val = this.editControl.val();
            if (this.nullable && val == '')
                return null
            else
                return this.editControl.val();
        },

        _createTextBox: function () {
            return $("<input>").attr("type", "text")
                   .addClass('form-control')
                .prop("readonly", !!this.readOnly);
        }
    });

    jsGrid.fields.text = jsGrid.TextField = TextField;

}(jsGrid, jQuery));

// control for integer
(function (jsGrid, $, undefined) {

    var TextField = jsGrid.TextField;

    function NumberField(config) {
        TextField.call(this, config);
    }

    NumberField.prototype = new TextField({

        sorter: "number",
        align: "right",
        readOnly: false,

        filterValue: function () {

            var val = this.filterControl.val();
            if (this.nullable && val == '')
                return null
            else
                return parseInt(this.filterControl.val() || 0, 10);
        },

        insertValue: function () {

            var val = this.insertControl.val();
            if (this.nullable && val == '')
                return null
            else
                return parseInt(this.insertControl.val() || 0, 10);
        },

        editValue: function () {

            var val = this.editControl.val();
            if (this.nullable && val == '')
                return null
            else
                return parseInt(this.editControl.val() || 0, 10);
        },

        _createTextBox: function () {
            return $("<input>").attr("type", "number")
                .addClass('form-control')
                .prop("readonly", !!this.readOnly);
        }
    });

    jsGrid.fields.number = jsGrid.NumberField = NumberField;

}(jsGrid, jQuery));

//control for float counts
(function (jsGrid, $, undefined) {

    var TextField = jsGrid.TextField;

    function FloatNumberField(config) {
        TextField.call(this, config);
    }

    FloatNumberField.prototype = new TextField({

        sorter: "number",
        align: "right",
        readOnly: false,

        filterValue: function () {

            var val = this.filterControl.val();
            if (this.nullable && val == '')
                return null
            else
                return parseInt(this.filterControl.val() || 0, 10);
        },

        insertValue: function () {

            var val = this.insertControl.val();
            if (this.nullable && val == '')
                return null
            else
                return parseInt(this.insertControl.val() || 0, 10);
        },

        editValue: function () {

            var val = this.editControl.val();
            if (this.nullable && val == '')
                return null
            else
                return parseInt(this.editControl.val() || 0, 10);
        },

        _createTextBox: function () {
            return $("<input type='number' step='0.0000000001'>")
                .addClass('form-control')
                .prop("readonly", !!this.readOnly);
        }
    });

    jsGrid.fields.floatNumber = jsGrid.FloatNumberField = FloatNumberField;

}(jsGrid, jQuery));

//datepicker
(function (jsGrid, $, undefined) {

    var datePicker = function (config) {
        jsGrid.Field.call(this, config);
    };

    datePicker.prototype = new jsGrid.Field({

        css: "date-field",            // redefine general property 'css'
        align: "left",              // redefine general property 'align'

        sorter: function (date1, date2) {
            return new Date(date1) - new Date(date2);
        },

        itemTemplate: function (value) {
            //return new Date(value).toDateString();
            var dateVal = getTimeToUpdate(value, true);
            return dateVal.day + '.' + dateVal.month + '.' + dateVal.year
        },

        insertTemplate: function (value) {
            return this._insertPicker = $("<input type='text'>")
                                            .addClass('form-control')
                                            .datepicker({
                                                defaultDate: new Date(),
                                                dateFormat: 'dd.mm.yy'
                                            });
        },

        filterTemplate: function (value) {

            var grid = this._grid;

            return this._filterPicker = $("<input type='text'>")
                                            .addClass('form-control')
                                            .datepicker({
                                                defaultDate: new Date(),
                                                dateFormat: 'dd.mm.yy',
                                                onSelect: function (dateText, inst) {

                                                    grid.search();
                                                }
                                            }).on('keypress', function (e) {

                                                if (e.which === 13) {
                                                    grid.search();
                                                    e.preventDefault();
                                                }
                                            });
        },

        editTemplate: function (value) {
            return this._editPicker = $("<input type='text'>")
                                            .addClass('form-control')
                                            .datepicker({ dateFormat: 'dd.mm.yy' })
                                            .datepicker("setDate", new Date(value));
        },

        filterValue: function () {
            return this._filterPicker.val();
        },

        insertValue: function () {
            return this._insertPicker.val();
        },

        editValue: function () {
            return this._editPicker.val();
        }
    });

    jsGrid.fields.date = datePicker;

}(jsGrid, jQuery));

//datetimepicker
(function (jsGrid, $, undefined) {

    var dateTimePicker = function (config) {
        jsGrid.Field.call(this, config);
    };

    dateTimePicker.prototype = new jsGrid.Field({

        css: "date-field",            // redefine general property 'css'
        align: "left",              // redefine general property 'align'

        sorter: function (date1, date2) {
            return new Date(date1) - new Date(date2);
        },

        itemTemplate: function (value) {

            var dateVal = getTimeToUpdate(value, true);

            return dateVal.day + '.' + dateVal.month + '.' + dateVal.year + ' ' + dateVal.hour + ':' + dateVal.minute + ':' + dateVal.second;
        },

        insertTemplate: function (value) {
            return this._insertPicker = $("<input type='text' class='form-control'>").datetimepicker({
                defaultDate: new Date(),
                dateFormat: 'dd.mm.yy',
                timeFormat: 'HH:mm:ss',
                controlType: dateTimePickerControl,
            });
        },

        filterTemplate: function (value) {

            var grid = this._grid;

            return this._filterPicker = $("<input type='text' class='form-control'>").datepicker(
                {
                    defaultDate: new Date(),
                    dateFormat: 'dd.mm.yy',

                    onClose: function () {

                        grid.search();
                    }
                });
        },

        editTemplate: function (value) {
            return this._editPicker = $("<input type='text' class='form-control'>").datetimepicker({
                timeFormat: 'HH:mm:ss',
                dateFormat: 'dd.mm.yy',
                controlType: dateTimePickerControl,
            }).datetimepicker("setDate", new Date(value));
        },

        filterValue: function () {
            return this._filterPicker.val();
        },

        insertValue: function () {

            var time = getTimeToUpdate(this._insertPicker.val());
            var stringToBase = '{0}-{1}-{2}T{3}:{4}:{5}.000Z'.format(time.year, time.month, time.day, time.hour, time.minute, time.second);

            return stringToBase;
        },

        editValue: function () {

            var time = getTimeToUpdate(this._editPicker.val());
            var stringToBase = '{0}-{1}-{2}T{3}:{4}:{5}.000Z'.format(time.year, time.month, time.day, time.hour, time.minute, time.second);

            return stringToBase;
        }
    });

    jsGrid.fields.dateTime = dateTimePicker;

}(jsGrid, jQuery));

//combo
(function (jsGrid, $, undefined) {

    var NumberField = jsGrid.NumberField;

    function combo(config) {
        this.items = [];
        this.selectedIndex = -1;

        NumberField.call(this, config);
    }

    combo.prototype = new NumberField({

        align: "left",
        valueType: "number",

        itemTemplate: function (value, item) {

            var tableInfo = this.tableInfo;
            var id = this.id;
            var result;
            var items = this.items,
                valueField = this.valueField,
                textField = this.textField,
                resultItem;

            if (valueField) {
                resultItem = $.grep(items, function (item, index) {
                    return item[valueField] === value;
                })[0] || {};
            }
            else {
                resultItem = items[value];
            }

            var result = (textField ? resultItem[textField] : resultItem);

            return result;
        },

        filterTemplate: function () {

            var self = this;
            if (!self.filtering)
                return "";

            var grid = self._grid,
                $result = self.filterControl = self._createSelect();


                if (self.autosearch) {
                    $result.on("change", function (e) {
                        grid.search();
                    });
                }

                return $result;
                                  
        },

        insertTemplate: function () {

            if (!this.inserting)
                return "";

            return this.insertControl = this._createSelect();
        },

        editTemplate: function (value) {

            if (!this.editing)
                return this.itemTemplate(value);

            var $result = this.editControl = this.result.clone();

            $result.val(value);

            return $result;
        },

        filterValue: function () {

            var self = this;

            var filterControl = this.filterControl;
            
            var val = filterControl.val();
                return this.valueType === "number" ? parseInt(val || 0, 10) : val;            
        },

        insertValue: function () {
            var val = this.insertControl.val();
            return this.valueType === "number" ? parseInt(val || 0, 10) : val;
        },

        editValue: function () {
            var val = this.editControl.val();
            return this.valueType === "number" ? parseInt(val || 0, 10) : val;
        },

        _createSelect: function () {
            var $result = $("<select>").addClass('form-control'),
                valueField = 'id',
                textField = 'name',
                selectedIndex = this.selectedIndex,
                tableInfo = this.tableInfo,
                field = this,
                comboFilter = field.comboFilter,
                serviceUrl = this.serviceUrl,
                url = serviceUrl + tableInfo.name;

            if (comboFilter)
                url += '?$filter=' + comboFilter;
                      
            $.ajax({

                url: url,
                xhrFields: {
                    withCredentials: true
                }
            }).then(function (data) {

                        var items = data.value.map(function (item) {

                            return {
                                'id': item[tableInfo.id],
                                'name': item[tableInfo.title]
                            }
                        });                        
                
                        field.items = items;

                        $emptyOption = $("<option>")
                                            .attr('value', '')
                                            .text('')
                                            .appendTo($result);

                        $.each(items, function (index, item) {
                            var value = valueField ? item[valueField] : index,
                                text = textField ? item[textField] : item;

                            var $option = $("<option>")
                                .attr("value", value)
                                .text(text)
                                .appendTo($result);

                            $option.prop("selected", (selectedIndex === index));
                        });

                        $result.prop("disabled", !!this.readOnly);

                        field.result = $result;

                        return $result;
                });

            return $result;
            
        }
    });

    jsGrid.fields.combo = jsGrid.combo = combo;

}(jsGrid, jQuery));

//binary
(function (jsGrid, $, undefined) {

    var binary = function (config) {
        jsGrid.Field.call(this, config);
    };

    binary.prototype = new jsGrid.Field({

        css: "binary-field",        // redefine general property 'css'
        align: "center",              // redefine general property 'align'

        sorter: function () {
            return 0;
        },

        itemTemplate: function (value, item) {

            // get name of table
            // current ID and filename
            var table = this._grid.table.name;
            var id = item[this._grid.table.key];
            var filename = item['FileName'].split('\\').pop();            

            // create download link
            var link = serviceUrl + table + '(' + id + ')/$value';

            // depending on MIME Type
            switch (item.MIMEType)
            {
                case 'image/png':
                case 'image/gif':
                case 'image/jpeg':
                case 'image/bmp':

                    // create image element
                    // attach its source to service resource link
                    // handle click event
                    // and paste image to clipboard
                    return $('<img />').attr('src', link)
                                    .click(function () {

                                        if (document.body.createControlRange) {

                                            // for IE specific
                                            // add image to control range
                                            // execute copy command
                                            var range = document.body.createControlRange();
                                            range.add(this);
                                            range.execCommand('copy');

                                        } else {

                                            // create range and add image to it
                                            var range = document.createRange();
                                            range.selectNode(this);

                                            // clear selection ranges
                                            // add range with image
                                            window.getSelection().removeAllRanges();
                                            window.getSelection().addRange(range);

                                            // execute copy command
                                            document.execCommand('copy');
                                        };
                                    });

                default:

                    // create link for file download
                    return $('<a />').attr({ target: '_blank', download: filename, href: link })
                                .text('Download');
            }
        },

        insertTemplate: function (value) {
            return null;
        },

        filterTemplate: function (value) {
            return null;
        },

        editTemplate: function (value, item) {
            return null;
        },

        filterValue: function () {
            return null;
        },

        insertValue: function () {
            return null;
        },

        editValue: function () {
            return null;
        }
    });

    jsGrid.fields.binary = binary;

}(jsGrid, jQuery));

//myCheckBox
(function (jsGrid, $, undefined) {

    var Field = jsGrid.Field;

    function MyCheckboxField(config) {
        Field.call(this, config);
    }

    MyCheckboxField.prototype = new Field({

        sorter: "number",
        align: "center",
        autosearch: true,

        itemTemplate: function (value) {

            return this._createCheckbox().prop({
                checked: value,
            });
        },

        filterTemplate: function () {
            return null;
        },

        insertTemplate: function () {
            return null;
        },

        editTemplate: function (value) {
            return null;
        },

        filterValue: function () {
            return null;
        },

        insertValue: function () {
            return null;
        },

        editValue: function () {
            return null;
        },

        _createCheckbox: function () {
            return $("<input>").attr("type", "checkbox");
        }
    });

    jsGrid.fields.myCheckbox = jsGrid.MyCheckboxField = MyCheckboxField;

}(jsGrid, jQuery));

//preview
(function (jsGrid, $, undefined) {

    var Field = jsGrid.Field;

    function PreviewField(config) {
        Field.call(this, config);
    }

    PreviewField.prototype = new Field({

        sorter: "number",
        align: "center",
        autosearch: false,

        itemTemplate: function (value, item) {

            var blackWrapper = $('<div />').attr({ 'id': 'fullImage' })
                                           .addClass('black-wrapper')
                                           .appendTo('body').hide(),

                controlsRootModal = $('<div />').addClass('modal fullImage')
                                        .appendTo(blackWrapper),

                fullImageZone = $('<div />').addClass('scaleZone')
                                        .appendTo(controlsRootModal),

                fullImage = $('<img />').appendTo(fullImageZone),

                cancelBtn = $('<button />')
                                        .addClass('btn btn-circle')
                                        .append('<span class="glyphicon glyphicon-remove"></span>')
                                        .appendTo(controlsRootModal)
                                        .click(function () {

                                            fullImage.removeAttr('src');
                                            blackWrapper.hide();
                                        })

            if (item.PreviewID) {

                var table = this._grid.table.name;
                var id = item['PreviewID'];

                // create download link
                var link = serviceUrl + table + '(' + id + ')/$value';

                return $('<img />').attr('src', link)
                                        .click(function () {

                                            blackWrapper.show();

                                            fullImage.attr('src', link);

                                        });
            } else return null;

            
        },

        filterTemplate: function () {
            return null;
        },

        insertTemplate: function () {
            return null;
        },

        editTemplate: function (value) {
            return null;
        },

        filterValue: function () {
            return null;
        },

        insertValue: function () {
            return null;
        },

        editValue: function () {
            return null;
        },

    });

    jsGrid.fields.preview = jsGrid.PreviewField = PreviewField;

}(jsGrid, jQuery));

// control for Indication
(function (jsGrid, $, undefined) {

    var Field = jsGrid.Field;

    function Indication(config) {
        Field.call(this, config);
    }

    Indication.prototype = new Field({

        align: "center",
        autosearch: false,
        readOnly: false,

        itemTemplate: function (value, item) {

            if (value)
                return '<span class="glyphicon glyphicon-ok"></span>';
            else
                return '<span class="glyphicon glyphicon-remove"></span>';
        },

        filterTemplate: function () {
            return null;
        },

        insertTemplate: function () {

            return null;
        },

        editTemplate: function (value) {
            return null;
        },

        filterValue: function () {

            return null;
        },

        insertValue: function () {

            return null;
        },

        editValue: function () {

            return null;
        },

    });

    jsGrid.fields.indication = jsGrid.Indication = Indication;

}(jsGrid, jQuery));

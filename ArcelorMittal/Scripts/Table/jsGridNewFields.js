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
            return new Date(value).toDateString();
        },

        insertTemplate: function (value) {
            return this._insertPicker = $("<input type='text'>").datepicker({ defaultDate: new Date(), dateFormat: 'yy-mm-dd' });
        },

        filterTemplate: function (value) {

            var grid = this._grid;

            return this._filterPicker = $("<input type='text'>").datepicker(
                {
                    defaultDate: new Date(),
                    dateFormat: 'yy-mm-dd',
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
            return this._editPicker = $("<input type='text'>").datepicker({ dateFormat: 'yy-mm-dd' }).datepicker("setDate", new Date(value));
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

    var myControl = {
        create: function (tp_inst, obj, unit, val, min, max, step) {
            $('<input type="text" class="ui-timepicker-input" value="' + val + '" style="width:80%">')
                .appendTo(obj)
                .spinner({
                    min: 0,
                    max: unit == 'hour' ? 23 : 59,
                    step: step,
                    change: function (e, ui) { // key events
                        // don't call if api was used and not key press
                        if (e.originalEvent !== undefined)
                            tp_inst._onTimeChange();

                        if (tp_inst.hour && tp_inst.hour > 23)
                            tp_inst.hour = 23;
                        if (tp_inst.minute && tp_inst.minute > 59)
                            tp_inst.minute = 59;
                        if (tp_inst.second && tp_inst.second > 59)
                            tp_inst.second = 59;

                        tp_inst._onSelectHandler();
                    },
                    spin: function (e, ui) { // spin events
                        tp_inst.control.value(tp_inst, obj, unit, ui.value);
                        tp_inst._onTimeChange();
                        tp_inst._onSelectHandler();
                    }
                });
            return obj;
        },
        options: function (tp_inst, obj, unit, opts, val) {
            if (typeof (opts) == 'string' && val !== undefined)
                return obj.find('.ui-timepicker-input').spinner(opts, val);
            return obj.find('.ui-timepicker-input').spinner(opts);
        },
        value: function (tp_inst, obj, unit, val) {
            if (val !== undefined) {

                if (unit == 'hour') {

                    if (val > 23)
                        val = 23;
                } else {

                    if (val > 59)
                        val = 59;
                }

                return obj.find('.ui-timepicker-input').spinner('value', val);
            }
                
            return obj.find('.ui-timepicker-input').spinner('value');
        }
    };

    dateTimePicker.prototype = new jsGrid.Field({

        css: "date-field",            // redefine general property 'css'
        align: "left",              // redefine general property 'align'

        sorter: function (date1, date2) {
            return new Date(date1) - new Date(date2);
        },

        itemTemplate: function (value) {
            return new Date(value).toUTCString();
        },

        insertTemplate: function (value) {
            return this._insertPicker = $("<input type='text'>").datetimepicker({
                defaultDate: new Date(),
                dateFormat: 'yy-mm-dd',
                timeFormat: 'HH:mm:ss',
                controlType: myControl,
                beforeShow: addBootstrapClassToControls
            });
        },

        filterTemplate: function (value) {

            var grid = this._grid;

            return this._filterPicker = $("<input type='text'>").datetimepicker(
                {
                    defaultDate: new Date(),
                    dateFormat: 'yy-mm-dd',
                    timeFormat: 'HH:mm:ss',
                    controlType: myControl,
                    beforeShow: addBootstrapClassToControls,
                    onClose: function () {

                        grid.search();
                    }
                });
        },

        editTemplate: function (value) {
            return this._editPicker = $("<input type='text'>").datetimepicker({
                timeFormat: 'HH:mm:ss',
                dateFormat: 'yy-mm-dd',
                controlType: myControl,
                beforeShow: addBootstrapClassToControls
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

(function (jsGrid, $, undefined) {

    var NumberField = jsGrid.NumberField;

    function combo(config) {
        this.items = [];
        this.selectedIndex = -1;

        NumberField.call(this, config);
    }

    combo.prototype = new NumberField({

        align: "center",
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

            var $result = this.result;

            if (!this.editing)
                return this.itemTemplate(value);
            
            (value !== undefined) && $result.val(value);
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
            var $result = $("<select>"),
                valueField = 'id',
                textField = 'name',
                selectedIndex = this.selectedIndex,
                tableInfo = this.tableInfo,
                field = this,
                filter = field.filter,
                serviceUrl = this.serviceUrl,
                url = serviceUrl + tableInfo.name;

            if (filter)
                url += '?$filter={0} eq {1}'.format(filter.property, filter.value)
                      
            $.get(url).then(function (data) {

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
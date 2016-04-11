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
            return parseFloat(this.filterControl.val() || 0, 10);
        },

        insertValue: function () {
            return parseFloat(this.insertControl.val() || 0, 10);
        },

        editValue: function () {
            return parseFloat(this.editControl.val() || 0, 10);
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
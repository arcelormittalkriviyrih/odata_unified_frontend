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

//datapicker
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
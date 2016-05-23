app.controller('marketCtrl', ['$scope', 'indexService', '$state', 'roles', function ($scope, indexService, $state, roles) {

    // throw main tab change
    $scope.$emit('mainTabChange', 'Market');

    $(function () {

        //handling required fields for IE
        if ($("<input />").prop("required") === undefined) {

            $('input, select').click(function () {

                if ($(this).attr('type') == 'file') {
                    $(this).parent().removeClass('wrong');
                } else
                    $(this).removeClass('wrong');
            })

            $(document).on("submit", function (e) {
               
                $(this)                    
                        .find("input, select")
                        .filter("[required]")
                        .filter(function () { return this.value == ''; })
                        .each(function () {
                            e.preventDefault();
                            

                            if ($(this).attr('type') == 'file') {

                                if ($('input#fileName').val() == '')
                                    $(this).parent().addClass('wrong');

                            } else
                                $(this).addClass('wrong');

                            alert($('label[for=' + $(this).attr('id') + ']').html() + " is required!");
                        });
            });

        }

        $('div#files').jsGrid({
            height: "500px",
            width: "950px",

            sorting: false,
            paging: true,
            editing: false,
            filtering: true,
            autoload: true,
            pageLoading: true,
            inserting: false,
            pageIndex: 1,
            pageSize: 10,

            rowClick: function (args) {
                vmPopulateForm(args.item);

                $form.find('input[type=file]').prop('required', false);
                $form.find('input[type=file]').attr('required', false);
            },

            onItemDeleted: function () {

                // hide edit form
                // on successfull delete
                $form.hide();
            }
        })
        .jsGrid('initOdata', {
            serviceUrl: serviceUrl,
            table: 'Files',

            fields: [{
                id: 'ID',
                name: 'ID',
                title: 'ID',
                order: 1
            }, {
                id: 'FileName',
                name: 'FileName',
                title: 'File Name',
                order: 2
            }, {
                id: 'Name',
                name: 'Name',
                title: 'Name',
                order: 3
            }, {
                id: 'Status',
                name: 'Status',
                title: 'Status',
                order: 4
            }, {
                id: 'FileType',
                name: 'FileType',
                title: 'File Type',
                order: 5
            }, {
                id: 'Data',
                name: 'Data',
                title: 'Data',
                order: 6
            }],

            controlProperties: {
                type: 'control',
                editButton: false,
                clearFilterButton: false,
                modeSwitchButton: false
            }
        })
        .jsGrid('loadOdata', {});

        // get form element
        var $form = $('#fileForm');

        // add new record
        $('#addFile').click(vmAddRecord);
        $('#cancel').click(vmResetForm);
        $('#fileData').change(vmFileSelected);

        function vmPopulateForm(item) {

            // create service URL
            // to create / update file by ID
            // and assign it as form action
            var action = serviceUrl + 'Files(' + item.ID + ')/$value';
            $form.attr('action', action);

            $('input[type=text], select').removeClass('wrong');
            $('input[type=file]').parent().removeClass('wrong');
            
            $form.find('[name="FileName"]').val(item.FileName);
            $form.find('[name="Name"]').val(item.Name);
            $form.find('[name="Status"]').val(item.Status);
            $form.find('[name="FileType"]').val(item.FileType);

            // show form
            $form.show();
        };

        function vmAddRecord() {

            // prepare form for INSERT
            // set ID to -1
            // set File type to default value
            vmPopulateForm({
                ID: -1,
                FileName: '',
                Name: '',
                FileType: 'Excel label'
            });

            $form.find('input[type=file]').prop('required', true);
            $form.find('input[type=file]').attr('required', true);

            return false;
        }

        // on file selected
        function vmFileSelected() {

            // get filename
            var filename = $form.find('[name="Data"]')
                                .val()
                                .split('\\')
                                .pop();

            // get "file name" control
            // and if it's empty
            // update with name of file selected
            var $input = $form.find('[name="FileName"]');
            if (!$input.val())
                $input.val(filename)
        }

        function vmResetForm() {

            //reset form entered data
            $form[0].reset();

            //and hide it
            $form.hide();
        }
    });

}])



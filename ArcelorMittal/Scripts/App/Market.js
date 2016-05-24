angular.module('indexApp')

.config(['$stateProvider', function ($stateProvider) {

    $stateProvider
        .state('app.Market.Order', {

            url: '/order',
            templateUrl: 'Static/market/order.html',
            controller: 'marketOrderCtrl'
        })
        .state('app.Market.LabelTemplate', {

            url: '/labeltemplate',
            templateUrl: 'Static/market/labeltemplate.html',
            controller: 'marketLabelTemplateCtrl'
        })
}])

.controller('marketCtrl', ['$scope', 'indexService', '$state', 'roles', function ($scope, indexService, $state, roles) {

    // throw main tab change
    $scope.$emit('mainTabChange', 'Market');

    $scope.$on('MarketTabChange', function (event, data) {
        $scope.activeMarketTab = data;
    });
    
}])

.controller('marketOrderCtrl', ['$scope', 'indexService', function ($scope, indexService) {

    $scope.$emit('MarketTabChange', 'Order');

    $scope.orderDetails = [];

    $(function () {

        $('#orders').jsGrid({
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

                vmActiveRow(args);
                vmGetOrderDetails(args);              
            }
        }).jsGrid('initOdata', {
            serviceUrl: serviceUrl,
            table: 'v_Orders',

            fields: [{
                id: 'STD',
                name: 'STD',
                title: 'STD',
                order: 1
            }, {
                id: 'CONTR',
                name: 'CONTR',
                title: 'Контракт №',
                order: 2
            }, {
                id: 'DIR',
                name: 'DIR',
                title: 'Направление',
                order: 3
            }, {
                id: 'ORDER',
                name: 'ORDER',
                title: 'Заказ',
                order: 4
            }, {
                id: 'TMPL',
                name: 'TMPL',
                title: 'Шаблон бирки',
                order: 5
            }],

            controlProperties: {
                type: 'control',
                editButton: false,
                deleteButton: true,
                clearFilterButton: true,
                modeSwitchButton: true
            }
        }).jsGrid('loadOdata', {})

        $("#orderDetails").addClass('disabled-grid').jsGrid({
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

        });

    });

    function vmGetOrderDetails(args) {

        var id = args.item.id;

        $("#orderDetails").removeClass('disabled-grid').jsGrid('initOdata', {
            serviceUrl: serviceUrl,
            table: 'v_OrderProperties',
            fields: [{
                id: 'Value',
                name: 'Value',
                title: 'Значение',
                order: 1
            }, {
                id: 'Description',
                name: 'Description',
                title: 'Описание',
                order: 2
            }]
        }).jsGrid('loadOdata', {
            defaultFilter: 'OperationsRequest eq {0}'.format(id)
        })
    }
    
}])

.controller('marketLabelTemplateCtrl', ['$scope', '$state', function ($scope, $state) {

    $scope.$emit('MarketTabChange', 'LabelTemplate');

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

        //refresh page after submit
        $form.on('submit', function () {

            setTimeout(function () {
                window.location.reload();
        }, 1000);
        })
    });
}])



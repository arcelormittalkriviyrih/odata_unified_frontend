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
            controller: 'marketLabelTemplateCtrl',
            params: {

                fileType: 'Excel label'
            }
        })
    .state('app.Market.Logotypes', {

        url: '/logotypes',
        templateUrl: 'Static/market/labeltemplate.html',
        controller: 'marketLabelTemplateCtrl',
        params: {
            fileType: 'Image'
        }
    })
}])

.controller('marketCtrl', ['$scope', 'indexService', '$state', 'roles', function ($scope, indexService, $state, roles) {

}])

.controller('marketOrderCtrl', ['$scope', 'indexService', '$translate', '$q', '$rootScope', function ($scope, indexService, $translate, $q, $rootScope) {

    $scope.orderDetails = [];

    $scope.isShowModal = false;
    $scope.toggleModal = vmToggleModal;

    $scope.createForm = vmCreateForm;
    $scope.deleteRow = vmDeleteRow;

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

            var id = args.item.id;

            $scope.selectedRow = id;
            $scope.selectedOrder = args.item.COMM_ORDER;

            $scope.$apply();

            vmActiveRow(args);

            $("#orderDetails").removeClass('disabled-grid').jsGrid('initOdata', {
                serviceUrl: serviceUrl,
                table: 'v_OrderProperties',
                fields: [{
                    id: 'Value',
                    name: 'Value',
                    title: $translate.instant('grid.common.value'),
                    order: 2
                }, {
                    id: 'Description',
                    name: 'Description',
                    title: $translate.instant('market.grid.orders.parameter'),
                    order: 1
                }]
            }).jsGrid('loadOdata', {
                defaultFilter: 'OperationsRequest eq {0}'.format(id),
                clientSort: 'Description'
            })
        }
    }).jsGrid('initOdata', {
        serviceUrl: serviceUrl,
        table: 'v_Orders',

        fields: [{
            id: 'COMM_ORDER',
            name: 'COMM_ORDER',
            title: $translate.instant('market.grid.orders.order'),
            order: 1
        }, {
            id: 'CONTRACT_NO',
            name: 'CONTRACT_NO',
            title: $translate.instant('market.grid.orders.contract'),
            order: 2
        }, {
            id: 'DIRECTION',
            name: 'DIRECTION',
            title: $translate.instant('market.grid.orders.direction'),
            order: 3
        }, {
            id: 'TEMPLATE',
            name: 'TEMPLATE',
            title: $translate.instant('market.grid.orders.labelTemplate'),
            order: 4
        }]
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


    function vmCreateForm(type, procedure, id, keyField) {

        vmToggleModal(true);

        var oDataAPI = [indexService.getInfo('Files'),
                indexService.getInfo('MaterialDefinition?$filter=MaterialClassID eq (1)')];

        if (id) {

            oDataAPI.push(indexService.getInfo('v_OrderPropertiesAll?$filter=OperationsRequest eq ({0})'.format(id)))
        }

        $q.all(oDataAPI)
            .then(function (responce) {

                var rowData;

                var templateData = responce[0].data.value;
                var profileData = responce[1].data.value;

                if (id)
                    rowData = responce[2].data.value;

                $('#orderForm').oDataAction({

                    action: procedure,
                    type: type,
                    keyField: keyField,
                    rowData: rowData,
                    controlCaptions: {

                        OK: 'OK',
                        Cancel: $translate.instant('buttonCancel')
                    },
                    fields: [{

                        name: 'STANDARD',
                        properties: {
                            control: 'text',
                            required: false,
                            translate: $translate.instant('market.Order.CreateDialogue.STANDARD')
                        }
                    }, {

                        name: 'LENGTH',
                        properties: {
                            control: 'text',
                            required: true,
                            translate: $translate.instant('market.Order.CreateDialogue.LENGTH')
                        }
                    }, {

                        name: 'MIN_ROD',
                        properties: {
                            control: 'text',
                            required: false,
                            translate: $translate.instant('market.Order.CreateDialogue.MIN_ROD')
                        }
                    }, {

                        name: 'CONTRACT_NO',
                        properties: {
                            control: 'text',
                            required: true,
                            translate: $translate.instant('market.Order.CreateDialogue.CONTRACT_NO')
                        }
                    }, {

                        name: 'DIRECTION',
                        properties: {
                            control: 'text',
                            required: true,
                            translate: $translate.instant('market.Order.CreateDialogue.DIRECTION')
                        }
                    }, {

                        name: 'PRODUCT',
                        properties: {
                            control: 'text',
                            required: false,
                            translate: $translate.instant('market.Order.CreateDialogue.PRODUCT')
                        }
                    }, {

                        name: 'CLASS',
                        properties: {
                            control: 'text',
                            required: false,
                            translate: $translate.instant('market.Order.CreateDialogue.CLASS')
                        }
                    }, {

                        name: 'STEEL_CLASS',
                        properties: {
                            control: 'text',
                            required: false,
                            translate: $translate.instant('market.Order.CreateDialogue.STEEL_CLASS')
                        }
                    }, {

                        name: 'CHEM_ANALYSIS',
                        properties: {
                            control: 'text',
                            required: false,
                            translate: $translate.instant('market.Order.CreateDialogue.CHEM_ANALYSIS')
                        }
                    }, {

                        name: 'BUNT_DIA',
                        properties: {
                            control: 'text',
                            required: false,
                            translate: $translate.instant('market.Order.CreateDialogue.BUNT_DIA')
                        }
                    }, {

                        name: 'ADDRESS',
                        properties: {
                            control: 'text',
                            required: false,
                            translate: $translate.instant('market.Order.CreateDialogue.ADDRESS')
                        }
                    }, {

                        name: 'COMM_ORDER',
                        properties: {
                            control: 'text',
                            required: true,
                            translate: $translate.instant('market.Order.CreateDialogue.COMM_ORDER')
                        },
                    }, {
                        name: 'TEMPLATE',
                        properties: {
                            control: 'combo',
                            required: true,
                            translate: $translate.instant('market.Order.CreateDialogue.TEMPLATE'),
                            data: templateData,
                            keyField: 'ID',
                            valueField: 'Name'
                        }
                    }, {
                        name: 'PROFILE',
                        properties: {
                            control: 'combo',
                            required: true,
                            translate: $translate.instant('market.Order.CreateDialogue.PROFILE'),
                            data: profileData,
                            keyField: 'ID',
                            valueField: 'Description'
                        }
                    }]
                });
            })
    }

    function vmDeleteRow(order) {

        if (confirm('Are you sure?')) {

            $.ajax({
                url: serviceUrl + 'del_Order',
                type: 'POST',
                data: JSON.stringify({ COMM_ORDER: order }),
                contentType: "application/json"
            }).done(function (result) {

                $('#orders').jsGrid('loadOdata', {});
                $("#orderDetails").jsGrid('loadOdata', {
                    defaultFilter: 'OperationsRequest eq (-1)',
                });

            }).fail(handleError);
        }

    }

    function vmToggleModal(expr) {

        $scope.isShowModal = expr;
    }

    $(document).on('oDataForm.success', function (e, data) {

        vmToggleModal(false);


        $('#orders').jsGrid('loadOdata', {});

        $("#orderDetails").jsGrid('loadOdata', {
            defaultFilter: 'OperationsRequest eq (-1)',
        });

        $scope.$apply();
    });

    $(document).on('oDataForm.cancel', function (e) {

        vmToggleModal(false);
        $scope.$apply();
    })
}])

.controller('marketLabelTemplateCtrl', ['$scope', '$state', '$rootScope', '$translate', function ($scope, $state, $rootScope, $translate) {

    //hack for IE. This fantastic browser makes form submit when 
    //user makes canceling (form reset).
    //submit form event handles required fields
    //so this check would be start when user makes form reset 
    //and user will seen useless messages about required fields.
    //For resolving this problem I add special flag will be 'true' only in form reset mode
    var _isReset = false;
    $scope.downloadTechnicalList = domainURL + '/api/MediaData/GenerateTemplate';

    //handle required fields for IE 9 browser
    if ($("<input />").prop("required") === undefined) {

        $('input, select').click(function () {

            if ($(this).attr('type') == 'file') {
                $(this).parent().removeClass('wrong');
            } else
                $(this).removeClass('wrong');
        })

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
            title: $translate.instant('market.grid.labelTemplate.fileName'),
            order: 4
        }, {
            id: 'Name',
            name: 'Name',
            title: $translate.instant('market.grid.labelTemplate.templateName'),
            order: 2
        }, {
            id: 'Status',
            name: 'Status',
            title: $translate.instant('market.grid.labelTemplate.status'),
            order: 3
        }, {
            id: 'FileType',
            name: 'FileType',
            title: $translate.instant('market.grid.labelTemplate.fileType'),
            order: 5
        }, {
            id: 'Data',
            name: 'Data',
            title: $translate.instant('market.grid.labelTemplate.file'),
            order: 6
        }],

        controlProperties: {
            type: 'control',
            editButton: false,
            clearFilterButton: false,
            modeSwitchButton: false
        }
    })
    .jsGrid('loadOdata', {

        defaultFilter: "FileType eq '{0}'".format($state.params.fileType)
    });

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

        _isReset = false; //hack for IE

        // prepare form for INSERT
        // set ID to -1
        // set File type to default value
        vmPopulateForm({
            ID: -1,
            FileName: '',
            Name: '',
            FileType: $state.params.fileType
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
        // update with name of file selected
        var $input = $form.find('[name="FileName"]');

        $input.val(filename)
    }

    function vmResetForm() {

        //reset form entered data
        $form[0].reset();

        _isReset = true; //hack for IE

        //and hide it
        $form.hide();
    }

    //check required fields before submit
    //if all required fields are filled - refresh page after submit
    $form.on('submit', function (e) {

        var unFilledFields = $(this)
                    .find("input, select")
                    .filter("[required]")
                    .filter(function () { return this.value == ''; });

        if (unFilledFields.length > 0) {

            unFilledFields.each(function () {
                e.preventDefault();


                if ($(this).attr('type') == 'file') {

                    if ($('input#fileName').val() == '')
                        $(this).parent().addClass('wrong');

                } else
                    $(this).addClass('wrong');

                if (!_isReset) //hack for IE
                    alert($('label[for=' + $(this).attr('id') + ']').html() + " is required!");

            });
        } else {

            setTimeout(function () {
                window.location.reload();
            }, 1000);
        }



    })

}]);
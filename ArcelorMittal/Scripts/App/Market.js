﻿angular.module('indexApp')

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

.controller('marketOrderCtrl', ['$scope', 'indexService', 'marketService', '$translate', '$q', '$rootScope', function ($scope, indexService, marketService, $translate, $q, $rootScope) {

    $scope.orderDetails = [];

    $scope.isShowModal = false;
    $scope.toggleModal = vmToggleModal;

    $scope.createForm = vmCreateForm;
    $scope.deleteRow = vmDeleteRow;

    $scope.loadingModalData = false;

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
                order: 'Description',
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
    }).jsGrid('loadOdata', {
        order: 'id desc'
    })

    $("#orderDetails").addClass('disabled-grid').jsGrid({
        width: "950px",
        sorting: false,
        paging: true,
        editing: false,
        filtering: true,
        autoload: true,
        pageLoading: true,
        inserting: false,
        pageIndex: 1,
        pageSize: 20,

    });


    function vmCreateForm(type, procedure, id, keyField) {

        vmToggleModal(true);

        $scope.loadingModalData = true;
        $scope.orderCaption = $translate.instant('market.Order.caption.{0}'.format(type));

        var oDataAPI = [indexService.getInfo("Files?$filter=FileType eq 'Excel label'")];

        if (id) {

            oDataAPI.push(indexService.getInfo('v_OrderPropertiesAll?$filter=OperationsRequest eq ({0})'.format(id)))
        }

        $q.all(oDataAPI)
            .then(function (responce) {

                $scope.loadingModalData = false;

                var rowData;

                var templateData = responce[0].data.value;

                if (id)
                    rowData = responce[1].data.value;

                marketService.createForm(type, procedure, id, keyField, templateData, rowData);

            });
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

    $('#orderForm').on('oDataForm.success', function (e, data) {

        vmToggleModal(false);

        $('#orders').jsGrid('loadOdata', {
            order: 'id desc'
        });

        $("#orderDetails").jsGrid('loadOdata', {
            defaultFilter: 'OperationsRequest eq (-1)',
        });

        $scope.$apply();
    });

    $('#orderForm').on('oDataForm.cancel', function (e) {

        vmToggleModal(false);
        $scope.$apply();
    });

    $('#orderForm').on('oDataForm.procedureProcessing', function (e) {

        $scope.processingTestPrint = true;
        $scope.$apply();
    });

    $('#orderForm').on('oDataForm.procedureProcessed', function (e) {

        $scope.processingTestPrint = false;
        $scope.$apply();
    });
}])

.controller('marketLabelTemplateCtrl', ['$scope', '$state', '$rootScope', '$translate', 'indexService', '$q', 'marketService', function ($scope, $state, $rootScope, $translate, indexService, $q, marketService) {

    //hack for IE. This fantastic browser makes form submit when 
    //user makes canceling (form reset).
    //submit form event handles required fields
    //so this check would be start when user makes form reset 
    //and user will seen useless messages about required fields.
    //For resolving this problem I add special flag will be 'true' only in form reset mode
    var _isReset = false;
    $scope.downloadTechnicalList = domainURL + '/api/MediaData/GenerateTemplate';
    $scope.showDownloadButton = true;
    $scope.toggleModal = false;
    $scope.createForm = vmCreateForm;

    if ($state.current.name.indexOf('Logotypes')>-1)
        $scope.showDownloadButton = false;

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

            vmActiveRow(args);
            vmPopulateForm(args.item);
            $scope.selectedTemplateID = args.item.ID;

            $form.find('input[type=file]').prop('required', false);
            $form.find('input[type=file]').attr('required', false);

            $scope.$apply();
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

        defaultFilter: "FileType eq '{0}'".format($state.params.fileType),
        order: 'ID desc'
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



    });

    function vmCreateForm(type, procedure, id, keyField) {

        vmToggleModal(true);

        $scope.loadingModalData = true;
        $scope.orderCaption = $translate.instant('market.Order.caption.{0}'.format(type));

        indexService.getInfo("Files?$filter=FileType eq 'Excel label'")
            .then(function (responce) {

                $scope.loadingModalData = false;
                var templateData = responce.data.value;

                var rowData = [{

                    Property: 'TEMPLATE',
                    Value: id.toString()
                }];

                marketService.createForm(type, procedure, id, keyField, templateData, rowData, true);

            });
    };

    function vmToggleModal(expr) {

        $scope.isShowModal = expr;
    };

    $('#orderForm').on('oDataForm.procedureProcessing', function (e) {

        $scope.processingTestPrint = true;

        $scope.$apply();
    });

    $('#orderForm').on('oDataForm.procedureProcessed', function (e) {

        $scope.processingTestPrint = false;

        $scope.$apply();
    });

    $('#orderForm').on('oDataForm.cancel', function (e) {

        vmToggleModal(false);
        $scope.$apply();
    })

}])

.service('marketService', ['$translate', function ($translate) {

    this.createForm = function (type, procedure, id, keyField, templateData, rowData, hideSubmit) {

        var controlList = [{
            type: 'additional',
            name: 'testPrint',
            text: $translate.instant('market.Order.CreateDialogue.additionalButtonCaptions.testPrint'),
            procedure: 'ins_MaterialLotForTestPrint'
        }];

        if (hideSubmit) {

            controlList.push({

                type: 'submit',
                hide: true
            })
        };
              
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
                    translate: $translate.instant('market.Order.CreateDialogue.STANDARD'),
                    order: 21
                }
            }, {

                name: 'LENGTH',
                properties: {
                    control: 'text',
                    required: false,
                    translate: $translate.instant('market.Order.CreateDialogue.LENGTH'),
                    order: 6
                }
            }, {

                name: 'MIN_ROD',
                properties: {
                    control: 'text',
                    required: false,
                    translate: $translate.instant('market.Order.CreateDialogue.MIN_ROD'),
                    order: 12
                }
            }, {

                name: 'CONTRACT_NO',
                properties: {
                    control: 'text',
                    required: false,
                    translate: $translate.instant('market.Order.CreateDialogue.CONTRACT_NO'),
                    order: 3
                }
            }, {

                name: 'DIRECTION',
                properties: {
                    control: 'text',
                    required: false,
                    translate: $translate.instant('market.Order.CreateDialogue.DIRECTION'),
                    order: 4
                }
            }, {

                name: 'PRODUCT',
                properties: {
                    control: 'text',
                    required: false,
                    translate: $translate.instant('market.Order.CreateDialogue.PRODUCT'),
                    order: 20
                }
            }, {

                name: 'CLASS',
                properties: {
                    control: 'text',
                    required: false,
                    translate: $translate.instant('market.Order.CreateDialogue.CLASS'),
                    order: 8
                }
            }, {

                name: 'STEEL_CLASS',
                properties: {
                    control: 'text',
                    required: false,
                    translate: $translate.instant('market.Order.CreateDialogue.STEEL_CLASS'),
                    order: 9
                }
            }, {

                name: 'CHEM_ANALYSIS',
                properties: {
                    control: 'text',
                    required: false,
                    translate: $translate.instant('market.Order.CreateDialogue.CHEM_ANALYSIS'),
                    order: 22
                }
            }, {

                name: 'BUNT_DIA',
                properties: {
                    control: 'text',
                    required: false,
                    translate: $translate.instant('market.Order.CreateDialogue.BUNT_DIA'),
                    order: 19
                }
            }, {

                name: 'BUNT_NO',
                properties: {
                    control: 'text',
                    required: false,
                    translate: $translate.instant('market.Order.CreateDialogue.BUNT_NO'),
                    order: 24
                }
            }, {

                name: 'COMM_ORDER',
                properties: {
                    control: 'text',
                    required: true,
                    translate: $translate.instant('market.Order.CreateDialogue.COMM_ORDER'),
                    order: 1
                },
            }, {

                name: 'PROD_ORDER',
                properties: {
                    control: 'text',
                    required: false,
                    translate: $translate.instant('market.Order.CreateDialogue.PROD_ORDER'),
                    order: 2
                },
            }, {

                name: 'SIZE',
                properties: {
                    control: 'text',
                    required: false,
                    translate: $translate.instant('market.Order.CreateDialogue.SIZE'),
                    order: 5
                },
            }, {

                name: 'TOLERANCE',
                properties: {
                    control: 'text',
                    required: false,
                    translate: $translate.instant('market.Order.CreateDialogue.TOLERANCE'),
                    order: 7
                },
            }, {

                name: 'MELT_NO',
                properties: {
                    control: 'text',
                    required: false,
                    translate: $translate.instant('market.Order.CreateDialogue.MELT_NO'),
                    order: 10
                },
            }, {

                name: 'PART_NO',
                properties: {
                    control: 'text',
                    required: false,
                    translate: $translate.instant('market.Order.CreateDialogue.PART_NO'),
                    order: 11
                },
            }, {

                name: 'BUYER_ORDER_NO',
                properties: {
                    control: 'text',
                    required: false,
                    translate: $translate.instant('market.Order.CreateDialogue.BUYER_ORDER_NO'),
                    order: 13
                },
            }, {

                name: 'BRIGADE_NO',
                properties: {
                    control: 'text',
                    required: false,
                    translate: $translate.instant('market.Order.CreateDialogue.BRIGADE_NO'),
                    order: 14
                },
            }, {

                name: 'PROD_DATE',
                properties: {
                    control: 'date',
                    required: false,
                    translate: $translate.instant('market.Order.CreateDialogue.PROD_DATE'),
                    order: 15
                },
            }, {

                name: 'UTVK',
                properties: {
                    control: 'text',
                    required: false,
                    translate: $translate.instant('market.Order.CreateDialogue.UTVK'),
                    order: 16
                },
            }, {

                name: 'CHANGE_NO',
                properties: {
                    control: 'text',
                    required: false,
                    translate: $translate.instant('market.Order.CreateDialogue.CHANGE_NO'),
                    order: 17
                },
            }, {

                name: 'MATERIAL_NO',
                properties: {
                    control: 'text',
                    required: false,
                    translate: $translate.instant('market.Order.CreateDialogue.MATERIAL_NO'),
                    order: 18
                },
            }, {
                name: 'TEMPLATE',
                properties: {
                    control: 'combo',
                    required: true,
                    translate: $translate.instant('market.Order.CreateDialogue.TEMPLATE'),
                    data: templateData,
                    keyField: 'ID',
                    valueField: 'Name',
                    order: 23
                }
            }],
            controlList: controlList
        });
            
    };
}])


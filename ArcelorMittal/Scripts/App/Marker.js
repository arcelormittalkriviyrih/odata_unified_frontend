angular.module('indexApp')

app.controller('markerCtrl', ['$scope', '$rootScope', 'indexService', '$state', 'roles', '$q', '$translate', 'scalesRefresh', '$interval', function ($scope, $rootScope, indexService, $state, roles, $q, $translate, scalesRefresh, $interval) {

    $scope.filter = [];
    $scope.scalesDetailsInfo = null;
    $scope.currentScaleID = null;
    $scope.isShowModal = false;
    $scope.orderNumber = '';
    $scope.variants = [];

    $scope.showScaleInfo = vmShowScaleInfo;
    //$scope.showPossibleResults = vmShowPossibleResults;
    //$scope.selectPossibleResult = vmSelectPossibleResult;
    $scope.buildForm = vmBuildForm;

    vmGetCurrentScales();

    function vmGetCurrentScales() {

        indexService.getInfo('v_AvailableScales').then(function (response) {

            $scope.scales = response.data.value;

            $scope.scales.sort(function (a, b) {

                if (a.Description < b.Description)
                    return -1;
                else if (a.Description > b.Description)
                    return 1;
                else
                    return 0;
            })

            if ($scope.scales.length > 0) {

                $scope.scales.forEach(function (scale) {

                    $scope.filter.push('ID eq {0}'.format(scale.ID));
                });

                $scope.groups = vmGetChunks($scope.scales, 4);
                $scope.filter = $scope.filter.join(' or ');
            }


            vmGetCurrentScalesInfo();

            //create interval for autorefresh scales
            //this interval must be clear on activity exit
            //so I create rootScope variable and set interval there
            //it will be called in $state onExit handler
            $rootScope.intervalScales = $interval(function () {

                vmGetCurrentScalesInfo();

                if ($scope.currentScaleID)
                    vmShowScaleInfo($scope.currentScaleID);
            }, scalesRefresh);
        })
    }

    function vmGetCurrentScalesInfo() {

        var path = 'v_ScalesShortInfo';
        if ($scope.filter.length > 0)
            path += '?$filter={0}'.format($scope.filter);

        indexService.getInfo(path)
                       .then(function (response) {

                           var scalesInfo = response.data.value;

                           $scope.scales.forEach(function (scale) {

                               var data = scalesInfo.filter(function (item) {

                                   if (item.ID == scale.ID)
                                       return item;
                               })

                               scale.data = data[0];
                           });

                       })
    }

    function vmShowScaleInfo(id) {

        $scope.currentScaleID = id;
        $scope.scalesDetailsInfo = null;

        var path = 'v_ScalesDetailInfo?$filter=ID eq {0}'.format(id);


        indexService.getInfo(path)
                       .then(function (response) {

                           $scope.scalesDetailsInfo = response.data.value[0];
                       });
    }

    //function vmShowPossibleResults(orderNumber) {

    //    $scope.orderNumber = orderNumber;

    //    if (orderNumber.length > 0) {
    //        indexService.getInfo("v_Orders?$filter=contains({0},'{1}')".format('COMM_ORDER', orderNumber))
    //                .then(function (response) {

    //                    $scope.variants = response.data.value.map(function (item) {

    //                        return item.COMM_ORDER;
    //                    });
    //                })
    //    }

    //    else
    //        $scope.variants = [];

    //}

    //function vmSelectPossibleResult(variant) {

    //    $scope.orderNumber = variant;
    //}

    function vmBuildForm(orderNumber) {

        indexService.getInfo("v_Orders?$filter=COMM_ORDER eq '{0}'".format(orderNumber))
                        .then(function (response) {

                            var order = response.data.value;

                            if (order.length > 0)
                                vmCreateForm('edit', 'upd_Order', order[0].id, 'COMM_ORDER');
                            else
                                alert('there is no orders with this name!');
                        })
    }

    function vmCreateForm(type, procedure, id, keyField) {

        vmToggleModal(true);

        var oDataAPI = [indexService.getInfo("Files?$filter=FileType eq 'Excel label'"),
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
    };

    function vmToggleModal(expr) {

        $scope.isShowModal = expr;
    };

    $(document).on('oDataForm.success', function (e, data) {

        vmToggleModal(false);

        $scope.$apply();
    });

    $(document).on('oDataForm.cancel', function (e) {

        vmToggleModal(false);
        $scope.$apply();
    });

}])

.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});
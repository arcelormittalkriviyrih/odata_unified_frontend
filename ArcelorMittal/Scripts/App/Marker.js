angular.module('indexApp')

.config(['$stateProvider', function ($stateProvider) {

    $stateProvider
        .state('app.Marker.ScaleInfo', {

            url: '/scaleinfo',
            templateUrl: 'Static/marker/scaleinfo.html',
            controller: 'markerScaleInfoCtrl'
        })
}])

.controller('markerCtrl', ['$scope', '$rootScope', 'indexService', '$state', 'roles', '$q', '$translate', 'scalesRefresh', '$interval', function ($scope, $rootScope, indexService, $state, roles, $q, $translate, scalesRefresh, $interval) {

    $scope.filter = [];
    $scope.scalesDetailsInfo = {};
    $scope.currentScaleID = null;
    $scope.scaleLoading = false;
    $scope.isShowModal = false;
    $scope.orderNumber = '';
    $scope.deviationState = null;
    $scope.sampleLength = 1;
    $scope.commOrder = null;
    $scope.sideIsSelected = false;
    $scope.OKLabel = 'OK';
    $scope.disableButtonOKTask = false;
    $scope.classOK = null;
    $scope.sandwichModeAccepted = false;
    //$scope.brigadeNoAfterOrderApprove = null;
    //$scope.prodDateAfterOrderApprove = null;

    $scope.currentScales = vmGetCurrentScales;
    $scope.showScaleInfo = vmShowScaleInfo;
    $scope.getLatestWorkRequests = vmGetLatestWorkRequests;
    $scope.buildForm = vmBuildForm;
    $scope.getProfiles = vmGetProfiles;
    $scope.getProfilePropertiesList = vmGetProfilePropertiesList;
    $scope.calculate = vmCalculate;
    $scope.reset = vmReset;
    $scope.workRequest = vmWorkRequest;
    $scope.doAction = vmDoAction;
    $scope.enableControlOK = vmEnableControlOK;
    $scope.checkIsAcceptedOrder = vmCheckIsAcceptedOrder;

    vmGetCurrentSides();    
    vmGetProfiles();

    function vmGetCurrentSides() {

        indexService.getInfo('v_AvailableSides').then(function (response) {
            
            $scope.sides = response.data.value;

            if ($scope.sides.length == 1)
                vmGetCurrentScales();
        });
    }

    function vmGetCurrentScales(side) {

        $scope.sideIsSelected = true;

        var url = 'v_AvailableScales';

        if (side)
            url += '?$filter=sideID eq {0}'.format(side);

        $scope.scaleLoading = true;
        $scope.currentScaleID = null;

        indexService.getInfo(url).then(function (response) {

            $scope.scaleLoading = false;

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

                $scope.filter = [];

                $scope.scales.forEach(function (scale) {
                    $scope.filter.push('ID eq {0}'.format(scale.ID));
                });

                $scope.groups = vmGetChunks($scope.scales, 4);
                $scope.filter = $scope.filter.join(' or ');
            }


            vmGetCurrentScalesShortInfo();

            if ($rootScope.intervalScales)
                $interval.cancel($rootScope.intervalScales);

            //create interval for autorefresh scales
            //this interval must be clear on activity exit
            //so I create rootScope variable and set interval there
            //it will be called in $state onExit handler
            $rootScope.intervalScales = $interval(function () {

                vmGetCurrentScalesShortInfo();

                if ($scope.currentScaleID)
                    vmShowScaleInfo($scope.currentScaleID);
            }, scalesRefresh);
        })
    }

    function vmGetCurrentScalesShortInfo() {

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


        //get scales detail info
        indexService.getInfo('v_ScalesDetailInfo?$filter=ID eq {0}'.format(id))
                       .then(function (response) {

                           $scope.scalesDetailsInfo = response.data.value[0];

                           vmCalculateRods();
                          
                       });                     
    }

    function vmGetLatestWorkRequests(id) {

        vmReset();

        indexService.getInfo('v_LatestWorkRequests?$filter=EquipmentID eq {0}'.format(id))
                    .then(function (response) {
 
                        var data = response.data.value;

                        $scope.orderNumber = null;
                        $scope.commOrder = null;
                        $scope.maxMass = null;
                        $scope.minMass = null;
                        $scope.barWeight = null;
                        $scope.sampleLength = 1;
                        $scope.sampleMass = null;
                        $scope.deviation = null;
                        $scope.brigadeNo = null;
                        $scope.prodDate = null;
                        $scope.length = null;
                        $scope.barQuantity = null;
                        $scope.sandwichMode = null;
                        $scope.approvingMode = null;

                        if (data.length > 0) {

                            $scope.disableButtonOKTask = true;

                            $scope.workRequestID = data[0].WorkRequestID;
                            $scope.selectedProfile = data[0].ProfileID;

                            if ($scope.selectedProfile)
                                vmGetProfilePropertiesList();
                            
                            data.forEach(function (item) {


                                if (item.PropertyType == "COMM_ORDER") {
                                    $scope.orderNumber = item.Value;
                                    $scope.commOrder = item.Value;
                                    $scope.isAcceptedOrder = true;
                                }

                                else if (item.PropertyType == "MAX_WEIGHT")
                                    $scope.maxMass = item.Value;

                                else if (item.PropertyType == "MIN_WEIGHT")
                                    $scope.minMass = item.Value;

                                else if (item.PropertyType == "BAR_WEIGHT")
                                    $scope.barWeight = item.Value;

                                else if (item.PropertyType == "SAMPLE_LENGTH")
                                    $scope.sampleLength = item.Value;

                                else if (item.PropertyType == "SAMPLE_WEIGHT")
                                    $scope.sampleMass = item.Value;

                                else if (item.PropertyType == "DEVIATION")
                                    $scope.deviation = item.Value;

                                else if (item.PropertyType == "BRIGADE_NO") 
                                    $scope.brigadeNo = item.Value;
                                
                                else if (item.PropertyType == "PROD_DATE")
                                    $scope.prodDate = item.Value;

                                else if (item.PropertyType == "LENGTH")
                                    $scope.length = item.Value;

                                else if (item.PropertyType == "BAR_QUANTITY")
                                    $scope.barQuantity = item.Value;

                                else if (item.PropertyType == "SANDWICH_MODE"){
                                    $scope.sandwichMode = item.Value == 'true' ? true : false;
                                    $scope.sandwichModeAccepted = $scope.sandwichMode;
                                }
                                    

                                else if (item.PropertyType == "AUTO_MANU_VALUE")
                                    $scope.approvingMode = item.Value == 'true' ? true : false;

                            });
                        };
                                                
                    });
    };

    function vmGetProfiles() {

        //get profiles (left form)
        indexService.getInfo('MaterialDefinition?$filter=MaterialClassID eq (1)')
                    .then(function (response) {

                        $scope.profiles = response.data.value;
                    });
    }

    function vmGetProfilePropertiesList() {

        if ($scope.selectedProfile) {

            indexService.getInfo('MaterialDefinitionProperty?$filter=MaterialDefinitionID eq ({0})'.format($scope.selectedProfile))
                    .then(function (response) {

                        var profileProperties = response.data.value;

                        if (profileProperties.length > 0) {

                            $scope.linearMassFromBase = vmGetProfileProperty(profileProperties, 1) || null;
                            $scope.length = vmGetProfileProperty(profileProperties, 2) || null;
                            $scope.tolerancePlus = vmGetProfileProperty(profileProperties, 3) || null;
                            $scope.toleranceMinus = vmGetProfileProperty(profileProperties, 4) || null;

                            if (!$scope.length)
                                $scope.minMass = '';

                        } else {

                            $scope.linearMassFromBase = null;
                            $scope.length = null;
                            $scope.tolerancePlus = null;
                            $scope.toleranceMinus = null;
                            $scope.barWeight = null;
                            $scope.minMass = '';

                        }

                        vmCalculate();
                    })
        }

        else {

            $scope.linearMassFromBase = null;
            $scope.length = null;
            $scope.tolerancePlus = null;
            $scope.toleranceMinus = null;
            $scope.barWeight = null;

            vmCalculate();
        }        
    }

    function vmBuildForm(orderNumber) {

        $scope.commOrder = null;
      
        indexService.getInfo("v_WorkDefinitionPropertiesAll?$filter=comm_order eq '{0}'".format(orderNumber))
                         .then(function (response) {

                             $scope.commOrder = orderNumber;

                             var orderData = response.data.value;
                             var procedure;

                             if (orderData.length > 0) {

                                 if (orderData[0].WorkDefinitionID)
                                     procedure = 'upd_WorkDefinition';
                                 else
                                     procedure = 'ins_WorkDefinition';
                                 
                                 vmCreateForm('edit', procedure, orderData, 'COMM_ORDER');
                             } else {

                                 $scope.commOrder = null;

                                 vmShowLastCommOrderValue();

                                 alert('there is no orders with this name!');
                            }
                                  
                         })

    }

    function vmCreateForm(type, procedure, orderData, keyField) {

        vmToggleModal(true);

        indexService.getInfo("Files?$filter=FileType eq 'Excel label'")
                    .then(function (response) {

                        var templateData = response.data.value;

                        $('#orderForm').oDataAction({

                            action: procedure,
                            type: type,
                            keyField: keyField,
                            rowData: orderData,
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
                            },{

                                name: 'LENGTH',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    translate: $translate.instant('market.Order.CreateDialogue.LENGTH')
                                }
                            },{

                                name: 'MIN_ROD',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    translate: $translate.instant('market.Order.CreateDialogue.MIN_ROD')
                                }
                             },{

                                name: 'CONTRACT_NO',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    translate: $translate.instant('market.Order.CreateDialogue.CONTRACT_NO')
                                }
                             },{

                                name: 'DIRECTION',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    translate: $translate.instant('market.Order.CreateDialogue.DIRECTION')
                                }
                             },{

                                name: 'PRODUCT',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    translate: $translate.instant('market.Order.CreateDialogue.PRODUCT')
                                }
                             },{

                                name: 'CLASS',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    translate: $translate.instant('market.Order.CreateDialogue.CLASS')
                                }
                             },{

                                name: 'STEEL_CLASS',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    translate: $translate.instant('market.Order.CreateDialogue.STEEL_CLASS')
                                }
                             },{

                                name: 'CHEM_ANALYSIS',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    translate: $translate.instant('market.Order.CreateDialogue.CHEM_ANALYSIS')
                                }
                             },{

                                name: 'BUNT_DIA',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    translate: $translate.instant('market.Order.CreateDialogue.BUNT_DIA')
                                }
                             },{

                                name: 'COMM_ORDER',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    translate: $translate.instant('market.Order.CreateDialogue.COMM_ORDER')
                                },
                             },{

                                name: 'PROD_ORDER',
                                properties: {
                                    control: 'text',
                                    required: true,
                                    translate: $translate.instant('market.Order.CreateDialogue.PROD_ORDER')
                                },
                             },{

                                name: 'SIZE',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    translate: $translate.instant('market.Order.CreateDialogue.SIZE')
                                },
                             },{

                                name: 'TOLERANCE',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    translate: $translate.instant('market.Order.CreateDialogue.TOLERANCE')
                                },
                             },{

                                name: 'MELT_NO',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    translate: $translate.instant('market.Order.CreateDialogue.MELT_NO')
                                },
                             },{
 
                                name: 'PART_NO',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    translate: $translate.instant('market.Order.CreateDialogue.PART_NO')
                                },
                             },{

                                name: 'BUYER_ORDER_NO',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    translate: $translate.instant('market.Order.CreateDialogue.BUYER_ORDER_NO')
                                },
                            },{

                                name: 'BRIGADE_NO',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    translate: $translate.instant('market.Order.CreateDialogue.BRIGADE_NO')
                                },
                            },{

                                name: 'PROD_DATE',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    translate: $translate.instant('market.Order.CreateDialogue.PROD_DATE')
                                },
                            },{

                                name: 'UTVK',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    translate: $translate.instant('market.Order.CreateDialogue.UTVK')
                                },
                            },{

                                name: 'LEAVE_NO',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    translate: $translate.instant('market.Order.CreateDialogue.LEAVE_NO')
                                },
                            },{

                                name: 'MATERIAL_NO',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    translate: $translate.instant('market.Order.CreateDialogue.MATERIAL_NO')
                                },
                            },{
                                name: 'TEMPLATE',
                                properties: {
                                    control: 'combo',
                                    required: false,
                                    translate: $translate.instant('market.Order.CreateDialogue.TEMPLATE'),
                                    data: templateData,
                                    keyField: 'ID',
                                    valueField: 'Name'
                                }
                            }]
                        });
                    })
    };

    function vmToggleModal(expr) {

        $scope.isShowModal = expr;
    };

    function vmGetProfileProperty(profileProperties, id) {

        return profileProperties.filter(function (item) {

            return item.ClassPropertyID == id;
        }).map(function (item) {

            return item.Value;
        })[0];
    };

    function vmCalculate() {

        /*calculations for left form*/
        $scope.disableButtonOKTask = false;

        if ($scope.length && $scope.linearMassFromBase) {
            $scope.barWeight = $scope.length * $scope.linearMassFromBase;
            $scope.barWeight = parseFloat($scope.barWeight).toFixed(3);
        }

        else
            $scope.barWeight = null;

        if ($scope.barWeight && $scope.barQuantity) {

            $scope.minMass = $scope.barWeight * $scope.barQuantity;
            $scope.minMass = parseFloat($scope.minMass).toFixed(3);
        }
                                   
        if (!$scope.sampleMass || $scope.sampleMass.length == 0)
            $scope.linearMass = $scope.linearMassFromBase;

        if ($scope.sampleMass && $scope.sampleLength && $scope.length) {

            $scope.linearMassCalculated = $scope.sampleMass / $scope.sampleLength;

            $scope.linearMass = $scope.linearMassCalculated;
            $scope.barWeight = $scope.linearMassCalculated * $scope.length; 
            $scope.minMass = $scope.barWeight * $scope.barQuantity;
        }

        if ($scope.linearMassFromBase && $scope.linearMassCalculated) {

            $scope.deviation = (($scope.linearMassCalculated / $scope.linearMassFromBase) * 100) - 100;
            $scope.deviation = parseFloat($scope.deviation).toFixed(1);
        }

        else
            $scope.deviation = null;

        if ($scope.deviation) {

            if (($scope.tolerancePlus && $scope.deviation > $scope.tolerancePlus)
                ||
                ($scope.toleranceMinus && $scope.deviation < (-1) * $scope.toleranceMinus)) {

                $scope.deviationState = 'wrong';
            } else
                $scope.deviationState = 'correct';

        }

        vmCalculateRods();

    };

    function vmCalculateRods() {

        if ($scope.scalesDetailsInfo.WEIGHT_CURRENT && $scope.barWeight) {

            $scope.rodsQuantity = parseInt($scope.scalesDetailsInfo.WEIGHT_CURRENT / $scope.barWeight);
        }

        if ($scope.barQuantity && $scope.rodsQuantity)
            $scope.rodsLeft = $scope.barQuantity - $scope.rodsQuantity;
    };

    function vmReset() {

        $scope.selectedProfile = null;
        $scope.length = null;
        $scope.barQuantity = null;
        $scope.maxMass = null;
        $scope.minMass = null;
        $scope.sampleMass = null;
        $scope.barWeight = null;
        $scope.sampleLength = 1;
        $scope.deviation = null;
    };

    function vmWorkRequest() {

        if ($scope.deviationState != 'wrong'
            && $scope.commOrder
            && $scope.minMass
            && $scope.maxMass
            && (parseFloat($scope.maxMass) >= parseFloat($scope.minMass))
            && $scope.isAcceptedOrder) {

            $scope.minMassWrongClass = false;
            $scope.maxMassWrongClass = false;

            var data = {

                EquipmentID: parseInt($scope.currentScaleID) || null,
                ProfileID: parseInt($scope.selectedProfile) || null,
                COMM_ORDER: $scope.commOrder.toString() || null,
                LENGTH: $scope.length ? $scope.length.toString() : null,
                BAR_WEIGHT: $scope.barWeight ? $scope.barWeight.toString() : null,
                BAR_QUANTITY: $scope.barQuantity ? $scope.barQuantity.toString() : null,
                MAX_WEIGHT: $scope.maxMass ? $scope.maxMass.toString() : null,
                MIN_WEIGHT: $scope.minMass ? $scope.minMass.toString() : null,
                SAMPLE_WEIGHT: $scope.sampleMass ? $scope.sampleMass.toString() : null,
                SAMPLE_LENGTH: $scope.sampleLength ? $scope.sampleLength.toString() : null,
                DEVIATION: $scope.deviation ? $scope.deviation.toString() : null,
                SANDWICH_MODE: $scope.sandwichMode ? 'true' : 'false',
                AUTO_MANU_VALUE: $scope.approvingMode ? 'true' : 'false'
            }
           
            $scope.OKLabel = 'loading...';

            indexService.sendInfo('ins_WorkRequest', data)
                        .then(function (response) {

                            $scope.OKLabel = 'OK';
                            $scope.disableButtonOKTask = true;
                            $scope.sandwichModeAccepted = $scope.sandwichMode;
                        });
        } else {
            
            if (!($scope.maxMass && $scope.minMass) && !$scope.isAcceptedOrder) {
                alert('You must fill all required fields! \n You must accept your order number!');
            }
            else if (!($scope.maxMass && $scope.minMass) && $scope.isAcceptedOrder) {
                alert('You must fill all required fields!');
            }

            else if ($scope.maxMass && $scope.minMass && !$scope.isAcceptedOrder) {
                alert('You must accept your order number!');
            }
            else if (parseFloat($scope.maxMass) < parseFloat($scope.minMass))
                alert('Max weight cannot be less then min weight!');
        }
            

                     
    };

    function vmDoAction(url) {

        indexService.sendInfo(url, {

            COMM_ORDER: $scope.commOrder.toString() || null,
            EquipmentID: parseInt($scope.currentScaleID) || null
        }).then(function (response) {

            response;
        })
    };
   
    function vmEnableControlOK() {

        $scope.disableButtonOKTask = false;
    }

    function vmShowLastCommOrderValue() {

        indexService.getInfo('v_LatestWorkRequests?$filter=EquipmentID eq {0}'.format($scope.currentScaleID))
                    .then(function (response) {

                        var data = response.data.value;

                        if (data.length > 0) {

                            $scope.orderNumber = data.filter(function (item) {

                                return item.PropertyType == 'COMM_ORDER';
                            }).map(function (item) {

                                return item.Value;
                            })[0];

                        };
                    });
    }

    function vmCheckIsAcceptedOrder() {

        $scope.isAcceptedOrder = false;
    }

    $(document).on('oDataForm.success', function (e, data) {

        $scope.disableButtonOKTask = false;
        $scope.isAcceptedOrder = true;
        vmToggleModal(false);
        
        $scope.brigadeNo = data.fields.BRIGADE_NO;
        $scope.prodDate = data.fields.PROD_DATE;

        $scope.$apply();
    });

    $(document).on('oDataForm.cancel', function (e) {

        vmToggleModal(false);        
        vmShowLastCommOrderValue();
        
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

angular.module('indexApp')

.config(['$stateProvider', function ($stateProvider) {

    $stateProvider
        .state('app.Marker.ScaleInfo', {

            url: '/scaleinfo',
            templateUrl: 'Static/marker/scaleinfo.html',
            controller: 'markerScaleInfoCtrl'
        })
}])

.controller('markerCtrl', ['$scope', '$rootScope', 'indexService', '$state', 'roles', '$q', '$translate', 'scalesRefresh', '$interval', '$http', function ($scope, $rootScope, indexService, $state, roles, $q, $translate, scalesRefresh, $interval, $http) {

    //properties
    $scope.filter = [];
    $scope.scalesDetailsInfo = {};
    $scope.currentScaleID = null;
    $scope.scaleLoading = false;
    $scope.isShowModal = false;
    $scope.deviationState = null;
    $scope.sampleLength = 1;
    $scope.commOrder = null;
    $scope.sideIsSelected = false;
    $scope.OKLabel = $translate.instant('marker.acceptOrderTask');
    $scope.takeWeightLabel = $translate.instant('marker.takeWeightButton');
    $scope.takeTaraLabel = $translate.instant('marker.takeTaraButton');
    $scope.testPrintLabel = $translate.instant('marker.testPrintButton');
    $scope.disableButtonOKTask = false;
    $scope.classOK = null;
    $scope.sandwichModeAccepted = false;
    $scope.toggleModalMarker = false;
    $scope.toggleModalSort = false;
    $scope.readOnly = false;
    $scope.isShowReMarkForm = false;
    $scope.isShowSortingForm = false;
    //$scope.reMarkerMode = false;
    //$scope.sortingMode = false;
    //$scope.defectMode = false;
    //$scope.splitMode = false;

    //methods
    $scope.currentScales = vmGetCurrentScales;
    $scope.showScaleInfo = vmShowScaleInfo;
    $scope.getLatestWorkRequest = vmGetLatestWorkRequest;
    $scope.buildForm = vmBuildForm;
    $scope.getProfiles = vmGetProfiles;
    $scope.getProfilePropertiesList = vmGetProfilePropertiesList;
    $scope.calculate = vmCalculate;
    $scope.reset = vmReset;
    $scope.workRequest = vmWorkRequest;
    $scope.showBuildFormWindow = vmShowBuildFormWindow;
    $scope.doAction = vmDoAction;
    $scope.buildFormSpecialMode = vmBuildFormSpecialMode;
    $scope.closeModal = vmCloseModal;
    $scope.calculateMaxMass = vmCalculateMaxMass;
    $scope.actionsOnExit = vmActionsOnExit;
    $scope.getHandModeCredentials = vmGetHandModeCredentials;

    //method for enabling OK button on 'Task' tab 
    //when we change value of any control (for examle, checkbox)
    $scope.enableControlOK = vmEnableControlOK;

    //method for checking is accepted current order for active scales
    //(Check whether the OK button on modal window with order form is pressed)
    $scope.checkIsAcceptedOrder = vmCheckIsAcceptedOrder;

    vmInit();

    function vmInit() {

        //first we get list of available sides
        vmGetCurrentSides();

        //and get full list of available steel profiles
        vmGetProfiles();

        //init form fields list
        indexService.getInfo("Files?$filter=FileType eq 'Excel label'")
                            .then(function (response) {

                                var templateData = response.data.value;

                                $scope.fields = [
                                {

                                    name: 'FactoryNumber',
                                    properties: {
                                        control: 'text',
                                        required: false,
                                        translate: $translate.instant('marker.CreateDialogue.FactoryNumber')
                                    }
                                }, {

                                    name: 'STANDARD',
                                    properties: {
                                        control: 'text',
                                        required: false,
                                        translate: $translate.instant('market.Order.CreateDialogue.STANDARD'),
                                        order: 22
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
                                        order: 13
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
                                        order: 21
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
                                        order: 23
                                    }
                                }, {

                                    name: 'BUNT_DIA',
                                    properties: {
                                        control: 'text',
                                        required: false,
                                        translate: $translate.instant('market.Order.CreateDialogue.BUNT_DIA'),
                                        order: 20
                                    }
                                }, {

                                    name: 'COMM_ORDER',
                                    properties: {
                                        control: 'text',
                                        required: false,
                                        translate: $translate.instant('market.Order.CreateDialogue.COMM_ORDER'),
                                        order: 1
                                    },
                                }, {

                                    name: 'PROD_ORDER',
                                    properties: {
                                        control: 'text',
                                        required: true,
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

                                    name: 'Weight',
                                    properties: {
                                        control: 'text',
                                        required: false,
                                        translate: $translate.instant('marker.CreateDialogue.mass'),
                                        order: 12
                                    },
                                }, {

                                    name: 'BUYER_ORDER_NO',
                                    properties: {
                                        control: 'text',
                                        required: false,
                                        translate: $translate.instant('market.Order.CreateDialogue.BUYER_ORDER_NO'),
                                        order: 14
                                    },
                                }, {

                                    name: 'BRIGADE_NO',
                                    properties: {
                                        control: 'text',
                                        required: false,
                                        translate: $translate.instant('market.Order.CreateDialogue.BRIGADE_NO'),
                                        order: 15
                                    },
                                }, {

                                    name: 'PROD_DATE',
                                    properties: {
                                        control: 'date',
                                        required: false,
                                        translate: $translate.instant('market.Order.CreateDialogue.PROD_DATE'),
                                        order: 16
                                    },
                                }, {

                                    name: 'UTVK',
                                    properties: {
                                        control: 'text',
                                        required: false,
                                        translate: $translate.instant('market.Order.CreateDialogue.UTVK'),
                                        order: 17
                                    },
                                }, {

                                    name: 'LEAVE_NO',
                                    properties: {
                                        control: 'text',
                                        required: false,
                                        translate: $translate.instant('market.Order.CreateDialogue.LEAVE_NO'),
                                        
                                    },
                                }, {

                                    name: 'MATERIAL_NO',
                                    properties: {
                                        control: 'text',
                                        required: false,
                                        translate: $translate.instant('market.Order.CreateDialogue.MATERIAL_NO'),
                                        order: 19
                                    },
                                }, {

                                    name: 'CHANGE_NO',
                                    properties: {
                                        control: 'text',
                                        required: false,
                                        translate: $translate.instant('marker.CreateDialogue.CHANGE_NO'),
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
                                        order: 24
                                    }
                                }]
                            });
    };

    function vmGetCurrentSides() {

        indexService.getInfo('v_AvailableSides').then(function (response) {

            $scope.sides = response.data.value;

            //if there is only one available side
            //show all available scales without selecting side
            if ($scope.sides.length == 1)
                vmGetCurrentScales();
        });
    }

    function vmGetCurrentScales(side) {

        //this flag is needed for disabling side list after selecting side
        $scope.sideIsSelected = true;
        $scope.currentSide = $scope.sides.filter(function (item) {

            return item.ID == side;
        })[0].Description;

        

        var url = 'v_AvailableScales';

        if (side)
            url += '?$filter=sideID eq {0}'.format(side);

        //set scaleLoading flag as true for showing 'loading' message while scales list loaded
        $scope.scaleLoading = true;

        //set id of current scale as null while scales list loaded 
        //(currentScaleID flag is needed for showing scale detail info and task bar)
        $scope.currentScaleID = null;

        indexService.getInfo(url).then(function (response) {

            //hide 'loading' message when scales list loaded
            $scope.scaleLoading = false;

            $scope.scales = response.data.value;

            //sort scales by name
            $scope.scales.sort(function (a, b) {

                if (a.Description < b.Description)
                    return -1;
                else if (a.Description > b.Description)
                    return 1;
                else
                    return 0;
            })

            //there we build filter for request which get us short info for every scale
            if ($scope.scales.length > 0) {

                $scope.filter = [];
                $scope.workRequestFilter = [];

                $scope.scales.forEach(function (scale) {
                    $scope.filter.push('ID eq {0}'.format(scale.ID));
                    $scope.workRequestFilter.push('EquipmentID eq {0}'.format(scale.ID));
                });

                $scope.groups = vmGetChunks($scope.scales, 4);
                $scope.filter = $scope.filter.join(' or ');
                $scope.workRequestFilter = $scope.workRequestFilter.join(' or ');
            }

            vmGetCurrentScalesShortInfo();

            //remove old interval
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

    //get detail info for every scale
    //in top part we show only weight and rods quantity
    //this method creates array with scale objects
    function vmGetCurrentScalesShortInfo() {

        var pathScalesDetail = 'v_ScalesDetailInfo';
        if ($scope.filter.length > 0)
            pathScalesDetail += '?$filter={0}'.format($scope.filter);

        var pathLatestWorkRequest = 'v_LatestWorkRequests';
        if ($scope.workRequestFilter.length > 0)
            pathLatestWorkRequest += '?$filter={0}'.format($scope.workRequestFilter);


        $q.all([indexService.getInfo(pathScalesDetail), indexService.getInfo(pathLatestWorkRequest)])

                       .then(function (responses) {

                           $scope.scalesInfo = responses[0].data.value;
                           $scope.latestRequestsList = responses[1].data.value;

                           var barWeight = $scope.latestRequestsList.filter(function (item) {

                               return item.PropertyType == 'BAR_WEIGHT';
                           });

                           $scope.scales.forEach(function (scale) {

                               var data = $scope.scalesInfo.filter(function (item) {

                                   if (item.ID == scale.ID)
                                       return item;
                               })

                               if (data.length > 0)
                                   scale.weightCurrent = data[0].WEIGHT_CURRENT;

                               var barWeightCurrentScales = barWeight.filter(function (item) {

                                   return item.EquipmentID == scale.ID;
                               });

                               if (barWeightCurrentScales.length > 0) {
                                   barWeightCurrentScales = barWeightCurrentScales[0].Value;
                                   scale.rodsQuantity = parseInt(scale.weightCurrent / barWeightCurrentScales);
                               }else
                                   scale.rodsQuantity = 0;
                                   

                                

                           });

                       })
    };

    //this method shows detail info for selected scale
    //we get array with scale objects and just filter him by ID of current scale
    //also we calculate rods quantity and rods left number
    function vmShowScaleInfo(id) {

        $scope.currentScaleID = id;

        $scope.scalesDetailsInfo = $scope.scalesInfo.filter(function (item) {

            if (item.ID == id)
                return item;
        })[0];

        vmCalculateRods();
    }

    //this method is called when we show scale detail info
    //this method get last work request data
    function vmGetLatestWorkRequest(id) {

        //clear fields
        vmReset();

        //get last work request for current scales

        var data = $scope.latestRequestsList.filter(function (item) {

            return item.EquipmentID == id;
        });

        if (data.length > 0) {

            $scope.disableButtonOKTask = true;

            $scope.workRequestID = data[0].WorkRequestID;
            $scope.selectedProfile = data[0].ProfileID;

            if ($scope.selectedProfile)
                vmGetProfilePropertiesList('latestWorkRequestMode');

            //find value of last work request for each field
            data.forEach(function (item) {


                if (item.PropertyType == "COMM_ORDER") {

                    $scope.commOrder = item.Value;
                    $scope.isAcceptedOrder = true;
                }

                else if (item.PropertyType == "MAX_WEIGHT")
                    $scope.maxMass = parseInt(item.Value);

                else if (item.PropertyType == "MIN_WEIGHT")
                    $scope.minMass = parseInt(item.Value);

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

                else if (item.PropertyType == "SANDWICH_MODE") {
                    $scope.sandwichMode = item.Value == 'true' ? true : false;
                    $scope.sandwichModeAccepted = $scope.sandwichMode;
                }

                else if (item.PropertyType == "AUTO_MANU_VALUE")
                    $scope.approvingMode = item.Value == 'true' ? true : false;

                else if (item.PropertyType == "NEMERA")
                    $scope.nemera = item.Value == 'true' ? true : false;

            });
        };

    };

    function vmGetProfiles() {

        //get profiles list(left form)
        indexService.getInfo('MaterialDefinition?$filter=MaterialClassID eq (1)')
                    .then(function (response) {

                        $scope.profiles = response.data.value;
                    });
    }

    //get profiles properties list
    //'disable' param indicates is must button 'accept' to be disabled
    function vmGetProfilePropertiesList(mode) {

        if ($scope.selectedProfile) {

            indexService.getInfo('MaterialDefinitionProperty?$filter=MaterialDefinitionID eq ({0})'.format($scope.selectedProfile))
                    .then(function (response) {

                        var profileProperties = response.data.value;

                        if (profileProperties.length > 0) {

                            $scope.linearMassFromBase = vmGetProfileProperty(profileProperties, 1) || null;
                            $scope.length = vmGetProfileProperty(profileProperties, 2) || null;
                            $scope.tolerancePlus = vmGetProfileProperty(profileProperties, 3) || null;
                            $scope.toleranceMinus = vmGetProfileProperty(profileProperties, 4) || null;

                            if (!$scope.length) {
                                $scope.minMass = null;
                                $scope.maxMass = null;
                            }


                        } else {

                            $scope.linearMassFromBase = null;
                            $scope.length = null;
                            $scope.tolerancePlus = null;
                            $scope.toleranceMinus = null;
                            $scope.barWeight = null;


                            if (mode == 'changeSelectMode') {
                                $scope.minMass = null;
                                $scope.maxMass = null;
                                $scope.minMassRec = null;
                            };
                            
                        }

                        vmCalculate(mode);
                    })

        }

        else {

            $scope.linearMassFromBase = null;
            $scope.length = null;
            $scope.tolerancePlus = null;
            $scope.toleranceMinus = null;
            $scope.barWeight = null;

            vmCalculate(mode);
            
        }
    }

    function vmBuildForm() {

        indexService.getInfo("v_WorkDefinitionPropertiesAll?$filter=comm_order eq '{0}' and (EquipmentID eq {1} or EquipmentID eq null)".format($scope.commOrder, $scope.currentScaleID))
                         .then(function (response) {

                             var orderData = response.data.value;

                             

                             var procedure;

                             if (orderData.length > 0) {

                                 $scope.WorkDefinitionID = orderData[0].WorkDefinitionID;

                                 if (orderData[0].WorkDefinitionID)
                                     procedure = 'upd_WorkDefinition';
                                 else
                                     procedure = 'ins_WorkDefinition';

                                 vmCreateForm($('#orderForm'),
                                              'edit',
                                              procedure,
                                              orderData,
                                              'COMM_ORDER',
                                               [{

                                                   name: 'EquipmentID',
                                                   value: $scope.currentScaleID
                                               }],
                                               ['EquipmentID'],
                                               {
                                                   OK: 'OK',
                                                   Cancel: $translate.instant('buttonCancel')
                                               });
                             } else {

                                 vmShowLastCommOrderValue();

                                 alert($translate.instant('marker.errorMessages.noOrders'));
                             }

                         })

    }

    function vmShowBuildFormWindow(flag, mode) {

        $scope[flag] = true;
        //$scope[mode] = false;
    };

    function vmBuildFormSpecialMode(container, showFlag) {

        $scope.readOnly = true;

        indexService.getInfo("v_MaterialLotProperty?$filter=FactoryNumber eq '{0}'".format($scope.labelNumber))
                    .then(function (response) {

                        var data = response.data.value;

                        if (data.length > 0) {

                            $scope[showFlag] = true;
                            data.push({

                                Property: 'Weight',
                                Value: data[0].Quantity
                            });

                            vmCreateForm($('#' + container),
                            'edit',
                            'ins_MaterialLotByFactoryNumber',
                            data,
                            'Weight', [{

                                name: 'EquipmentID',
                                value: $scope.currentScaleID
                            }, {

                                name: 'FactoryNumber',
                                value: $scope.labelNumber
                            }],
                            ['EquipmentID', 'FactoryNumber'],
                            {
                                OK: 'OK',
                                Cancel: container == 'remarkerForm' ? $translate.instant('marker.buttonExit') : $translate.instant('buttonCancel')
                            }, [{
                                mandatory: false,
                                maxlength: undefined,
                                name: "Weight",
                                type: "Edm.String"
                            }]);
                        }
                        else {
                            $scope.readOnly = false;
                            $scope[showFlag] = false;
                            alert($translate.instant('marker.errorMessages.noLabel'));
                        }

                    });
    };

    function vmCreateForm(container, type, procedure, orderData, keyField, additionalFields, escapedFields, captions, additionalActionFields) {

        vmToggleModal(true);

        container.oDataAction({

            action: procedure,
            type: type,
            keyField: keyField,
            rowData: orderData,
            controlCaptions: {

                OK: captions.OK,
                Cancel: captions.Cancel
            },
            fields: $scope.fields,
            additionalFields: additionalFields,
            escapedFields: escapedFields,
            additionalActionFields: additionalActionFields
        });

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

    function vmCalculate(mode) {

        /*calculations for left form*/
        if (mode == 'latestWorkRequestMode')
            $scope.disableButtonOKTask = true;
        else
            $scope.disableButtonOKTask = false;

        if ($scope.length && $scope.linearMassFromBase) {
            $scope.barWeight = $scope.length * $scope.linearMassFromBase;
            $scope.barWeight = parseFloat($scope.barWeight).toFixed(3);
        }

        else
            $scope.barWeight = null;

        if ($scope.barWeight && $scope.barQuantity) {

            $scope.minMass = $scope.barWeight * $scope.barQuantity;
            $scope.minMass = parseInt($scope.minMass);
            $scope.minMassRec = parseInt($scope.barWeight * $scope.barQuantity);

            vmCalculateMaxMass();
        }

        if (!$scope.sampleMass || $scope.sampleMass.length == 0)
            $scope.linearMass = $scope.linearMassFromBase;

        if ($scope.sampleMass && $scope.sampleLength && $scope.length) {

            $scope.linearMassCalculated = $scope.sampleMass / $scope.sampleLength;

            $scope.linearMass = $scope.linearMassCalculated;
            $scope.barWeight = $scope.linearMassCalculated * $scope.length;
            $scope.minMass = parseInt($scope.barWeight * $scope.barQuantity);
            $scope.minMassRec = parseInt($scope.barWeight * $scope.barQuantity);

            vmCalculateMaxMass();
        }

        if ($scope.linearMassFromBase && $scope.linearMassCalculated) {

            $scope.deviation = (($scope.linearMassCalculated / $scope.linearMassFromBase) * 100) - 100;
            $scope.deviation = parseFloat($scope.deviation).toFixed(1);

            vmCalculateMaxMass();
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

    function vmCalculateMaxMass() {

        $scope.maxMass = parseInt($scope.minMass) + 200;
    };

    function vmCalculateRods() {

        if ($scope.scalesDetailsInfo && $scope.scalesDetailsInfo.WEIGHT_CURRENT >= 0 && $scope.barWeight) {

            $scope.rodsQuantity = parseInt($scope.scalesDetailsInfo.WEIGHT_CURRENT / $scope.barWeight);
        } else {

            $scope.rodsQuantity = 0;
        }

        if ($scope.barQuantity && $scope.rodsQuantity)
            $scope.rodsLeft = $scope.barQuantity - $scope.rodsQuantity;
        else
            $scope.rodsLeft = 0;

    };

    function vmReset() {

        $scope.selectedProfile = null;
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
        $scope.nemera = null;
    };

    function vmWorkRequest() {

        if ($scope.deviationState != 'wrong'
            && $scope.commOrder
            && $scope.minMass
            && $scope.maxMass
            && $scope.selectedProfile
            && (parseInt($scope.maxMass) >= parseInt($scope.minMass))
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
                MAX_WEIGHT: $scope.maxMass ? parseInt($scope.maxMass).toString() : null,
                MIN_WEIGHT: $scope.minMass ? parseInt($scope.minMass).toString() : null,
                SAMPLE_WEIGHT: $scope.sampleMass ? $scope.sampleMass.toString() : null,
                SAMPLE_LENGTH: $scope.sampleLength ? $scope.sampleLength.toString() : null,
                DEVIATION: $scope.deviation ? $scope.deviation.toString() : null,
                SANDWICH_MODE: $scope.sandwichMode ? 'true' : 'false',
                AUTO_MANU_VALUE: $scope.approvingMode ? 'true' : 'false',
                NEMERA: $scope.nemera ? 'true' : 'false'
            }

            $scope.OKLabel = $translate.instant('loadingMsg');

            indexService.sendInfo('ins_WorkRequest', data)
                        .then(function (response) {

                            $scope.OKLabel = $translate.instant('marker.acceptOrderTask');
                            $scope.disableButtonOKTask = true;
                            $scope.sandwichModeAccepted = $scope.sandwichMode;
                        });
        } else {

            var errors = [];

            if (!($scope.maxMass && $scope.minMass && $scope.selectedProfile))
                errors.push($translate.instant('marker.errorMessages.fillRequired'));

            if (!$scope.isAcceptedOrder)
                errors.push($translate.instant('marker.errorMessages.acceptOrder'));

            if (parseInt($scope.maxMass) < parseInt($scope.minMass))
                errors.push($translate.instant('marker.errorMessages.minMaxWeight'));

            if ($scope.deviationState == 'wrong')
                errors.push($translate.instant('marker.errorMessages.wrongDeviation'));

            errors = errors.join(' \n ');
            alert(errors);
        }



    };

    function vmDoAction(url, label, text) {

        $scope[label] = $translate.instant('loadingMsg');

        indexService.sendInfo(url, {

            COMM_ORDER: $scope.commOrder.toString() || null,
            EquipmentID: parseInt($scope.currentScaleID) || null
        }).then(function (response) {

            $scope[label] = $translate.instant(text)
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

                            $scope.commOrder = data.filter(function (item) {

                                return item.PropertyType == 'COMM_ORDER';
                            }).map(function (item) {

                                return item.Value;
                            })[0];

                        };
                    });
    }

    //this method is calling where we enter some value in comm_order field and
    //handles special flag. This flag is corresponding us current order is not accepted by 'OK' button
    //in modal form
    function vmCheckIsAcceptedOrder() {

        $scope.isAcceptedOrder = false;
    }

    function vmCloseModal(flag) {
        
        $scope[flag] = false;
        vmToggleModal(false);
    };

    function vmActionsOnExit(container, formWrapperFlag) {

        $scope.labelNumber = null;
        $('#' + container).empty();
        vmToggleModal(false);
        $scope.readOnly = false;
        $scope[formWrapperFlag] = false;
    };

    function vmGetHandModeCredentials() {

        $scope.handModeUserName;
        $scope.handModeUserPassword;

        $http({
            method: 'GET',
            url: serviceUrl + 'v_System_User',
            headers: {
                'Content-Type' : 'application/json', 
                'Authorization': 'NTLM TlRMTVNTUAADAAAAGAAYAIAAAABaAVoBmAAAAAwADABYAAAAEAAQAGQAAAAMAAwAdAAAAAAAAADyAQAABYKIogoAWikAAAAPiJqYFE3EV5AZ8aCdYRLsDGEAcwBrAC0AYQBkAG8AYwBoAGUAawBtAGUAegBaAEUATgBPAFMAUwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACEde2qN7N6jb8ychv4qFI1AQEAAAAAAAA+L6Ow+dXRAaRt65dLvnpVAAAAAAIADABBAFMASwAtAEEARAABABgATQBTAFMAUQBMADIAMAAxADQAUwBSAFYABAAYAGEAcwBrAC0AYQBkAC4AdgBpAG0AYQBzAAMAMgBNAFMAUwBRAEwAMgAwADEANABTAFIAVgAuAGEAcwBrAC0AYQBkAC4AdgBpAG0AYQBzAAUAGABhAHMAawAtAGEAZAAuAHYAaQBtAGEAcwAHAAgAPi+jsPnV0QEGAAQAAgAAAAgAMAAwAAAAAAAAAAAAAAAAMAAAXF/xV8oq70bAQmBaNPTRsSKKet0jawtuvD8CqeHZxosKABAAAAAAAAAAAAAAAAAAAAAAAAkAKABIAFQAVABQAC8AMQA5ADIALgAxADYAOAAuADEAMAAwAC4AMQA3ADQAAAAAAAAAAAAAAAAA='
            }
        }).then(function (response) {

            response;
        });
    };

    //there are events triggered on success and cancel button click in order modal form
    $('#orderForm').on('oDataForm.success', function (e, data) {

        $scope.disableButtonOKTask = false;
        $scope.isAcceptedOrder = true;
        vmToggleModal(false);

        $scope.brigadeNo = data.fields.BRIGADE_NO;
        $scope.prodDate = data.fields.PROD_DATE;

        $scope.$apply();
    });

    $('#orderForm').on('oDataForm.cancel', function (e) {

        vmToggleModal(false);
        vmShowLastCommOrderValue();

        $scope.$apply();
    });

    $('#remarkerForm').on('oDataForm.success', function (e) {

        vmActionsOnExit('remarkerForm', 'isShowReMarkForm');
        //$scope.reMarkerMode = true;

        $scope.$apply();
    })

    $('#remarkerForm').on('oDataForm.cancel', function (e) {

        vmCloseModal('toggleModalMarker');
        vmActionsOnExit('remarkerForm', 'isShowReMarkForm');

        $scope.$apply();
    });

    $('#sortingForm').on('oDataForm.success', function (e) {

        vmCloseModal('toggleModalSort');
        vmActionsOnExit('sortingForm', 'isShowSortingForm');
        //$scope.sortingMode = true;

        $scope.$apply();
    })

    $('#sortingForm').on('oDataForm.cancel', function (e) {

        vmCloseModal('toggleModalSort');
        vmActionsOnExit('sortingForm', 'isShowSortingForm');

        $scope.$apply();
    });

    $('#defectForm').on('oDataForm.success', function (e) {

        vmCloseModal('toggleModalDefect');
        vmActionsOnExit('defectForm', 'isShowDefectForm');
        //$scope.defectMode = true;

        $scope.$apply();
    })

    $('#defectForm').on('oDataForm.cancel', function (e) {

        vmCloseModal('toggleModalDefect');
        vmActionsOnExit('defectForm', 'isShowDefectForm');

        $scope.$apply();
    });

    $('#splitForm').on('oDataForm.success', function (e) {

        vmCloseModal('toggleModalSplit');
        vmActionsOnExit('splitForm', 'isShowSplitForm');
        //$scope.splitMode = true;

        $scope.$apply();
    })

    $('#splitForm').on('oDataForm.cancel', function (e) {

        vmCloseModal('toggleModalSplit');
        vmActionsOnExit('splitForm', 'isShowSplitForm');

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
})

.directive('myNumberCheck', function () {
    return function (scope, element, attrs) {

        element.bind("keydown keypress", function (event) {

            if (!((event.which >= 48 && event.which <= 57) || (event.which >= 96 && event.which <= 105))
                && event.which != 8 && event.which != 46 && event.which != 13) {

                return false;
            };
        });
    };
});




angular.module('indexApp')

.config(['$stateProvider', function ($stateProvider) {

    $stateProvider
        .state('app.Marker.ScaleInfo', {

            url: '/scaleinfo',
            templateUrl: 'Static/marker/scaleinfo.html',
            controller: 'markerScaleInfoCtrl'
        })
}])

.controller('markerCtrl', ['$scope', '$rootScope', 'indexService', '$state', 'roles', '$q', '$translate', 'scalesRefresh', 'workRequestRefresh', '$interval', '$http', function ($scope, $rootScope, indexService, $state, roles, $q, $translate, scalesRefresh, workRequestRefresh, $interval, $http) {

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
    $scope.sortingMode = false;
    $scope.rejectMode = false;
    $scope.separateMode = false;
    $scope.standard = true;

    $scope.packs = [1,2,3]
    $scope.packsLeft = $scope.packs[1];
    $scope.packsLeftCount = null; //count of packs left from procedure

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
    $scope.showOrderChangeModal = vmShowOrderChangeModal;
    $scope.acceptOrderChange = vmAcceptOrderChange;
    $scope.cancelOrderChange = vmCancelOrderChange;
    $scope.acceptHandMode = vmAcceptHandMode;
    $scope.cancelHandMode = vmCancelHandMode;

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

                                    name: 'FACTORY_NUMBER',
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

                                    name: 'BUNT_NO',
                                    properties: {
                                        control: 'text',
                                        required: false,
                                        translate: $translate.instant('market.Order.CreateDialogue.BUNT_NO'),
                                        order: 25
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
                                },
                                {
                                    name: 'PACKS_LEFT',
                                    properties: {
                                        control: 'text',
                                        required: false,
                                        translate: $translate.instant('market.Order.CreateDialogue.PAKCS_LEFT'),
                                        order: 24
                                    }
                                },
                                {
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
            });

            //there we build filter for request which get us short info for every scale
            if ($scope.scales.length > 0) {

                $scope.filter = [];
                $scope.workRequestFilter = [];

                $scope.scales.forEach(function (scale) {
                    $scope.filter.push('ID eq {0}'.format(scale.ID));
                    $scope.workRequestFilter.push('EquipmentID eq {0}'.format(scale.ID));

                    scale.isInfoLoaded = false;
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

        indexService.getInfo(pathScalesDetail)

                       .then(function (response) {

                           $scope.scalesInfo = response.data.value;

                           $scope.scales.forEach(function (scale) {

                               scale.isInfoLoaded = true;

                               var data = $scope.scalesInfo.filter(function (item) {

                                   if (item.ID == scale.ID)
                                       return item;
                               });

                               if (data.length > 0) {

                                   scale.weightCurrent = data[0].WEIGHT_CURRENT;
                                   scale.rodsQuantity = data[0].RodsQuantity;

                                   var plotWeightData = [scale.weightCurrent];

                                   //if (scale.weightCurrent) {

                                   //    $('#plot-' + scale.ID).addClass('plotVisible').empty();

                                   //    $.jqplot('plot-' + scale.ID, [plotWeightData], {
                                   //        seriesDefaults: {
                                   //            renderer: $.jqplot.MeterGaugeRenderer,
                                   //            rendererOptions: {
                                   //                   min: scale.minWeight,
                                   //                   max: scale.maxWeight,
                                   //                   intervals: [scale.minWeight, scale.maxWeight],
                                   //                   intervalColors: ['transparent', 'red']
                                   //                   label: $translate.instant('marker.kg')
                                   //            }
                                   //        }
                                   //    });
                                   //}else{

                                   //    $('#plot-' + scale.ID).empty().removeClass('plotVisible');
                                   //}
                               }
                           });

                       });
    };

    //this method shows detail info for selected scale
    //we get array with scale objects and just filter him by ID of current scale
    //also we calculate rods quantity and rods left number
    function vmShowScaleInfo(id) {

        if ($scope.groups[0][0].isInfoLoaded) {

            $scope.currentScaleID = id;            

            $scope.scalesDetailsInfo = $scope.scalesInfo.filter(function (item) {

                if (item.ID == id)
                    return item;
            })[0];
            
            vmCalculateRods();
            
        }        
    }

    //this method is called when we show scale detail info
    //this method get last work request data
    function vmGetLatestWorkRequest(id) {

        //get last work request for current scales

        if ($scope.groups[0][0].isInfoLoaded) {

            //clear fields
            vmReset();

            indexService.getInfo('v_LatestWorkRequests?$filter=EquipmentID eq {0}'.format(id)).then(function (response) {

                var data = response.data.value;

                if (data.length > 0) {

                    $scope.disableButtonOKTask = true;

                    $scope.workRequestID = data[0].WorkRequestID;
                    $scope.selectedProfile = data[0].ProfileID;

                    indexService.getInfo('MaterialDefinitionProperty?$filter=MaterialDefinitionID eq ({0})'.format($scope.selectedProfile))
                    .then(function (response) {

                        var profileProperties = response.data.value;

                        if (profileProperties.length > 0) {

                            $scope.linearMassFromBase = vmGetProfileProperty(profileProperties, 1) || null;
                            $scope.length = vmGetProfileProperty(profileProperties, 2) || null;
                            $scope.tolerancePlus = vmGetProfileProperty(profileProperties, 3) || null;
                            $scope.toleranceMinus = vmGetProfileProperty(profileProperties, 4) || null;


                        } else {

                            $scope.linearMassFromBase = null;
                            $scope.length = null;
                            $scope.tolerancePlus = null;
                            $scope.toleranceMinus = null;

                        };
                        
                        if (data[0].WorkType == 'Standard') {
                            $scope.standard = true;
                            $scope.sortingMode = false;
                            $scope.rejectMode = false;
                            $scope.separateMode = false;

                            if ($rootScope.intervalWorkRequest)
                                $interval.cancel($rootScope.intervalWorkRequest);

                        } else {

                            $scope.standard = false;

                            if (data[0].WorkType == 'Sort')
                                $scope.sortingMode = true;

                            if (data[0].WorkType == 'Reject')
                                $scope.rejectMode = true;

                            if (data[0].WorkType == 'Separate')
                                $scope.separateMode = true;

                            if ($rootScope.intervalWorkRequest)
                                $interval.cancel($rootScope.intervalWorkRequest);

                            //create interval for autorefresh scales
                            //this interval must be clear on activity exit
                            //so I create rootScope variable and set interval there
                            //it will be called in $state onExit handler
                            $rootScope.intervalWorkRequest = $interval(function () {

                                vmGetLatestWorkRequest(id);
                            }, workRequestRefresh);
                        }


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
                                $scope.autoMode = item.Value == 'true' ? true : false;

                            else if (item.PropertyType == "NEMERA")
                                $scope.nemera = item.Value == 'true' ? true : false;

                            else if (item.PropertyType == "PACKS_LEFT")
                                $scope.packsLeftCount = item.Value;

                        });

                    })
                           
                };
            });

            

        }

    };

    function vmGetProfiles() {

        //get profiles list(left form)
        indexService.getInfo('MaterialDefinition?$filter=MaterialClassID eq (1)')
                    .then(function (response) {

                        $scope.profiles = response.data.value;
                        $scope.selectedProfile = $scope.profiles[0];
                    });
    }

    //get profiles properties list
    //'calledByLastWorkRequest' param indicates is must button 'accept' to be disabled
    function vmGetProfilePropertiesList(calledByLastWorkRequest) {

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
                            
                            $scope.minMass = null;
                            $scope.maxMass = null;
                            $scope.minMassRec = null;
                            $scope.barWeight = null;
                            $scope.linearMassFromBase = null;
                            $scope.length = null;
                            $scope.tolerancePlus = null;
                            $scope.toleranceMinus = null;
                            
                        }

                        if (calledByLastWorkRequest)
                            vmCalculate('disable');
                        else
                            vmCalculate();

                    })

        }

        else {

            $scope.linearMassFromBase = null;
            $scope.length = null;
            $scope.tolerancePlus = null;
            $scope.toleranceMinus = null;
            $scope.barWeight = null;

            if (calledByLastWorkRequest)
                vmCalculate('disable');
            else
                vmCalculate();
            
        }
    }

    function vmBuildForm() {

        $scope.definitionPropertiesLoading = true;

        indexService.getInfo("v_WorkDefinitionPropertiesAll?$filter=comm_order eq '{0}' and (EquipmentID eq {1} or EquipmentID eq null)".format($scope.commOrder, $scope.currentScaleID))
                         .then(function (response) {

                             $scope.definitionPropertiesLoading = false;
                             var orderData = response.data.value;
                           
                             var procedure;

                             if (orderData.length > 0) {

                                 $scope.WorkDefinitionID = orderData[0].WorkDefinitionID;

                                 if (orderData[0].WorkDefinitionID)
                                     procedure = 'upd_WorkDefinition';
                                 else
                                     procedure = 'ins_WorkDefinitionStandard';

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

        if (!$scope[mode])
            $scope[flag] = true;
        else {

            if ($rootScope.intervalWorkRequest)
                $interval.cancel($rootScope.intervalWorkRequest);

            indexService.sendInfo('set_StandardMode', {

                EquipmentID: parseInt($scope.currentScaleID) || null
            }).then(function (response) {

                $scope.standard = true;
                $scope[mode] = false;

                vmGetLatestWorkRequest($scope.currentScaleID);
            });
        };
                         
    };

    function vmBuildFormSpecialMode(container, showFlag) {

        var additionalFields = [{

            name: 'EquipmentID',
            value: $scope.currentScaleID
        }, {

            name: 'FACTORY_NUMBER',
            value: $scope.labelNumber
        }];

        var escapedFields = ['EquipmentID', 'FACTORY_NUMBER'];

        var additionalActionFields = [{
            mandatory: false,
            maxlength: undefined,
            name: "Weight",
            type: "Edm.String"
        }];

        var procedureName;
        $scope.readOnly = true;

        if (container == 'remarkerForm')
            procedureName = 'ins_MaterialLotByFactoryNumber';

        if (container == 'sortingForm') 
            procedureName = 'set_SortMode';
        
        if (container == 'rejectForm') 
            procedureName = 'set_RejectMode';        

        if (container == 'separateForm'){

            procedureName = 'set_SeparateMode';
            escapedFields.push('PACKS_LEFT');
            additionalFields.push({

                name: 'PACKS_LEFT',
                value: $scope.packsLeft.toString()
            });

            additionalActionFields = null;
        } 
                        

        vmGetLatestWorkRequest($scope.currentScaleID);

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
                            procedureName,
                            data,
                            'Weight',
                            additionalFields,
                            escapedFields,
                            {
                                OK: 'OK',
                                Cancel: container == 'remarkerForm' ? $translate.instant('marker.buttonExit') : $translate.instant('buttonCancel')
                            },
                            additionalActionFields);
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

        if (mode == 'disable')
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

        if ($scope.barQuantity && $scope.scalesDetailsInfo.RodsQuantity)
            $scope.rodsLeft = $scope.barQuantity - $scope.scalesDetailsInfo.RodsQuantity;
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
        $scope.autoMode = null;
        $scope.nemera = null;
        $scope.packsLeftCount = null;
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
                AUTO_MANU_VALUE: $scope.autoMode ? 'true' : 'false',
                NEMERA: $scope.nemera ? 'true' : 'false'
            }

            $scope.OKLabel = $translate.instant('loadingMsg');

            indexService.sendInfo('ins_WorkRequestStandart', data)
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
        
        if (label == 'testPrintLabel' && !$scope.isAcceptedOrder) {

            alert($translate.instant('marker.errorMessages.acceptOrder'))
        } else {

            $scope[label] = $translate.instant('loadingMsg');

            indexService.sendInfo(url, {

                EquipmentID: parseInt($scope.currentScaleID) || null
            }).then(function (response) {

                $scope[label] = $translate.instant(text)
            });

            //if (!$scope.standard && label == 'takeWeightLabel') {

            //    if ($scope.separateMode) {

            //        if (parseInt($scope.packsLeftCount) > 1) {

            //            indexService.sendInfo('set_DecreasePacksLeft', {

            //                EquipmentID: parseInt($scope.currentScaleID)
            //            }).then(function (response) {

            //                vmGetLatestWorkRequest($scope.currentScaleID);
            //            });
            //        } else {
            //            //vmSetStandardMode();
            //        }
                        
                    

            //    } else {
            //        //vmSetStandardMode();
            //    }
                    
                
            //}


        };
        
    };

    function vmSetStandardMode() {

        indexService.sendInfo('set_StandardMode', {

            EquipmentID: parseInt($scope.currentScaleID) || null
        }).then(function (response) {

            $scope.standard = true;

            if ($scope.sortingMode)
                $scope.sortingMode = false;

            if ($scope.rejectMode)
                $scope.rejectMode = false;

            if ($scope.separateMode)
                $scope.separateMode = false;

            vmGetLatestWorkRequest($scope.currentScaleID);
        });
    }

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

        vmGetLatestWorkRequest($scope.currentScaleID);

        $scope.labelNumber = null;
        $('#' + container).empty();
        vmToggleModal(false);
        $scope.readOnly = false;
        $scope[formWrapperFlag] = false;
    };

    function vmGetHandModeCredentials() {

        $scope.handModeUserName;
        $scope.handModeUserPassword;

        document.execCommand("ClearAuthenticationCache", "false");
        
    };

    function vmAcceptHandMode() {

        if (!$scope.handModeQuantity){

            alert($translate.instant('marker.errorMessages.handModeQuantity'));

            $scope.noHandModeQuantity = true;
        }
            
        else {

            $scope.noHandModeQuantity = false;

            indexService.sendInfo('ins_ManualWeightEntry', {
                EquipmentID: parseInt($scope.currentScaleID) || null,
                Quantity: $scope.handModeQuantity
            }).then(vmCancelHandMode);
        };
    };

    function vmCancelHandMode() {

        $scope.toggleModalHandMode = false;
        $scope.noHandModeQuantity = false;
        $scope.handModeQuantity = null;
    };

    function vmShowOrderChangeModal() {

        $scope.toggleModalOrderChange = true;
        $scope.materialLotProdorderIDs = [];

        $('#changeOrderGrid').jsGrid({
            height: "500px",
            width: "750px",

            sorting: false,
            paging: true,
            editing: false,
            filtering: true,
            autoload: true,
            pageLoading: true,
            inserting: false,
            pageIndex: 1,
            pageSize: 10,

            onDataLoaded: function(args){

                $scope.materialLotProdorderIDs = [];
            },
            
            rowClick: function(args){
                
                var materialLotProdorderID = args.item.ID;
                var index = $scope.materialLotProdorderIDs.indexOf(materialLotProdorderID);

                if (index == -1)
                    $scope.materialLotProdorderIDs.push(materialLotProdorderID);

                else {
                    $scope.materialLotProdorderIDs = $scope.materialLotProdorderIDs.filter(function (item) {
                        return item != materialLotProdorderID;
                    });
                };

                $scope.$apply();
            }

        }).jsGrid('initOdata', {
            serviceUrl: serviceUrl,
            table: 'v_MaterialLotChange',

            fields: [{
                id: 'PROD_ORDER',
                name: 'PROD_ORDER',
                title: $translate.instant('marker.grid.PROD_ORDER'),
                order: 1
            },
            {
                id: 'PART_NO',
                name: 'PART_NO',
                title: $translate.instant('marker.grid.PART_NO'),
                order: 2
            },
            {
                id: 'FactoryNumber',
                name: 'FactoryNumber',
                title: $translate.instant('marker.grid.FactoryNumber'),
                order: 3
            },
            {
                id: 'BUNT_NO',
                name: 'BUNT_NO',
                title: $translate.instant('marker.grid.BUNT_NO'),
                order: 4
            },
            {
                id: 'CreateTime',
                name: 'CreateTime',
                title: $translate.instant('marker.grid.CreateTime'),
                order: 5
            },

            {
                id: 'Quantity',
                name: 'Quantity',
                title: $translate.instant('marker.grid.Quantity'),
                order: 6
            },
            {
                id: 'selected',
                name: 'selected',
                title: $translate.instant('marker.grid.selected'),
                type: 'myCheckbox',
                order: 7
            }]

        }).jsGrid('loadOdata', {});
    }
    function vmAcceptOrderChange() {

        $scope.MaterialLotIDs = $scope.materialLotProdorderIDs.join(',');

        var errors = [];

        if (!$scope.NewOrderNumber) {

            $scope.noNewOrderNumber = true;
            errors.push($translate.instant('marker.errorMessages.enterProdOrder'));
        }
          
        if ($scope.materialLotProdorderIDs.length == 0)
            errors.push($translate.instant('marker.errorMessages.selectLabel'));

        if (errors.length > 0) {

            errors = errors.join(' \n ');
            alert(errors);

        } else {

            $scope.noNewOrderNumber = false;
            indexService.sendInfo('upd_MaterialLotProdOrder', {

                PROD_ORDER: $scope.NewOrderNumber,
                MaterialLotIDs: $scope.MaterialLotIDs
            }).then(vmCancelOrderChange);
        }
    }

    function vmCancelOrderChange() {

        $scope.noNewOrderNumber = false;
        $scope.toggleModalOrderChange = false;
    }

    //there are events triggered on success and cancel button click in order modal form
    $('#orderForm').on('oDataForm.success', function (e, data) {

        $scope.disableButtonOKTask = true;
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

        $scope.standard = false;
        $scope.sortingMode = true;

        $scope.$apply();
    })

    $('#sortingForm').on('oDataForm.cancel', function (e) {

        vmCloseModal('toggleModalSort');
        vmActionsOnExit('sortingForm', 'isShowSortingForm');

        $scope.$apply();
    });

    $('#rejectForm').on('oDataForm.success', function (e) {

        vmCloseModal('toggleModalReject');
        vmActionsOnExit('rejectForm', 'isShowRejectForm');

        $scope.standard = false;
        $scope.rejectMode = true;

        $scope.$apply();
    })

    $('#rejectForm').on('oDataForm.cancel', function (e) {

        vmCloseModal('toggleModalReject');
        vmActionsOnExit('rejectForm', 'isShowRejectForm');

        $scope.$apply();
    });

    $('#separateForm').on('oDataForm.success', function (e) {

        vmCloseModal('toggleModalSeparate');
        vmActionsOnExit('separateForm', 'isShowSeparateForm');

        $scope.standard = false;
        $scope.separateMode = true;

        $scope.$apply();
    })

    $('#separateForm').on('oDataForm.cancel', function (e) {

        vmCloseModal('toggleModalSeparate');
        vmActionsOnExit('separateForm', 'isShowSeparateForm');

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




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
    $scope.isShowModal = false;
    $scope.orderNumber = '';
    $scope.state = null;
    $scope.sampleLength = 1;

    $scope.showScaleInfo = vmShowScaleInfo;
    $scope.buildForm = vmBuildForm;
    $scope.getProfiles = vmGetProfiles;
    $scope.getProfilePropertiesList = vmGetProfilePropertiesList;
    $scope.calculate = vmCalculate;
    $scope.reset = vmReset;
    

    vmGetCurrentScales();
    vmGetProfiles();

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


            vmGetCurrentScalesShortInfo();

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

    function vmGetProfiles() {

        //get profiles (left form)
        indexService.getInfo('MaterialDefinition?$filter=MaterialClassID eq (1)')
                    .then(function (response) {

                        $scope.profiles = response.data.value;
                    });
    }

    function vmGetProfilePropertiesList(profileId) {

        indexService.getInfo('MaterialDefinitionProperty?$filter=MaterialDefinitionID eq ({0})'.format(profileId))
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
                        }

                        vmCalculate();
                    })

        vmCalculate();
    }

    function vmBuildForm(orderNumber) {

        indexService.getInfo("v_WorkDefinitionPropertiesAll?$filter=comm_order eq '{0}'".format(orderNumber))
                         .then(function (response) {
                             var orderData = response.data.value;
                             var procedure;

                             if (orderData.length > 0) {

                                 if (orderData[0].WorkDefinitionID)
                                     procedure = 'upd_WorkDefinition';
                                 else
                                     procedure = 'ins_WorkDefinition';
                                 
                                 vmCreateForm('edit', procedure, orderData, 'COMM_ORDER');
                             }else
                                  alert('there is no orders with this name!');
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

        if ($scope.length && $scope.linearMassFromBase){
            $scope.barWeight = $scope.length * $scope.linearMassFromBase;
            $scope.barWeight = parseFloat($scope.barWeight).toFixed(3);
        }
            
        else
            $scope.barWeight = null;

        if ($scope.barWeight && $scope.barQuantity){

            $scope.minMass = $scope.barWeight * $scope.barQuantity;
            $scope.minMass = parseFloat($scope.minMass).toFixed(3);
        }          
        else
            $scope.minMass = null;

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
                ($scope.toleranceMinus && $scope.deviation < (-1) * $scope.toleranceMinus)
                ) {

                $scope.state = 'wrong';
            } else
                $scope.state = 'correct';

        }

        vmCalculateRods();
                           
    }

    function vmCalculateRods() {

        if ($scope.scalesDetailsInfo.WEIGHT_CURRENT_VALUE && $scope.barWeight) {

            $scope.rodsQuantity = parseInt($scope.scalesDetailsInfo.WEIGHT_CURRENT_VALUE / $scope.barWeight);
        }

        if ($scope.barQuantity && $scope.rodsQuantity)
            $scope.rodsLeft = $scope.barQuantity - $scope.rodsQuantity;
    }

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
    }

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

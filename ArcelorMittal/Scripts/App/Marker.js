﻿angular.module('indexApp')

.config(['$stateProvider', function ($stateProvider) {

    $stateProvider
        .state('app.Marker.Index', {

            url: '/index',
            templateUrl: 'Static/marker/marker.html',
            controller: 'markerIndexCtrl',

            onExit: function ($state, $injector) {

                var $interval = $injector.get('$interval');
                var $rootScope = $injector.get('$rootScope');

                $interval.cancel($rootScope.intervalScales);
                $interval.cancel($rootScope.intervalWorkRequest);
                $interval.cancel($rootScope.intervalErrors);
                $interval.cancel($rootScope.blinkingInterval);
            }
        })

    .state('app.Marker.Monitor', {

        url: '/monitor/:side',
        templateUrl: 'Static/marker/monitor.html',
        controller: 'markerMonitorCtrl',
        params: {
            side: null
        },
        onExit: function ($state, $injector) {

            var $interval = $injector.get('$interval');
            var $rootScope = $injector.get('$rootScope');

            $interval.cancel($rootScope.intervalMonitor);
        }
    })

    .state('app.Marker.Diagnostics', {

        url: '/diagnostics/:side',
        templateUrl: 'Static/pa/diagnostics.html',
        controller: 'diagnosticsCtrl',
        params: {
            side: null
        }
    })

    .state('app.Marker.Charts', {

        url: '/charts/:side',
        templateUrl: 'Static/marker/charts.html',
        controller: 'markerChartsCtrl',
        params: {
            side: null
        }
    })

    .state('app.Marker.Statistics', {

        url: '/statistics/:side',
        templateUrl: 'Static/marker/statistics.html',
        controller: 'markerStatisticsCtrl',
        params: {
            side: null
        }
    })

    .state('app.Marker.Statistics.labelsCount', {

        url: '/labelscount',
        templateUrl: 'Static/marker/statistics/labelscount.html',
        controller: 'markerStatisticsLabelsCountCtrl',
        params: {
            data: null
        }
    })

    .state('app.Marker.Statistics.weightOverall', {

        url: '/weightoverall',
        templateUrl: 'Static/marker/statistics/weightoverall.html',
        controller: 'markerStatisticsWeightOverallCtrl',
        params: {
            data: null
        }
    })

    .state('app.Marker.Statistics.byChanges', {

        url: '/bychanges',
        templateUrl: 'Static/marker/statistics/bychanges.html',
        controller: 'markerStatisticsByChangesCtrl',
        params: {
            data: null
        }
    })

    .state('app.Marker.Statistics.byBrigades', {

        url: '/bybrigades',
        templateUrl: 'Static/marker/statistics/bybrigades.html',
        controller: 'markerStatisticsByBrigadesCtrl',
        params: {
            data: null
        }
    })

    .state('app.Marker.Statistics.byMelt', {

        url: '/bymelt',
        templateUrl: 'Static/marker/statistics/bymelt.html',
        controller: 'markerStatisticsByMeltCtrl',
        params: {
            data: null
        }
    })

    .state('app.Marker.Statistics.byOrder', {

        url: '/byorder',
        templateUrl: 'Static/marker/statistics/byorder.html',
        controller: 'markerStatisticsByOrderCtrl',
        params: {
            data: null
        }
    })

    .state('app.Marker.Statistics.byParty', {

        url: '/byparty',
        templateUrl: 'Static/marker/statistics/byparty.html',
        controller: 'markerStatisticsByPartyCtrl',
        params: {
            data: null
        }
    })

    .state('app.Marker.Statistics.handMode', {

        url: '/handmode',
        templateUrl: 'Static/marker/statistics/handmode.html',
        controller: 'markerStatisticsHandModeCtrl',
        params: {
            data: null
        }
    })

    .state('app.Marker.Statistics.allLabels', {

        url: '/alllabels',
        templateUrl: 'Static/marker/statistics/handmode.html',
        controller: 'markerStatisticsHandModeCtrl',
        params: {
            data: null
        }
    })

}])

.controller('markerCtrl', ['$scope', '$state', function ($scope, $state) {

    if ($state.current.name != 'app.Marker.Monitor'
        && $state.current.name != 'app.Marker.Diagnostics'
        && $state.current.name != 'app.Marker.Charts'
        && $state.current.name.indexOf('Statistics') == -1)
        $state.go('app.Marker.Index');

}])

.controller('markerIndexCtrl', ['$scope', 'sapUrl', '$rootScope', 'indexService', '$state', 'roles', '$q', '$translate', 'scalesRefresh', 'workRequestRefresh', '$interval', '$timeout', '$http', function ($scope, sapUrl, $rootScope, indexService, $state, roles, $q, $translate, scalesRefresh, workRequestRefresh, $interval, $timeout, $http) {

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

    $scope.flagTakeWeight = true;

    $scope.packs = [1,2,3]
    $scope.packsLeft = $scope.packs[1];
    $scope.packsLeftCount = null; //count of packs left from procedure

    //methods
    $scope.currentScales = vmGetCurrentScales;
    $scope.selectCurrentSides = vmSelectCurrentSides;
    $scope.showScaleInfo = vmShowScaleInfo;
    $scope.getLatestWorkRequest = vmGetLatestWorkRequest;
    $scope.buildForm = vmBuildForm;
    $scope.getProfiles = vmGetProfiles;
    $scope.actionsProfileChanged = vmActionsProfileChanged;

    $scope.changeBindingDiaData = vmChangeBindingDiaData;
    $scope.changeBindingQtyData = vmChangeBindingQtyData;

    $scope.getProfilePropertiesList = vmGetProfilePropertiesList;
    $scope.calculate = vmCalculate;
    $scope.workRequest = vmWorkRequest;
    $scope.reset = vmReset;
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

    $scope.showToggleModalReversal = vmShowToggleModalReversal;
    $scope.acceptOrderReversal = vmAcceptOrderReversal;
    $scope.cancelReversal = vmCancelReversal;

    $scope.acceptHandMode = vmAcceptHandMode;
    $scope.cancelHandMode = vmCancelHandMode;
    $scope.showOuterPage = vmShowOuterPage;

    //these global variables for correct showing commorderValue in special mode (without blinking)
    var _commOrder, _brigadeNo, _prodDate;

    var flagSound = false;
    $scope.flagCurrentScales = false;

    vmInit();
    SoundInit();

    // инициализация звуков уведомления
    function SoundInit() {
        $scope.bell_sound = document.createElement('audio');
        // определяем, поддерживается ли звук в браузере
        if (typeof $scope.bell_sound.canPlayType === "function" && $scope.bell_sound.canPlayType("audio/mpeg;codecs=mp3") !== "") {
            $scope.bell_sound.canplay = true;
            $scope.bell_sound.src = "Content/sounds/Sound.mp3";
        }
    }

    // проиграть звук
    function PlayBellSound() {
        if ($scope.bell_sound.canplay) {
            $scope.bell_sound.play();
        }
    }

    function vmInit() {

        //first we get list of available sides
        vmGetCurrentSides();

        //and get full list of available steel profiles
        vmGetProfiles();

        //init form fields list
        indexService.getInfo("Files?$select=ID,Name&$filter=FileType eq 'Excel label' and Status eq '%D0%98%D1%81%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5'")
                            .then(function (response) {

                                var templateData = response.data.value;

                                $scope.fields = [{

                                     name: 'STANDARD',
                                     properties: {
                                         control: 'text',
                                         required: false,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.STANDARD'),
                                         order: 22
                                     }
                                 }, {

                                     name: 'LENGTH',
                                     properties: {
                                         control: 'text',
                                         required: false,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.LENGTH'),
                                         order: 6
                                     }
                                 }, {

                                     name: 'MIN_ROD',
                                     properties: {
                                         control: 'text',
                                         required: false,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.MIN_ROD'),
                                         order: 13
                                     }
                                 }, {

                                     name: 'CONTRACT_NO',
                                     properties: {
                                         control: 'text',
                                         required: false,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.CONTRACT_NO'),
                                         order: 3
                                     }
                                 }, {

                                     name: 'DIRECTION',
                                     properties: {
                                         control: 'text',
                                         required: false,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.DIRECTION'),
                                         order: 4
                                     }
                                 }, {

                                     name: 'PRODUCT',
                                     properties: {
                                         control: 'text',
                                         required: false,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.PRODUCT'),
                                         order: 21
                                     }
                                 }, {

                                     name: 'CLASS',
                                     properties: {
                                         control: 'text',
                                         required: false,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.CLASS'),
                                         order: 8
                                     }
                                 }, {

                                     name: 'STEEL_CLASS',
                                     properties: {
                                         control: 'text',
                                         required: false,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.STEEL_CLASS'),
                                         order: 9
                                     }
                                 }, {

                                     name: 'CHEM_ANALYSIS',
                                     properties: {
                                         control: 'text',
                                         required: false,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.CHEM_ANALYSIS'),
                                         order: 23
                                     }
                                 }, {

                                     name: 'BUNT_DIA',
                                     properties: {
                                         control: 'text',
                                         required: false,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.BUNT_DIA'),
                                         order: 20
                                     }
                                 }, {

                                     name: 'BUNT_NO',
                                     properties: {
                                         control: 'text',
                                         required: false,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         countOnly: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.BUNT_NO'),
                                         order: 25
                                     }
                                 }, {

                                     name: 'COMM_ORDER',
                                     properties: {
                                         control: 'text',
                                         required: false,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         maxlength: '10',
                                         countOnly: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.COMM_ORDER'),
                                         order: 1
                                     },
                                 }, {

                                     name: 'PROD_ORDER',
                                     properties: {
                                         control: 'text',
                                         required: true,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.PROD_ORDER'),
                                         order: 2
                                     },
                                 }, {

                                     name: 'SIZE',
                                     properties: {
                                         control: 'text',
                                         required: false,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.SIZE'),
                                         order: 5
                                     },
                                 }, {

                                     name: 'TOLERANCE',
                                     properties: {
                                         control: 'text',
                                         required: false,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.TOLERANCE'),
                                         order: 7
                                     },
                                 }, {

                                     name: 'MELT_NO',
                                     properties: {
                                         control: 'text',
                                         required: false,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.MELT_NO'),
                                         order: 10

                                     },
                                 }, {

                                     name: 'PART_NO',
                                     properties: {
                                         control: 'text',
                                         required: false,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.PART_NO'),
                                         order: 11
                                     },
                                 }, {

                                     name: 'BUYER_ORDER_NO',
                                     properties: {
                                         control: 'text',
                                         required: false,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.BUYER_ORDER_NO'),
                                         order: 14
                                     },
                                 }, {

                                     name: 'BRIGADE_NO',
                                     properties: {
                                         control: 'text',
                                         required: false,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.BRIGADE_NO'),
                                         order: 15
                                     },
                                 }, {

                                     name: 'PROD_DATE',
                                     properties: {
                                         control: 'date',
                                         required: true,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.PROD_DATE'),
                                         order: 16
                                     },
                                 }, {

                                     name: 'UTVK',
                                     properties: {
                                         control: 'text',
                                         required: false,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.UTVK'),
                                         order: 17
                                     },
                                 }, {

                                     name: 'CHANGE_NO',
                                     properties: {
                                         control: 'text',
                                         required: false,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.CHANGE_NO'),
                                         order: 18
                                     },
                                 }, {

                                     name: 'MATERIAL_NO',
                                     properties: {
                                         control: 'text',
                                         required: false,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.MATERIAL_NO'),
                                         order: 19
                                     },
                                 }, {

                                     name: 'LABEL_PRINT_QTY',
                                     properties: {
                                         control: 'combo',
                                         required: true,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         defaultValue: 1,
                                         translate: $translate.instant('market.Order.CreateDialogue.LABEL_PRINT_QTY'),
                                         data: [{
                                           'ID': 1,
                                           'Name': 1
                                         }, {
                                           'ID': 2,
                                           'Name': 2
                                         }],
                                         keyField: 'ID',
                                         valueField: 'Name',
                                         filter: false,
                                         order: 98
                                     },
                                 }, {
                                     name: 'TEMPLATE',
                                     properties: {
                                         control: 'combo',
                                         required: true,
                                         show: true,
                                         disable: false,
                                         send: true,
                                         translate: $translate.instant('market.Order.CreateDialogue.TEMPLATE'),
                                         data: templateData,
                                         keyField: 'ID',
                                         valueField: 'Name',
                                         filter: true,
                                         className: 'large',
                                         order: 99
                                     }
                                 }];
                                                                
                            });
    };

    function vmGetCurrentSides() {

        $q.all([indexService.getInfo('v_AvailableSides'), indexService.getInfo('GetUserProcedure')])
               .then(function (responses) {

                   $scope.sides = responses[0].data.value;
                   $scope.userMetadata = responses[1].data.value.map(function (item) {

                       return item.Name;
                   });

                   //if there is only one available side
                   //show all available scales without selecting side
                   if ($scope.sides.length == 1)
                       vmGetCurrentScales();
               });
    };

    function vmGetCurrentScales(side) {

        //this flag is needed for disabling side list after selecting side

        if (side)
            $scope.sideIsSelected = side.ID
        else
            $scope.sideIsSelected = $scope.sides[0].ID;
        
        var url = 'v_AvailableScales';

        if ($scope.sideIsSelected) {

            $scope.currentSide = $scope.sides.filter(function (item) {

                return item.ID == $scope.sideIsSelected;
            })[0].Description;

            url += '?$filter=sideID eq {0}'.format($scope.sideIsSelected);
        }
            

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
            vmGetMarkerErrors();

            //remove old interval
            if ($rootScope.intervalScales)
                $interval.cancel($rootScope.intervalScales);

            if ($rootScope.intervalErrors)
                $interval.cancel($rootScope.intervalErrors);

            //create interval for autorefresh scales
            //this interval must be clear on activity exit
            //so I create rootScope variable and set interval there
            //it will be called in $state onExit handler
            $rootScope.intervalScales = $interval(function () {

                vmGetCurrentScalesShortInfo();

                if ($scope.currentScaleID)
                    vmShowScaleInfo($scope.currentScaleID);
               
            }, scalesRefresh);

            $rootScope.intervalErrors = $interval(function () {

                vmGetMarkerErrors();
            }, errorsRefresh);

            $rootScope.blinkingInterval = $interval(function () {
                vmSetBlinking('color', 'rgb(255, 0, 0)');
            }, 1000);
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

                           var scalesData = response.data.value;

                           $scope.scales.forEach(function (scale) {

                               scale.isInfoLoaded = true;

                               var scaleData = scalesData.find(function (item) {

                                   if (item.ID == scale.ID)
                                       return item;
                               });

                               if (scaleData) {

                                   
                                   for (var i in scaleData) {

                                       if (i != 'WEIGHT_CURRENT' && i != 'MinWeight' && i != 'MaxWeight' && i != 'MaxPossibleWeight')
                                           scale[i] = scaleData[i];
                                   };                                  

                                   if ((scale.SCALES_TYPE == "LINEPACK" || scale.SCALES_TYPE == 'BUNT') && (scale.WEIGHT_STAB && !scale.WEIGHT_ZERO && !scale.WEIGHT_OK)) {
                                       if (!flagSound) {
                                           PlayBellSound();
                                           flagSound = true;
                                       }
                                   }
                                   if ((scale.SCALES_TYPE == "LINEPACK" || scale.SCALES_TYPE == 'BUNT') && scale.WEIGHT_ZERO && scale.SCALES_TYPE != 'MANUAL') {
                                       flagSound = false;
                                   }

                                   
                                   scale.rodsQuantity = scaleData.RodsQuantity;

                                   if (scale.MinWeight != scaleData.MinWeight ||
                                       scale.MaxWeight != scaleData.MaxWeight ||
                                       scale.MaxPossibleWeight != scaleData.MaxPossibleWeight) {

                                       scale.weightCurrent = scaleData.WEIGHT_CURRENT;
                                       scale.MinWeight = scaleData.MinWeight;
                                       scale.MaxWeight = scaleData.MaxWeight;
                                       scale.MaxPossibleWeight = scaleData.MaxPossibleWeight;

                                       vmRedrawScale(scale);

                                   } else if (scale.weightCurrent != scaleData.WEIGHT_CURRENT) {

                                       scale.weightCurrent = scaleData.WEIGHT_CURRENT;

                                       if (!scale.ALARM)
                                           vmRedrawArrow(scale);
                                   };                              

                               };
                           });

                       });
        
    };

    function vmGetMarkerErrors() {
        indexService.getInfo('v_MarkerErrors?$orderby=ErrorMessage').then(function (response) {
            $scope.markerErrors = response.data.value;
                
        });
    };

    function vmRedrawScale(scale) {

        var seriesDefaults = {

            renderer: $.jqplot.MeterGaugeRenderer,
            min: 0,
            max: scale.MaxPossibleWeight,

            rendererOptions: {                
                ringWidth: 4,
                shadowDepth: 0,
                intervalOuterRadius: 85,
                intervalInnerRadius: 75,
                hubRadius: 6
            }
        };


        if (scale.MinWeight > 0 && scale.MaxWeight > 0) {

            seriesDefaults.rendererOptions.intervals = [scale.MinWeight, scale.MaxWeight, scale.MaxPossibleWeight];
            seriesDefaults.rendererOptions.intervalColors = ['#E7E658', '#66cc66', '#cc6666'];
        };

        

        $('#plot-' + scale.ID).addClass('plotVisible').empty();

        scale.plot = $.jqplot('plot-' + scale.ID, [[scale.weightCurrent || 0]], {

            seriesDefaults: seriesDefaults
        });
    };

    function vmRedrawArrow(scale) {
      
        scale.plot.replot({

            data: [[scale.weightCurrent || 0]],
        });
    };

    function vmSelectCurrentSides(id) {

        vmShowScaleInfo(id);

        if (($scope.scalesDetailsInfo.SCALES_TYPE == 'BUNT' && $scope.scalesDetailsInfo.PACK_RULE == 'CALC')){

            $scope.BindingDiaData = null;
            $scope.BindingQtyData = null;

            $scope.scales[0].isInfoLoaded = false;

            $q.all([indexService.getInfo('v_BindingDia'), indexService.getInfo('v_BindingQty')])
                .then(function (responses) {

                    $scope.BindingDiaData = responses[0].data.value;
                    $scope.BindingQtyData = responses[1].data.value;

                    $scope.scales[0].isInfoLoaded = true;

                    vmGetLatestWorkRequest(id);
                })
        } else {

            vmGetLatestWorkRequest(id);
        }
    }

    //this method shows detail info for selected scale
    //we get array with scale objects and just filter him by ID of current scale
    //also we calculate rods quantity and rods left number
    function vmShowScaleInfo(id) {

        if ($scope.scales[0].isInfoLoaded) {

            $scope.currentScaleID = id;            

            //this scope variable currently needed to show scale detail data on user interface
            $scope.scalesDetailsInfo = $scope.scales.find(function (item) {

                if (item.ID == id)
                    return item;
            });
            
            if ($scope.flagTakeWeight && $scope.scalesDetailsInfo.PEREBOR && $scope.scalesDetailsInfo.SCALES_TYPE != 'BUNT' && $scope.scalesDetailsInfo.SCALES_TYPE != 'LINEPACK') {
                $scope.takeWeightLabel = $translate.instant('marker.takeWeightButton');
            }

            if ($scope.flagTakeWeight && $scope.scalesDetailsInfo.PEREBOR && ($scope.scalesDetailsInfo.SCALES_TYPE == 'BUNT' || $scope.scalesDetailsInfo.SCALES_TYPE == 'LINEPACK')) {
                $scope.takeWeightLabel = $translate.instant('marker.passWeightButton');
            }

            if ($scope.flagTakeWeight && ($scope.scalesDetailsInfo.PEREBOR == null || $scope.scalesDetailsInfo.PEREBOR == false || $scope.scalesDetailsInfo.PEREBOR == undefined)) {
                $scope.takeWeightLabel = $translate.instant('marker.takeWeightButton');
            }



            //this variable created for watching change CMD_TAKE_WEIGHT parameter from controller
            //true/false meaning of this parameter influences on caption of 'take weight' button
            $scope.cmdTakeWeight = $scope.scalesDetailsInfo.CMD_TAKE_WEIGHT;
            $scope.buntNo = $scope.scalesDetailsInfo.BUNT_NO;
                                            
            vmCalculateRods();
            
        }        
    }

    //this method is called when we show scale detail info
    //this method get last work request data
    function vmGetLatestWorkRequest(id) {        

        //get last work request for current scales
        if ($scope.scales[0].isInfoLoaded) {

            //clear fields
            vmReset();

            indexService.getInfo('v_LatestWorkRequests?$filter=EquipmentID eq {0}'.format(id)).then(function (response) {

                var data = response.data.value;

                if (data.length > 0) {

                    $scope.disableButtonOKTask = true;

                    $scope.workRequestID = data[0].WorkRequestID;
                    $scope.selectedProfile = data[0].ProfileID;

                    vmBuildLabelGrid($('#changeOrderGrid'));
                    vmBuildLabelGrid($('#reverseGrid'));




                    var selectedProfileInfo = $scope.profiles.find(function (profile) {

                        return profile.ID == $scope.selectedProfile;
                    });
                    if (selectedProfileInfo)
                        $scope.selectedProfileDescription = selectedProfileInfo.Description;

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

                                _commOrder = item.Value;

                                if ($scope.commOrder != _commOrder)
                                    $scope.commOrder = _commOrder;

                                //$scope.commOrder = item.Value;
                                $scope.isAcceptedOrder = true;
                            }

                            else if (item.PropertyType == "MAX_WEIGHT") {
                                $scope.maxMass = parseInt(item.Value);
                                //$scope.lastRequestMaxMass = parseInt(item.Value);
                            }


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

                            else if (item.PropertyType == "BRIGADE_NO") {

                                _brigadeNo = item.Value;

                                if ($scope.brigadeNo != _brigadeNo)
                                    $scope.brigadeNo = _brigadeNo;
                            }
                                

                            else if (item.PropertyType == "PROD_DATE"){

                                _prodDate = item.Value;

                                if ($scope.prodDate != _prodDate)
                                    $scope.prodDate = _prodDate;
                            }
                                

                            else if (item.PropertyType == "LENGTH")
                                $scope.length = item.Value;

                            else if (item.PropertyType == "BAR_QUANTITY")
                                $scope.barQuantity = item.Value;

                            else if (item.PropertyType == "SANDWICH_MODE") {
                                $scope.sandwichMode = item.Value == 'true' ? true : false;
                                $scope.sandwichModeAccepted = $scope.sandwichMode;
                            }

                            else if (item.PropertyType == "AUTO_MANU_VALUE")
                                $scope.autoMode = item.Value == 'true' ? false : true;

                            else if (item.PropertyType == "NEMERA")
                                $scope.nemera = item.Value == 'true' ? true : false;

                            else if (item.PropertyType == "PACKS_LEFT")
                                $scope.packsLeftCount = item.Value;

                            else if (item.PropertyType == 'BINDING_DIA') {

                                $scope.bindingDia = $scope.BindingDiaData.find(function (data) {

                                    return data.Value == item.Value;
                                });

                                $scope.BindingDiaDataValue = $scope.bindingDia.Value;
                            }


                            else if (item.PropertyType == 'BINDING_QTY') {

                                $scope.bindingQty = $scope.BindingQtyData.find(function (data) {

                                    return data.Value == item.Value;
                                });

                                $scope.BindingQtyDataValue = $scope.bindingQty.Value;
                            }

                        });

                        //calculate minimal recommended weight when we get last work request for scale
                        if ($scope.barWeight && $scope.barQuantity)
                            $scope.minMassRec = parseInt($scope.barWeight * $scope.barQuantity);

                    })

                };
            });

        };
    }

    function vmBuildLabelGrid($container) {

        $container.jsGrid({
            width: "750px",

            sorting: false,
            paging: true,
            editing: false,
            filtering: true,
            autoload: true,
            pageLoading: true,
            inserting: false,
            pageIndex: 1,
            pageSize: 14,

            onDataLoaded: function (args) {

                var rows = vmShowSelectedRows(args, $scope.materialLotProdorderIDs, 'ID', 'FactoryNumber');

                if (rows)
                    rows.forEach(function (row) {

                        var checkbox = row.find('input[type=checkbox]');
                        $(checkbox).prop('checked', true);
                    });
            },

            rowClick: function (args) {

                var $tr = $(args.event.currentTarget);
                $tr.toggleClass('selected-row');

                var elem = $(args.event.target);
                var checkbox = $(args.event.currentTarget).find('input[type=checkbox]');

                var materialLotProdorderID = args.item.ID;
                var index = $scope.materialLotProdorderIDs.indexOf(materialLotProdorderID);


                if (index == -1) {

                    if (!elem.is('input'))
                        $(checkbox).prop('checked', true);

                    $scope.materialLotProdorderIDs.push(materialLotProdorderID);
                }

                else {

                    if (!elem.is('input'))
                        $(checkbox).prop('checked', false);

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
                width: 120,
                order: 1
            },
            {
                id: 'PART_NO',
                name: 'PART_NO',
                title: $translate.instant('marker.grid.PART_NO'),
                width: 100,
                order: 2
            },
            {
                id: 'FactoryNumber',
                name: 'FactoryNumber',
                title: $translate.instant('marker.grid.FactoryNumber'),
                width: 120,
                order: 3
            },
            {
                id: 'BUNT_NO',
                name: 'BUNT_NO',
                title: $translate.instant('marker.grid.BUNT_NO'),
                width: 145,
                order: 4
            },
            {
                id: 'CreateTime',
                name: 'CreateTime',
                title: $translate.instant('marker.grid.CreateTime'),
                width: 150,
                order: 5
            },

            {
                id: 'Quantity',
                name: 'Quantity',
                title: $translate.instant('marker.grid.Quantity'),
                width: 50,
                order: 6
            },
            {
                id: 'selected',
                name: 'selected',
                title: ' ',
                type: 'myCheckbox',
                width: 25,
                order: 7
            }]

        })
    }

    function vmGetProfiles() {

        //get profiles list(left form)
        indexService.getInfo('MaterialDefinition?$filter=MaterialClassID eq (1)')
                    .then(function (response) {

                        $scope.profiles = response.data.value;
                        $scope.selectedProfile = $scope.profiles[0];
                    });
    }

    function vmActionsProfileChanged(item) {

        vmGetProfilePropertiesList(item.ID);
        vmEnableControlOK();
    }


    function vmChangeBindingDiaData(item) {

        $scope.BindingDiaDataValue = item.Value;
        $scope.bindingDia = item;
        vmEnableControlOK();
    }

    function vmChangeBindingQtyData(item) {

        $scope.BindingQtyDataValue = item.Value;
        $scope.bindingQty = item;
        vmEnableControlOK();
    }

    //get profiles properties list
    //'calledByLastWorkRequest' param indicates is must button 'accept' to be disabled
    function vmGetProfilePropertiesList(id, calledByLastWorkRequest) {

        if (id)
            $scope.selectedProfile = id;

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

                                 var fields = $scope.fields;

                                 if ($scope.scalesDetailsInfo.SCALES_TYPE == 'BUNT') {

                                     fields.forEach(function (item) {

                                         if (item.name == 'BUNT_NO') {
                                             item.properties.required = true;
                                             item.properties.notZeroValue = true;
                                         }

                                     });
                                 }

                                 fields.forEach(function (field) {

                                     var data = orderData.find(function (item) {

                                         return item.Property == field.name;
                                     })

                                     if (data)
                                         field.properties.defaultValue = data.Value;
                                     else
                                         field.properties.defaultValue = null;
                                 });

                                 var isEquipmentID = $scope.fields.filter(function (item) {

                                     return item.name == 'EquipmentID';
                                 });

                                 if (isEquipmentID.length > 0) {
                                     $scope.fields.forEach(function (item) {
                                         if (item.name == 'EquipmentID')
                                             item.properties.defaultValue = $scope.currentScaleID;
                                     })
                                 } else {
                                     $scope.fields.push({

                                         name: 'EquipmentID',
                                         properties: {
                                             control: 'text',
                                             required: false,
                                             show: false,
                                             disable: false,
                                             send: true,
                                             defaultValue: $scope.currentScaleID,
                                             order: -1
                                         }

                                     });
                                 }

                                 var controlList = [{
                                     type: 'additional',
                                     name: 'preview',
                                     text: $translate.instant('market.Order.CreateDialogue.additionalButtonCaptions.preview'),
                                     procedure: 'ins_MaterialLotForPreview',
                                     procedureParams: {

                                         additionalProcedureParams: {
                                             prop: 'MaterialLotID',
                                             value: 1
                                         },
                                         escapedProcedureParam: ['EquipmentID']
                                     }
                                 },

                                {
                                    type: 'additional',
                                    name: 'testPrint',
                                    text: $translate.instant('market.Order.CreateDialogue.additionalButtonCaptions.testPrint'),
                                    procedure: 'ins_MaterialLotForTestPrint',
                                    procedureParams: {
                                        callBack: function () {
                                            $scope.isLoading = false;
                                            $scope.$apply();
                                        },
                                    }
                                },
                                    {
                                     type: 'additional',
                                     name: 'refresh',
                                     text: $translate.instant('market.Order.CreateDialogue.additionalButtonCaptions.refresh'),
                                     procedure: 'upd_WorkDefinitionFromOrder',
                                     procedureParams: {

                                         additionalProcedureParams: {},                                         
                                         escapedProcedureParam: ['BRIGADE_NO', 'BUNT_DIA', 'BUNT_NO', 'BUYER_ORDER_NO',
                                         'CHANGE_NO', 'CHEM_ANALYSIS', 'CLASS', 'CONTRACT_NO', 'DIRECTION', 'LABEL_PRINT_QTY',
                                         'LENGTH', 'MATERIAL_NO', 'MELT_NO', 'MIN_ROD', 'PART_NO', 'PRODUCT', 'PROD_DATE',
                                         'PROD_ORDER', 'SIZE', 'STANDARD', 'STEEL_CLASS', 'TEMPLATE', 'TOLERANCE', 'UTVK'],

                                         callBack: function () {

                                             $scope.isLoading = false;
                                             vmToggleModal(false);

                                             vmBuildForm();

                                             $scope.$apply();
                                         },
                                         

                                     }
                                 }];

                                 vmCreateForm($('#orderForm'),
                                              'edit',
                                              procedure,
                                              fields,
                                              'COMM_ORDER',                                               
                                               {
                                                   OK: 'OK',
                                                   Cancel: $translate.instant('buttonCancel')
                                               }, controlList);
                             } else {
                                if(creatingOrder !== $scope.commOrder) { // we need this to avoid inserting twice.
                                    // By some reason our method vmBuildForm called 2 times on ENTER event
                                    creatingOrder = $scope.commOrder;

                                    vmGetSapInfo($scope.commOrder).then(function(data){
                                        vmOnGetSapInfoResult($scope.commOrder, data.value);
                                    }, function( jqXHR, textStatus, errorThrown ){
                                        console.log('[vmGetSapInfo() failed] Status: ' + textStatus + '; Error: ' + errorThrown);
                                        vmOnGetSapInfoResult($scope.commOrder);
                                    })
                                }
                             }
                         })

    }

    var creatingOrder = null;    

    function vmGetSapInfo(orderNumber){
        return $.ajax({
            url: sapUrl + orderNumber,
            contentType: "application/json",
            timeout: 60000
        })
    }

    function vmOnGetSapInfoResult(orderNum, sapData){
        var orderData = sapData ? vmSapDataToOrder(sapData) : null;

        vmTryCreateOrder(orderNum, orderData).then(
            function() {
                vmBuildForm();
            },
            function() {
                creatingOrder = null;
            }
        );
    }

    function vmSapDataToOrder(sapData){
        return {
            STANDARD: vmGetSapField(sapData,'DSTU'),
            LENGTH: vmGetSapField(sapData,'Lenght'), 
            MIN_ROD: vmGetSapField(sapData,'Quantity'),
            CONTRACT_NO: vmGetSapField(sapData,'Contract'),
            DIRECTION: vmGetSapField(sapData,'CountryName'),
            PRODUCT: vmGetSapField(sapData,'ProductName'),
            CLASS: vmGetSapField(sapData,'ProductClass'),
            STEEL_CLASS: vmGetSapField(sapData,'SteelGrade'), 
            COMM_ORDER: vmGetSapField(sapData,'SelesOrder'),
            SIZE: vmGetSapField(sapData,'Size'), 
            BUYER_ORDER_NO: vmGetSapField(sapData,'Order')
        };
    }

    function vmGetSapField(sapData, fieldName) {
        var param = sapData.filter(function(val){
            return val.Name === fieldName;
        });

        return param.length ? param[0].Value : null;
    }

    function vmTryCreateOrder(orderNumber, orderData) {
        var url = serviceUrl;
        var data =  { COMM_ORDER: orderNumber/*parseInt(orderNumber, 10)*/ };
        if(orderData) {
            data = angular.extend(orderData, data);
        }

        var params = {
            url: url + 'ins_Order',
            type: 'POST',
            data: JSON.stringify(data),
            contentType: "application/json",
            timeout: 60000
        };
        
        //call service action
        return $.ajax(params);

    }

    function vmShowBuildFormWindow(flag, mode) {

        if (!$scope[mode])
            $scope[flag] = true;
        else {

            if ($rootScope.intervalWorkRequest)
                $interval.cancel($rootScope.intervalWorkRequest);

            $scope.isLoading = true;

            indexService.sendInfo('set_StandardMode', {

                EquipmentID: parseInt($scope.currentScaleID) || null
            }).then(function (response) {

                $scope.standard = true;
                $scope[mode] = false;

                $scope.sandwichMode = false;
                $scope.sandwichModeAccepted = false;

                $scope.isLoading = false;

                //clear _commOrder, _brigadeNo and _prodDate to return to standard mode
                _commOrder = null;
                _brigadeNo = null;
                _prodDate = null;

                vmGetLatestWorkRequest($scope.currentScaleID);
            });
        };
                         
    };

    function vmBuildFormSpecialMode(container, showFlag) {

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
        }                         

        vmGetLatestWorkRequest($scope.currentScaleID);

        indexService.getInfo("v_MaterialLotProperty?$filter=FactoryNumber eq '{0}'".format($scope.labelNumber))
                    .then(function (response) {

                        var rowData = response.data.value;

                        if (rowData.length > 0) {

                            $scope[showFlag] = true;
                            
                            $scope.fieldsSpecialMode = $scope.fields.slice(0);

                            var currentScaleID = $scope.currentScaleID;
                            var quantity = rowData[0].Quantity;

                            $scope.fieldsSpecialMode.push({

                                    name: 'EquipmentID',
                                    properties: {
                                        control: 'text',
                                        required: false,
                                        show: false,
                                        disable: false,
                                        send: true,
                                        defaultValue: $scope.currentScaleID,
                                        order: -1
                                    }

                                },
                            {

                                name: 'Weight',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    show: true,
                                    disable: true,
                                    send: false,
                                    defaultValue: rowData[0].Quantity,
                                    translate: $translate.instant('marker.CreateDialogue.mass'),
                                    order: 12
                                },
 
                            }, {

                                name: 'FACTORY_NUMBER',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    show: false,
                                    disable: false,
                                    send: true,
                                    defaultValue: $scope.labelNumber,
                                    translate: $translate.instant('marker.CreateDialogue.FactoryNumber'),
                                    order: -1

                                }
                            });

                            $scope.fieldsSeparateMode = $scope.fieldsSpecialMode.slice(0);
                            $scope.fieldsSeparateMode.push({
                                name: 'PACKS_LEFT',
                                properties: {
                                    control: 'text',
                                    required: false,
                                    show: false,
                                    disable: false,
                                    send: true,
                                    defaultValue: $scope.packsLeft,
                                    translate: $translate.instant('market.Order.CreateDialogue.PACKS_LEFT'),
                                    order: 24
                                }
                            });

                            $scope.fieldsSeparateMode = $scope.fieldsSeparateMode.filter(function (item) {

                                return item.name != 'Weight';
                            });

                            var fields;

                            if (container != 'separateForm') {

                                fields = $scope.fieldsSpecialMode;
                            } else {

                                fields = $scope.fieldsSeparateMode;
                            };
                                

                            fields.forEach(function (field) {

                                var data = rowData.find(function (item) {

                                    return item.Property == field.name;
                                })

                                if (data)
                                    field.properties.defaultValue = data.Value;
                                else {

                                    if (['PACKS_LEFT', 'FACTORY_NUMBER', 'Weight', 'EquipmentID'].indexOf(field.name) == -1)
                                        field.properties.defaultValue = null;
                                }
                                    
                            });

                            var controlList = [{
                                type: 'additional',
                                name: 'preview',
                                text: $translate.instant('market.Order.CreateDialogue.additionalButtonCaptions.preview'),
                                procedure: 'ins_MaterialLotForPreview',
                                procedureParams: {

                                    additionalProcedureParams: {
                                        prop: 'MaterialLotID',
                                        value: 1
                                    },
                                    escapedProcedureParam: ['EquipmentID', 'FACTORY_NUMBER', 'PACKS_LEFT']
                                }
                            }];

                            vmCreateForm($('#' + container),
                            'edit',
                            procedureName,
                            fields,
                            null,
                            {
                                OK: 'OK',
                                Cancel: container == 'remarkerForm' ? $translate.instant('marker.buttonExit') : $translate.instant('buttonCancel')
                            }, controlList);
                        }
                        else {
                            $scope.readOnly = false;
                            $scope[showFlag] = false;
                            alert($translate.instant('marker.errorMessages.noLabel'));
                        }

                    });
    };

    function vmCreateForm(container, type, procedure, fields, keyField, captions, controlList) {

        vmToggleModal(true);

        container.oDataAction({

            action: procedure,
            type: type,
            keyField: keyField,
            controlCaptions: {

                OK: captions.OK,
                Cancel: captions.Cancel
            },
            translates: {

                errorConnection: $translate.instant('errorConnection'),
                fillRequired: $translate.instant('marker.errorMessages.fillRequired'),
                notAcceptable: $translate.instant('market.modal.notAcceptable'),
                noZeroValue: $translate.instant('market.modal.noZeroValue')
            },
            fields: fields,
            controlList: controlList,
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

        $scope.maxMass = parseInt($scope.minMass) + 20;
    };

    function vmCalculateRods() {
       
        if (
            (typeof $scope.scalesDetailsInfo.BAR_QUANTITY === 'undefined' || $scope.scalesDetailsInfo.BAR_QUANTITY === null)
            ||
            (typeof $scope.scalesDetailsInfo.RodsQuantity === 'undefined' || $scope.scalesDetailsInfo.RodsQuantity === null)
            )
            $scope.rodsLeft = null;
        else
            $scope.rodsLeft = $scope.scalesDetailsInfo.BAR_QUANTITY - $scope.scalesDetailsInfo.RodsQuantity;

    };

    function vmReset() {

        $scope.selectedProfile = null;

        if ($scope.commOrder != _commOrder)
            $scope.commOrder = null;

        $scope.maxMass = null;
        $scope.minMass = null;
        $scope.barWeight = null;
        $scope.sampleLength = 1;
        $scope.sampleMass = null;
        $scope.deviation = null;

        if ($scope.brigadeNo != _brigadeNo)
            $scope.brigadeNo = null;

        if ($scope.prodDate != _prodDate)
            $scope.prodDate = null;

        $scope.length = null;
        $scope.barQuantity = null;
        $scope.sandwichMode = null;
        $scope.autoMode = null;
        $scope.nemera = null;
        $scope.packsLeftCount = null;
        $scope.bindingDia = null;
        $scope.bindingQty = null;
    };

    function vmWorkRequest() {

        if (
            ($scope.commOrder
            && $scope.minMass > 0
            && $scope.maxMass > 0
            && (parseInt($scope.maxMass) >= parseInt($scope.minMass))
            && $scope.isAcceptedOrder)

            //&& $scope.scalesDetailsInfo.SCALES_TYPE
            && (($scope.scalesDetailsInfo.SCALES_TYPE == 'POCKET'
                    && $scope.deviationState != 'wrong'
                    && $scope.selectedProfile
                    && $scope.barQuantity > 0)
            || ($scope.scalesDetailsInfo.SCALES_TYPE == 'BUNT'
                    && $scope.scalesDetailsInfo.PACK_RULE == 'CALC'
                    && $scope.bindingDia
                    && $scope.bindingQty)
			|| ($scope.scalesDetailsInfo.SCALES_TYPE == 'BUNT'
                    && $scope.scalesDetailsInfo.PACK_RULE == 'ENTERED'))

            || ($scope.scalesDetailsInfo.SCALES_TYPE == 'LINEPACK')
            ) {

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
                AUTO_MANU_VALUE: $scope.autoMode ? 'false' : 'true',
                NEMERA: $scope.nemera ? 'true' : 'false',
                BINDING_DIA: null,
                BINDING_QTY: null
            }

            if ($scope.bindingDia && $scope.bindingQty) {

                data.BINDING_DIA = $scope.bindingDia.Value;
                data.BINDING_QTY = $scope.bindingQty.Value;
            }

            $scope.OKLabel = $translate.instant('loadingMsg');
            $scope.isLoading = true;

            indexService.sendInfo('ins_WorkRequestStandart', data)
                        .then(function (response) {

                            $scope.OKLabel = $translate.instant('marker.acceptOrderTask');
                            $scope.disableButtonOKTask = true;
                            $scope.sandwichModeAccepted = $scope.sandwichMode;
                            $scope.isLoading = false;
                        });
        } else {

            var errors = [];

            if ($scope.minMass === null || $scope.minMass.toString().length == 0)
                errors.push($translate.instant('marker.errorMessages.fieldIsRequired').format($translate.instant('marker.errorMessages.fieldName.minMass')));

            if ($scope.minMass == '0')
                errors.push($translate.instant('marker.errorMessages.notNullable').format($translate.instant('marker.errorMessages.fieldName.minMass')));

            if ($scope.maxMass === null || $scope.maxMass.toString().length == 0 || isNaN($scope.maxMass))
                errors.push($translate.instant('marker.errorMessages.fieldIsRequired').format($translate.instant('marker.errorMessages.fieldName.maxMass')));

            if ($scope.maxMass == '0')
                errors.push($translate.instant('marker.errorMessages.notNullable').format($translate.instant('marker.errorMessages.fieldName.maxMass')));

            if (($scope.barQuantity === null || $scope.barQuantity.toString().length == 0) && $scope.scalesDetailsInfo.SCALES_TYPE == 'POCKET')
                errors.push($translate.instant('marker.errorMessages.fieldIsRequired').format($translate.instant('marker.errorMessages.fieldName.rodsQuantity')));

            if ($scope.barQuantity == '0' && $scope.scalesDetailsInfo.SCALES_TYPE == 'POCKET')
                errors.push($translate.instant('marker.errorMessages.notNullable').format($translate.instant('marker.errorMessages.fieldName.rodsQuantity')));

            if ($scope.selectedProfile === null && $scope.scalesDetailsInfo.SCALES_TYPE == 'POCKET')
                errors.push($translate.instant('marker.errorMessages.fieldIsRequired').format($translate.instant('marker.errorMessages.fieldName.profile')));


            if (!$scope.isAcceptedOrder)
                errors.push($translate.instant('marker.errorMessages.acceptOrder'));

            if (parseInt($scope.maxMass) < parseInt($scope.minMass))
                errors.push($translate.instant('marker.errorMessages.minMaxWeight'));

            if ($scope.deviationState == 'wrong' && $scope.scalesDetailsInfo.SCALES_TYPE == 'POCKET')
                errors.push($translate.instant('marker.errorMessages.wrongDeviation'));

            if (!$scope.scalesDetailsInfo.SCALES_TYPE)
                errors.push($translate.instant('marker.errorMessages.scalesTypeUndefined'));

            if ($scope.bindingDia === null && $scope.scalesDetailsInfo.SCALES_TYPE == 'BUNT' && $scope.scalesDetailsInfo.PACK_RULE == 'CALC')
                errors.push($translate.instant('marker.errorMessages.fieldIsRequired').format($translate.instant('marker.bindingDia')));

            if ($scope.bindingQty === null && $scope.scalesDetailsInfo.SCALES_TYPE == 'BUNT' && $scope.scalesDetailsInfo.PACK_RULE == 'CALC')
                errors.push($translate.instant('marker.errorMessages.fieldIsRequired').format($translate.instant('marker.bindingQty')));

            errors = errors.join(' \n ');
            alert(errors);
        }



    };

    function vmDoAction(url, label, text, stateObj) {
        $scope.flagTakeWeight = false;
        if (label == 'testPrintLabel' && !$scope.isAcceptedOrder) {

            alert($translate.instant('marker.errorMessages.acceptOrder'))
        } else {
           
            $scope.isLoading = true;

            if (label == 'takeWeightLabel') {

                $scope[label] = $translate.instant('marker.takeWeightButtonProcessing');               
                
            } else {
                $scope[label] = $translate.instant('loadingMsg');
            }

            indexService.sendInfo(url, {

                EquipmentID: parseInt($scope.currentScaleID) || null
            }).then(function (response) {

                if (label == 'takeWeightLabel') {
                    var cmdTakeWeightWatcher = $scope.$watch('cmdTakeWeight', function () {

                            if (!$scope.cmdTakeWeight) {
                                $scope[label] = $translate.instant('marker.takeWeightButtonProcessing');

                            } else {

                                //$scope[label] = $translate.instant('marker.takeWeightButton');
                                $scope.flagTakeWeight = true;

                                $timeout(function () {
                                    cmdTakeWeightWatcher();
                                }, 0);
                            }                            
                        
                    });
                }                

                $scope[label] = $translate.instant(text);
                $scope.isLoading = false;
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

        $scope.isLoading = true;
        indexService.sendInfo('set_StandardMode', {

            EquipmentID: parseInt($scope.currentScaleID) || null
        }).then(function (response) {

            $scope.standard = true;
            $scope.isLoading = false;

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

            $scope.isLoading = true;

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
        $scope.isLoading = false;

        //clear _commOrder, _brigadeNo and _prodDate to return to standard mode 
        _commOrder = null;
        _brigadeNo = null;
        _prodDate = null;
    };

    function vmShowOrderChangeModal() {

        $scope.toggleModalOrderChange = true;
        $scope.materialLotProdorderIDs = [];
       
        $('#changeOrderGrid').jsGrid('loadOdata', {

            defaultFilter: 'SideID eq {0}'.format($scope.sideIsSelected),
            order: 'ID desc'
        });
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
            $scope.isLoading = true;

            indexService.sendInfo('upd_MaterialLotProdOrder', {

                PROD_ORDER: $scope.NewOrderNumber,
                MaterialLotIDs: $scope.MaterialLotIDs
            }).then(function () {

                $scope.MaterialLotIDs = null;
                $scope.materialLotProdorderIDs = [];
                
                $('#changeOrderGrid').jsGrid('loadData', {});

                $('#changeOrderGrid').on('oDataGrid.dataLoadedSuccessfull', function () {

                    $scope.NewOrderNumber = null;
                    $scope.isLoading = false;

                    $scope.$apply();
                });
            });
        }
    }

    function vmCancelOrderChange() {

        $scope.noNewOrderNumber = false;
        $scope.toggleModalOrderChange = false;
        $scope.NewOrderNumber = null;
    }

    function vmShowToggleModalReversal() {

        $scope.toggleReversal = true;
        $scope.materialLotProdorderIDs = [];

        $('#reverseGrid').jsGrid('loadOdata', {

            defaultFilter: 'SideID eq {0}'.format($scope.sideIsSelected),
            order: 'ID desc'
        });
    }

    function vmAcceptOrderReversal() {

        $scope.MaterialLotIDs = $scope.materialLotProdorderIDs.join(',');

        var errors = [];

        if ($scope.materialLotProdorderIDs.length == 0)
            errors.push($translate.instant('marker.errorMessages.selectLabel'));

        if (errors.length > 0) {

            errors = errors.join(' \n ');
            alert(errors);

        } else {

            $scope.isLoading = true;

            indexService.sendInfo('upd_MaterialLotReversal', {

                MaterialLotIDs: $scope.MaterialLotIDs
            }).then(function () {

                $scope.MaterialLotIDs = [];
                $scope.materialLotProdorderIDs = [];

                $('#reverseGrid').jsGrid('loadData', {});

                $('#reverseGrid').on('oDataGrid.dataLoadedSuccessfull', function () {

                    $scope.isLoading = false;

                    $scope.$apply();
                });
            });
        }
    }

    function vmCancelReversal() {

        $scope.toggleReversal = false;
    }

    function vmShowOuterPage(state, newWindow) {

        var url = $state.href(state, {

            side: $scope.sideIsSelected
        });

        if (newWindow) {
            window.open(url, 'newwindow', 'width=800,height=600,top=0,left=0');
        } else
            window.open(url, '_blank');

    };

    $('.oDataForm').on('oDataForm.processing', function () {

        $scope.isLoading = true;

        $scope.$apply();
    });

    $('.oDataForm').on('oDataForm.failed', function () {

        $scope.isLoading = false;

        $scope.$apply();
    });

    //there are events triggered on success and cancel button click in order modal form
    $('#orderForm').on('oDataForm.success', function (e, data) {

        $scope.isLoading = false;
        $scope.disableButtonOKTask = true;
        $scope.isAcceptedOrder = true;
        vmToggleModal(false);

        $scope.brigadeNo = data.fields.BRIGADE_NO;
        $scope.prodDate = data.fields.PROD_DATE;

        $scope.$apply();
    });

    $('#orderForm').on('oDataForm.procedureProcessing', function (e) {

        $scope.isLoading = true;
        //$scope.processingTestPrint = true;
        $scope.$apply();
    });

    $('#orderForm').on('oDataForm.procedureProcessed', function (e) {

        $scope.isLoading = false;
        $('#orderForm').find('button').each(function (i, item) {

            $(item).blur();
        })
    })

    $('#orderForm').on('oDataForm.cancel', function (e) {

        $scope.isLoading = false;
        vmToggleModal(false);
        vmShowLastCommOrderValue();

        $scope.brigadeNo = $translate.instant('loadingMsg');
        $scope.prodDate = $translate.instant('loadingMsg');

        indexService.getInfo("v_WorkDefinitionPropertiesAll?$filter=comm_order eq '{0}' and (EquipmentID eq {1} or EquipmentID eq null)".format($scope.commOrder, $scope.currentScaleID))
                    .then(function (response) {

                        var data = response.data.value;
                        var brigadeNo = data.find(function (item) {
                            return item.Property == 'BRIGADE_NO';
                        });

                        if (brigadeNo)
                            $scope.brigadeNo = brigadeNo.Value;
                        else
                            $scope.brigadeNo = null;

                        var prodDate = data.find(function (item) {
                            return item.Property == 'PROD_DATE';
                        });

                        if (prodDate)
                            $scope.prodDate = prodDate.Value;
                        else
                            $scope.prodDate = null;

                    }).catch(function () {
                        vmShowLastCommOrderValue();
                    })

        $scope.$apply();
    });

    $('#remarkerForm').on('oDataForm.success', function (e) {

        $scope.isLoading = false;
        vmActionsOnExit('remarkerForm', 'isShowReMarkForm');

        $scope.$apply();
    })

    $('#remarkerForm').on('oDataForm.cancel', function (e) {

        vmCloseModal('toggleModalMarker');
        vmActionsOnExit('remarkerForm', 'isShowReMarkForm');

        $scope.$apply();
    });

    $('#sortingForm').on('oDataForm.success', function (e) {

        $scope.isLoading = false;

        vmCloseModal('toggleModalSort');
        vmActionsOnExit('sortingForm', 'isShowSortingForm');

        $scope.standard = false;
        $scope.sortingMode = true;

        $scope.$apply();
    })

    $('#sortingForm').on('oDataForm.cancel', function (e) {

        $scope.isLoading = false;

        vmCloseModal('toggleModalSort');
        vmActionsOnExit('sortingForm', 'isShowSortingForm');

        $scope.$apply();
    });

    $('#rejectForm').on('oDataForm.success', function (e) {

        $scope.isLoading = false;

        vmCloseModal('toggleModalReject');
        vmActionsOnExit('rejectForm', 'isShowRejectForm');

        $scope.standard = false;
        $scope.rejectMode = true;

        $scope.$apply();
    })

    $('#rejectForm').on('oDataForm.cancel', function (e) {

        $scope.isLoading = false;

        vmCloseModal('toggleModalReject');
        vmActionsOnExit('rejectForm', 'isShowRejectForm');

        $scope.$apply();
    });

    $('#separateForm').on('oDataForm.success', function (e) {

        $scope.isLoading = false;

        vmCloseModal('toggleModalSeparate');
        vmActionsOnExit('separateForm', 'isShowSeparateForm');

        $scope.standard = false;
        $scope.separateMode = true;

        $scope.$apply();
    })

    $('#separateForm').on('oDataForm.cancel', function (e) {

        $scope.isLoading = false;

        vmCloseModal('toggleModalSeparate');
        vmActionsOnExit('separateForm', 'isShowSeparateForm');

        $scope.$apply();
    });

}])

.controller('markerMonitorCtrl', ['$scope', '$rootScope', 'indexService', '$state', 'scalesRefresh', '$interval', function ($scope, $rootScope, indexService, $state, scalesRefresh, $interval) {

    $scope.shownParamsList = [{
                                id: 0,
                                Description: 'Вес'
                                }, {
                                    id: 1,
                                    Description: 'Прутки'
                                }];

    $scope.filter = {

        left: null,
        right: null
    };

    $scope.getScalesInfo = vmGetScalesInfo;

    if ($state.params.side) {

        indexService.getInfo('v_AvailableScales?$filter=sideID eq {0}'.format($state.params.side))
                    .then(function (response) {

                        $scope.scalesList = response.data.value;

                    });
       
    }

    function vmGetScalesInfo(item) {

        if (item)
            item.side == 'left' ? $scope.scaleLeft = item : $scope.scaleRight = item;

        if ($rootScope.intervalMonitor)
            $interval.cancel($rootScope.intervalMonitor);

        if ($scope.scaleLeft) {

            $scope.filter.left = 'ID eq {0}'.format($scope.scaleLeft.ID);
        };

        if ($scope.scaleRight) {

            $scope.filter.right = 'ID eq {0}'.format($scope.scaleRight.ID);
        };

        
        $rootScope.intervalMonitor = $interval(function () {

                vmGetScaleInfo();
        }, scalesRefresh);
    };

    function vmGetScaleInfo() {

        var filter = [];

        if ($scope.filter.left == $scope.filter.right) {

            filter = $scope.filter.left;
        } else {

            for (var i in $scope.filter) {

                if ($scope.filter[i])
                    filter.push($scope.filter[i]);
            };

            filter = filter.join(' or ');
        };
                
        indexService.getInfo('v_ScalesMonitorInfo?$filter={0}'.format(filter))
            .then(function (response) {

               var scaleInfo = response.data.value;

               if ($scope.scaleLeft) {

                   $scope.scalesLeftSideInfo = scaleInfo.find(function (item) {

                       return item.ID == $scope.scaleLeft.ID
                   });
                   

                   vmCalculateRods($scope.scalesLeftSideInfo);
               };
               
               if ($scope.scaleRight) {

                   $scope.scalesRightSideInfo = scaleInfo.find(function (item) {

                       return item.ID == $scope.scaleRight.ID
                   });

                   vmCalculateRods($scope.scalesRightSideInfo);
               };

               if (($scope.scalesLeftSideInfo && $scope.scalesLeftSideInfo.POCKET_LOC == true && $scope.scalesLeftSideInfo.WEIGHT_STAB == false) ||
                   ($scope.scalesRightSideInfo && $scope.scalesRightSideInfo.POCKET_LOC == true && $scope.scalesRightSideInfo.WEIGHT_STAB == false)) {

                   vmSetBlinking('backgroundColor');
               } else {

                   vmClearStyle($('.monitorSideItem'));
               }
                              
            });
    }

    function vmCalculateRods(info) {

        if (
            (typeof info.BAR_QUANTITY === 'undefined' || info.BAR_QUANTITY === null)
            ||
            (typeof info.RodsQuantity === 'undefined' || info.RodsQuantity === null)
            )
            info.rodsLeftCounted = null;
        else
            info.rodsLeftCounted = info.BAR_QUANTITY - info.RodsQuantity;

    };
}])

.controller('markerChartsCtrl', ['$scope', '$rootScope', 'indexService', '$state', 'dateTimePickerControl', '$q', '$translate', function ($scope, $rootScope, indexService, $state, dateTimePickerControl, $q, $translate) {
    
    var date = new Date();

    $scope.dateEnd = indexService.getDateChartFormat(date);
    $scope.dateStart = indexService.getDateChartFormat(new Date(date.setHours(date.getHours() - 1)));
    $scope.chartDataLoaded = false;

    $scope.getChartData = vmGetChartData;    

    $('#chart-date-start').datetimepicker({
        defaultDate: new Date($scope.dateStart),
        dateFormat: 'dd.mm.yy',
        timeFormat: 'HH:mm:ss',
        controlType: dateTimePickerControl
    });

    $('#chart-date-end').datetimepicker({
        defaultDate: new Date($scope.dateEnd),
        dateFormat: 'dd.mm.yy',
        timeFormat: 'HH:mm:ss',
        controlType: dateTimePickerControl
    });

    vmGetChartData($scope.dateStart, $scope.dateEnd);

    function vmGetChartData(dateStart, dateEnd) {

        $('#chart').empty();

        dateStart = indexService.getOdataDate(dateStart);
        dateEnd = indexService.getOdataDate(dateEnd);
       
        $scope.chartDataLoaded = true;

        $q.all([indexService.getInfo('v_ScalesWeightHistory?$filter=SideID eq {0} and WEIGHT_TIMESTAMP gt {1} and WEIGHT_TIMESTAMP lt {2}'
                            .format($state.params.side, dateStart, dateEnd)),
                indexService.getInfo('v_AvailableScales?$filter=sideID eq {0}'.format($state.params.side))
        ])
                    .then(function (responses) {

                        $scope.chartDataLoaded = false;

                        var chartData = responses[0].data.value;
                        var scalesList = responses[1].data.value;

                        if (chartData.length == 0) {

                            alert($translate.instant('marker.chartNoData'));

                        } else {

                            scalesList = scalesList.map(function (item) {

                                return {

                                    id: item.ID,
                                    name: item.Description
                                }
                            }).sort(function (a, b) {
                                return a.id - b.id;
                            });

                            var chartDataChunks = [], chartDataForScale = [], labels = [];

                            scalesList.forEach(function (scale) {

                                chartDataForScale = chartData.filter(function (item) {

                                    return item.EquipmentID == scale.id;
                                }).map(function (item) {

                                    var date = new Date(item.WEIGHT_TIMESTAMP);

                                    date = indexService.getDateChartFormat(date, true);

                                    return [date, item.WEIGHT_CURRENT];
                                });

                                chartDataChunks.push(chartDataForScale);
                                labels.push(scale.name);
                            });

                            var i = chartDataChunks.length;
                            while (i--) {
                                if (chartDataChunks[i].length == 0) {
                                    chartDataChunks.splice(i, 1);
                                    labels.splice(i, 1);
                                }
                            }

                            var plotLine = $.jqplot('chart', chartDataChunks, {

                                seriesDefaults: { showMarker: false },

                                legend: {
                                    show: true,
                                    labels: labels,
                                    placement: "outside",
                                    renderer: $.jqplot.EnhancedLegendRenderer,
                                    location: 's',
                                },

                                axes: {

                                    xaxis: {
                                        renderer: $.jqplot.DateAxisRenderer,
                                        tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                                        tickOptions: {
                                            formatString: '%d.%m.%Y %H:%M:%S',
                                            angle: -30,
                                        },
                                        min: $scope.dateStart,
                                        max: $scope.dateEnd,
                                        tickInterval: vmGetAxeInterval(dateStart, dateEnd),
                                        drawMajorGridlines: false
                                    },

                                    yaxis: {
                                        label: 'КГ',
                                        labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                                    },
                                },

                                highlighter: {
                                    show: true,
                                    sizeAdjust: 7.5,
                                    useAxesFormatters: true,
                                    formatString: '%s , %s {0}'.format($translate.instant('marker.kg'))
                                    
                                },
                                cursor: {
                                    show: false
                                }

                            });
                    
                            setTimeout(function () {

                                var td = $('table.jqplot-table-legend')
                                            .find('td.jqplot-table-legend-swatch');

                                td.append('<input type="checkbox" checked/>');

                                $('tr.jqplot-table-legend').bind('click', function (e) {

                                    if (e.target.tagName != 'INPUT') {

                                        var checkbox = $(this).find('input[type=checkbox]');
                                        checkbox.prop("checked", !checkbox.prop("checked"));
                                    };
                                });
                            }, 0);

                            

                        }

                                                
                    });
    }

    function vmGetAxeInterval(dateStart, dateEnd) {

        var interval = '';

        dateStart = new Date(dateStart);
        dateEnd = new Date(dateEnd);

        var timeDiff = Math.abs(dateEnd.getTime() - dateStart.getTime())/1000/60;
               
        interval = (timeDiff / 6).toFixed(2);
        interval += ' minute';
            
        return interval;
    }

}])

.controller('markerStatisticsCtrl', ['$scope', '$state', 'indexService', '$translate', function ($scope, $state, indexService, $translate) {

    var date = getTimeToUpdate();

    $scope.dateStart = $scope.dateEnd = '{0}.{1}.{2}'.format(date.day, date.month, date.year);

    $scope.groupParams = ['labelsCount', 'weightOverall', 'byChanges', 'byBrigades', 'byMelt', 'byOrder', 'byParty', 'handMode', 'allLabels'];

    $scope.groupParams = $scope.groupParams.map(function (item) {

        return {

            ID: item,
            Description: $translate.instant('marker.statistics.' + item)
        }
    }).sort(function (a, b) {
        if (a.Description < b.Description)
            return -1
        else if (a.Description > b.Description)
            return 1
        else return 0
    });

    $scope.groupBy = null;
    $scope.comboValue = '';

    $scope.getReportData = vmGetReportData;
    $scope.clearData = vmClearData;
    $scope.groupByParam = vmGroupByParam;

    $('#statistics-date-start').datepicker({
        defaultDate: new Date($scope.dateStart),
        dateFormat: 'dd.mm.yy',
        controlType: dateTimePickerControl
    });

    $('#statistics-date-end').datepicker({
        defaultDate: new Date($scope.dateEnd),
        dateFormat: 'dd.mm.yy',
        controlType: dateTimePickerControl
    });

    function vmGetReportData(dateStart, dateEnd) {

        $scope.reportDataLoading = true;

        dateStart = dateStart.split('.').reverse().join('-') + 'T00:00:00.000Z';
        dateEnd = dateEnd.split('.').reverse().join('-') + 'T23:59:59.999Z';

        var url = 'v_MaterialLotReport?$filter=SideID eq {0} and PROD_DATE ge {1} and PROD_DATE le {2}'
                            .format($state.params.side, dateStart, dateEnd);


        indexService.getInfo(url).then(function (responce) {

            $scope.reportDataLoading = false;
            $scope.reportData = responce.data.value;

            if ($scope.groupBy) {

                vmGroupByParam();
            };

        });
    };

    function vmClearData() {

        $scope.reportData = null;
        $scope.groupBy = null;
        $scope.comboValue = '';
        $state.go('app.Marker.Statistics');
    };

    function vmGroupByParam(groupBy) {

            if (groupBy)
                $scope.groupBy = groupBy;

            if ($scope.reportData) {

                $state.go('app.Marker.Statistics.{0}'.format($scope.groupBy.ID), {

                    data: $scope.reportData

                });
            }
            
    }


    
}])

.controller('markerStatisticsLabelsCountCtrl', ['$scope', '$state', 'indexService', '$translate', function ($scope, $state, indexService, $translate) {

    var data = $state.params.data;
    if (!data)
        $state.go('app.Marker.Statistics');
    else
        $scope.labelCount = [{ length: data.length }];
}])

.controller('markerStatisticsWeightOverallCtrl', ['$scope', '$state', 'indexService', '$translate', function ($scope, $state, indexService, $translate) {

    var data = $state.params.data;
    if (!data)
        $state.go('app.Marker.Statistics');
    else {
        data = indexService.countParam(data, 'Quantity');
        $scope.weightOverall = [{ weightOverall: data }];
    }
        
}])

.controller('markerStatisticsByChangesCtrl', ['$scope', '$state', 'indexService', function ($scope, $state, indexService) {

    if (!$state.params.data)
        $state.go('app.Marker.Statistics');
    else 
        indexService.buildStatisticsGrid($('#byChangeGrid'), 'CHANGE_NO', $state.params.data, 'marker.statistics.change');
      
}])

.controller('markerStatisticsByBrigadesCtrl', ['$scope', '$state', 'indexService', function ($scope, $state, indexService) {

    if (!$state.params.data)
        $state.go('app.Marker.Statistics');
    else 
        indexService.buildStatisticsGrid($('#byBrigadeGrid'), 'BRIGADE_NO', $state.params.data, 'marker.statistics.brigade');
       
}])

.controller('markerStatisticsByMeltCtrl', ['$scope', '$state', 'indexService', function ($scope, $state, indexService) {

    if (!$state.params.data)
        $state.go('app.Marker.Statistics');
    else 
        indexService.buildStatisticsGrid($('#byMeltGrid'), 'MELT_NO', $state.params.data, 'marker.statistics.melt');
      
}])

.controller('markerStatisticsByOrderCtrl', ['$scope', '$state', 'indexService', function ($scope, $state, indexService) {

    if (!$state.params.data)
        $state.go('app.Marker.Statistics');
    else 
        indexService.buildStatisticsGrid($('#byOrderGrid'), 'PROD_ORDER', $state.params.data, 'marker.statistics.prodOrder');

}])

.controller('markerStatisticsByPartyCtrl', ['$scope', '$state', 'indexService', function ($scope, $state, indexService) {

    if (!$state.params.data)
        $state.go('app.Marker.Statistics');
    else
        indexService.buildStatisticsGrid($('#byPartyGrid'), 'PART_NO', $state.params.data, 'marker.statistics.party');
      
}])

.controller('markerStatisticsHandModeCtrl', ['$scope', '$state', 'indexService', '$translate', function ($scope, $state, indexService, $translate) {

    if (!$state.params.data)
        $state.go('app.Marker.Statistics');
    else {

        var data = $state.params.data;
        var fields = [
                { name: "FactoryNumber", title: $translate.instant('marker.statistics.labelNumder'), type: "text", width: 100 },
                { name: "Quantity", title: $translate.instant('marker.statistics.mass'), type: "text", align: "center", width: 50 },
                { name: "BRIGADE_NO", title: $translate.instant('marker.statistics.brigade'), type: "text", align: "center", width: 55 },
                { name: "MEASURE_TIME", title: $translate.instant('marker.statistics.dateTimeMeasure'), align: "center", type: "dateTime", width: 150 },
                { name: "PART_NO", title: $translate.instant('marker.statistics.party'), type: "text", align: "center", width: 50 },
                { name: "MELT_NO", title: $translate.instant('marker.statistics.melt'), type: "text", align: "center", width: 50 },
                { name: "PROD_ORDER", title: $translate.instant('marker.statistics.prodOrder'), type: "text", align: "center", width: 150 },
                { name: "MATERIAL_NO", title: $translate.instant('marker.statistics.materialNo'), type: "text", align: "center", width: 70 }
                
        ];

        var fieldsHandMode = fields.slice(0);
        var fieldsAllLabels = fields.slice(0);

        fieldsAllLabels.push({ name: "StatusName", title: $translate.instant('marker.statistics.statusName'), type: "text", align: "center", width: 70 });


        if ($state.current.name == 'app.Marker.Statistics.handMode') {

            data = data.filter(function (item) {

                return item.CREATE_MODE == 'Печать с ручным вводом веса';
            });
        }

        data = data.sort(function (a, b) {

            return b.ID - a.ID
        });
        
        $('#handModeGrid').jsGrid({
            width: "940px",

            filtering: true,
            editing: false,
            sorting: false,
            paging: true,
            autoload: true,

            pageSize: 10,
            data: data,

            controller: {
                loadData: function (filter) {

                    return vmLoadStaticData(filter, data)
                }
            },

            fields: $state.current.name == 'app.Marker.Statistics.handMode' ? fieldsHandMode : fieldsAllLabels
        });
    };

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

            var val = element.val();

            var permittedSymbols = [8, 46, 13, 37, 38, 39, 40, 9];

            if (attrs.myNumberCheck != 'number')
                permittedSymbols.push(190);

            if ((!((event.which >= 48 && event.which <= 57) || (event.which >= 96 && event.which <= 105))
                && permittedSymbols.indexOf(event.which) == -1) ||
                (attrs.myNumberCheck != 'number' && event.which == 190 && element.val().indexOf('.') > -1)) {

                return false;
            };
        });
    }

});




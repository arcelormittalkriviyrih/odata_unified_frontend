﻿var translations = {

    en: {
        index: {
            User: 'User',
            Market: 'Market',
            WorkshopSpecs: 'WorkshopSpecs',
            Marker: 'Marker',
            PA: 'PA',
            WeightAnalytics: 'WeightAnalytics',
            AutomationLab: 'Automation Lab'
        },
        welcome: {
            Welcome: 'Welcome',
            UseRoles: 'Use one of the available roles',
            NoRoles: 'There are no available roles'
        },

        automationlab: {
            Income: 'Income/Outcome',
            Material: 'Device',
            Repair: 'Repair & Maintenance',
            material: {
                buttonAdd: 'New device',
                addnewmaterial: 'Add a new device'
            },
            income: {
                incomeoutcome: 'Income/Outcome device',
                factorynumber: 'Enter the factory number:',
                search: 'Search',
                income: 'Income',
                outcome: 'Outcome',
                defect: 'Defect'
            },
        },

        gasCollection: {
          reports: 'Reports', //Отчёты
          gasReports: 'Gas reports', //Отчёты по газу
          trends: 'Trends', //Тренды
          gasTrends: 'Gas trends', //Тренды по газу
          // Нижеследующие переводы ещё следует добавить в рус и укр варианте
          balance: 'Balance', // Баланс
          gasBalance: 'Gas balances', // Балансы по газу
          selectTypeOfReports: 'Select type of reports', // Выберите тип отчёта
          // Выберите точку отбора
          // Получить данные
          // Отображать полные данные
        },

        market: {
            OrderLabel: 'Orders',
            TemplateLabel: 'Label Templates',
            buttonAddTempate: 'Add File',
            buttonDownloadTechSheet: 'Download Tech. Sheet',
            Order: {

                caption: {

                    create: 'Create order',
                    edit: 'Edit order',
                    copy: 'Copy order'
                },

                CreateDialogue: {

                    STANDARD: 'Standard',
                    LENGTH: 'Length',
                    MIN_ROD: 'Rods quantity (minimal)',
                    CONTRACT_NO: 'Contract №',
                    DIRECTION: 'Direction',
                    PRODUCT: 'Product',
                    CLASS: 'Class',
                    STEEL_CLASS: 'Steel class',
                    CHEM_ANALYSIS: 'Chem. Analysis',
                    BUNT_DIA: 'Bunt Diameter',
                    BUNT_NO: 'Bunt No',
                    ADDRESS: 'Provider Address',
                    COMM_ORDER: 'Order',
                    PROFILE: 'Profile',
                    TEMPLATE: 'Label Template',
                    PROD_ORDER: 'Product order',
                    SIZE: 'Size',
                    TOLERANCE: 'Tolerance',
                    MELT_NO: 'Melting',
                    PART_NO: 'Party No',
                    BUYER_ORDER_NO: 'Buyer order no',
                    UTVK: 'UTVK',
                    CHANGE_NO: 'Change No',
                    MATERIAL_NO: 'Material No',
                    BRIGADE_NO: 'Brigade',
                    PROD_DATE: 'Production date',
					LABEL_PRINT_QTY: 'Number of printed labels',
                    additionalButtonCaptions: {

                        testPrint: 'Test print',
                        preview: 'Preview'
                    }
                }
            },
            grid: {
                orders: {
                    order: 'Order',
                    contract: 'Contract No',
                    direction: 'Direction',
                    labelTemplate: 'Label template',
                    templateName: 'Template name',
                    parameter: 'Parameter'
                },
                labelTemplate: {
                    fileName: 'File Name',
                    status: 'Status',
                    fileType: 'File Type',
                    templateName: 'Name',
                    file: 'File',
                    preview: 'Preview',
                    changeFile: 'Change file',
                    changeDescription: 'Change description',
                    upload: 'Upload',
                    update: 'Update'
                }
            },
            modal: {
                notAcceptable: 'Cannot load preview for this template!',
            }

        },
        pa: {
            Equipment: 'Equipment',
            Material: 'Material',
            Personnel: 'Personnel',
            PhysicalAsset: 'PhysicalAsset',
            PhysTabs: {
                Property: 'Properties',
                Structure: 'Structure'
            },
            Label: 'Labels',
            SAPCommunication: "SAP communication",
            Version: 'Version',
            Diagnostics: 'Diagnostics',
            LabelButtons: {
                print: 'Print',
                cancelPrint: 'Print cancel',
                refresh: 'Refresh'
            },
            OrderLabel: 'Orders',
            TemplateLabel: 'Label Templates',
            Logotypes: 'Logos',
            grid: {

                material: {
                    description: 'Description'
                },
                labels: {
                    number: 'Number',
                    quantity: 'Quantity',
                    status: 'Status',
                    isPrinted: 'Is printed'
                },
            },
            sap: {
                address: 'SAP address',
                login: 'Login',
                password: 'Password',
                communicationSuccess: 'Parameters successfully saved'
            },
            diagnostics: {
                changeSide: 'Change side',
                equipmentName: 'Equipment name',
                equipmentStatus: 'Equipment status',
                printSystemEnabled: 'Labels print system enabled',
                printSystemOn: 'Labels print system is ON',
                printSystemOff: 'Labels print system is OFF',
                printSystemTurnOn: 'Are you sure you want to turn labels printing system ON?',
                printSystemTurnOff: 'Are you sure you want to turn labels printing system OFF?'
            }
        },
        marker: {
            changeSide: 'Change side for work:',
            failure: 'failure',
            kg: 'kg',
            pcs: 'pcs',
            task: 'Task',
            profile: 'Profile',
            size: 'Size(m.)',
            rodsQuantityPcs: 'Rods quantity (pcs)',
            sandwich: 'Sandwich Mode',
            byAccept: '"By accept" Mode',
            autoModeShort: 'Auto',
            byAcceptShort: 'By acc',
            nemera: 'Nemera',
            minMassRec: 'Min weight rec. (kg)',
            maxMass: 'Max weight(kg)',
            minMass: 'Min weight (kg)',
            sampleMass: 'Sample weight (kg)',
            rodsWeight: 'Rod weight(kg)',
            sampleLength: 'Sample length (m)',
            deviation: 'Deviation (%)',
            autoMode: 'Auto Mode',
            weight: 'Weight',
            rodsQuantity: 'Rods quantity',
            rodsLeft: 'Rods left',
            scalesBlocked: 'Scales blocked',
            weightOver: 'Weight is over then maximum permissible weight',
            firstPack: 'First pack',
            secondPack: 'Second pack',
            bindingDia: 'Bindind diameter',
            bindingQty: 'Bindind quantity',
            monitor: 'Monitor',
            order: 'Order',
            brigadeNo: 'Brigade No',
            date: 'Date',
            charts: 'Charts',
            period: 'Period',
            chartStartDate: 'Begin Date',
            chartEndDate: 'End Date',
            getChartDataBtn: 'Get',
            chartNoData: 'There are no data for this period! select another period!',
			markerErrorCaption: 'Errors',

            CreateDialogue: {
                CHANGE_NO: 'Change',
                FactoryNumber: 'Factory number',
                mass: 'Mass'
            },
            acceptOrderTask: 'Accept task',
            takeWeightButton: 'Take weight',
            takeTaraButton: 'Take tara',
            testPrintButton: 'Test print',
            buttonExit: 'Exit',
            remarkingButton: 'Remarking',
            sortingButton: 'Sort pack',
            rejectButton: 'Reject pack',
            separateButton: 'Split pack',
            handModeButton: 'Manual input',
            changeOrderButton: 'Change order',
			reversalButton: 'Reversal',
            statisticsButton: 'Statistics',
            errorMessages: {

                noOrders: 'There is no orders with this name!',
                noLabel: 'There is no label with this number!',
                fillRequired: 'You must fill all required fields!',
                acceptOrder: 'You must accept your order number!',
                minMaxWeight: 'Max weight cannot be less then min weight!',
                wrongDeviation: 'Deviation is wrong! Please, recalculate it!',
                enterProdOrder: 'You must enter new prod order number!',
                selectLabel: 'You must change label!',
                handModeQuantity: 'You must enter weight!',
				notNullable: 'Field "{0}" cannot be nullable!',
                fieldIsRequired: 'Field "{0}" is required!',
                fieldName: {

                    minMass: 'Min weight',
                    maxMass: 'Max weight',
                    profile: 'Profile',
                    rodsQuantity: 'Rods quantity'
                }
            },
            modalCaptions: {

                reMarkingMode: 'Remarking mode',
                reSortingMode: 'Sorting mode',
                RejectMode: 'Reject pack mode',
                SeparateMode: 'Split mode',
                enterLabelNumber: 'Enter label number',
                changePackNumber: 'Select pucks number',
                order: 'Order',
                HandMode: 'Manual Mode',
                enterQuantity: 'Enter weight',
                getHandModeCredentials: 'Run',
                OrderChangeMode: 'Change order',				
                Reversal: 'Reversal',
                enterNewOrder: 'Enter new order no'
            },
            grid: {

                PROD_ORDER: 'Order No',
                PART_NO: 'Part No',
                FactoryNumber: 'label No',
                BUNT_NO: 'Bunt No',
                CreateTime: 'Date',
                Quantity: 'Quantity',
                selected: 'Select records needed to change',
                reversed: 'Select records needed to reverse'
            },
            monitorCaptions: {

                scales: 'Scales',
                weightRods: 'Weight/Rods',
                packWeight: 'Pack weight',
                rodsQuantity: 'Rods quantity',
                rodsLeft: 'Rods left'
            },
            statistics: {

                getBtn: 'Get',
                SelectGrouppingMode: 'Select groupping mode',
                labelsCount: 'Labels overall',
                weightOverall: 'Weight overall',
                byChanges: 'By changes',
                byBrigades: 'By brigades',
                byMelt: 'By melts',
                byOrder: 'By orders',
                byParty: 'By parties',
                handMode: 'Hand mode',
                allLabels: 'All labels',
                labelQuantity: 'Label quantity',
                totalWeigth: 'Total weight',
                weight: 'Weight',
                change: 'Change',
                brigade: 'Brigade',
                melt: 'Melt',
                order: 'Order',
                party: 'Party',
                labelNumder: 'Factory number',
                dateTimeMeasure: 'Measure date and time',
                prodOrder: 'Product order',
                materialNo: 'Number of material',
                mass: 'Mass',
                statusName: 'Status'
            }

        },
        weightanalytics: {
            Kopr4: 'ScrapYard 4',
            Link2: 'Link2',
            Buttons: {
                printWS: 'Print weightsheet',
                closeWS: 'Close weightsheet',
                takeWeight: 'Take weight'

            },
            Labels: {
                noOpenedWS: 'No opened weightsheets',
                openedWS: 'Weightsheet №',
                archiveWS: 'Archive weightsheets',
                platform: 'Platform',
                Platform_I: 'Platform I',
                Platform_I_II: 'Platform I+II',
                offset: 'Offset',
                enterParameter: 'Enter the data',
                sender: 'Sender',
                receiver: 'Receiver',
                scrapType: 'Scrap type',
                waybill: 'Waybill №',
                wagon: 'Wagon №',
                wagonSelect: 'Enter wagons...'
            },
            Modal: {
                enterWSNo: 'Enter weightsheet number'
            },
            Table: {
                weightsheet: 'Weightsheet',
                wagon: 'Wagon',
                waybill: 'Waybill',
                CSH: 'Code',
                brutto: 'Brutto',
                tare: 'Tare',
                netto: 'Netto',
                weightingTime: 'Weighting time'
            },
            ton: 't',
            Taring: 'Taring',
            Weighting: 'Weighting'
        },
        error: {
            Unauthorized: 'This role is unavailable for you!'
        },
        errorLog: {
            errorCode: 'Error message',
            description: 'Enter extra info',
            sending: 'Sending...'
        },
        buttonCreate: 'Create',
        buttonEdit: 'Edit',
        buttonDelete: 'Delete',
        buttonCopy: 'Copy',
        buttonSubmit: 'Submit',
        buttonSend: 'Send',
        buttonUpload: 'Select File',
        buttonCancel: 'Cancel',
        loadingMsg: 'Loading...',
        processing: 'Processing...',
        calculatingMsg: 'Calculating...',
        errorConnection: 'There is no internet connection!',
        grid: {
            common: {

                name: 'Name',
                property: 'Property',
                value: 'Value',
                description: 'Description'
            }
        },
        tree: {
            nodeName: 'Node name',
            parentID: 'Parent ID',
            equipmentClass: 'Equipment class',
            search: 'Search...'
        }
    },

    ru: {
        index: {
            User: 'Пользователь',
            Market: 'Маркетолог',
            WorkshopSpecs: 'Специалист Цеха',
            Marker: 'Маркировщик',
            PA: 'Специалист АСУТП',
            WeightAnalytics: 'Аналитик',
            AutomationLab: 'Лаборатория автоматизации'
        },
        welcome: {
            Welcome: 'Привет',
            UseRoles: 'Выберите одну из доступных ролей',
            NoRoles: 'Нет доступных ролей'
        },


        automationlab: {
            Income:'Прием/Выдача',
            Material: 'Устройства',
            Repair: 'Ремонт и техобслуживание',
        material: {
            buttonAdd: 'Добавить',
            addnewmaterial: 'Добавление нового устройства'
        },
        income: {
            incomeoutcome: 'Прием/выдача устройств',
            factorynumber: 'Введите заводской номер устройства:',
            search: 'Поиск',
            income: 'Принять',
            outcome: 'Выдать',
            defect: 'Брак'
        },
        },

        gasCollection: {
            reports: 'Отчёты', //Отчёты
            gasReports: 'Отчёты по газу', //Отчёты по газу
            trends: 'Тренды', //Тренды
            gasTrends: 'Тренды по газу', //Тренды по газу
        },

        market: {
            OrderLabel: 'Заказы',
            TemplateLabel: 'Шаблоны Бирок',
            buttonAddTempate: 'Добавить Файл',
            buttonDownloadTechSheet: 'Скачать Тех. Лист',
            Order: {

                caption: {

                    create: 'Создать заказ',
                    edit: 'Редактировать заказ',
                    copy: 'Копировать заказ'
                },

                CreateDialogue: {

                    STANDARD: 'Стандарт',
                    LENGTH: 'Длина',
                    MIN_ROD: 'Количество прутков',
                    CONTRACT_NO: 'Контракт №',
                    DIRECTION: 'Направление',
                    PRODUCT: 'Продукция',
                    CLASS: 'Класс',
                    STEEL_CLASS: 'Марка стали',
                    CHEM_ANALYSIS: 'Хим. Анализ',
                    BUNT_DIA: 'Диаметр бунта',
                    BUNT_NO: '№ бунта',
                    ADDRESS: 'Адрес поставщика',
                    COMM_ORDER: 'Коммерческий заказ',
                    TEMPLATE: 'Шаблон бирки',
                    PROD_ORDER: 'Производственный заказ',
                    SIZE: 'Размер',
                    TOLERANCE: 'Допуск',
                    MELT_NO: 'Плавка',
                    PART_NO: 'Партия',
                    BUYER_ORDER_NO: '№ заказа у покупателя',
                    UTVK: 'УТВК',
                    CHANGE_NO: 'Смена',
                    MATERIAL_NO: '№ материала',
                    BRIGADE_NO: 'Бригада',
                    PROD_DATE: 'Производственная дата',
					LABEL_PRINT_QTY: 'Кол-во печатаемых бирок',
                    additionalButtonCaptions: {

                        testPrint: 'Тестовая печать',
                        preview: 'Превью'
                    }
                }
            },
            grid: {

                orders: {
                    order: 'Заказ',
                    contract: 'Контракт №',
                    direction: 'Направление',
                    labelTemplate: 'Шаблон бирки',
                    parameter: 'Параметр'
                },
                labelTemplate: {
                    fileName: 'Имя файла',
                    status: 'Статус',
                    fileType: 'Тип файла',
                    templateName: 'Название',
                    file: 'Файл',
                    preview: 'Превью',
                    changeFile: 'Обновить файл',
                    changeDescription: 'Обновить описание',
                    upload: 'Загрузить',
                    update: 'Обновить'
                }
            },
            modal: {
                notAcceptable: 'Невозможно загрузить превью для этого шаблона!',
            }
        },
        pa: {
            Equipment: 'Оборудование',
            Material: 'Материалы',
            Personnel: 'Персонал',
            PhysicalAsset: 'Физические активы',
            PhysTabs: {
                Property: 'Свойства',
                Structure: 'Структура'
            },
            Label: 'Бирки',
            SAPCommunication: "Связь с SAP",
            Version: 'Версия',
            Diagnostics: 'Диагностика',
            LabelButtons: {
                print: 'Печать',
                cancelPrint: 'Отмена печати',
                refresh: 'Обновить'
            },
            OrderLabel: 'Заказы',
            TemplateLabel: 'Шаблоны Бирок',
            Logotypes: 'Логотипы',
            grid: {
                material: {
                    description: 'Название'
                },
                labels: {
                    number: 'Номер',
                    quantity: 'Количество',
                    status: 'Статус',
                    isPrinted: 'Напечатано'
                }
            },
            sap: {
                address: 'Адрес SAP',
                login: 'Логин',
                password: 'Пароль',
                communicationSuccess: 'Параметры успешно сохранены'
            },
            diagnostics: {
                changeSide: 'Выберите сторону',
                equipmentName: 'Название оборудования',
                equipmentStatus: 'Статус оборудования',
                printSystemEnabled: 'Система печати бирок включена',                
                printSystemOn: 'Система печати бирок включена',
                printSystemOff: 'Система печати бирок выключена',
                printSystemTurnOn: 'Вы уверены, что хотите включить систему печати бирок?',
                printSystemTurnOff: 'Вы уверены, что хотите выключить систему печати бирок? '
            }
        },
        marker: {
            changeSide: 'Выберите сторону стана для работы:',
            failure: 'авария',
            kg: 'кг',
            pcs: 'шт',
            task: 'Задание',
            profile: 'Профиль',
            size: 'Размер(м.)',
            rodsQuantityPcs: 'Количество прутков(шт.)',
            sandwich: 'Бутерброд',
            byAccept: 'По подтверждению',
            autoModeShort: 'Авт',
            byAcceptShort: 'По подт',
            nemera: 'Немера',
            minMassRec: 'Рек. масса минимум (кг)',
            maxMass: 'Масса максимум(кг.)',
            minMass: 'Масса минимум(кг.)',
            sampleMass: 'Масса образца(кг.)',
            rodsWeight: 'Вес прутка(кг.)',
            sampleLength: 'Длина образца(м.)',
            deviation: 'Отклонение (%)',
            autoMode: 'Автоматический режим',
            weight: 'Вес',
            rodsQuantity: 'Количество прутков',
            rodsLeft: 'Осталось прутков',
            scalesBlocked: 'Весы заблокированы',
            weightOver: 'Масса превышает максимально допустимую',
            firstPack: 'Первая пачка',
            secondPack: 'Вторая пачка',
            bindingDia: 'Диаметр увязки',
            bindingQty: 'Количество увязок',
            monitor: 'Монитор',
            order: 'Заказ',
            brigadeNo: '№ бригады',
            date: 'Дата',
            charts: 'Графики',
            period: 'Период',
            chartStartDate: 'Дата с',
            chartEndDate: 'Дата до',
            getChartDataBtn: 'Получить',
            chartNoData: 'Нет данных за этот период! Выберите другой период',
			markerErrorCaption: 'Ошибки',

            CreateDialogue: {
                CHANGE_NO: 'Смена',
                FactoryNumber: 'Номер бирки',
                mass: 'Масса'
            },
            acceptOrderTask: 'Подтвердить задание',
            takeWeightButton: 'Взять вес',
            takeTaraButton: 'Взять тару',
            testPrintButton: 'Тест печать',
            buttonExit: 'Выход',
            remarkingButton: 'Перемаркировка',
            sortingButton: 'Сортировка',
            rejectButton: 'Отбраковка',
            separateButton: 'Разделение пачки',
            handModeButton: 'Ручной ввод',
            changeOrderButton: 'Изменить заказ',
			reversalButton: 'Сторнирование',
            statisticsButton: 'Статистика',
            errorMessages: {

                noOrders: 'Нет заказа с таким номером!',
                noLabel: 'Нет бирки с таким номером!',
                fillRequired: 'Вы должны заполнить все обязательные поля!',
                acceptOrder: 'Вы должны подтвердить ваш номер заказа!',
                minMaxWeight: 'Максимальный вес не может быть меньше минимального!',
                wrongDeviation: 'Отклонение неверно! Пожалуйста, пересчитайте!',
                enterProdOrder: 'Вы должны ввести новый номер производственного заказа!',
                selectLabel: 'Вы должны выбрать бирку!',
                handModeQuantity: 'Вы должны ввести вес!',
				notNullable: 'Значение поля "{0}" не должно равняться 0!',
                fieldIsRequired: 'Поле "{0}" обязательно для заполнения!',
                fieldName: {

                    minMass: 'Масса минимум',
                    maxMass: 'Масса максимум',
                    profile: 'Профиль',
                    rodsQuantity: 'Количество прутков'
                }
            },
            modalCaptions: {

                reMarkingMode: 'Режим перемаркировки',
                reSortingMode: 'Режим сортировки',
                RejectMode: 'Режим отбраковки',
                SeparateMode: 'Режим разделения пачки',
                enterLabelNumber: 'Введите номер бирки',
                changePackNumber: 'Выберите число пачек',
                order: 'Заказ',
                HandMode: 'Ручной ввод',
                enterQuantity: 'Введите вес',
                getHandModeCredentials: 'Run',
                OrderChangeMode: 'Изменить заказ',
				Reversal: 'Сторнирование',
                enterNewOrder: 'Введите новый номер заказа'
            },
            grid: {

                PROD_ORDER: '№ заказа',
                PART_NO: '№ партии',
                FactoryNumber: '№ бирки',
                BUNT_NO: '№ бунта',
                CreateTime: 'Дата',
                Quantity: 'Вес',
                selected: 'Отметьте записи, которые нужно изменить',
				reversed: 'Отметьте записи, которые нужно сторнировать'
            },
            monitorCaptions: {

                scales: 'Весы',
                weightRods: 'Вес/Прутки',
                packWeight: 'Вес пачки',
                rodsQuantity: 'Количество прутков',
                rodsLeft: 'Осталось прутков'
            },
            statistics: {

                getBtn: 'Получить',
                SelectGrouppingMode: 'Выберите режим группировки',
                labelsCount: 'Бирок всего',
                weightOverall: 'Масса всего',
                byChanges: 'По сменам',
                byBrigades: 'По бригадам',
                byMelt: 'По плавкам',
                byOrder: 'По заказам',
                byParty: 'По партиям',
                handMode: 'Ручной режим',
                allLabels: 'Все бирки',
                labelQuantity: 'Количество бирок',
                totalWeigth: 'Общий вес',
                weight: 'Вес',
                change: 'Смена',
                brigade: 'Бригада',
                melt: 'Плавка',
                order: 'Заказ',
                party: 'Партия',
                labelNumder: 'Номер бирки',
                dateTimeMeasure: 'Дата и время взвешивания',
                prodOrder: 'Производственный заказ',
                materialNo: 'Номер материала',
                mass: 'Масса',
                statusName: 'Статус'
            }
        },
        weightanalytics: {
            Kopr4: 'Копровой 4',
            Link2: 'Ссылка2',
            Buttons: {
                printWS: 'Печать отвесной',
                closeWS: 'Закрыть отвесную',
                takeWeight: 'Взять вес'

            },
            Labels: {
                noOpenedWS: 'Нет открытых отвесных',
                openedWS: 'Отвесная №',
                archiveWS: 'Архивные отвесные',
                platform: 'Платформа',
                Platform_I: 'Платформа I',
                Platform_I_II: 'Платформа I+II',
                offset: 'Смещение',
                enterParameter: 'Введите данные',
                sender: 'Отправитель',
                receiver: 'Получатель',
                scrapType: 'Вид лома',
                waybill: '№ путевой',
                wagon: 'Лафет-короб',
                wagonSelect: 'Введите пару...'
            },
            Table: {
                weightsheet: 'Отвесная',
                wagon: 'Лафет-короб',
                waybill: 'Путевая',
                CSH: 'Код',
                brutto: 'Брутто',
                tare: 'Тара',
                netto: 'Нетто',
                weightingTime: 'Время взвешивания'
            },
            Modal: {
                enterWSNo: 'Введите номер отвесной'
            },
            ton: 'т',
            Taring: 'Тарирование',
            Weighting: 'Взвешивание'
        },
        error: {
            Unauthorized: 'Эта роль Вам недоступна'
        },
        errorLog: {
            errorCode: 'Текст ошибки',
            description: 'Введите доп. информацию',
            sending: 'Отправка...'
        },
        buttonCreate: 'Создать',
        buttonEdit: 'Редактировать',
        buttonDelete: 'Удалить',
        buttonCopy: 'Копировать',
        buttonSubmit: 'Отправить',
        buttonSend: 'Отправить',
        buttonUpload: 'Выбрать файл',
        buttonCancel: 'Отмена',
        loadingMsg: 'Загрузка...',
        processing: 'Выполнение...',
        calculatingMsg: 'Подсчет...',
        errorConnection: 'Нет интернет-соединения!',
        grid: {
            common: {

                name: 'Имя',
                property: 'Свойство',
                value: 'Значение',
                description: 'Описание'
            }



        },
        tree: {
            nodeName: 'Имя узла',
            parentID: 'ID родителя',
            equipmentClass: 'Класc оборудования',
            search: 'Поиск...'
        }

    },

    ua: {
        index: {
            User: 'Користувач',
            Market: 'Маркетолог',
            WorkshopSpecs: 'Спеціаліст Цеху',
            Marker: 'Маркувальник',
            PA: 'Спеціаліст АСУТП',
            WeightAnalytics: 'Аналітик',
            AutomationLab: 'Лабораторія автоматизації'
        },
        welcome: {
            Welcome: 'Привiт',
            UseRoles: 'Виберіть одну з доступних ролей',
            NoRoles: 'Не має доступных ролей'
        },
        automationlab: {
            Income: 'Прийом/Видача',
            Material: 'Пристрої',
            Repair: 'Ремонт і техобслуговування',
            material: {
                buttonAdd: 'Добавить',
                addnewmaterial: 'Внесення нового пристрою'
            },
            income: {
                incomeoutcome: 'Прийом/Видача пристроїв',
                factorynumber: 'Введіть заводський номер приладу:',
                search: 'Пошук',
                income: 'Прийняти',
                outcome: 'Видати',
                defect: 'Брак'
            },
        },

        gasCollection: {
            reports: 'Звiти', //Отчёты
            gasReports: 'Звiти по газу', //Отчёты по газу
            trends: 'Графiки', //Тренды
            gasTrends: 'Графiки по газу', //Тренды по газу
        },

        market: {
            OrderLabel: 'Замовлення',
            TemplateLabel: 'Шаблони Бирок',
            buttonAddTempate: 'Додати Файл',
            buttonDownloadTechSheet: 'Скачати Тех. Лист',
            Order: {

                caption: {

                    create: 'Створити замовлення',
                    edit: 'Редагувати замовлення',
                    copy: 'Копіювати замовлення'
                },

                CreateDialogue: {

                    STANDARD: 'Стандарт',
                    LENGTH: 'Довжина',
                    MIN_ROD: 'Кількість прутків',
                    CONTRACT_NO: 'Контракт №',
                    DIRECTION: 'Напрамок',
                    PRODUCT: 'Продукція',
                    CLASS: 'Клас',
                    STEEL_CLASS: 'Марка сталі',
                    CHEM_ANALYSIS: 'Хім. Аналіз',
                    BUNT_DIA: 'Діаметр бунта',
                    BUNT_NO: '№ бунта',
                    ADDRESS: 'Адреса постачальника',
                    COMM_ORDER: 'Комерційне замовлення',
                    TEMPLATE: 'Шаблон бірки',
                    PROD_ORDER: 'Виробниче замовлення',
                    SIZE: 'Розмір',
                    TOLERANCE: 'Допуск',
                    MELT_NO: 'Плавка',
                    PART_NO: 'Партія',
                    BUYER_ORDER_NO: '№ замовлення у покупця',
                    UTVK: 'УТВК',
                    CHANGE_NO: 'Зміна',
                    MATERIAL_NO: '№ материала',
                    BRIGADE_NO: 'Бригада',
                    PROD_DATE: 'Виробнича дата',
					LABEL_PRINT_QTY: 'К-сть друкуємих бирок',
                    additionalButtonCaptions: {

                        testPrint: 'Тестовий друк',
                        preview: 'Прев\'ю'
                    }
                }
            },
            grid: {
                orders: {
                    order: 'Замовлення',
                    contract: 'Контракт №',
                    direction: 'Напрям',
                    labelTemplate: 'Шаблон бірки',
                    parameter: 'Параметр'
                },
                labelTemplate: {
                    fileName: 'Ім\'я файла',
                    status: 'Статус',
                    fileType: 'Тип файла',
                    templateName: 'Назва',
                    file: 'Файл',
                    preview: 'Прев\'ю',
                    changeFile: 'Оновити файл',
                    changeDescription: 'Оновити опис',
                    upload: 'Завантажити',
                    update: 'Оновити'
                }
            },
            modal: {
                notAcceptable: 'Неможливо завантажити прев\'ю для цього шаблона!',
            }
        },
        pa: {
            Equipment: 'Обладнання',
            Material: 'Матеріали',
            Personnel: 'Персонал',
            PhysicalAsset: 'Фізичні активи',
            PhysTabs: {
                Property: 'Властивості',
                Structure: 'Структура'
            },
            Label: 'Бирки',
            SAPCommunication: "Зв\'язок з SAP",
            Version: 'Версія',
            Diagnostics: 'Діагностика',
            LabelButtons: {
                print: 'Друк',
                cancelPrint: 'Відміна друку',
                refresh: 'Оновити'
            },
            OrderLabel: 'Замовлення',
            TemplateLabel: 'Шаблони Бирок',
            Logotypes: 'Логотипи',
            grid: {
                material: {
                    description: 'Назва'
                },
                labels: {
                    number: 'Номер',
                    quantity: 'Кількість',
                    status: 'Статус',
                    isPrinted: 'Надруковано'
                }
            },
            sap: {
                address: 'Адреса SAP',
                login: 'Логін',
                password: 'Пароль',
                communicationSuccess: 'Параметри успішно збережені'
            },
            diagnostics: {
                changeSide: 'Виберіть сторону',
                equipmentName: 'Назва обладнання',
                equipmentStatus: 'Статус обладнання',
                printSystemEnabled: 'Система друку бирок увімкнена',
                printSystemOn: 'Система друку бирок включена',
                printSystemOff: 'Система друку бирок вимкнена',
                printSystemTurnOn: 'Ви впевнені що хочете ввімкнути систему друку бирок?',
                printSystemTurnOff: 'Ви впевнені що хочете вимкнути систему друку бирок? '
            }
        },
        marker: {
            changeSide: 'Виберіть сторону стана для роботи:',
            failure: 'аварія',
            kg: 'кг',
            pcs: 'шт',
            task: 'Завдання',
            profile: 'Профіль',
            size: 'Розмір(м.)',
            rodsQuantityPcs: 'Кількість прутків(шт.)',
            sandwich: 'Бутерброд',
            byAccept: 'за підтвердженням',
            autoModeShort: 'Авт',
            byAcceptShort: 'По підт',
            nemera: 'Немера',
            minMassRec: 'Рек. маса мінімум (кг)',
            maxMass: 'Маса максимум(кг.)',
            minMass: 'Маса мінімум(кг.)',
            sampleMass: 'Вага зразка(кг.)',
            rodsWeight: 'Вага прутка(кг.)',
            sampleLength: 'Довжина зразка(м.)',
            deviation: 'Відхилення (%)',
            autoMode: 'Автоматичний режим',
            weight: 'Вага',
            rodsQuantity: 'Кількість прутків',
            rodsLeft: 'Залишилось прутків',
            scalesBlocked: 'Ваги заблоковані',
            weightOver: 'Маса перевищує максимально допустиму',
            firstPack: 'Перша пачка',
            secondPack: 'Друга пачка',
            bindingDia: 'Діаметр ув\'язки',
            bindingQty: 'Кількість ув\'язок',
            monitor: 'Монітор',
            order: 'Замовлення',
            brigadeNo: '№ бригади',
            date: 'Дата',
            charts: 'Графіки',
            period: 'Період',
            chartStartDate: 'Дата з',
            chartEndDate: 'Дата до',
            getChartDataBtn: 'Отримати',
            chartNoData: 'Немає даних за цей період! Виберіть інший період',
			markerErrorCaption: 'Помилки',

            CreateDialogue: {
                FactoryNumber: 'Номер бірки',
                CHANGE_NO: 'Зміна',
                mass: 'Маса'
            },
            acceptOrderTask: 'Підтвердити завдання',
            takeWeightButton: 'Взяти вагу',
            takeTaraButton: 'Взяти тару',
            testPrintButton: 'Тест друк',
            buttonExit: 'Вихід',
            remarkingButton: 'Перемаркування',
            sortingButton: 'Сортування',
            rejectButton: 'Відбракування',
            separateButton: 'Розділення пачки',
            handModeButton: 'Ручне введення',
            changeOrderButton: 'Змінити замовл.',
			reversalButton: 'Сторнування',
            statisticsButton: 'Статистика',
            errorMessages: {

                noOrders: 'Немає замовлення з таким номером!',
                noLabel: 'Немає бирки з таким номером!',
                fillRequired: 'Ви маєте заповнити всі обов\'язкові поля!',
                acceptOrder: 'Ви маєте підтвердити ваш номер замовлення!',
                minMaxWeight: 'Максимальна вага не може бути менше мінімальної!',
                wrongDeviation: 'Відхилення невірне! Будь ласка, перерахуйте!',
                enterProdOrder: 'Ви повинні ввести новий номер виробничого замовлення!',
                selectLabel: 'Ви повинні вибрати бірку!',
                handModeQuantity: 'Ви повинні ввести вагу!',
				notNullable: 'Значення поля "{0}" не повинно дорівнювати 0!',
                fieldIsRequired: 'Поле "{0}" обов\'язкове для заповнення!',
                fieldName: {

                    minMass: 'Маса мінімум',
                    maxMass: 'Маса максимум',
                    profile: 'Профіль',
                    rodsQuantity: 'Кількість прутків'
                }
            },
            modalCaptions: {

                reMarkingMode: 'Режим перемаркування',
                reSortingMode: 'Режим сортування',
                RejectMode: 'Режим відбракування',
                SeparateMode: 'Режим разділення пачки',
                enterLabelNumber: 'Введіть номер бирки',
                changePackNumber: 'Виберіть число пачок',
                order: 'Замовлення',
                HandMode: 'Ручне введення',
                enterQuantity: 'Введіть вагу',
                getHandModeCredentials: 'Run',
                OrderChangeMode: 'Змінити замовлення',
				Reversal: 'Сторнування',
                enterNewOrder: 'Введіть новий номер замовлення'
            },
            grid: {

                PROD_ORDER: '№ замовлення',
                PART_NO: '№ партії',
                FactoryNumber: '№ бірки',
                BUNT_NO: '№ бунта',
                CreateTime: 'Дата',
                Quantity: 'Вага',
                selected: 'Відмітьте записи, котрі необхідно змінити',
				reversed: 'Відмітьте записи, котрі необхідно сторнувати'
            },
            monitorCaptions: {

                scales: 'Ваги',
                weightRods: 'Вага/Прутки',
                packWeight: 'Вага пачки',
                rodsQuantity: 'Кількість прутків',
                rodsLeft: 'Залишилось прутків'
            },
            statistics: {

                getBtn: 'Отримати',
                SelectGrouppingMode: 'Виберіть режим групування',
                labelsCount: 'Бирок всього',
                weightOverall: 'Маса всього',
                byChanges: 'За змінами',
                byBrigades: 'За бригадами',
                byMelt: 'За плавками',
                byOrder: 'За замовленнями',
                byParty: 'За партіями',
                handMode: 'Ручний режим',
                allLabels: 'Всі бирки',
                labelQuantity: 'Кількість бирок',
                totalWeigth: 'Загальна вага',
                weight: 'Вага',
                change: 'Зміна',
                brigade: 'Бригада',
                melt: 'Плавка',
                order: 'Замовлення',
                party: 'Партія',
                labelNumder: 'Номер бирки',
                dateTimeMeasure: 'Дата та час зважування',
                prodOrder: 'Виробниче замовлення',
                materialNo: 'Номер матеріала',
                mass: 'Маса',
                statusName: 'Статус'
            }
        },
        weightanalytics: {
            Kopr4: 'Копровий 4',
            Link2: 'Посилання2',
            Buttons: {
                printWS: 'Друк вагової',
                closeWS: 'Закрити вагову',
                takeWeight: 'Взяти вагу'
            },
            Labels: {
                noOpenedWS: 'Немає відкритих вагових',
                openedWS: 'Вагова №',
                archiveWS: 'Архівні вагові',
                platform: 'Платформа',
                Platform_I: 'Платформа I',
                Platform_I_II: 'Платформа I+II',
                offset: 'Зміщення',
                enterParameter: 'Введіть дані',
                sender: 'Відправник',
                receiver: 'Отримувач',
                scrapType: 'Вид лома',
                waybill: '№ путівої',
                wagon: 'Лафет-короб',
                wagonSelect: 'Введіть пару...'
            }, Table: {
                weightsheet: 'Вагова',
                wagon: 'Лафет-короб',
                waybill: 'Путіва',
                CSH: 'Код',
                brutto: 'Бруто',
                tare: 'Тара',
                netto: 'Нето',
                weightingTime: 'Час зважування'
            },
            Modal: {
                enterWSNo: 'Введіть номер вагової'
            },
            ton: 'т',
            Taring: 'Тарування',
            Weighting: 'Зважування'
        },
        error: {
            Unauthorized: 'У доступі відмовлено'
        },
        errorLog: {
            errorCode: 'Текст помилки',
            description: 'Введіть дод. інформацію',
            sending: 'Відправка...'
        },
        buttonCreate: 'Створити',
        buttonEdit: 'Редагувати',
        buttonDelete: 'Видалити',
        buttonCopy: 'Копіювати',
        buttonSubmit: 'Відправити',
        buttonSend: 'Надіслати',
        buttonUpload: 'Вибрати файл',
        buttonCancel: 'Відміна',
        loadingMsg: 'Завантаження...',
        processing: 'Виконання...',
        calculatingMsg: 'Підрахунок...',
        errorConnection: "Немає інтернет-з'єднання!",
        grid: {
            common: {

                name: 'Ім\'я',
                property: 'Властивість',
                value: 'Значення',
                description: 'Опис'
            }

        },
        tree: {
            nodeName: 'Ім\'я вузла',
            parentID: 'Батьківський ID',
            equipmentClass: 'Клас обладнання',
            search: 'Пошук...'
        }

    }
}
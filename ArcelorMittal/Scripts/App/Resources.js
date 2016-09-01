var translations = {

    en: {
        index: {            
            User: 'User',
            Market: 'Market',
            WorkshopSpecs: 'WorkshopSpecs',
            Marker: 'Marker',
            PA: 'PA'
        },
        welcome: {
            Welcome: 'Welcome',
            UseRoles: 'Use one of the available roles',
            NoRoles: 'There are no available roles'
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
                    additionalButtonCaptions: {

                        testPrint: 'Test print'
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
            }

        },
        pa: {
            Equipment: 'Equipment',
            Material: 'Material',
            Personnel: 'Personnel',
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
                equipmentStatus: 'Equipment status'
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
            weightOver: 'Specified rods quantity weight is over then maximum permissible weight',           
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


            CreateDialogue: {
                CHANGE_NO: 'Change',
                FactoryNumber: 'Factory number',
                mass: 'Mass'
            },
            acceptOrderTask: 'Accept order/task',
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
                handModeQuantity: 'You must enter weight!'
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
                enterNewOrder: 'Enter new order no'
            },
            grid: {

                PROD_ORDER: 'Order No',
                PART_NO: 'Part No',
                FactoryNumber: 'label No',
                BUNT_NO: 'Bunt No',
                CreateTime: 'Date',
                Quantity: 'Quantity',
                selected: 'Select records needed to change'
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
                labelsOverall: 'Labels overall',
                weightOverall: 'Weight overall',
                byChanges: 'By changes',
                byBrigades: 'By brigades',
                byMelts: 'By melts',
                byOrders: 'by orders',
                byParties: 'By parties',
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
                mass: 'Mass'
            }
            
        },
        error: {
            Unauthorized: 'This role is unavailable for you!'
        },
        errorLog:{
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
        calculatingMsg: 'Calculating...',
        grid: {
            common: {

                name: 'Name',
                property: 'Property',
                value: 'Value',
                description: 'Description'
            }                                
        },
        tree:{
            nodeName: 'Node name',
            parentID: 'Parent ID',
            equipmentClass: 'Equipment class'
        }
    },

    ru: {
        index: {            
            User: 'Пользователь',
            Market: 'Маркетолог',
            WorkshopSpecs: 'Специалист Цеха',
            Marker: 'Маркировщик',
            PA: 'Специалист АСУТП'
        },
        welcome: {
            Welcome: 'Привет',
            UseRoles: 'Виберите одну из доступних ролей',
            NoRoles: 'Нет доступных ролей'
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
                    additionalButtonCaptions: {

                        testPrint: 'Тестовая печать'
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
            }
        },
        pa: {
            Equipment: 'Оборудование',
            Material: 'Материалы',
            Personnel: 'Персонал',
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
                equipmentStatus: 'Статус оборудования'
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
            weightOver: 'Масса заданного количества прутков превышает максимально допустимую',
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

            CreateDialogue: {
                CHANGE_NO: 'Смена',
                FactoryNumber: 'Номер бирки',
                mass: 'Масса'
            },
            acceptOrderTask: 'Подтвердить заказ/задание',
            takeWeightButton: 'Взять вес',
            takeTaraButton: 'Взять тару',
            testPrintButton: 'Тестовая печать',
            buttonExit: 'Выход',
            remarkingButton: 'Перемаркировка',
            sortingButton: 'Сортировка',
            rejectButton: 'Отбраковка',
            separateButton: 'Разделение пачки',
            handModeButton: 'Ручной ввод',
            changeOrderButton: 'Изменить заказ',
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
                handModeQuantity: 'Вы должны ввести вес!'
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
                enterNewOrder: 'Введите новый номер заказа'
            },
            grid: {

                PROD_ORDER: '№ заказа',
                PART_NO: '№ партии',
                FactoryNumber: '№ бирки',
                BUNT_NO: '№ бунта',
                CreateTime: 'Дата',
                Quantity: 'Вес',
                selected: 'Отметьте записи, которые нужно изменить'
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
                labelsOverall: 'Бирок всего',
                weightOverall: 'Масса всего',
                byChanges: 'По сменам',
                byBrigades: 'По бригадам',
                byMelts: 'По плавкам',
                byOrders: 'По заказам',
                byParties: 'По партиям',
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
                mass: 'Масса'
            }
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
        calculatingMsg: 'Подсчет...',
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
            equipmentClass: 'Класc оборудования'
        }

    },

    ua: {
        index: {            
            User: 'Користувач',
            Market: 'Маркетолог',
            WorkshopSpecs: 'Спеціаліст Цеху',
            Marker: 'Маркувальник',
            PA: 'Спеціаліст АСУТП'
        },
        welcome: {
            Welcome: 'Привiт',
            UseRoles: 'Виберіть одну з доступних ролей',
            NoRoles: 'Не має доступных ролей'
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
                    additionalButtonCaptions: {

                        testPrint: 'Тестовий друк'
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
            }
        },
        pa: {
            Equipment: 'Обладнання',
            Material: 'Матеріали',
            Personnel: 'Персонал',
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
                equipmentStatus: 'Статус обладнання'
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
            weightOver: 'Маса заданої кількості прутків перевищує максимально допустиму',
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

            CreateDialogue: {
                FactoryNumber: 'Номер бірки',
                CHANGE_NO: 'Зміна',
                mass: 'Маса'
            },
            acceptOrderTask: 'підтвердити замовлення/завдання',
            takeWeightButton: 'Взяти вагу',
            takeTaraButton: 'Взяти тару',
            testPrintButton: 'Тестовий друк',
            buttonExit: 'Вихід',
            remarkingButton: 'Перемаркування',
            sortingButton: 'Сортування',
            rejectButton: 'Відбракування',
            separateButton: 'Розділення пачки',
            handModeButton: 'Ручне введення',
            changeOrderButton: 'Змінити замовлення',
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
                handModeQuantity: 'Ви повинні ввести вагу!'
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
                enterNewOrder: 'Введіть новий номер замовлення'
            },
            grid: {

                PROD_ORDER: '№ замовлення',
                PART_NO: '№ партії',
                FactoryNumber: '№ бірки',
                BUNT_NO: '№ бунта',
                CreateTime: 'Дата',
                Quantity: 'Вага',
                selected: 'Відмітьте записи, котрі необхідно змінити'
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
                labelsOverall: 'Бирок всього',
                weightOverall: 'Маса всього',
                byChanges: 'За змінами',
                byBrigades: 'За бригадами',
                byMelts: 'За плавками',
                byOrders: 'За замовленнями',
                byParties: 'За партіями',
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
                mass: 'Маса'
            }
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
        calculatingMsg: 'Підрахунок...',
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
            equipmentClass: 'Клас обладнання'
        }

    }
}
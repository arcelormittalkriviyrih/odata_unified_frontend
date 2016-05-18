var activePage = 'Market';

$(function () {

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
            title: 'File Name',
            order: 2
        }, {
            id: 'Status',
            name: 'Status',
            title: 'Status',
            order: 3
        }, {
            id: 'FileType',
            name: 'FileType',
            title: 'File Type',
            order: 4
        }, {
            id: 'Data',
            name: 'Data',
            title: 'Data',
            order: 5
        }],

        controlProperties: {
            type: 'control',
            editButton: false,
            clearFilterButton: false,
            modeSwitchButton: false
        }
    })
    .jsGrid('loadOdata', {});

    // a
    $('#addFile').click(vmAddRecord);

    // as default set form
    // to INSERT mode
    vmAddRecord();

    function vmPopulateForm(item) {

        // get form element
        var $form = $('#fileForm');

        // create service URL
        // to create / update file by ID
        // and assign it as form action
        var action = serviceUrl + '/Files(' + item.ID + ')/$value';
        $form.attr('action', action);

        $form.find('[name="FileName"]').val(item.FileName);
        $form.find('[name="Status"]').val(item.Status);
        $form.find('[name="FileType"]').val(item.FileType);
    };

    function vmAddRecord() {

        // prepare form for INSERT
        // set ID to -1
        // set File type to default value
        vmPopulateForm({
            ID: -1,
            FileName: '',
            FileType: 'Excel label'
        });

        return false;
    }    
});
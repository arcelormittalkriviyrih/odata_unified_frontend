$(document).ready(function () {

    $.ajax({

        url: _url,
        method: 'get'
    }).then(function (response) {

        var data = response.value;

        data = data.map(function (item) {

            var dateStartOptions = getTimeToUpdate(item.StartTime, true);
            var dateEndOptions = getTimeToUpdate(item.EndTime, true);

            return {
                ID: item.ID,
                text: item.Description,
                start_date: '{0}-{1}-{2} {3}-{4}'.format(dateStartOptions.year, dateStartOptions.month, dateStartOptions.day, dateStartOptions.hour, dateStartOptions.minute),
                end_date: '{0}-{1}-{2} {3}-{4}'.format(dateEndOptions.year, dateEndOptions.month, dateEndOptions.day, dateEndOptions.hour, dateEndOptions.minute),
                WorkType: item.WorkType
            }
        });

        vmInit(data);
    })
});

//flag shows initialization processed
var _init;
var _url = serviceUrl + 'WorkSchedule';

function vmInit(json) {
    
    //initialization started
    _init = true;

    scheduler.init('scheduler_container', new Date(), "month");

    json.forEach(function (item) {

        scheduler.addEvent(item);
    });

    //initialization ended
    _init = false;

};

scheduler.config.api_date = "%Y-%m-%d %H:%i";
scheduler.config.lightbox.sections = [
    {name: 'ID', map_to: 'ID', type: 'id'},
    { name: "Описание", height: 55, map_to: "text", type: "textarea" },
    { name: "Тип работы", height: 100, map_to: "WorkType", type: "typeWork" },
    { name: "Время", height: 72, type: "time", map_to: "auto" }
];

scheduler.form_blocks["typeWork"] = {
    render: function (sns) {

        return '<div class="dhx_cal_ltext"><select id="WorkType"></select></div>';
    },
    set_value: function (node, value, ev) {

        var select = $('select#WorkType').empty();
        var data = [{

            id: '1',
            description: 'работа1'
        }, {

            id: '2',
            description: 'работа2'
        }, {

            id: '3',
            description: 'работа3'
        }]

        data.forEach(function (item) {

            var option = $('<option />').attr('value', item.id)
                                        .text(item.description)
                                        .appendTo(select);
        });

        select.val(ev.WorkType);
    },
    get_value: function (node, ev) {
        return $(node).children('select').val();
    },
};

scheduler.form_blocks["id"] = {
    render: function (sns) {

        return '<div class="dhx_cal_ltext"><input type="text" id="valID"></div>';
    },
    set_value: function (node, value, ev) {

        var input = $('input#valID').empty().attr('readonly', true);

        input.val(ev.ID);
    },
    get_value: function (node, ev) {
        return $(node).children('input').val();
    },
};

scheduler.attachEvent("onEventAdded", function (id, ev) {

    //this event fires on initializatian also.
    //but we don't need call method 'save' at this moment
    //so we call this method only when calendar and events totally initialized
    if (!_init)
        vmSaveEvent(ev);

});

scheduler.attachEvent("onEventChanged", function (id, ev) {

    vmSaveEvent(ev);
});

scheduler.attachEvent("onEventDeleted", function (id, ev) {
   
    vmDeleteEvent(ev);
});

function vmSaveEvent(ev) {

    var StartTimeOptions = getTimeToUpdate(ev.start_date);
    var EndTimeOptions = getTimeToUpdate(ev.end_date);

    var url = _url;

    //if there is new event
    //it has not 'ID' property
    //in this case we form 'post' query and add to database new event
    //else this is old event and 'save' method must to update event
    if (ev.ID)
        url += '(' + ev.ID + ')';

    var data = {

        Description: ev.text,
        WorkType: ev.WorkType,
        StartTime: '{0}-{1}-{2}T{3}:{4}:{5}.000Z'.format(StartTimeOptions.year, StartTimeOptions.month, StartTimeOptions.day, StartTimeOptions.hour, StartTimeOptions.minute, StartTimeOptions.second),
        EndTime: '{0}-{1}-{2}T{3}:{4}:{5}.000Z'.format(EndTimeOptions.year, EndTimeOptions.month, EndTimeOptions.day, EndTimeOptions.hour, EndTimeOptions.minute, EndTimeOptions.second),
    };

    $.ajax({
        url: url,
        type: ev.ID ? "PUT" : "POST",
        data: JSON.stringify(data),
        contentType: "application/json;odata=verbose",

    }).then(function (response) {

        //if new event is created
        //to prevent duplicating of events with the same reason
        //we set ID of just created record in database table as event ID
        //then, if user wants (for example) to change a time of event by dragging
        //there will not be initiated 'post' query. Hovewer record will be updated
        if (response)
            ev.ID = response.ID;
    });
};

function vmDeleteEvent(ev) {

    if (ev.ID) {
        $.ajax({
            type: "DELETE",
            url: _url + '(' + ev.ID + ')'
        });
    };
}


;(function ( $ ) {
    $.fn.printPreview = function( options ) {
        var elem = this;
        
        var opt = $.extend({
            obj2print:'body',
            style:'',
            width:'670',
            height: screen.height-105,
            top:0,
            left:'center',
            resizable : 'no',
            scrollbars:'yes',
            status:'no',
            title:'Report Preview'
        }, options );
        if(opt.left == 'center'){
            opt.left=(screen.width/2)-(opt.width/2);
        }
        $(opt.obj2print+" input").each(function(){
            $(this).attr('value',$(this).val());
        });
        $(opt.obj2print+" textarea").each(function(){
            $(this).html($(this).val());
        });
        return elem.bind("click.printPreview", function () {
            var btnCode = elem[0].outerHTML;
            var headString = '';
            headString = $("head").html();
            var str = "<!DOCTYPE html><html><head>" + headString + opt.style + "<style>body {min-width:100%; padding:20px !important} .table-print {display:block; width:100%;}</style>" + "</head><body>";
            str += $(opt.obj2print)[0].outerHTML.replace(btnCode, '') + "<button id=\"Print2Page\" onclick=\"var obj = document.getElementById('Print2Page');obj.style.display = 'none';  window.print(); window.close();\">Print</button>" + "</body></html>";
            //top open multiple instances we have to name newWindow differently, so getting milliseconds
            var d = new Date();

            

            var n = 'newWindow' + d.getMilliseconds();

            var newWindow = window.open(
                    "", 
                    n, 
                    "width="+opt.width+
                    ",top="+opt.top+
                    ",height="+opt.height+
                    ",left="+opt.left+
                    ",resizable="+opt.resizable+
                    ",scrollbars="+opt.scrollbars+
                    ",status="+opt.status
                    );
            newWindow.document.write(str);
            newWindow.document.title = opt.title;
            newWindow.document.close();
        });
    };
}( jQuery ));

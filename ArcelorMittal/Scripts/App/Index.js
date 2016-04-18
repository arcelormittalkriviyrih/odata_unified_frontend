$(function () {

    // read user roles
    vmReadTable('v_Roles')
        .then(function (roles) {            

            // a. sort roles
            // b. populate navigation menu
            roles.value
                .map(function (role) {

                    return role.RoleName;

                })
                .sort(function (a, b) {

                    return a.localeCompare(b);

                })
                .forEach(function (role) {

                    // find navigation bar
                    var $navigation = $('#navigation');

                    // add menu item
                    // set active item
                    var $li = $('<li />').toggleClass('active', role == window.activePage)
                                    .appendTo($navigation);

                    // add link to role page
                    $('<a />').attr('href', role.toLowerCase())
                        .text(role)
                        .appendTo($li);
                        
                });            
        })
        .fail(function () {

            alert('Failed to load user roles');
        });
});
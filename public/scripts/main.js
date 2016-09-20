'use strict';

var airApp = {};
var url = 'http://:3004';

airApp.getAir = function () {
    $.ajax({
        API_URL: url,
        method: 'GET',
        dataType: 'json',
        data: {
            REQUESTS_LIMIT: 10000
        }
    }).then(function (results) {
        console.log(results);
    });
};
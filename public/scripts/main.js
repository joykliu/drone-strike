'use strict';

var url = 'http://api.dronestre.am/data';
var droneApp = {};

droneApp.getDrones = $.ajax({
    url: url,
    method: 'GET',
    dataType: 'jsonp'
});

$.when(droneApp.getDrones).then(function (data) {
    data.strike.forEach(function (result) {
        // group data by country + year

        // keep detailed geolocation information

        // use funciton in console.log() to get the years of each drone strike
        console.log(result.country);

        //filter data by years

        // filter data by casulties (death_min)

        // display information
    });
});
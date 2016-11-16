'use strict';

var url = 'http://api.dronestre.am/data';
var droneApp = {};

droneApp.getDrones = $.ajax({
    url: url,
    method: 'GET',
    dataType: 'jsonp'
});

$.when(droneApp.getDrones).then(function (data) {
    data.strike.map(function (result) {
        // group data by country + year
        result.date = result.date.split('-')[0];
        // keep detailed geolocation information

        // use funciton in console.log() to get the years of each drone strike
        // console.log(result.country)

        //filter data by years

        // filter data by casulties (death_min)

        // display information
    });
    $('input[type=checkbox]').on('change', function () {
        var getCheckedInputValue = function getCheckedInputValue(param) {
            return $('input[name=' + param + ']:checked').map(function (input, value) {
                return $(value).val();
            }).toArray();
        };
        var checkedDates = getCheckedInputValue('date');
        var checkedCountries = getCheckedInputValue('country');
        var date = 'date';
        var country = 'country';
        var defaultCoutries = ['yemen', 'somalia', 'pakistan'];
        var defaultDates = ['2002', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016'];

        var filteringResult = function filteringResult(checkedValues, defaultValues, key) {
            if (checkedValues.length) {
                checkedValues.map(function (criteria) {
                    droneApp.filtedResult = data.strike.filter(function (singleStrike) {
                        return singleStrike.date === criteria;
                    });
                });
            }
        };
        filteringResult(checkedDates, defaultDates, 'date');
        console.log(droneApp.filtedResult);
        // filteringResult(checkedCountries, defaultCoutries, country)
    });
});
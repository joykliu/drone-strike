'use strict';

var url = 'http://api.dronestre.am/data';
var droneApp = {};
mapboxgl.accessToken = 'pk.eyJ1Ijoiam95OTAxN21hcGJveCIsImEiOiJjaW94M2RneXQwMDJ1d2ZtNXp4a29pbTV4In0.TebEkoRfRP8E0hw_Nd3PFA';

droneApp.getDrones = $.ajax({
    url: url,
    method: 'GET',
    dataType: 'jsonp'
});

$.when(droneApp.getDrones).then(function (data) {
    data.strike.map(function (result) {
        result.date = result.date.split('-')[0];
    });

    $('input[type=checkbox]').on('change', function () {
        var getCheckedInputValue = function getCheckedInputValue(param) {
            return $('input[name=' + param + ']:checked').map(function (input, value) {
                return $(value).val();
            }).toArray();
        };
        var checkedDates = getCheckedInputValue('date');
        var checkedCountries = getCheckedInputValue('country');;
        var defaultCountries = ['Yemen', 'Somalia', 'Pakistan'];
        var defaultDates = ['2002', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016'];
        var filteringResult = function filteringResult(checkedValues, defaultValues, category, baseData) {
            if (checkedValues.length !== 0) {
                var filteredRaw = checkedValues.map(function (criteria) {
                    return baseData.filter(function (singleStrike) {
                        if (category === 'date') {
                            return singleStrike.date === criteria;
                        } else if (category === 'country') {
                            return singleStrike.country === criteria;
                        }
                    });
                });
            } else {
                var filteredRaw = defaultValues.map(function (criteria) {
                    return baseData.filter(function (singleStrike) {
                        if (category === 'date') {
                            return singleStrike.date === criteria;
                        } else if (category === 'country') {
                            return singleStrike.country === criteria;
                        }
                    });
                });
            }
            var filteredResult = $.map(filteredRaw, function (n) {
                return n;
            });
            data.filteredStrikes = filteredResult;
            // return data;
        };
        filteringResult(checkedDates, defaultDates, 'date', data.strike);
        filteringResult(checkedCountries, defaultCountries, 'country', data.filteredStrikes);
        droneApp.displayStrikes();
    });

    droneApp.displayStrikes = function () {
        var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v9',
            hash: true
        });
        var displayMarkers = data.filteredStrikes.map(function (singleStrike) {
            console.log(singleStrike);
            var lat = singleStrike.lat,
                lon = singleStrike.lon;
            // Creating dom element for Marker
            var el = document.createElement('div');
            var marker = new mapboxgl.Marker(el).setLngLat([lon, lat]).addTo(map);
        });
    };
});
'use strict';

// define callback url, app shell and mapbox key
var url = 'http://api.dronestre.am/data';
var droneApp = {};
mapboxgl.accessToken = 'pk.eyJ1Ijoiam95OTAxN21hcGJveCIsImEiOiJjaW94M2RneXQwMDJ1d2ZtNXp4a29pbTV4In0.TebEkoRfRP8E0hw_Nd3PFA';

// calling for drone results
droneApp.getDrones = $.ajax({
    url: url,
    method: 'GET',
    dataType: 'jsonp'
});

$.when(droneApp.getDrones).then(function (data) {
    // show date as year form
    data.strike.map(function (result) {
        result.date = result.date.split('-')[0];
    });

    $('input[type=checkbox]').on('change', function () {
        // collect chekced values into an array
        var getCheckedInputValue = function getCheckedInputValue(param) {
            return $('input[name=' + param + ']:checked').map(function (input, value) {
                return $(value).val();
            }).toArray();
        };
        // define checked and default values for filter use
        var checkedDates = getCheckedInputValue('date');
        var checkedCountries = getCheckedInputValue('country');;
        var defaultCountries = ['Yemen', 'Somalia', 'Pakistan'];
        var defaultDates = ['2002', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016'];

        // filter resutls
        var filteringResult = function filteringResult(checkedValues, defaultValues, category, baseData) {
            if (checkedValues.length !== 0) {
                // when the user makes a selection filter data against checked boxes
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
                // when no selection is made, show all possible results
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
            // turn filtered result, a multilevel array, into a flattened array
            var filteredResult = $.map(filteredRaw, function (n) {
                return n;
            });
            data.filteredStrikes = filteredResult;
            // return data;
        };
        // first call for data to be filtered with an original dataset
        filteringResult(checkedDates, defaultDates, 'date', data.strike);
        // then call for data to be filtered wiht an filtered dataset
        filteringResult(checkedCountries, defaultCountries, 'country', data.filteredStrikes);
        droneApp.displayStrikes();
    });

    droneApp.displayStrikes = function () {
        // display map
        var markerArr = [];
        var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v9'
        });
        // create empty array to store markers
        // display markers
        var displayMarkers = data.filteredStrikes.forEach(function (singleStrike) {
            // define marker latitute and longtitute
            var lat = singleStrike.lat,
                lon = singleStrike.lon;
            if (lat.length && lon.length) {
                // when location exists create dom element for Marker
                var el = document.createElement('div');
                el.className = 'marker';
                // add markeres to map
                droneApp.markers = new mapboxgl.Marker(el).setLngLat([lon, lat]).addTo(map);
                // push markers to empty array
                markerArr.push([lon, lat]);
            };
        });
        // fit map to marker bounds
        // NOTE: SOLUTION 1: CREATE FEATURE GROUP (GEOJSON) FOR MARKERS, GET FEATURE GROUP BOUNDS
        // create geojson object to store marker coordinates sotred in markerArry
        var fitMap = function fitMap() {
            var geojson = {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "geometry": {
                        "type": "Markers",
                        "properties": {},
                        "coordinates": markerArr
                    }
                }]
            };
            var coordinates = geojson.features[0].geometry.coordinates;

            /* Pass the first coordinates in markerArry to `lngLatBounds` &
            ** wrap each coordinate pair in `extend` to include them in the bounds
            ** result. A variation of this technique could be applied to zooming
            ** to the bounds of multiple Points or Polygon geomteries - it just
            ** requires wrapping all the coordinates with the extend method. */
            var bounds = coordinates.reduce(function (bounds, coord) {
                return bounds.extend(coord);
            }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
            map.fitBounds(bounds, { padding: 50 });
        };
        fitMap();

        var displayPopup = data.filteredStrikes.map(function (singleStrike) {
            // define information contained in popup
            var town = void 0,
                summary = void 0,
                link = void 0,
                deaths = void 0;

            //NOTE👇: DO NOT DO THIS FIND A WAY TO WRAP THIS BETTER
            var getPopupInfo = function getPopupInfo() {
                if (singleStrike.town.length) {
                    town = singleStrike.town;
                } else if (singleStrike.location.length) {
                    town = singleStrike.location;
                } else {
                    town = 'Unknown';
                }

                if (singleStrike.bij_summary_short.length) {
                    summary = singleStrike.bij_summary_short;
                } else if (singleStrike.narrative.length) {
                    summary = singleStrike.narrative;
                } else {
                    summary = 'Awaiting detailed information on this strike...';
                }

                if (singleStrike.bij_link.length) {
                    link = singleStrike.bij_summary_short.length;
                }

                var numberReconstruct = function numberReconstruct() {
                    var number = singleStrike.deaths;
                    if (number.length > 2) {
                        deaths = number.split('-').join(' to ');
                    } else {
                        deaths = number;
                    }
                };
                numberReconstruct();
            };
            getPopupInfo();
        });
    };
});
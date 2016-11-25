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
    droneApp.filteringResult = function () {
        data.strike.map(function (result) {
            var m_names = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
            result.date = result.date.split('-').splice(0, 2);
            result.year = result.date[0];
            var dateObj = new Date(result.date);
            var month = m_names[dateObj.getMonth()];
            result.displayDate = month + ', ' + result.year;
        });

        $('input[type=checkbox]').on('change', function () {
            // collect chekced values into an array
            var getCheckedInputValue = function getCheckedInputValue(param) {
                return $('input[name=' + param + ']:checked').map(function (input, value) {
                    return $(value).val();
                }).toArray();
            };
            // define checked and default values for filter use
            var checkedYears = getCheckedInputValue('year');
            var checkedCountries = getCheckedInputValue('country');;
            var defaultCountries = ['Yemen', 'Somalia', 'Pakistan'];
            var defaultYears = ['2002', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016'];

            // filter resutls
            var filteringResult = function filteringResult(checkedValues, defaultValues, category, baseData) {
                if (checkedValues.length !== 0) {
                    // when the user makes a selection filter data against checked boxes
                    var filteredRaw = checkedValues.map(function (criteria) {
                        return baseData.filter(function (singleStrike) {
                            if (category === 'year') {
                                return singleStrike.year === criteria;
                            } else if (category === 'country') {
                                return singleStrike.country === criteria;
                            }
                        });
                    });
                } else {
                    // when no selection is made, show all possible results
                    var filteredRaw = defaultValues.map(function (criteria) {
                        return baseData.filter(function (singleStrike) {
                            if (category === 'year') {
                                return singleStrike.year === criteria;
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
            filteringResult(checkedYears, defaultYears, 'year', data.strike);
            // then call for data to be filtered wiht an filtered dataset
            filteringResult(checkedCountries, defaultCountries, 'country', data.filteredStrikes);
            droneApp.displayStrikes();
        });
    };

    droneApp.displayStrikes = function () {
        // display map
        var markerArr = [];
        var displayMap = function displayMap() {
            droneApp.map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v9'
            });
        };
        // create empty array to store markers
        // display markers
        var displayMarkers = function displayMarkers() {
            data.filteredStrikes.forEach(function (singleStrike) {
                // define marker latitute and longtitute
                var lat = singleStrike.lat,
                    lon = singleStrike.lon;
                console.log(singleStrike);
                // define information contained in popup
                var town = void 0,
                    summary = void 0,
                    link = void 0,
                    deaths = void 0,
                    time = void 0;
                //NOTE👇: DO NOT DO THIS FIND A WAY TO WRAP THIS BETTER
                var getPopupInfo = function getPopupInfo() {
                    if (singleStrike.town.length) {
                        town = singleStrike.town;
                    } else if (singleStrike.location.length) {
                        town = singleStrike.location;
                    } else {
                        town = 'Unknown';
                    }

                    if (singleStrike.narrative.length) {
                        summary = singleStrike.narrative;
                    } else if (singleStrike.bij_summary_short.length) {
                        summary = singleStrike.bij_summary_short;
                    } else {
                        summary = 'Awaiting detailed information on this strike...';
                    }

                    if (singleStrike.bij_link.length) {
                        link = singleStrike.bij_summary_short.length;
                    }

                    if (singleStrike.displayDate.length) {
                        time = singleStrike.displayDate;
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
                var popup = new mapboxgl.Popup({ offset: [0, 0] }).setHTML('\n                    <div class="marker-content">\n                        <p>' + time + '</p>\n                        <h3>' + town + '</h3>\n                        <h4>Deaths: ' + deaths + '</h4>\n                        <p>' + summary + '</p>\n                        <a href="' + link + '">More Details...</a>\n                    </div>\n                    ');
                if (lat.length && lon.length) {
                    // when location exists create dom element for Marker
                    var el = document.createElement('div');
                    el.className = 'marker';
                    // add markeres to map
                    droneApp.markers = new mapboxgl.Marker(el).setLngLat([lon, lat]).setPopup(popup).addTo(droneApp.map);
                    // push markers to empty array
                    markerArr.push([lon, lat]);
                };
            });
        };
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
            droneApp.map.fitBounds(bounds, { padding: 50 });
        };

        displayMap();
        displayMarkers();
        fitMap();
    };

    droneApp.init = function () {
        droneApp.filteringResult();
    };

    droneApp.init();
});
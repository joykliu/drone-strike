// define callback url, app shell and mapbox key
const url = 'http://api.dronestre.am/data';
const droneApp = {};
mapboxgl.accessToken = 'pk.eyJ1Ijoiam95OTAxN21hcGJveCIsImEiOiJjaW94M2RneXQwMDJ1d2ZtNXp4a29pbTV4In0.TebEkoRfRP8E0hw_Nd3PFA';

// calling for drone results
droneApp.getDrones = $.ajax ({
    url: url,
    method: 'GET',
    dataType: 'jsonp'
});

$.when(droneApp.getDrones).then(data => {
    // show date as year form
    droneApp.init = () => {
        data.strike.map(result => {
            result.date = result.date.split('-')[0];
        })

        $(`input[type=checkbox]`).on('change', ()=> {
            // collect chekced values into an array
            let getCheckedInputValue = (param) => {
                return $(`input[name=${param}]:checked`).map((input, value) => {
                    return $(value).val()
                }).toArray();
            }
            // define checked and default values for filter use
            const checkedDates = getCheckedInputValue('date');
            const checkedCountries = getCheckedInputValue('country');;
            const defaultCountries = ['Yemen', 'Somalia', 'Pakistan'];
            const defaultDates = ['2002', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016'];

            // filter resutls
            const filteringResult = (checkedValues, defaultValues, category, baseData) => {
                if(checkedValues.length !== 0) {
                    // when the user makes a selection filter data against checked boxes
                    var filteredRaw = checkedValues.map((criteria) => {
                        return baseData.filter((singleStrike) => {
                            if (category === 'date') {
                                return singleStrike.date === criteria
                            } else if (category === 'country') {
                                return singleStrike.country === criteria
                            }
                        })
                    })
                } else {
                    // when no selection is made, show all possible results
                    var filteredRaw = defaultValues.map((criteria) => {
                        return baseData.filter((singleStrike) => {
                            if (category === 'date') {
                                return singleStrike.date === criteria
                            } else if (category === 'country') {
                                return singleStrike.country === criteria;
                            }
                        })
                    })
                }
                // turn filtered result, a multilevel array, into a flattened array
                var filteredResult = $.map(filteredRaw, function(n) {
                    return n
                })
                data.filteredStrikes = filteredResult;
                // return data;
            }
            // first call for data to be filtered with an original dataset
            filteringResult(checkedDates, defaultDates, 'date',data.strike);
            // then call for data to be filtered wiht an filtered dataset
            filteringResult(checkedCountries, defaultCountries, 'country',data.filteredStrikes);
            droneApp.displayStrikes();
        })
    }

    droneApp.displayStrikes = () => {
        // display map
        let markerArr = [];
        const displayMap = () => {
            droneApp.map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/streets-v9'
            })
        }
        // create empty array to store markers
        // display markers
        const displayMarkers = () => {
            data.filteredStrikes.forEach((singleStrike) => {
                // define marker latitute and longtitute
                let lat = singleStrike.lat
                ,     lon = singleStrike.lon;

                // define information contained in popup
                let town, summary, link, deaths;
                //NOTE👇: DO NOT DO THIS FIND A WAY TO WRAP THIS BETTER
                const getPopupInfo = () => {
                    if (singleStrike.town.length) {
                        town = singleStrike.town;
                    } else if (singleStrike.location.length){
                        town = singleStrike.location
                    } else {
                        town = 'Unknown'
                    }

                    if (singleStrike.bij_summary_short.length) {
                        summary = singleStrike.bij_summary_short
                    } else if (singleStrike.narrative.length){
                        summary = singleStrike.narrative
                    } else {
                        summary = 'Awaiting detailed information on this strike...'
                    }

                    if (singleStrike.bij_link.length) {
                        link = singleStrike.bij_summary_short.length
                    }

                    const numberReconstruct = () => {
                        let number = singleStrike.deaths;
                        if(number.length > 2) {
                            deaths = number.split('-').join(' to ')
                        } else {
                            deaths = number;
                        }
                    }
                    numberReconstruct();
                }
                getPopupInfo();
                const popup = new mapboxgl.Popup({offset: [0,-30]}).setText('sup');
                if (lat.length && lon.length) {
                    // when location exists create dom element for Marker
                    const el = document.createElement('div');
                    el.className = 'marker';
                    // add markeres to map
                    droneApp.markers = new mapboxgl.Marker(el)
                    .setLngLat([lon, lat])
                    .setPopup(popup)
                    .addTo(droneApp.map);
                    // push markers to empty array
                    markerArr.push([lon, lat])
                };
            })
        }
        // fit map to marker bounds
        // NOTE: SOLUTION 1: CREATE FEATURE GROUP (GEOJSON) FOR MARKERS, GET FEATURE GROUP BOUNDS
        // create geojson object to store marker coordinates sotred in markerArry
        const fitMap = () => {
            const geojson = {
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
            const coordinates = geojson.features[0].geometry.coordinates;

            /* Pass the first coordinates in markerArry to `lngLatBounds` &
            ** wrap each coordinate pair in `extend` to include them in the bounds
            ** result. A variation of this technique could be applied to zooming
            ** to the bounds of multiple Points or Polygon geomteries - it just
            ** requires wrapping all the coordinates with the extend method. */
            const bounds = coordinates.reduce(function(bounds, coord) {
                return bounds.extend(coord);
            }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
            droneApp.map.fitBounds(bounds, {padding:50});
        }

        displayMap();
        displayMarkers();
        fitMap();
    }

    droneApp.init();
})

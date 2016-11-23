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

    droneApp.displayStrikes = () => {
        // display map
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v9'
        })
        // create empty array to store markers
        let markerArr = [];
        // display markers
        const displayMarkers = data.filteredStrikes.forEach((singleStrike) => {
            // define marker latitute and longtitute
            let lat = singleStrike.lat
            ,     lon = singleStrike.lon;
            if (lat.length && lon.length) {
                // when location exists create dom element for Marker
                const el = document.createElement('div');
                el.className = 'marker';
                // add markeres to map
                droneApp.markers = new mapboxgl.Marker(el)
                .setLngLat([lon, lat])
                .addTo(map);
                // push markers to empty array
                markerArr.push([lon, lat])
            };
        })

        /** NOTE: SOLUTION 1: CREATE FEATURE GROUP (GEOJSON) FOR MARKERS, GET FEATURE GROUP BOUNDS
        *** SOLUTION 2: FILTER LAT AND LNG, FIND EXTREME POINTS AND FORM COORDINATES */
        const fitMap = () => {
            // var bounds = markerArr.getBounds();
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

            const coordinates = geojson.features[0].geometry.coordinates;
            const bounds = coordinates.reduce(function(bounds, coord) {
                    return bounds.extend(coord);
                }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
            map.fitBounds(bounds, {padding:50});
        }
        fitMap();

    }
})

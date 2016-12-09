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
    droneApp.filterResults = () => {

        data.strike.map(result => {
            const m_names = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
            result.date = result.date.split('-').splice(0,2);
            result.year = result.date[0];
            let dateObj = new Date(result.date);
            const month = m_names[dateObj.getMonth()];
            result.displayDate = `${month}, ${result.year}`;
        })
        $(`input[type=checkbox]`).on('change', ()=> {
            // collect chekced values into an array
            let getCheckedInputValue = (param) => {
                return $(`input[name=${param}]:checked`).map((input, value) => {
                    return $(value).val()
                }).toArray();
            }
            // define checked and default values for filter use
            const checkedYears = getCheckedInputValue('year');
            const checkedCountries = getCheckedInputValue('country');;
            const defaultCountries = ['Yemen', 'Somalia', 'Pakistan'];
            const defaultYears = ['2002', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016'];

            // filter resutls
            const filteringResult = (checkedValues, defaultValues, category, baseData) => {
                if(checkedValues.length !== 0) {
                    // when the user makes a selection filter data against checked boxes
                    var filteredRaw = checkedValues.map((criteria) => {
                        return baseData.filter((singleStrike) => {
                            if (category === 'year') {
                                return singleStrike.year === criteria
                            } else if (category === 'country') {
                                return singleStrike.country === criteria
                            }
                        })
                    })
                } else {
                    // when no selection is made, show all possible results
                    var filteredRaw = defaultValues.map((criteria) => {
                        return baseData.filter((singleStrike) => {
                            if (category === 'year') {
                                return singleStrike.year === criteria
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
            filteringResult(checkedYears, defaultYears, 'year', data.strike);
            // then call for data to be filtered wiht an filtered dataset
            filteringResult(checkedCountries, defaultCountries, 'country',data.filteredStrikes);

            // display strike markers on map
            droneApp.displayStrikes(data.filteredStrikes);
        }) // Checkbox on change
    } // displayResults()

    // display markers
    droneApp.displayStrikes = (strikeData) => {
        // create empty array to store markers
        droneApp.markerArr = [];
        droneApp.markerData = [];
        // display markers
        strikeData.forEach((singleStrike) => {
            // define marker latitute and longtitute
            const lat = singleStrike.lat
            ,     lon = singleStrike.lon;
            // define information contained in popup
            let town, summary, link, deaths, time;
            //NOTE👇: DO NOT DO THIS FIND A WAY TO WRAP THIS BETTER. USE TENERAY
            const getPopupInfo = () => {
                if (singleStrike.town.length && singleStrike.country.length) {
                    town = singleStrike.town + singleStrike.country;
                } else if (singleStrike.location.length){
                    town = singleStrike.location + singleStrike.country
                } else {
                    town = 'Unknown'
                }

                if (singleStrike.narrative.length) {
                    summary = singleStrike.narrative
                } else if (singleStrike.bij_summary_short.length){
                    summary = singleStrike.bij_summary_short
                } else {
                    summary = 'Awaiting detailed information on this strike...'
                }

                if (singleStrike.bij_link.length) {
                    link = singleStrike.bij_summary_short.length
                }

                if (singleStrike.displayDate.length) {
                    time = singleStrike.displayDate
                }

                let number = singleStrike.deaths;
                if(number.length > 2) {
                    deaths = number.split('-').join(' to ')
                } else {
                    deaths = number;
                }
            }
            getPopupInfo();

            // create geojson objsct for markers
            const featureObj =
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lon, lat]
                },
                "properties": {
                    "title": singleStrike._id,
                    "description":
                    `<div class="marker-content">
                    <p>${time}</p>
                    <h3>${town}</h3>
                    <h4>Deaths: ${deaths}</h4>
                    <p>${summary}</p>
                    <a href="${link}">More Details...</a>
                    </div>`,
                    "iconSize": [40,40]
                }
            };
            droneApp.markerData.push(featureObj);
        })// forEach(singleStrike)

        let geojson = {
            "type": "FeatureCollection",
            "features": droneApp.markerData
        }

        geojson.features.forEach(function(marker) {
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.backgroundImgae = 'url(../images/marker.svg)';
            el.style.width = marker.properties.iconSize[0] + 'px';
            el.style.height = marker.properties.iconSize[1] + 'px';

            if (marker.geometry.coordinates[0].length && marker.geometry.coordinates[1].length) {
                new mapboxgl.Marker(el, {
                    offset: [-marker.properties.iconSize[0] / 2, -marker.properties.iconSize[1] / 2]
                })
                .setLngLat(marker.geometry.coordinates)
                .addTo(droneApp.map);        
            }
        });

        // fit map to marker bounds
        // create geojson object to store marker coordinates sotred in markerArry
        const fitMap = () => {
            if(droneApp.markerArr.length > 1) {
                const geojson = {
                    "type": "FeatureCollection",
                    "features": [{
                        "type": "Feature",
                        "geometry": {
                            "type": "Markers",
                            "properties": {},
                            "coordinates": droneApp.markerArr
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
            } else if (droneApp.markerArr.length){
                droneApp.map.flyTo({center:droneApp.markerArr[0]});
            }// if(data.filteredStrikes)
        } // fit map
        fitMap();
    } // displayStrikes()

    //display map
    droneApp.initMap = () => {
        droneApp.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/satellite-v9',
            center: [54.281023, 10.913129],
            zoom: 3,
            maxZoom: 13
        })
    }

    // initiate drone app
    droneApp.init = () => {
        droneApp.initMap();
        droneApp.filterResults();
    }
    droneApp.init();
}) // promise

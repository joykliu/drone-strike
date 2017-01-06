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

    // create empty array to store markers
    droneApp.markerData = [];
    droneApp.mapArr = [];
    droneApp.listArr = [];

    droneApp.dataCleanUp = () => {
        const pakistanData = data.strike.filter(result => {
            if (result.country) {
                return result.country === 'Pakistan'
            }
        });

        pakistanData.map((result) => {
            const m_names = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
            result.date = result.date.split('-').splice(0,2);
            result.year = result.date[0];
            let dateObj = new Date(result.date);
            const month = m_names[dateObj.getMonth()];
            result.displayDate = `${month}, ${result.year}`;

            if (!result.lat && !result.lon) {
                droneApp.listArr.push(result);
            } else {
                droneApp.mapArr.push (result)
            }
        })
    } // displayResults()

    // display markers
    droneApp.displayStrikes = (strikeData) => {
        // display markers
        strikeData.forEach((singleStrike) => {
            // define information contained in popup
            let lat, lon, town, summary, link, deaths, time, min;

            //NOTE👇: DO NOT DO THIS FIND A WAY TO WRAP THIS BETTER. USE TENERAY
            const getMarkerInfo = () => {
                lat = singleStrike.lat;
                lon = singleStrike.lon;

                if (singleStrike.town.length && singleStrike.country.length) {
                    town = singleStrike.town + ', ' + singleStrike.country;
                } else if (singleStrike.location.length){
                    town = singleStrike.location + ', ' + singleStrike.country
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

                if (singleStrike.displayDate) {
                    time = singleStrike.displayDate
                }

                let number = singleStrike.deaths;
                if(number.length > 2) {
                    deaths = number.split('-').join(' to ')
                } else {
                    deaths = number;
                }

                if(singleStrike.min_deaths) {
                    min = singleStrike.min_deaths
                }
            }
            getMarkerInfo();

            // create geojson objsct for markers
            const featureObj =
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lon, lat]
                },
                "properties": {
                    "description":
                    `<div class="marker-content">
                    <p>${time}</p>
                    <h3>${town}</h3>
                    <h4>Deaths: ${deaths}</h4>
                    <p>${summary}</p>
                    <a href="${link}">More Details...</a>
                    </div>`,
                    "iconSize": [40,40],
                    "minDeaths": min
                }
            };
            droneApp.markerData.push(featureObj);
        })// forEach(singleStrike)

        const geojson = {
            "type": "FeatureCollection",
            "features": droneApp.markerData
        }

        droneApp.map.on('load', () => {
            droneApp.map.addSource("strikes", {
                "type": "geojson",
                "data": geojson
            });

            var layers = [
                [0, 'green'],
                [20, 'orange'],
                [200, 'red']
            ];

            droneApp.map.addLayer({
                "id": "strikes",
                "type": "circle",
                "source": "strikes",
                "paint": {
                    "circle-radius": 10,
                    "circle-color": {
                        property: "minDeaths"
                    }
                }
            });

            console.log(droneApp.map)
        })
        //create popups, but not adding them to map yet

        let popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
        });

        droneApp.map.on('mousemove', function(e) {
            const features = droneApp.map.queryRenderedFeatures(e.point, { layers: ['strikes'] });

            // Change the cursor style as a UI indicator.
            droneApp.map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

            if (!features.length) {
                popup.remove();
                return;
            }
            const feature = features[0];

            // Populate the popup and set its coordinates
            // based on the feature found.
            popup.setLngLat(feature.geometry.coordinates)
            .setHTML(feature.properties.description)
            .addTo(droneApp.map);
        })

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
        // fitMap();
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
        droneApp.dataCleanUp();
        droneApp.displayStrikes(droneApp.mapArr);
    }
    droneApp.init();
}) // promise

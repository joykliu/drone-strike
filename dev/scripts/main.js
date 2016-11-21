const url = 'http://api.dronestre.am/data';
const droneApp = {};

droneApp.getDrones = $.ajax ({
    url: url,
    method: 'GET',
    dataType: 'jsonp'
});

$.when(droneApp.getDrones).then(data => {
    data.strike.map(result => {
        // group data by country + year
        result.date = result.date.split('-')[0];
        // keep detailed geolocation information

        // use funciton in console.log() to get the years of each drone strike
        // console.log(result.country)

        //filter data by years

        // filter data by casulties (death_min)

        // display information
    })

    $(`input[type=checkbox]`).on('change', ()=> {
        let getCheckedInputValue = (param) => {
            return $(`input[name=${param}]:checked`).map((input, value) => {
                return $(value).val()
            }).toArray();
        }
        const checkedDates = getCheckedInputValue('date');
        const checkedCountries = getCheckedInputValue('country');
        // const date = 'date';
        // const country = 'country';
        const defaultCountries = ['Yemen', 'Somalia', 'Pakistan'];
        const defaultDates = ['2002', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016'];

        let filteringResult = (checkedValues, defaultValues, category) => {
            if(checkedValues.length) {
                checkedValues.map((criteria) => {
                    return droneApp.filteredResult = data.strike.filter((singleStrike) => {
                        if (category === 'date') {
                            return singleStrike.date === criteria
                        } else if (category === 'country') {
                            return singleStrike.country === criteria
                        }
                    })
                })
            } else {
                defaultValues.map((criteria) => {
                    return droneApp.filteredResult = data.strike.filter((singleStrike) => {
                        if (category === 'date') {
                            return singleStrike.date === criteria
                        } else if (category === 'country') {
                            return singleStrike.country === criteria
                        }
                    })
                })
            }
        }
        filteringResult(checkedDates, defaultDates, 'date');
        filteringResult(checkedCountries, defaultCountries, 'country');
    })

    droneApp.displyStrikes = (strikes) => {
        
    }
})

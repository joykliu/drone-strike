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
        function getCheckedInputValue(param) {
            return $(`input[name=${param}]:checked`).map((input, value) => {
                return $(value).val()
            }).toArray();
        }
        const checkedDates = getCheckedInputValue('date');
        const checkedCountries = getCheckedInputValue('country');
        const date = 'date';
        const countru = 'country';
        const defaultCoutries = ['yemen', 'somalia', 'pakistan'];
        const defaultDates = ['2002', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016'];
        console.log('result2', result)
        let filteringResult = (checkedValues, defaultValues, key) => {
            console.log('is it working');
            if (checkedValues.length > 0) {
                // MAP OUT DATA.STRIKE HERE
                return data.strike.filter(()=> result.key === checkedValues)
            } else {
                return data.strike.filter(()=> result.key === checkedValues )
            }
        }
        filteringResult(checkedDates, defaultDates, date)
        filteringResult(checkedCountries, defaultCoutries, country)

    })

})

const url = 'http://api.dronestre.am/data';
const droneApp = {};
const mapKey = 'pk.eyJ1Ijoiam95OTAxN21hcGJveCIsImEiOiJjaW94M2RneXQwMDJ1d2ZtNXp4a29pbTV4In0.TebEkoRfRP8E0hw_Nd3PFA';

droneApp.getDrones = $.ajax ({
    url: url,
    method: 'GET',
    dataType: 'jsonp'
});

$.when(droneApp.getDrones).then(data => {
    data.strike.map(result => {
        result.date = result.date.split('-')[0];
    })

    $(`input[type=checkbox]`).on('change', ()=> {
        let getCheckedInputValue = (param) => {
            return $(`input[name=${param}]:checked`).map((input, value) => {
                return $(value).val()
            }).toArray();
        }
        const checkedDates = getCheckedInputValue('date');
        const checkedCountries = getCheckedInputValue('country');;
        const defaultCountries = ['Yemen', 'Somalia', 'Pakistan'];
        const defaultDates = ['2002', '2004', '2005', '2006', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016'];
        const filteringResult = (checkedValues, defaultValues, category, baseData) => {
            if(checkedValues.length !== 0) {
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
            var filteredResult = $.map(filteredRaw, function(n) {
                return n
            })
            data.filteredStrikes = filteredResult;
            // return data;
        }
        filteringResult(checkedDates, defaultDates, 'date',data.strike);
        filteringResult(checkedCountries, defaultCountries, 'country',data.filteredStrikes);
        console.log(data.filteredStrikes);
    })

    droneApp.displayStrikes = (strikes) => {
    }
})

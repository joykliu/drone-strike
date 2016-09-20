const airApp = {};
const url = 'http://:3004'

airApp.getAir = () => {
    $.ajax ({
        API_URL: url,
        method: 'GET',
        dataType: 'json',
        data: {
            REQUESTS_LIMIT: 10000,
        }
    }).then(results => {
        console.log(results)
    })
}

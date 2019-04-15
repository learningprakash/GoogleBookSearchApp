const request = require('request');

_EXTERNAL_URL = 'https://www.googleapis.com/books/v1/volumes';

const callExternalApiWithFilter = (filter, callback) => {
    request(_EXTERNAL_URL + constructQuerString(filter), { json: true }, (err, res, body) => {
        if (err) {
            return callback(err);
        }
        return callback(body);
    });
}

const constructQuerString = function (filter) {
    var queryString = '?';
    for (let i = 0; i < filter.length; i++) {
        if (filter[i][1] != undefined)
        queryString += `${filter[i][0]}=${filter[i][1]}&`;
    }
    return queryString === '?' ? '' : queryString;
};

module.exports.callApi = callExternalApiWithFilter;
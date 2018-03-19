'use strict'

const fetch = require('node-fetch')
const stringify = require('querystring').stringify

module.exports = (url, params) => {
    if(params) {
        url = url + '?' + stringify(params)
    }

    console.log('Fetching url: ' + url)
    return fetch(url, {timeout: 5000}).then(res => res.json())
}
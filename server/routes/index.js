var express = require('express');
var router = express.Router();
const fetch = require('../fetch')
const config = require('../config')
const parpar = require('parpar')

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {});
});


const getYelp = () => {
    let url = config.search1
    return fetch(url)
}

const parse = parpar({
    country: {default: 'se'},
    version: {default: '1.1.3'},
    profile: {default: 'frontEndTest12'},
    key: {default: '6111238394344117116'},
    search_word: {default : 'bio'}

})
//?country=se&version=1.1.3&profile=frontEndTest12&key=6111238394344117116&search_word=bio
const getSuggest = (params) => {
    let url = config.search2
    console.log('params1', params)
    return fetch(url, {
        country: params.country,
        version: params.version,
        profile: params.profile,
        key: params.key,
        search_word: params.search_word
    })
}
/*?country=se&version=1.1.3&profile=frontEndTest12&key=6111238394344117116&search_word=bio
* */
const formatJSON = (json, res) => {
    //console.log(json);
    try {
        let data = json.adverts

        return {
            totalHits: json.totalHits,
            querySearch: json.querySearch,
            //data: data.map(company => ({companyInfo:company.companyInfo, address:company.address}))
            data: data.map(company => ({name:company.companyInfo.companyName, address:company.address}))


        }
    } catch (err) {
        res.status(404).send({error: 'No reviews found'})
    }
}
/**
 * JSON Routes
 * test url:
 http://api.company.com/cs/search/basic?country=se&version=1.1.3&profile=frontEndTest12&key=6111238394344117116&search_word=bio
 */
//http://api.company.com/cs/search/basic?country=se&version=1.1.3&profile=frontEndTest12&key=6111238394344117116&search_word=bio
router.get('/cs', function(req, res, next) {


    var search_word = req.query.search_word;

    //console.log('search_word', search_word)

    //let params = Object.assign({}, req.params, req.query)
    parse(req.query, (err, params) => {
        console.log('req.query',req.query);
        if (err) {
            console.log(err)
            return res.status(400).end(err.message)
        }
        getSuggest(params)
            .then(sugest => {
                res.set('Content-Type', 'application/json')
                res.send(formatJSON(sugest, res))
            })
            .catch(err => {
                res.status(500).end(err.message)
            })
    })

    /*getYelp()
        .then(yelp => {
            res.set('Content-Type', 'application/json')
            res.send(formatJSON(yelp,res))
        })
        .catch(err => {
            res.status(500).end(err.message)
        })*/


    /*app.get('/', function (req, res) {
        parse(req.query, function (err, params) {
            if (err) {
                res.status(400).send(err.message);
            } else {
                res.send(params);
            }
        });
    });*/
    // random timeout to simulate api response times
    /*setTimeout(function(){
        res.json({search_word: search_word  })
    }, getRandomResponseTime())*/
});
//http://localhost:3000/api/conversion?originAmount=30.00&originCurrency=USD&destCurrency=EUR&calcOriginAmount=false&search_word=bio
//http://localhost:3000/api/fees?originAmount=30.00&originCurrency=USD&destCurrency=EUR
router.get('/api/conversion', function(req, res, next) {

    var originAmount = req.query.originAmount;
    var originCurrency = req.query.originCurrency;
    var destAmount = req.query.destAmount;
    var destCurrency = req.query.destCurrency;
    var calcOriginAmount = req.query.calcOriginAmount === 'true';
    var xRate = getXRate(originCurrency, destCurrency);

    // decide whether to convert TO or FROM originAmount
    if (calcOriginAmount) {
        originAmount = (parseFloat(destAmount, 10) / xRate).toFixed(2);
    } else {
        destAmount = (parseFloat(originAmount, 10) * xRate).toFixed(2);
    }

    // random timeout to simulate api response times
    setTimeout(function(){
        res.json({originAmount: originAmount, destAmount: destAmount, destCurrency: destCurrency, xRate: xRate  })
    }, getRandomResponseTime())
});

router.get('/api/fees', function(req, res, next) {
    var originAmount = req.query.originAmount;
    var originCurrency = req.query.originCurrency;
    var destCurrency = req.query.destCurrency;

    var feeAmount = getFee(originAmount, originCurrency, destCurrency);

    // random timeout to simulate api response times
    setTimeout(function(){
        res.json({originAmount: originAmount, originCurrency: originCurrency, destCurrency: destCurrency, feeAmount: feeAmount  })
    }, getRandomResponseTime())

});

/**
 * Helper functions
 */

function getXRate(originCurrency, destCurrency) {
    var rate = 1;

    // if both currencies are the same, exchange rate will be 1.
    if (originCurrency === destCurrency) {
        return rate;
    }

    rate = xRates[originCurrency + '_' + destCurrency];
    if (!rate) {
        console.log('ERROR: Exchange rate missing for ' + originCurrency + ' -> ' + destCurrency)
    }

    return rate;
}

// Returns fee amount (feePercentage of originAmount for transaction)
function getFee(originAmount, originCurrency, destCurrency) {
    var feePerc = 2;

    feePerc = fees[originCurrency + '_' + destCurrency];

    if (!feePerc) {
        return console.log('ERROR: Fee % missing for ' + originCurrency + ' -> ' + destCurrency)
    }

    return originAmount * feePerc / 100;

}

function getRandomResponseTime() {
    var max = 1200; // ms
    var min = 150;
    return Math.floor(Math.random() * (max - min)) + min;
}

// TODO: get some real values here
// bogus values...
var xRates = {
    USD_EUR: 0.94,
    EUR_USD: 1 / 1.5,

    USD_JPY: 108.81,
    JPY_USD: 1 / 108.81,


    EUR_JPY: 123.79,
    JPY_EUR: 1 / 123.79
}

// in percentages
var fees = {
    USD_USD: 2,
    USD_EUR: 15,
    USD_JPY: 105,
    EUR_USD: 2,
    EUR_JPY: 70,
    EUR_EUR: 5,
    JPY_JPY: 2,
    JPY_USD: 26,
    JPY_EUR: 14
}



module.exports = router;

'use strict'

const parpar = require('parpar')
const fetch = require('../fetch')
const config = require('../config')


const parse = parpar({
    'profile': {type: /se|krak|no|dgs/, default: 'se'},
    'id': {type: 'string', required: true}
})

const getYelp = (params) => {
    let url = `${config.socialHubURL}/socialhub/v1/country/${params.profile}/eco/${params.id}/socialdata/Yelp`
    return fetch(url)
}

const formatJSON = (json, res) => {
    try {
        let data = json[0].socialData[0].data
        return {
            link: data.url,
            numReviews: data.review_count,
            rating: data.rating,
            reviews: data.reviews.map(review => ({
                published: new Date(review.time_created*1000),
                ratingImageUrl: review.rating_image_large_url,
                text: review.excerpt,
                user: review.user.name,
                image: review.user.image_url,
                rating: review.rating
            }))
        }
    } catch (err) {
        res.status(404).send({error: 'No reviews found'})
    }
}

module.exports = (req, res) => {
    let params = Object.assign({}, req.params, req.query)
    parse(params, (err, params) => {
        if (err) {
            return res.status(400).end(err.message)
        }
        getYelp(params)
            .then(yelp => {
                res.set('Content-Type', 'application/json')
                res.send(formatJSON(yelp,res))
            })
            .catch(err => {
                res.status(500).end(err.message)
            })
    })
}
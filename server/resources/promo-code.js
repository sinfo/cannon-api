const Boom = require('boom')
const server = require('..').hapi
const log = require('../helpers/logger')
const PromoCode = require('../db/promo-code')

server.method('promoCode.get', get, {})

function get (cb) {
  let now = new Date()

  PromoCode.find({ expire: { '$gt': now.toISOString() } }, {}, {}, (err, codes) => {
    if (err) {
      log.error({ err: err }, 'error getting promo code')
      return cb(Boom.internal())
    }

    if (!codes) {
      log.warn({ err: err }, 'could not find promo code')
      return cb(Boom.notFound())
    }

    cb(null, Array.from(codes, c => { return c.toObject() }))
  })
}

const Boom = require('@hapi/boom')
const server = require('..').hapi
const log = require('../helpers/logger')
const PromoCode = require('../db/promo-code')

server.method('promoCode.get', get, {})

async function get () {
  let now = new Date()

  filter = {
    'validity.from': { $lte: now },
    'validity.to': { $gte: now }
  }

  try {
    let codes = await PromoCode.find(filter)
    if (!codes) {
      log.warn({ err: err }, 'could not find promo code')
      return cb(Boom.notFound())
    }
    return Array.from(codes, c => { return c.toObject() })
  }
  catch (err) {
    log.error({ err: err }, 'error getting promo code')
    return cb(Boom.internal())
  }
}

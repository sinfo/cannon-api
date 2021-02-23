const Boom = require('boom')
const server = require('..').hapi
const log = require('../helpers/logger')
const HappyHour = require('../db/happy-hour')

server.method('happyHour.get', get, {})
server.method('happyHour.create', create, {})

function get (cb) {
  let now = new Date()

  const filter = {
    from: {'$lt': now},
    to: {'$gt': now}
  }

  HappyHour.find(filter, (err, hhs) => {
    if (err) {
      log.error({ err: err }, 'error getting happy hours')
      return cb(Boom.internal())
    }

    if (!hhs) {
      log.warn({ err: err }, 'could not find happy hours')
      return cb(Boom.notFound())
    }

    cb(null, Array.from(hhs, c => { return c.toObject() }))
  })
}

function create (hh, cb) {
  if (hh.from >= hh.to) {
    log.error({from: hh.from, to: hh.to}, 'from date is after to date')
  }

  HappyHour.create(hh, (err, _hh) => {
    if (err) {
      log.error({ err: err, happyHour: _hh }, 'error creating happy hour')
      return cb(Boom.internal())
    }

    cb(null, _hh.toObject({ getters: true }))
  })
}

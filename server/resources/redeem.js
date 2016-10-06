const Boom = require('boom')
const server = require('../').hapi
const log = require('../helpers/logger')
const Redeem = require('../db/redeem')

server.method('redeem.create', create, {})
server.method('redeem.get', get, {})
server.method('redeem.remove', remove, {})

function create (redeem, cb) {
  Redeem.created = Date.now()

  Redeem.create(redeem, (err, _redeem) => {
    if (err) {
      if (err.code === 11000) {
        return cb(Boom.conflict('redeem is a duplicate'))
      }

      log.error({err: err, redeem: redeem.id}, 'error redeeming')
      return cb(Boom.internal())
    }

    cb(null, _redeem.toObject({ getters: true }))
  })
}

function get (id, cb) {
  Redeem.findOne({id: id}, (err, redeem) => {
    if (err) {
      log.error({err: err, redeem: id}, 'error getting redeem')
      return cb(Boom.internal())
    }
    if (!redeem) {
      log.error({err: 'not found', redeem: id}, 'error getting redeem')
      return cb(Boom.notFound())
    }

    cb(null, redeem.toObject({ getters: true }))
  })
}

function remove (id, cb) {
  Redeem.findOneAndRemove({id: id}, (err, redeem) => {
    if (err) {
      log.error({err: err, redeem: id}, 'error deleting redeem')
      return cb(Boom.internal())
    }
    if (!redeem) {
      log.error({err: 'not found', redeem: id}, 'error deleting redeem')
      return cb(Boom.notFound())
    }

    return cb(null, redeem)
  })
}

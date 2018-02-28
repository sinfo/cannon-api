const Boom = require('boom')
const server = require('../').hapi
const log = require('../helpers/logger')
const Redeem = require('../db/redeem')
const uuid = require('uuid')

server.method('redeem.create', create, {})
server.method('redeem.get', get, {})
server.method('redeem.getMe', getMe, {})
server.method('redeem.remove', remove, {})
server.method('redeem.prepareRedeemCodes', prepareRedeemCodes, {})

function create (redeem, id, cb) {
  redeem.created = Date.now()

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
      return cb(Boom.notFound('redeem code not found'))
    }

    cb(null, redeem.toObject({ getters: true }))
  })
}

function getMe (id, cb) {
  Redeem.find({}, (err, redeemCodes) => {
    if (err) {
      log.error({err: err, user: id}, 'error getting my redeem codes')
      return cb(Boom.internal())
    }
    if (!redeemCodes) {
      log.error({err: 'not found', user: id}, 'error getting my redeem codes')
      return cb(Boom.notFound('redeem code not found'))
    }

    cb(null, redeemCodes)
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

function prepareRedeemCodes (sessionId, users, cb) {
  let redeemCodes = []
  for (let i = 0; i < users.length; i++) {
    redeemCodes.push({
      id: uuid.v4(),
      user: users[i].id,
      achievement: 'session-' + sessionId
    })
  }
  log.info(`${redeemCodes.length} redeem codes created for ${users.length} users`)
  cb(null, redeemCodes)
}

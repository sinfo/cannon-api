const Boom = require('boom')
const server = require('../').hapi
const log = require('../helpers/logger')
const Redeem = require('../db/redeem')
const uuid = require('uuid')

server.method('redeem.create', create, {})
server.method('redeem.get', get, {})
server.method('redeem.remove', remove, {})
server.method('redeem.prepareRedeemCodes', prepareRedeemCodes, {})

function create (redeem, cb) {
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

    var now = new Date()
    var expirationDate = new Date(redeem.expires)

    if (now.getTime() > expirationDate.getTime()) {
      log.error({err: 'expired', redeem: id}, 'tried to redeem an expired code')
      return cb(Boom.notAcceptable('expired redeem code'))
    }

    cb(null, redeem.toObject({ getters: true }))
  })
}

function remove (id, achievement, cb) {
  cb = cb || achievement // achievement and user are optional

  Redeem.findOne({id: id}, (err, redeem) => {
    if (err) {
      log.error({err: err, redeem: id}, 'error deleting redeem')
      return cb(Boom.internal())
    }
    if (!redeem) {
      log.error({err: 'not found', redeem: id}, 'error deleting redeem')
      return cb(Boom.notFound())
    }

    let user = redeem.user
    let achievement = redeem.achievement
    let filter = { id: id }

    if (achievement && user) {
      filter = {user: user, achievement: achievement}
    }

    Redeem.remove(filter, (err, redeems) => {
      return cb(null, redeems)
    })
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

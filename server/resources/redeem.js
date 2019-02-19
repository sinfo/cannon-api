const Boom = require('boom')
const server = require('../').hapi
const log = require('../helpers/logger')
const Redeem = require('../db/redeem')
const Achievement = require('../db/achievement')
const uuid = require('uuid')

server.method('redeem.create', create, {})
server.method('redeem.get', get, {})
server.method('redeem.remove', remove, {})
server.method('redeem.prepareRedeemCodes', prepareRedeemCodes, {})
server.method('redeem.use', use, {})

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

function use (redeem, userId, cb) {
  if (redeem === null) {
    log.error({err: err, redeem: redeem.id}, 'redeem code not found')
    return cb(Boom.notAcceptable())
  }

  if (redeem.achievement === null) {
    log.error({err: err, achievement: redeem.achievement}, 'achievement of redeem not found')
    return cb(Boom.notAcceptable())
  }

  if (redeem.available !== undefined && redeem.available <= 0) {
    log.info({err: err, user: userId, redeem: redeem.id}, 'redeem code not available anymore')
    return cb(Boom.notAcceptable())
  }

  Achievement.findOne({ id: redeem.achievement }, (err, achievement) => {
    if (err) {
      log.error({err: err, achievement: achievement.id}, 'achievement of redeem not found')
      return cb(Boom.notAcceptable())
    }

    let now = new Date().getTime()
    
    if (achievement.validity !== undefined
      && (achievement.validity.from.getTime() > now || achievement.validity.to.getTime() < now) ) {
        log.info({err: err, user: userId, redeem: redeem.id}, 'achievement expired')
        return cb(Boom.notAcceptable())
      }

    let users = achievement.users

    if (users === undefined || users.length === undefined) {
      log.error({err: err, user: userId}, 'user not given')
      return cb(Boom.notAcceptable())
    }

    let alreadyRedeemed = users.filter(u => u === userId).length > 0

    if (alreadyRedeemed) {
      log.info({err: err, user: userId, redeem: redeem.id}, 'user already used the redeem code')
      return cb(Boom.notAcceptable())
    }

    let available = redeem.available - 1

    Redeem.findOneAndUpdate({id: redeem.id}, { $set: { available: available }}, (err, redeem) => {
      if (err) {
        log.error({err: err, redeem: id}, 'error using redeem code')
        return cb(Boom.internal())
      }

      if (!redeem) {
        log.error({err: 'not found', redeem: id}, 'error using redeem')
        return cb(Boom.notFound())
      }

      log.info({ id: redeem.id, achievement: achievement.id, user: userId }, 'redeem code redeemed')
  
      return cb(null, redeem)
    })
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

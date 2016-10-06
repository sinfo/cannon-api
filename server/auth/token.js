
var jwt = require('jsonwebtoken')
var Boom = require('boom')
var log = require('../helpers/logger')
var User = require('../db/user')
var authConfig = require('../../config').auth
var async = require('async')

function getJWT (user) {
  var date = Date.now()
  var tokenOptions = {
    algorithm: authConfig.token.algorithm,
    expiresInMinutes: authConfig.token.ttl,
    issuer: authConfig.token.issuer,
    audience: authConfig.token.audience
  }
  var refreshOptions = {
    algorithm: authConfig.refreshToken.algorithm,
    expiresInMinutes: authConfig.refreshToken.ttl,
    issuer: authConfig.refreshToken.issuer,
    audience: authConfig.refreshToken.audience
  }
  var token = jwt.sign({user: user, date: date}, authConfig.token.privateKey, tokenOptions)
  var refreshToken = jwt.sign({user: user, refresh: true, date: date}, authConfig.refreshToken.privateKey, refreshOptions)
  return {token: token, refreshToken: refreshToken, ttl: authConfig.token.ttl, date: date}
}

function removeToken (token, user, cb) {
  var filter = cb ? {id: user} : {bearer: {$elemMatch: {token: token}}}
  var update = {$pull: {bearer: {token: token}}}
  cb = (cb || user)

  User.findOneAndUpdate(filter, update, function (err, result) {
    if (err) {
      log.error({err: err, requestedUser: user}, '[Auth] error removing expired token')
      return cb(Boom.internal())
    }
    cb(null, result)
  })
}

function validator (token, config, cb) {
  var isValid = false
  var credentials = {}
  var user
  var bearer
  var query = {bearer: {$elemMatch: {token: token}}}

  async.series([
    function findUser (callback) {
      User.findOne(query, function (error, result) {
        if (error) {
          log.error({err: error, token: token}, '[Auth] error finding user')
          return callback(Boom.unauthorized())
        }
        if (!result) {
          log.error({err: error, token: token}, '[Auth] user not found')
          return callback(Boom.unauthorized())
        }
        user = result.toObject({ getters: true })
        bearer = user.bearer
        callback()
      })
    },
    function verify (callback) {
      verifyToken(user.id, token, false, function (err, decoded) {
        if (err) return callback(Boom.unauthorized())
        async.each(bearer, checkToken, function (error) {
          if (error) {
            log.error({err: error}, '[Auth] error running throw user tokens')
            return callback(Boom.unauthorized())
          }
          return callback()
        })
      })
    }
  ], function done (err) {
    cb(err, isValid, credentials)
  })

// aux check token func used in the async
  function checkToken (userBearer, callback) {
    if (userBearer.token === token) {
      isValid = true
      credentials.user = user
      credentials.bearer = userBearer
      credentials.scope = user.role
    }
    callback()
  }
}

// given a user check if it matches the one in the token
function verifyToken (id, token, refresh, cb) {
  var config = refresh ? authConfig.refreshToken : authConfig.token

  jwt.verify(token, config.publicKey, {audience: config.audience, issuer: config.issuer}, function (err, decoded) {
    if (err) {
      log.warn({err: err, token: decoded}, '[Auth] invalid token')
      return cb(Boom.unauthorized())
    }

    if ((refresh && !decoded.refresh) || (!refresh && decoded.refresh)) {
      log.warn({refresh: refresh, token: decoded}, '[Auth] invalid usage of token')
      return cb(Boom.unauthorized())
    }

    if (id !== decoded.user) {
      log.warn({user: id, token: decoded}, '[Auth] user in token payload does not match user')
      return cb(Boom.unauthorized())
    }

    cb(err, decoded)
  })
}

module.exports.verifyToken = verifyToken
module.exports.validator = validator
module.exports.getJWT = getJWT
module.exports.removeToken = removeToken

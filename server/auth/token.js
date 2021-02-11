const jwt = require('jsonwebtoken')
const Boom = require('boom')
const log = require('../helpers/logger')
const User = require('../db/user')
const tokenConfig = require('../../config').auth.token

function createJwt (userId) {
  const options = {
    algorithm: tokenConfig.algorithm,
    expiresIn: tokenConfig.expiresIn,
    issuer: tokenConfig.issuer
  }
  const token = jwt.sign({ userId }, tokenConfig.privateKey, options)
  return { token }
}

function verify (token, cb) {
  let credentials = {}
  let isValid = false

  jwt.verify(token, tokenConfig.publicKey, { issuer: tokenConfig.issuer }, (err, decoded) => {
    if (err) {
      log.warn({ err, tokenDecoded: decoded }, '[Auth] invalid token')
      return cb(Boom.unauthorized(), isValid)
    }

    User.findOne({ id: decoded.userId }, (err, user) => {
      if (err) {
        log.error({ err, token }, '[Auth] error finding user')
        return cb(Boom.unauthorized(), isValid)
      }
      if (!user) {
        log.error({ err, token }, '[Auth] user not found')
        return cb(Boom.unauthorized(), isValid)
      }
      credentials.user = user.toObject({ getters: true })
      credentials.scope = user.role
      isValid = true
      cb(null, isValid, credentials)
    })
  })
}

module.exports.verify = verify
module.exports.createJwt = createJwt

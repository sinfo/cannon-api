const jwt = require('jsonwebtoken')
const Boom = require('@hapi/boom')
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
  log.info(token)
  return { token }
}

async function verify (request, token, h) {
  let credentials = {}
  let isValid = false

  decoded = jwt.verify(token, tokenConfig.publicKey, { issuer: tokenConfig.issuer })

  let user = await User.findOne({ id: decoded.userId })

  if (!user) {
    log.error({ token }, '[Auth] user not found')
    throw Boom.unauthorized()
  }

  credentials.user = user.toObject({ getters: true })
  credentials.scope = user.role
  isValid = true
  return { isValid, credentials }
}

module.exports.verify = verify
module.exports.createJwt = createJwt

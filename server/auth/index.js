const config = require('../../config')
const Token = require('./token')

const basic = function (username, password, cb) {
  Token.validator(password, config.auth.token, cb)
}

const bearer = function (token, cb) {
  Token.validator(token, config.auth.token, cb)
}

const internal = function (username, password, cb) {
  const isValid = (username === config.auth.internal.username && password === config.auth.internal.password)

  cb(null, isValid, { id: username })
}

module.exports = {
  bearer: bearer,
  basic: basic,
  internal: internal
}

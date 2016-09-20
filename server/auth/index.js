
var tokenConfig = require('config').auth.token
var Token = require('server/auth/token')
var config = require('config')

var basic = function (username, password, cb) {
  Token.validator(password, tokenConfig, cb)
}

var bearer = function (token, cb) {
  Token.validator(token, tokenConfig, cb)
}

var internal = function (username, password, cb) {
  var isValid = (username === config.auth.internal.username && password === config.auth.internal.password)

  cb(null, isValid, { id: username })
}

module.exports = {
  bearer: bearer,
  basic: basic,
  internal: internal
}

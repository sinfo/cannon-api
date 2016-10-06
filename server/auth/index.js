
var config = require('../../config')
var Token = require('./token')

var basic = function (username, password, cb) {
  Token.validator(password, config.auth.token, cb)
}

var bearer = function (token, cb) {
  Token.validator(token, config.auth.token, cb)
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

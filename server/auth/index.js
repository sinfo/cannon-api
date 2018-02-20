const config = require('../../config')
const token = require('./token')

const basic = function (username, password, cb) {
  token.verify(password, cb)
}

const bearer = function (token, cb) {
  token.verify(token, cb)
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

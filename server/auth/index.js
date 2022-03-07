const config = require('../../config')
const verify = require('./token').verify

const bearer = (token, cb) => {
  verify(token, cb)
}

const internal = (username, password, cb) => {
  const isValid = (username === config.auth.internal.username && password === config.auth.internal.password)

  cb(null, isValid, { id: username })
}

module.exports = {
  bearer: verify,
  internal: internal
}

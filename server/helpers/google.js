const Request = require('request')
const log = require('./logger')
const googleConfig = require('../../config').google

const google = {}

google.debugToken = function (googleUserId, googleUserToken, cb) {
  const url = 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + googleUserToken

  Request.get(url, {
    json: true
  },
  (error, response, result) => {
    /* jshint camelcase: false */
    if (error || response.statusCode !== 200) {
      log.warn({err: error, googleConfig: googleConfig, response: response})
      return cb(error || {err: response.statusCode, message: response.statusMessage})
    }

    const isValid = !(!result || result.issued_to !== googleConfig.clientId || result.user_id !== googleUserId)

    if (!isValid) {
      log.warn(
        {
          'result-app-id': result.issued_to,
          'config-app-id': googleConfig.clientId,
          'result-user-id': result.user_id,
          'requested-user-id': googleUserId
        },
        'invalid google login!'
      )
    }

    cb(null, isValid)
  })
}

google.getMe = function (googleUserId, cb) {
  const url = ' https://www.googleapis.com/plus/v1/people/' + googleUserId + '?key=' + googleConfig.clientSecret

  Request.get(url, {
    json: true
  },
  (error, response, result) => {
    if (error || response.statusCode !== 200) {
      return cb(error || {err: response.statusCode, message: response.statusMessage})
    }

    cb(null, result)
  })
}

google.getMail = function (googleUserToken, cb) {
  const url = 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + googleUserToken

  Request.get(url, {
    json: true
  },
  (error, response, result) => {
    if (error || response.statusCode !== 200) {
      return cb(error || {err: response.statusCode, message: response.statusMessage})
    }

    cb(null, result.email)
  })
}

module.exports = google

const Request = require('request')
const { OAuth2Client } = require('google-auth-library')
const log = require('./logger')
const googleConfig = require('../../config').google

const google = {}

google.debugToken = function (googleUserId, googleUserToken, cb) {
  let oAuth2Client = new OAuth2Client(googleConfig.clientId, googleConfig.clientSecret)
  oAuth2Client.verifyIdToken({
    idToken: googleUserToken,
    audience: googleConfig.clientId
  }, (err, login) => {
    if (err) {
      log.warn(err)
      return cb(err)
    }
    log.debug(login)
    const auth = login.payload
    const isValid = !(!login || auth.aud !== googleConfig.clientId || auth.sub !== googleUserId)
    const url = `https://www.googleapis.com/plus/v1/people/me`
    oAuth2Client.request({ url })
      .then(result => {
        log.debug(result)
      })
      .catch(error => {
        if (error) {
          log.debug(error)
        }
      })

    if (!isValid) {
      log.warn(
        {
          'result-app-id': auth.aud,
          'config-app-id': googleConfig.clientId,
          'result-user-id': auth.sub,
          'requested-user-id': googleUserId
        },
        'invalid google login!'
      )
    }

    cb(null, isValid)
  })
}

google.getMe = function (googleUserToken, cb) {
  let oAuth2Client = new OAuth2Client(googleConfig.clientId, googleConfig.clientSecret)
  const url = `https://www.googleapis.com/plus/v1/people/me`
  oAuth2Client.request({ url })
    .then(result => {
      log.debug(result)
      return cb(null, result)
    })
    .catch(error => {
      if (error) {
        log.error(error)
        return cb(error)
      }
    })

  /* Request.get(url, {
    json: true
  },
  (error, response, result) => {
    if (error || response.statusCode !== 200) {
      return cb(error || {err: response.statusCode, message: response.statusMessage})
    }
    log.debug(result)
    cb(null, result)
  }) */
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

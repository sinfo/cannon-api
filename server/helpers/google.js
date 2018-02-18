const { OAuth2Client } = require('google-auth-library')
const server = require('../').hapi
const log = require('./logger')
const googleConfig = require('../../config').google

const google = {}

/**
 * Verifies the JWT signature, the aud claim, the exp claim, and the iss claim.
 * @param {string} googleUserId
 * @param {string} googleUserToken
 */
google.verifyToken = (googleUserId, googleUserToken) => {
  return new Promise((resolve, reject) => {
    const oAuth2Client = new OAuth2Client(googleConfig.clientId, googleConfig.clientSecret)
    oAuth2Client.verifyIdToken({
      idToken: googleUserToken,
      audience: googleConfig.clientId
    }, (err, login) => {
      if (err) {
        log.warn(err)
        return reject(err)
      }
      // If verified we can trust in the login.payload
      return resolve(login.payload)
    })
  })
}

/**
 * Get user in cannon DB by mail associated with Google account
 * @param {object} gUser Google User Profile
 * @param {string} gUser.sub Google User Id
 * @param {string} gUser.email
 * @param {string} gUser.name
 * @param {string} gUser.picture Profile image
 */
google.getUser = gUser => {
  return new Promise((resolve, reject) => {
    server.methods.user.get({ 'mail': gUser.email }, (err, user) => {
      if (err) {
        if (err.output && err.output.statusCode !== 404) {
          log.error({ err: err, google: gUser }, '[google-login] error getting user by google email')
          return reject(err)
        }
        // If does not find a user with a given Google email, we create a new user (KEEP IT SIMPLE)
        return resolve({ createUser: true, gUser })
      }
      // A user exist with a given Google email, we only need to update 'google.id' and 'img' in DB
      return resolve({ createUser: false, userId: user.id })
    })
  })
}

google.createUser = gUser => {
  return new Promise((resolve, reject) => {
    const user = {
      google: {
        id: gUser.sub
      },
      name: gUser.name,
      mail: gUser.email,
      img: gUser.picture
    }

    log.debug('[google-login] creating user', user)

    server.methods.user.create(user, (err, result) => {
      if (err) {
        log.error({ user }, '[google-login] error creating user')
        return reject(err)
      }

      log.debug({ userId: result.id }, '[google-login] new user created')

      return resolve(result.id)
    })
  })
}

module.exports = google

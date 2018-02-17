const { OAuth2Client } = require('google-auth-library')
const server = require('../').hapi
const log = require('./logger')
const googleConfig = require('../../config').google

const google = {}

google.verifyToken = (googleUserId, googleUserToken) => {
  return new Promise((resolve, reject) => {
    const oAuth2Client = new OAuth2Client(googleConfig.clientId, googleConfig.clientSecret)
    /**
     * The verifyIdToken function verifies the JWT signature, the aud claim,
     * the exp claim, and the iss claim.
     */
    oAuth2Client.verifyIdToken({
      idToken: googleUserToken,
      audience: googleConfig.clientId
    }, (err, login) => {
      if (err) {
        log.warn(err)
        return reject(err)
      }
      log.debug(login)

      // If verified we can trust in the login.payload
      return resolve(login.payload)
    })
  })
}

google.getUser = gUser => {
  return new Promise((resolve, reject) => {
    server.methods.user.get({ 'google.id': gUser.sub }, (err, user) => {
      if (err) {
        if (!err.output || err.output.statusCode !== 404) {
          log.error({ err: err, google: gUser.sub }, '[google-login] error getting user')
          return reject(err)
        }
        return createUser(gUser)
          .then(userId => resolve(userId))
          .catch(err => reject(err))
      }
      return resolve(user.id)
    })
  })
}

const createUser = gUser => {
  return new Promise((resolve, reject) => {
    let changedAttributes = {}
    let filter = {}

    filter = { mail: gUser.email }

    changedAttributes = {
      google: {
        id: gUser.sub,
        img: gUser.picture
      }
    }

    // If user does not exist, lets set the id, name and email
    changedAttributes.$setOnInsert = {
      id: Math.random().toString(36).substr(2, 20), // generate random id
      name: `${gUser.given_name} ${gUser.family_name}`,
      mail: gUser.email
    }

    server.methods.user.update(filter, changedAttributes, {upsert: true}, (err, result) => {
      if (err) {
        log.error({ user: { mail: gUser.email }, changedAttributes: changedAttributes }, '[google-login] error creating or updating user')
        return reject(err)
      }

      log.debug({id: result.id}, '[google-login] created or updated user')

      return resolve(result.id)
    })
  })
}

module.exports = google

const request = require('request')
const server = require('../').hapi
const log = require('./logger')
const facebookConfig = require('../../config').facebook

const facebook = {}

facebook.verifyToken = (facebookUserId, facebookUserToken) => {
  return new Promise((resolve, reject) => {
    const url = `https://graph.facebook.com/debug_token?input_token=${facebookUserToken}&access_token=${facebookConfig.clientId}|${facebookConfig.clientSecret}`

    request.get(url, { json: true }, (error, response, result) => {
      if (error || response.statusCode !== 200) {
        log.warn({ error, facebookConfig, response: response.statusMessage })
        return reject('invalid facebook token')
      }

      const isValid = !(!result.data || result.data.app_id !== facebookConfig.clientId || result.data.user_id !== facebookUserId)

      if (!isValid) {
        log.warn(
          {
            'result-app-id': result.data.app_id,
            'config-app-id': facebookConfig.clientId,
            'result-user-id': result.data.user_id,
            'requested-user-id': facebookUserId
          },
          'invalid facebook login!'
        )
        return reject('invalid facebook login')
      }

      return resolve(result)
    })
  })
}

facebook.getFacebookUser = facebookUserToken => {
  return new Promise((resolve, reject) => {
    const url = `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${facebookUserToken}`

    request.get(url, { json: true }, (error, response, fbUser) => {
      if (error || response.statusCode !== 200) {
        log.warn({ error, response: response.statusMessage })
        return reject('error getting facebook user profile')
      }

      return resolve(fbUser)
    })
  })
}

/**
 * Get user in cannon DB by mail associated with Facebook account
 * @param {object} fbUser Facebook User profile
 * @param {string} fbUser.id User Id
 * @param {string} fbUser.email
 * @param {string} fbUser.name
 * @param {string} fbUser.picture.data.url Profile image
 */
facebook.getUser = fbUser => {
  return new Promise((resolve, reject) => {
    server.methods.user.get({ 'mail': fbUser.email }, (err, user) => {
      if (err) {
        if (err.output && err.output.statusCode !== 404) {
          log.error({ err: err, facebook: fbUser }, '[facebook-login] error getting user by facebook email')
          return reject(err)
        }
        // If does not find a user with a given facebook email, we create a new user (KEEP IT SIMPLE)
        return resolve({ createUser: true, fbUser })
      }
      // A user exist with a given Facebook email, we only need to update 'facebook.id' and 'img' in DB
      return resolve({ createUser: false, userId: user.id })
    })
  })
}

facebook.createUser = fbUser => {
  return new Promise((resolve, reject) => {
    const user = {
      facebook: {
        id: fbUser.id
      },
      name: fbUser.name,
      mail: fbUser.email,
      img: fbUser.picture.data.url
    }

    log.debug('[facebook-login] creating user', user)

    server.methods.user.create(user, (err, result) => {
      if (err) {
        log.error({ user }, '[facebook-login] error creating user')
        return reject(err)
      }

      log.debug({ userId: result.id }, '[facebook-login] new user created')

      return resolve(result.id)
    })
  })
}

module.exports = facebook

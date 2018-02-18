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
      log.debug(fbUser)
      return resolve(fbUser)
    })
  })
}

facebook.getUser = fbUser => {
  return new Promise((resolve, reject) => {
    server.methods.user.get({ 'facebook.id': fbUser.user_id }, (err, user) => {
      if (err) {
        if (err.output && err.output.statusCode !== 404) {
          log.error({ err: err, facebook: fbUser }, '[facebook-login] error getting user')
          return reject(err)
        }
        return resolve({ createUser: true, fbUser })
      }
      // We do not need to create a new user
      return resolve({ createUser: false, userId: user.id })
    })
  })
}

facebook.createUser = fbUser => {
  return new Promise((resolve, reject) => {
    let changedAttributes = {
      facebook: {
        id: fbUser.user_id
      }
    }
    log.debug('create user', fbUser)
    // If user does not exist, lets set the id, name and email
    changedAttributes.$setOnInsert = {
      id: Math.random().toString(36).substr(2, 20), // generate random id
      name: fbUser.name,
      mail: fbUser.email,
      img: fbUser.picture.data.url
    }

    server.methods.user.update({ mail: fbUser.email }, changedAttributes, {upsert: true}, (err, result) => {
      if (err) {
        log.error({user: { mail: fbUser.email }, changedAttributes: changedAttributes}, '[facebook-login] error creating or updating user')
        return reject(err)
      }

      log.debug({ userId: result.id }, '[facebook-login] created or updated user')

      return resolve(result.id)
    })
  })
}

module.exports = facebook

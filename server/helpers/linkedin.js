const server = require('../').hapi
const request = require('request')
const log = require('./logger')
const linkedinConfig = require('../../config').linkedin

const LI_API_URL = 'https://www.linkedin.com/oauth/v2'
const linkedin = {}

linkedin.getToken = code => {
  return new Promise((resolve, reject) => {
    const url = `${LI_API_URL}/accessToken?grant_type=authorization_code&code=${code}&redirect_uri=${linkedinConfig.redirectUri}&client_id=${linkedinConfig.clientId}&client_secret=${linkedinConfig.clientSecret}`

    request.post(url, { json: true }, (error, response, result) => {
      if (error || response.statusCode !== 200) {
        log.warn({ error, linkedinConfig, response: response.statusMessage })
        return reject('invalid LinkedIn token')
      }
      console.log(result)
      return resolve(result.access_token)
    })
  })
}

linkedin.getLinkedinUser = linkedinUserToken => {
  return new Promise((resolve, reject) => {
    const urlProfile = 'https://api.linkedin.com/v1/people/~:(id,firstName,lastName,picture-urls::(original),emailAddress)?format=json'

    request.get(urlProfile, {
      json: true,
      auth: {
        'bearer': linkedinUserToken
      }
    }, (error, response, linkedinUser) => {
      if (error || response.statusCode !== 200) {
        log.warn({ error, response: response.statusMessage })
        return reject('error getting linkedIn user profile')
      }
      console.log(linkedinUser)
      return resolve(linkedinUser)
    })
  })
}

/**
 * Get user in cannon DB by mail associated with LinkedIn account
 * @param {object} linkedinUser linkedin User Profile
 * @param {string} linkedinUser.id linkedin User Id
 * @param {string} linkedinUser.emailAddress
 * @param {string} linkedinUser.firstName
 * @param {string} linkedinUser.lastName
 * @param {string} linkedinUser.pictureUrls.values[0] Profile image
 */
linkedin.getUser = linkedinUser => {
  return new Promise((resolve, reject) => {
    server.methods.user.get({ 'mail': linkedinUser.emailAddress }, (err, user) => {
      if (err) {
        // If does not find a user with a given linkedin email, we create a new user
        if (err.output && err.output.statusCode === 404) {
          return resolve({ createUser: true, linkedinUser })
        }

        log.error({ err: err, linkedinUser }, '[linkedin-login] error getting user by linkedin email')
        return reject(err)
      }

      // A user exist with a given linkedin email, we only need to update 'linkedin.id' and 'img' in DB
      return resolve({ createUser: false, userId: user.id })
    })
  })
}

linkedin.createUser = linkedinUser => {
  return new Promise((resolve, reject) => {
    const user = {
      linkedin: {
        id: linkedinUser.id
      },
      name: `${linkedinUser.firstName} ${linkedinUser.lastName}`,
      mail: linkedinUser.emailAddress,
      img: linkedinUser.pictureUrls.values[0]
    }

    log.debug('[linkedin-login] creating user', user)

    server.methods.user.create(user, (err, result) => {
      if (err) {
        log.error({ user }, '[linkedin-login] error creating user')
        return reject(err)
      }

      log.debug({ userId: result.id }, '[linkedin-login] new user created')

      return resolve(result.id)
    })
  })
}

module.exports = linkedin

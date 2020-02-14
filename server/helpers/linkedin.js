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
        log.warn({
          error,
          linkedinConfig: {
            clientId: linkedinConfig.clientId,
            redirectUri: linkedinConfig.redirectUri
          },
          response: response.statusMessage
        })
        return reject('invalid Linkedin token')
      }
      return resolve(result.access_token)
    })
  })
}

linkedin.getLinkedinUser = linkedinUserToken => {
  return new Promise((resolve, reject) => {
    const urlProfile = 'https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))'

    request.get(urlProfile, {
      json: true,
      auth: {
        'bearer': linkedinUserToken
      }
    }, (error, response, linkedinJsonUser) => {

      if (error || response.statusCode !== 200) {
        log.warn({ error, response: response.statusMessage })
        return reject('error getting linkedin user profile')
      }


      linkedin.getLinkedinUserEmail(linkedinUserToken)
        .then(linkedinEmail => {

          let linkedinUser = {
            id: linkedinJsonUser.id,
            emailAddress: linkedinEmail,
            firstName: Object.keys(linkedinJsonUser.firstName.localized).map(key => linkedinJsonUser.firstName.localized[key])[0],
            lastName: Object.keys(linkedinJsonUser.lastName.localized).map(key => linkedinJsonUser.lastName.localized[key])[0],
            pictureUrl: linkedinJsonUser.profilePicture['displayImage~'].elements[0].identifiers[0].identifier
          }

        return resolve(linkedinUser)
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
    })
  })
}

linkedin.getLinkedinUserEmail = linkedinUserToken => {
  return new Promise((resolve, reject) => {
    const emailUrl = 'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))'

    request.get(emailUrl, {
      json: true,
      auth: {
        'bearer': linkedinUserToken
      }
    }, (error, response, linkedinEmail) => {

      if (error || response.statusCode !== 200) {
        log.warn({ error, response: response.statusMessage })
        return reject('error getting linkedin user email')
      }

      console.log('email ' + linkedinEmail)

      return resolve(linkedinEmail)
    })
  })
}




/**
 * Get user in cannon DB by mail associated with Linkedin account
 * @param {object} linkedinUser linkedin User Profile
 * @param {string} linkedinUser.id linkedin User Id
 * @param {string} linkedinUser.emailAddress
 * @param {string} linkedinUser.firstName
 * @param {string} linkedinUser.lastName
 * @param {string} linkedinUser.pictureUrl Profile image
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
      img: linkedinUser.pictureUrl
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

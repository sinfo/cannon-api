const server = require('../').hapi
const axios = require('axios').default
const log = require('./logger')

const linkedin = {}

linkedin.getLinkedinUser = async accessToken => {
    const urlProfile = 'https://api.linkedin.com/v2/userinfo'

    let response = await axios.get(urlProfile, {
      json: true,
      headers: {
        'Authorization':`Bearer ${accessToken}`
      }
    }).catch((error) => {
        log.warn({ error, where: 'getLinkedinUser'})
        throw error
    })

    if (response.status !== 200) {
      log.error('error fetching linkedin user')
      throw new Error('error fetching linkedin user')
    }

    let linkedinJsonUser = response.data

    let linkedinUser = {
      id: linkedinJsonUser.sub,
      emailAddress: linkedinJsonUser.email,
      firstName: linkedinJsonUser.given_name,
      lastName: linkedinJsonUser.family_name,
      pictureUrl: linkedinJsonUser.picture
    }

    return linkedinUser
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
linkedin.getUser = async linkedinUser => {
  let user = await server.methods.user.get({ 'mail': linkedinUser.emailAddress }).catch((err) => {
    log.error({ err: err, linkedinUser }, '[linkedin-login] error getting user by linkedin email')
    throw err
  })

  if (user) {
    return {
      createUser: false,
      userId: user.id
    }
  } else {
    return {
      createUser: true
    }
  }
}

linkedin.createUser = async linkedinUser => {
  const user = {
    linkedin: {
      id: linkedinUser.id
    },
    name: `${linkedinUser.firstName} ${linkedinUser.lastName}`,
    mail: linkedinUser.emailAddress,
    img: linkedinUser.pictureUrl
  }

  log.debug('[linkedin-login] creating user', user)

  let result = await server.methods.user.create(user).catch((err) => {
    log.error({ user }, '[linkedin-login] error creating user')
    throw err
  })
  log.debug({ userId: result.id }, '[linkedin-login] new user created')
  return result.id
}

module.exports = linkedin

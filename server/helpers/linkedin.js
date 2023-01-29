const server = require('../').hapi
const axios = require('axios').default
const log = require('./logger')
const linkedinConfig = require('../../config').linkedin

const LI_API_URL = 'https://www.linkedin.com/oauth/v2'
const linkedin = {}

linkedin.getToken = async code => {
  log.info(code)
  const url = `${LI_API_URL}/accessToken?grant_type=authorization_code&code=${code}&redirect_uri=${linkedinConfig.redirectUri}&client_id=${linkedinConfig.clientId}&client_secret=${linkedinConfig.clientSecret}`

  let response = await axios.post(url,null, { json: true }).catch((error) => {
      log.warn({
        error,
        linkedinConfig: {
          clientId: linkedinConfig.clientId,
          redirectUri: linkedinConfig.redirectUri
        },
        where: 'getToken'
      })
      throw err
    })
  if(response.status !== 200){
    throw new Error('invalid token')
  }  
  log.info(response.data)
  return response.data.access_token
}

linkedin.getLinkedinUser = async linkedinUserToken => {
    const urlProfile = 'https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))'
    log.info(linkedinUserToken)
    let response = await axios.get(urlProfile, {
      json: true,
      headers: {
        'Authorization':`Bearer ${linkedinUserToken}`
      }
    }).catch((error) => {
        log.warn({ error, where: 'getLinkedinUser'})
        throw error
    })

    if(response.status !== 200){
      log.error('error fetching linkedin user')
      throw new Error('error fetching linkedin user')
    }

    let linkedinJsonUser = response.data

    let linkedinEmail = await  linkedin.getLinkedinUserEmail(linkedinUserToken).catch(err => {
      log.error(err)
      throw err
    })
    let linkedinUser = {
      id: linkedinJsonUser.id,
      emailAddress: linkedinEmail,
      firstName: Object.keys(linkedinJsonUser.firstName.localized).map(key => linkedinJsonUser.firstName.localized[key])[0],
      lastName: Object.keys(linkedinJsonUser.lastName.localized).map(key => linkedinJsonUser.lastName.localized[key])[0],
      pictureUrl: linkedinJsonUser.profilePicture['displayImage~'].elements[0].identifiers[0].identifier
    }

    return linkedinUser
}

linkedin.getLinkedinUserEmail = async linkedinUserToken => {
  const emailUrl = 'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))'

  let response = await axios.get(emailUrl, {
    json: true,
    headers: {
      'Authorization':`Bearer ${linkedinUserToken}`
    }
  }).catch((error) => {
    if (error) {
      log.warn({ error, where: 'getLinkedinUserEmail'})
      throw error
    }
  })

  if(response.status !== 200){
    log.error('error fetching linkedin user email')
    throw new Error('error fetching linkedin user email')
  }

  let linkedinEmail = response.data

  if (typeof (linkedinEmail) === 'string') {
    return linkedinEmail
  }

  if (!linkedinEmail['elements'] ||
    !linkedinEmail['elements'].length ||
    !linkedinEmail['elements'][0]['handle~'] ||
    !linkedinEmail['elements'][0]['handle~']['emailAddress']) {
    throw new Error(`Couldn\t find email in ${JSON.stringify(linkedinEmail)}`)
  }

  return linkedinEmail['elements'][0]['handle~']['emailAddress']
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

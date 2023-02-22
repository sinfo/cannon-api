const server = require('../').hapi
const log = require('./logger')
const fenixConfig = require('../../config').fenix
const axios = require('axios').default
const qs = require('qs')

const fenix = {}

fenix.getToken = async function(code) {
  const queryParams = {
    client_id: fenixConfig.clientId,
    client_secret: fenixConfig.clientSecret,
    redirect_uri: fenixConfig.redirectUri,
    code: code,
    grant_type: 'authorization_code'
  }

  const options = {
    url: fenixConfig.oauthUrl + 'access_token?'+ qs.stringify(queryParams),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
  }

  let response = await axios.post(options.url, options.headers, { json: true }).catch((error) => {
    log.warn({
      error,
      fenixConfig: fenixConfig,
      where: 'getToken'
    })

    throw error
  })

  if(response.status !== 200){
    throw new Error('[Fenix-Auth] Invalid token')
  }  

  log.info(response.data)
  return response.data.access_token
}

fenix.getFenixUser = async function(token) {
  const options = {
    url: fenixConfig.url + 'person?access_token=' + encodeURIComponent(token)
  }

  let response = await axios.get(options.url, null, { json: true }).catch((error) => {
    log.warn({
      error,
      where: 'getFenixUser'
    })

    throw error
  })

  if(response.status !== 200){
    throw new Error('[Fenix-Auth] Error getting person')
  }  

  return response.data
}

/**
 * Get user in cannon DB by mail associated with Fenix account
 * @param {*} fenixUser.name
 * @param {*} fenixUser.email
 * @param {string} fenixUser.username Fenix ID (e.g. ist112345)
 */
fenix.getUser = async function (fenixUser) {
  let user = await server.methods.user.get({ 'mail': fenixUser.email }).catch((err) => {
    log.error({ err, fenixUser }, '[Fenix-Auth] Error getting user')
    throw err
  })

  // A user exist with a given Fenix email, we only need to update 'fenix.id' and 'img' in DB
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

fenix.createUser = async function(fenixUser) {
  const user = {
    fenix: {
      id: fenixUser.username
    },
    name: fenixUser.name,
    mail: fenixUser.email,
    img: `https://fenix.tecnico.ulisboa.pt/user/photo/${fenixUser.username}`
  }

  log.debug('[Fenix-Auth] Creating a new user', user)

  let result = await server.methods.user.create(user).catch((err) => {
    log.error({ user }, '[Fenix-Auth] Error creating user')
    throw err
  })

  log.debug({ userId: result.id }, '[Fenix-Auth] New user created')
  return result.id
}

module.exports = fenix

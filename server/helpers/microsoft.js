const server = require('../').hapi
const axios = require('axios').default
const log = require('./logger')
const microsoftConfig = require('../../config').microsoft

const microsoft = {}

async function fetch (endpoint, accessToken) {
  const options = {
    json: true,
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  }

  const path = microsoftConfig.url + endpoint
  log.info(`[Microsoft-Auth] Request made to ${path} at: ` + new Date().toString())

  try {
    const response = await axios.get(path, options)

    if (response.status !== 200) {
      log.error('[Microsoft-Auth] Error fetching Microsoft user info')
      throw new Error('[Microsoft-Auth] Error fetching Microsoft user info')
    }

    return response.data
  } catch (error) {
    throw new Error(error)
  }
}

microsoft.getMicrosoftUser = async (accessToken) => {
  return fetch('/oidc/userinfo', accessToken)
}

microsoft.getUser = async (microsoftUser) => {
  const mail = microsoftUser.email || microsoftUser.mail || microsoftUser.userPrincipalName || microsoftUser.preferred_username
  const user = await server.methods.user.get({ mail: mail }).catch((err) => {
    log.error({ err: err, microsoftUser }, '[Microsoft-Auth] Error getting user by Microsoft email')
    throw err
  })

  if (user) {
    return {
      createUser: false,
      userId: user.id,
      user
    }
  } else {
    return {
      createUser: true
    }
  }
}

microsoft.createUser = async function (microsoftUser) {
  const name = microsoftUser.name || microsoftUser.displayName || [microsoftUser.given_name || microsoftUser.givenName, microsoftUser.family_name || microsoftUser.surname].filter(Boolean).join(' ') || undefined
  const mail = microsoftUser.email || microsoftUser.mail || microsoftUser.userPrincipalName || microsoftUser.preferred_username
  const user = {
    microsoft: {
      id: microsoftUser.sub || microsoftUser.id
    },
    name: name,
    mail: mail
  }

  log.debug('[Microsoft-Auth] Creating a new user', user)

  const result = await server.methods.user.create(user).catch((err) => {
    log.error({ user }, '[Microsoft-Auth] Error creating user')
    throw err
  })

  log.debug({ userId: result.id }, '[Microsoft-Auth] New user created')
  return result.id
}

module.exports = microsoft

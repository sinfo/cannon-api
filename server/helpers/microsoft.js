const server = require('../').hapi
const axios = require('axios').default
const log = require('./logger')
const microsoftConfig = require('../../config').microsoft

const microsoft = {}

async function fetch(endpoint, accessToken) {
    const options = {
        json: true,
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    };

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

microsoft.getEmail = (microsoftUser) => {
    return microsoftUser.mail ? microsoftUser.mail : microsoftUser.userPrincipalName;
}

microsoft.getProfilePicture = async (accessToken) => {
    return fetch('/v1.0/me/photo/$value', accessToken)
}

microsoft.getMicrosoftUser = async (accessToken) => {
    return fetch('/v1.0/me', accessToken)
}

microsoft.getUser = async (microsoftUser) => {
    const mail = microsoft.getEmail(microsoftUser)
    let user = await server.methods.user.get({ 'mail': mail }).catch((err) => {
        log.error({ err: err, microsoftUser }, '[Microsoft-Auth] Error getting user by Microsoft email')
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

microsoft.createUser = async function (microsoftUser) {
    const user = {
        microsoft: {
            id: microsoftUser.id
        },
        name: microsoftUser.displayName,
        mail: microsoft.getEmail(microsoftUser)
    }

    log.debug('[Microsoft-Auth] Creating a new user', user)

    let result = await server.methods.user.create(user).catch((err) => {
        log.error({ user }, '[Microsoft-Auth] Error creating user')
        throw err
    })

    log.debug({ userId: result.id }, '[Microsoft-Auth] New user created')
    return result.id
}

module.exports = microsoft
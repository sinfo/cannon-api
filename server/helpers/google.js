const server = require('../').hapi
const log = require('./logger')
const render = require('../views/google')
const googleConfig = require('../../config').google
const config = require('../../config')
const request = require('request')
const axios = require('axios').default

const google = {}

google.getGoogleUser = async accessToken => {
  const url = 'https://openidconnect.googleapis.com/v1/userinfo?access_token=' + encodeURIComponent(accessToken)

  let response = await axios.get(url).catch((error) => {
    log.warn({ error, where: 'getGoogleUser'})
    throw error
  })
  
  if (response.status !== 200) {
    log.error('error fetching google user')
    throw new Error('error fetching google user')
  }

  return response.data
}

/**
 * Get user in cannon DB by mail associated with Google account
 * @param {object} gUser Google User Profile
 * @param {string} gUser.sub Google User Id
 * @param {string} gUser.email
 * @param {string} gUser.name
 * @param {string} gUser.picture Profile image
 */
google.getUser = async gUser => {
    log.info('getUser')
    let user = await server.methods.user.get({
      'mail': gUser.email
    }).catch((err) => {
        log.error({
          err: err,
          google: gUser
        }, '[google-login] error getting user by google email')
        throw Boom.boomify(err)
    })

    // A user exist with a given Google email, we only need to update 'google.id' and 'img' in DB
    if (user) {
      return {
        createUser: false,
        userId: user.id
      }
    } else {
      return {
        createUser: true,
        gUser
      }
    }
}

google.createUser = async gUser => {
    log.info('createUser')
    const user = {
      google: {
        id: gUser.sub
      },
      name: gUser.name,
      mail: gUser.email,
      img: gUser.picture
    }

    log.debug('[google-login] creating user', user)

    let result = await server.methods.user.create(user).catch((err) => {
      log.error({
        user
      }, '[google-login] error creating user')
      throw Boom.boomify(err)
    })

    log.debug({
      userId: result.id
    }, '[google-login] new user created')

    log.info('createUser done')
    return result.id
}

google.getLiveStream = function (callback) {
  var channelId = googleConfig.channelId
  var youtubeApiKey = googleConfig.apiKey

  if (process.env.NODE_ENV !== 'production') {
    return callback({
      up: false,
      url: ''
    }, null)
  }

  request({
    url: `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&eventType=live&key=${youtubeApiKey}`,
    headers: {
      'Referer': config.url
    }
  }, (err, _, body) => {
    if (err) {
      console.error(err)
      callback(null, err)
    }
    callback(render(JSON.parse(body)), null)
  })
}

module.exports = google

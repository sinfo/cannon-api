const server = require('../').hapi
const log = require('./logger')
const fenixConfig = require('../../config').fenix
const fenixEdu = require('fenixedu')(fenixConfig)

const fenix = {}

fenix.getToken = code => {
  return new Promise((resolve, reject) => {
    fenixEdu.auth.getAccessToken(code, (err, response, body) => {
      if (err || !body) {
        log.error({ err, response: response.statusCode, body }, '[fenix-login] error getting access token')
        return reject('error getting access token')
      }
      return resolve(body.access_token)
    })
  })
}

fenix.getFenixUser = token => {
  return new Promise((resolve, reject) => {
    fenixEdu.person.getPerson(token, (err, fenixUser) => {
      if (err || !fenixUser) {
        log.error({ err, fenixUser }, '[fenix-login] error getting person')
        return reject('error getting person')
      }
      return resolve(fenixUser)
    })
  })
}

/**
 * Get user in cannon DB by mail associated with Fenix account
 * @param {*} fenixUser.name
 * @param {*} fenixUser.email
 * @param {string} fenixUser.username Fenix ID (e.g. ist112345)
 */
fenix.getUser = fenixUser => {
  return new Promise((resolve, reject) => {
    server.methods.user.get({ 'mail': fenixUser.email }, (err, user) => {
      if (err) {
        // If does not find a user with a given Fenix email, we create a new user
        if (err.output && err.output.statusCode === 404) {
          return resolve({ createUser: true, fenixUser })
        }
        log.error({ err, fenixUser }, '[fenix-login] error getting user')
        return reject('error getting user')
      }
      // A user exist with a given Fenix email, we only need to update 'fenix.id' and 'img' in DB
      return resolve({ createUser: false, userId: user.id })
    })
  })
}

fenix.createUser = fenixUser => {
  return new Promise((resolve, reject) => {
    const user = {
      fenix: {
        id: fenixUser.username
      },
      name: fenixUser.name,
      mail: fenixUser.email,
      img: `https://fenix.tecnico.ulisboa.pt/user/photo/${fenixUser.username}`
    }

    log.debug('[fenix-login] creating user', user)

    server.methods.user.create(user, (err, result) => {
      if (err) {
        log.error({ user }, '[fenix-login] error creating user')
        return reject(err)
      }

      log.debug({ userId: result.id }, '[fenix-login] new user created')

      return resolve(result.id)
    })
  })
}

module.exports = fenix

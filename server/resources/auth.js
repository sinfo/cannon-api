const server = require('../').hapi
const Boom = require('boom')
const log = require('../helpers/logger')
const token = require('../auth/token')
const facebook = require('../helpers/facebook')
const google = require('../helpers/google')
const fenix = require('../helpers/fenix')
const linkedin = require('../helpers/linkedin')

server.method('auth.facebook', facebookAuth, {})
server.method('auth.fenix', fenixAuth, {})
server.method('auth.google', googleAuth, {})
server.method('auth.linkedIn', linkedInAuth, {})

function facebookAuth (id, token, cb) {
  // Check with Facebook if token is valid
  facebook.verifyToken(id, token).then(() => {
    // Get user profile information from Facebook
    facebook.getFacebookUser(token).then(fbUser => {
      // Get user in cannon by Facebook User email
      facebook.getUser(fbUser).then(res => {
        // If user does not exist we create, otherwise we update existing user
        if (res.createUser) {
          return facebook.createUser(fbUser)
            .then(userId => authenticate(userId, null, cb))
            .catch(err => cb(Boom.unauthorized(err)))
        }

        const changedAttributes = {
          facebook: {
            id: fbUser.id
          },
          name: fbUser.name,
          img: fbUser.picture
        }
        return authenticate(res.userId, changedAttributes, cb)
      }).catch(err => cb(Boom.unauthorized(err)))
    }).catch(err => cb(Boom.unauthorized(err)))
  }).catch(err => cb(Boom.unauthorized(err)))
}

function googleAuth (id, token, cb) {
  // Check with Google if token is valid
  google.verifyToken(id, token).then(gUser => {
    // Get user in cannon by Google User email
    google.getUser(gUser).then(res => {
      // If user does not exist we create, otherwise we update existing user
      if (res.createUser) {
        return google.createUser(gUser)
        .then(userId => authenticate(userId, null, cb))
        .catch(err => cb(Boom.unauthorized(err)))
      }

      const changedAttributes = {
        google: {
          id: gUser.sub
        },
        name: gUser.name,
        img: gUser.picture
      }
      return authenticate(res.userId, changedAttributes, cb)
    }).catch(err => cb(Boom.unauthorized(err)))
  }).catch(err => cb(Boom.unauthorized(err)))
}

function fenixAuth (code, cb) {
  // Exchange the code given by the user by a token from Fenix
  fenix.getToken(code).then(token => {
    // Get user profile information from Fenix
    fenix.getFenixUser(token).then(fenixUser => {
      // Get user in cannon by Fenix User email
      fenix.getUser(fenixUser).then(res => {
        // If user does not exist we create, otherwise we update existing user
        if (res.createUser) {
          return google.createUser(fenixUser)
            .then(userId => authenticate(userId, null, cb))
            .catch(err => cb(Boom.unauthorized(err)))
        }

        const changedAttributes = {
          fenix: {
            id: fenixUser.username
          },
          name: fenixUser.name,
          img: `https://fenix.tecnico.ulisboa.pt/user/photo/${fenixUser.username}`
        }
        return authenticate(res.userId, changedAttributes, cb)
      }).catch(err => cb(Boom.unauthorized(err)))
    }).catch(err => cb(Boom.unauthorized(err)))
  }).catch(err => cb(Boom.unauthorized(err)))
}

function linkedInAuth (code, cb) {
  // Exchange the code given by the user by a token from LinkedIn
  linkedin.getToken(code).then(token => {
    // Get user profile information from LinkedIn
    linkedin.getLinkedinUser(token).then(linkedinUser => {
      // Get user in cannon by LinkedIn User email
      linkedin.getUser(linkedinUser).then(res => {
        // If user does not exist we create, otherwise we update existing user
        if (res.createUser) {
          return linkedin.createUser(linkedinUser)
            .then(userId => authenticate(userId, null, cb))
            .catch(err => cb(Boom.unauthorized(err)))
        }
        const changedAttributes = {
          linkedIn: {
            id: linkedinUser.id
          },
          name: `${linkedinUser.firstName} ${linkedinUser.lastName}`,
          mail: linkedinUser.emailAddress,
          img: linkedinUser.pictureUrl
        }
        return authenticate(res.userId, changedAttributes, cb)
      }).catch(err => cb(Boom.unauthorized(err)))
    }).catch(err => cb(Boom.unauthorized(err)))
  }).catch(err => cb(Boom.unauthorized(err)))
}

function authenticate (userId, changedAttributes, cb) {
  const newToken = token.createJwt(userId)
  changedAttributes = {$set: changedAttributes} || {}

  server.methods.user.update({ id: userId }, changedAttributes, (err, result) => {
    if (err) {
      log.error({user: userId, changedAttributes: changedAttributes}, '[login] error updating user')
      return cb(err)
    }
    log.info({ userId }, '[login] user logged in')
    // Finally resolves a new JWT token from Cannon that authenticates the user on the following requests
    return cb(null, newToken)
  })
}

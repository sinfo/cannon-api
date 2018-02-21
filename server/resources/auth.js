const Boom = require('boom')
const server = require('../').hapi
const config = require('../../config')
const log = require('../helpers/logger')
const async = require('async')
const facebook = require('../helpers/facebook')
const token = require('../auth/token')
const Fenix = require('fenixedu')(config.fenix)
const google = require('../helpers/google')

server.method('auth.facebook', facebookAuth, {})
server.method('auth.fenix', fenixAuth, {})
server.method('auth.google', googleAuth, {})

// //////////////////////////
// Fenix helper functions
// //////////////////////////

function getFenixToken (code, cb) {
  Fenix.auth.getAccessToken(code, (err, response, body) => {
    let auth

    if (err || !body) {
      log.error({err: err, response: response.statusCode, body: body}, '[fenix-login] error getting access token')
      return cb(Boom.unauthorized(body))
    }

    auth = {
      token: body.access_token, // jshint ignore:line
      refreshToken: body.refresh_token, // jshint ignore:line
      ttl: body.expires_in, // jshint ignore:line
      created: Date.now()
    }

    cb(null, auth)
  })
}

function getFenixInfo (auth, cb) {
  Fenix.person.getPerson(auth.token, (err, fenixUser) => {
    let user
    const _auth = auth

    if (err || !fenixUser) {
      log.error({err: err, user: fenixUser}, '[fenix-login] error getting person')
      return cb(Boom.unauthorized())
    }

    _auth.id = fenixUser.username
    user = {
      auth: _auth,
      name: fenixUser.name,
      email: {
        main: fenixUser.email,
        others: fenixUser.personalEmails.concat(fenixUser.workEmails)
      }
    }
    cb(null, user)
  })
}

function getFenixUser (fenixUser, cb) {
  server.methods.user.get({'fenix.id': fenixUser.auth.id}, (err, user) => {
    if (err) {
      if (err.output && err.output.statusCode === 404) {
        return fenixUserNotFound(fenixUser, cb)
      }

      log.error({err: err, fenix: fenixUser.auth.id}, '[fenix-login] error getting user')
      return cb(err)
    }

    const changedAttributes = {
      fenix: fenixUser.auth,
      mail: user.mail || fenixUser.email.main
    }
    authenticate(user.id, changedAttributes, cb)
  })
}

function fenixUserNotFound (fenixUser, cb) {
  const changedAttributes = {}
  const filter = {}

  changedAttributes.fenix = fenixUser.auth

  // If user does not exist, lets set the id, name and email
  changedAttributes.$setOnInsert = {
    id: Math.random().toString(36).substr(2, 20), // generate random id
    name: fenixUser.name,
    mail: fenixUser.email.main
  }

  fenixUser.email.others.push(fenixUser.email.main)

  filter.mail = {$in: fenixUser.email.others}

  log.debug({fenixUser: fenixUser.id}, '[fenix-login] got fenix user')

  // Update the fenix details of the user with any this emails, ou create a new user if it does not exist
  server.methods.user.update(filter, changedAttributes, {upsert: true}, (err, result) => {
    if (err) {
      log.error({query: filter, changedAttributes: changedAttributes}, '[fenix-login] error upserting user')
      return cb(err)
    }

    log.debug({id: result.id}, '[fenix-login] upserted user')

    return authenticate(result.id, null, cb)
  })
}

// /////////////////////////////////
// Third party login server methods
// /////////////////////////////////

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
          img: fbUser.picture.data.url
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
        img: gUser.picture
      }
      return authenticate(res.userId, changedAttributes, cb)
    }).catch(err => cb(Boom.unauthorized(err)))
  }).catch(err => cb(Boom.unauthorized(err)))
}

function fenixAuth (code, cb) {
  async.waterfall([
    function debug (cbAsync) {
      getFenixToken(code, cbAsync)
    },
    getFenixInfo,
    getFenixUser

  ], function done (err, result) {
    if (err) {
      log.error({err: err}, '[fenix-login] error on fenix login')
      return cb(err)
    }
    cb(null, result)
  })
}

function authenticate (userId, changedAttributes, cb) {
  const newToken = token.createJwt(userId)
  changedAttributes = changedAttributes || {}

  server.methods.user.update({id: userId}, changedAttributes, (err, result) => {
    if (err) {
      log.error({user: userId, changedAttributes: changedAttributes}, '[login] error updating user')
      return cb(err)
    }
    log.info({user: userId}, '[login] user logged in ')
    return cb(null, newToken)
  })
}

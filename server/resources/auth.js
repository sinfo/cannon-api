const Boom = require('boom')
const server = require('../').hapi
const config = require('../../config')
const log = require('../helpers/logger')
const async = require('async')
const Hoek = require('hoek')
const _ = require('underscore')
const facebook = require('../helpers/facebook')
const Token = require('../auth/token')
const Fenix = require('fenixedu')(config.fenix)
const google = require('../helpers/google')

server.method('auth.facebook', facebookAuth, {})
server.method('auth.fenix', fenixAuth, {})
server.method('auth.google', googleAuth, {})
server.method('auth.addFenix', addFenixAuth, {})
server.method('auth.refreshToken', refreshToken, {})

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
      if (!err.output || err.output.statusCode !== 404) {
        log.error({err: err, fenix: fenixUser.auth.id}, '[fenix-login] error getting user')
        return cb(err)
      }

      return fenixUserNotFound(fenixUser, cb)
    }
    const changedAttributes = {fenix: fenixUser.auth}
    changedAttributes.mail = user.mail || fenixUser.email.main
    authenticate(user.id, changedAttributes, cb)
  })
}

function addFenixAccount (user, fenixUser, cb) {
  server.methods.user.get({'fenix.id': fenixUser.auth.id}, (err, _user) => {
    const changedAttributes = {}

    if (err) {
      if (!err.output || err.output.statusCode !== 404) {
        log.error({err: err, fenix: fenixUser.auth.id}, '[fenix-login] error getting user')
        return cb(err)
      }

      changedAttributes.fenix = fenixUser.auth

      changedAttributes.mail = user.mail || fenixUser.email.main

      log.debug({fenixUser: fenixUser.id}, '[fenix-login] got fenix user')

      return updateUserAuth({id: user.id}, changedAttributes, cb)
    }

    if (_user.id === user.id) {
      log.error({user: user.id}, '[fenix-login] user already added account')
      return cb(Boom.conflict('Account alaready registered to this user'))
    }

    user.fenix = Hoek.applyToDefaults(_user.fenix, fenixUser.auth)
    mergeAccount(user, _user, cb)
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
      facebook.getUser(fbUser)
        .then(res => {
          // If user does not exist we create, otherwise we update existing user
          if (res.createUser) {
            return facebook.createUser(fbUser)
              .then(userId => authenticate(userId, null, cb))
              .catch(err => cb(Boom.unauthorized(err)))
          } else {
            const changedAttributes = {
              facebook: {
                id: fbUser.id
              },
              img: fbUser.picture.data.url
            }
            return authenticate(res.userId, changedAttributes, cb)
          }
        }).catch(err => cb(Boom.unauthorized(err)))
    }).catch(err => cb(Boom.unauthorized(err)))
  }).catch(err => cb(Boom.unauthorized(err)))
}

function googleAuth (id, token, cb) {
  // Check with Google if token is valid
  google.verifyToken(id, token).then(gUser => {
    // Get user in cannon from Google User ID (also known as gUser.sub)
    google.getUser(gUser)
      .then(userId => authenticate(userId, null, cb))
      .catch(() => {
        // User not found, lets create a user
        google.createUser(gUser)
          .then(userId => authenticate(userId, null, cb))
          .catch(err => cb(Boom.unauthorized(err)))
      })
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

// ////////////////////////////
// Add account server methods
// ////////////////////////////

function addFenixAuth (user, code, cb) {
  async.waterfall([
    function debug (cbAsync) {
      getFenixToken(code, cbAsync)
    },

    getFenixInfo,

    function addAccount (fenixUser, cbAsync) {
      addFenixAccount(user, fenixUser, cbAsync)
    }

  ], function done (err, result) {
    if (err) {
      log.error({err: err}, 'error adding fenix account')
      return cb(err)
    }
    cb(null, result)
  })
}

// ////////////////////////////////////////////
// Helper functions to merge and update users
// ////////////////////////////////////////////

function updateUserAuth (filter, changedAttributes, cbAsync) {
  // Update the details of the user with this new auth info
  server.methods.user.update(filter, changedAttributes, (err, result) => {
    if (err) {
      log.error({err: err, user: filter, changedAttributes: changedAttributes}, '[login] error updating user')
      return cbAsync(err)
    }

    log.debug({id: result.id}, '[login] updated user auth')

    return cbAsync(null, result)
  })
}

function mergeAccount (user, other, cb) {
  const userId = user.id
  const otherId = other.id

  server.methods.user.remove(other.id, (err, result) => {
    if (err) {
      log.error({err: err, user: other.id}, '[merge-account] error removing dup account')
      return cb(err)
    }

    log.debug('[merge-account] removed dup account')

    async.parallel([
      function updateFiles (cbAsync) {
        async.parallel([
          function getUser (cbFile) {
            server.methods.file.get(userId, (err, result) => {
              if (err) {
                if (err.output && err.output.statusCode === 404) {
                  log.warn({err: err.message, user: userId}, '[merge-account] user has no file')
                  return cbFile()
                }
                log.error({err: err, user: userId, other: userId}, '[merge-account] error getting user file')
              }
              cbFile(err, result)
            })
          },
          function getOther (cbFile) {
            server.methods.file.get(otherId, (err, result) => {
              if (err) {
                if (err.output && err.output.statusCode === 404) {
                  log.warn({err: err.message, user: otherId}, '[merge-account] other user has no file')
                  return cbFile()
                }
                log.error({err: err, user: userId, other: otherId}, '[merge-account] error getting other user file')
              }
              cbFile(err, result)
            })
          }
        ], function gotFiles (err, results) {
          const userFile = results[0]
          const otherFile = results[1]
          let resultFile
          let deleteFile
          log.debug({results: results})
          if (err) {
            return cbAsync(err)
          }

          if (!userFile && !otherFile) {
            return cbAsync()
          }

          if (!userFile || !otherFile) {
            resultFile = userFile || otherFile
            resultFile.user = user.id
          } else {
            if (userFile.updated > otherFile.updated) {
              resultFile = userFile
              deleteFile = otherFile
            } else {
              resultFile = otherFile
              deleteFile = userFile
            }
            resultFile.user = user.id
          }

          async.parallel([
            function deleteFile (cbFile) {
              server.methods.file.delete(deleteFile.id, err => {
                if (err) {
                  log.warn({err: err, file: deleteFile.id}, '[merge-account] error deleting file')
                }
                cbFile()
              })
            },
            function deleteFileDb (cbFile) {
              server.methods.file.remove(deleteFile.id, (err, _file) => {
                if (err) {
                  log.error({err: err, file: deleteFile.id}, '[merge-account] error removing file from db')
                  return cbFile(err)
                }
                cbFile(null, _file)
              })
            }
          ], function updateFileDb (err, results) {
            if (err) {
              return cbAsync(err)
            }

            server.methods.file.update(resultFile.id, resultFile, (err, result) => {
              if (err) {
                log.error({err: err, file: resultFile.id}, '[merge-account] error updating file')
                return cbAsync(err)
              }
              return cbAsync(null, result)
            })
          })
        })
      },

      function updateTickets (cbAsync) {
        const filter = {$and: [{users: otherId}, {users: {$nin: [userId]}}]}
        const changedAttributes = {$set: {'users.$': userId}}
        server.methods.ticket.updateMulti(filter, changedAttributes, (err, tickets) => {
          if (err) {
            if (err.output && err.output.statusCode === 404) {
              log.warn({err: err.message, user: otherId}, '[merge-account] user had no tickets')
              return cbAsync()
            }
            log.error({err: err, user: userId, other: otherId}, '[merge-account] error updating tickets')
            return cbAsync(err)
          }
          cbAsync(null, tickets)
        })
      },

      function updateAchievements (cbAsync) {
        const filter = {$and: [{users: otherId}, {users: {$nin: [userId]}}]}
        const changedAttributes = {$set: {'users.$': userId}}
        server.methods.achievement.updateMulti(filter, changedAttributes, (err, achievements) => {
          if (err) {
            if (err.output && err.output.statusCode === 404) {
              log.warn({err: err.message, user: otherId}, '[merge-account] user had no achievements')
              return cbAsync()
            }
            log.error({err: err, user: userId, other: otherId}, '[merge-account] error updating achievements')
            return cbAsync(err)
          }
          cbAsync(null, achievements)
        })
      }
    ], function updateUser (err, results) {
      if (err) return cb(err)
      const filter = {id: user.id}
      let changedAttributes = {}

      changedAttributes = Hoek.applyToDefaults(other, user)
      changedAttributes.skills = _.union(other.skills, user.skills)
      server.methods.user.update(filter, changedAttributes, (err, user) => {
        if (err) {
          log.error({err: err, user: userId, other: otherId, update: changedAttributes}, '[merge-account] error updating user')
          return cb(err)
        }
        cb(null, user)
      })
    })
  })
}

// //////////////////////////////////////////
// Update user with new session credentials
// //////////////////////////////////////////

function authenticate (userId, changedAttributes, cb) {
  const newToken = Token.getJWT(userId)
  changedAttributes = changedAttributes || {}
  changedAttributes.$push = { bearer: newToken }

  server.methods.user.update({id: userId}, changedAttributes, (err, result) => {
    if (err) {
      log.error({user: userId, changedAttributes: changedAttributes}, '[login] error updating user')
      return cb(err)
    }
    log.info({user: userId}, '[login] user logged in ')
    return cb(null, newToken)
  })
}

// ///////////////////////////
// Refresh session method
// ///////////////////////////

function refreshToken (user, token, refresh, cb) {
  Token.verifyToken(user, refresh, true, (err, decoded) => {
    if (err) {
      return cb(err)
    }

    const newToken = Token.getJWT(user)
    const filter = {id: user, bearer: {$elemMatch: {refreshToken: refresh, token: token}}}
    const update = {$set: {'bearer.$': newToken}}

    server.methods.user.update(filter, update, (err, result) => {
      if (err) {
        log.error({user: user}, '[login] error updating user')
        return cb(Boom.unauthorized())
      }
      return cb(err, newToken)
    })
  })
}

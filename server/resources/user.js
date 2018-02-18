const Boom = require('boom')
const server = require('../').hapi
const log = require('../helpers/logger')
const dupKeyParser = require('../helpers/dupKeyParser')
const fieldsParser = require('../helpers/fieldsParser')
const config = require('../../config')
const User = require('../db/user')

server.method('user.create', create, {})
server.method('user.update', update, {})
server.method('user.updatePoints', updatePoints, {})
server.method('user.get', get, {})
server.method('user.getByToken', getByToken, {})
server.method('user.list', list, {})
server.method('user.getMulti', getMulti, {})
server.method('user.remove', remove, {})

function create (user, cb) {
  user.id = user.id || Math.random().toString(36).substr(2, 20)
  user.role = user.role || config.auth.permissions[0]
  user.resgistered = user.resgistered || Date.now()
  user.updated = user.updated || Date.now()

  User.create(user, (err, _user) => {
    if (err) {
      if (err.code === 11000) {
        log.warn({err: err, requestedUser: user.id}, 'user is a duplicate')
        return cb(Boom.conflict(dupKeyParser(err.err) + ' is a duplicate'))
      }

      log.error({err: err, user: user.id}, 'error creating user')
      return cb(Boom.internal())
    }

    cb(null, _user.toObject({ getters: true }))
  })
}

function updatePoints (filter, points, cb) {
  const user = {$inc: {'points.available': points}}

  if (typeof points !== 'number') {
    return cb(Boom.badRequest('points must be of type number'))
  }

  if (points > 0) {
    user.$inc['points.total'] = points
  }

  update(filter, user, cb)
}

function update (filter, user, opts, cb) {
  user.updated = Date.now()

  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  if (typeof filter === 'string') {
    filter = { id: filter }
  }

  if (user && user.company) {
    user.$addToSet = {
      'user.company': {
        $each: [user.company]
      }
    }
  }

  User.findOneAndUpdate(filter, user, opts, (err, _user) => {
    if (err) {
      log.error({err: err, requestedUser: filter}, 'error updating user')
      return cb(Boom.internal())
    }
    if (!_user) {
      log.error({err: err, requestedUser: filter}, 'user not found')
      return cb(Boom.notFound())
    }

    cb(null, _user.toObject({ getters: true }))
  })
}

function get (filter, query, cb) {
  cb = cb || query // fields is optional

  const fields = fieldsParser(query.fields)

  if (typeof filter === 'string') {
    filter = { id: filter }
  }

  User.findOne(filter, fields, (err, user) => {
    if (err) {
      log.error({err: err, requestedUser: filter}, 'error getting user')
      return cb(Boom.internal())
    }
    if (!user) {
      log.warn({err: err, requestedUser: filter}, 'could not find user')
      return cb(Boom.notFound())
    }

    cb(null, user.toObject({ getters: true }))
  })
}

function getByToken (token, cb) {
  User.findOne({'bearer.token': token}, (err, user) => {
    if (err) {
      log.error({err: err, requestedUser: user}, 'error getting user')
      return cb(Boom.internal())
    }
    if (!user) {
      log.error({err: err, requestedUser: user}, 'error getting user')
      return cb(Boom.notFound())
    }

    cb(null, user)
  })
}

function list (query, cb) {
  cb = cb || query // fields is optional

  const filter = {}
  const fields = fieldsParser(query.fields)
  const options = {
    skip: query.skip,
    limit: query.limit,
    sort: fieldsParser(query.sort)
  }

  User.find(filter, fields, options, (err, users) => {
    if (err) {
      log.error({err: err}, 'error getting all users')
      return cb(Boom.internal())
    }

    cb(null, users)
  })
}

function getMulti (ids, query, cb) {
  cb = cb || query // fields is optional

  const filter = { id: { $in: ids } }
  const fields = fieldsParser(query.fields)
  const options = {
    skip: query.skip,
    limit: query.limit,
    sort: fieldsParser(query.sort)
  }

  User.find(filter, fields, options, (err, users) => {
    if (err) {
      log.error({err: err, ids: ids}, 'error getting multiple users')
      return cb(Boom.internal())
    }

    cb(null, users)
  })
}

function remove (filter, cb) {
  if (typeof filter === 'string') {
    filter = { id: filter }
  }

  User.findOneAndRemove(filter, (err, user) => {
    if (err) {
      log.error({err: err, requestedUser: filter}, 'error deleting user')
      return cb(Boom.internal())
    }
    if (!user) {
      log.error({err: err, requestedUser: filter}, 'error deleting user')
      return cb(Boom.notFound())
    }

    return cb(null, user)
  })
}

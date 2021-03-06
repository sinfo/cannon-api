const Boom = require('boom')
const server = require('../').hapi
const log = require('../helpers/logger')
const dupKeyParser = require('../helpers/dupKeyParser')
const fieldsParser = require('../helpers/fieldsParser')
const config = require('../../config')
const User = require('../db/user')

server.method('user.create', create, {})
server.method('user.update', update, {})
server.method('user.updateMe', updateMe, {})
server.method('user.get', get, {})
server.method('user.getByToken', getByToken, {})
server.method('user.list', list, {})
server.method('user.getMulti', getMulti, {})
server.method('user.remove', remove, {})
server.method('user.removeCompany', removeCompany, {})
server.method('user.sign', sign, {})
server.method('user.redeemCard', redeemCard, {})

function create (user, cb) {
  user.id = user.id || Math.random().toString(36).substr(2, 20)
  user.role = user.role || config.auth.permissions[0]
  user.resgistered = user.resgistered || Date.now()
  user.updated = user.updated || Date.now()

  User.create(user, (err, _user) => {
    if (err) {
      if (err.code === 11000) {
        log.warn({ err: err, requestedUser: user.id }, 'user is a duplicate')
        return cb(Boom.conflict(dupKeyParser(err.err) + ' is a duplicate'))
      }

      log.error({ err: err, user: user.id }, 'error creating user')
      return cb(Boom.internal())
    }

    cb(null, _user.toObject({ getters: true }))
  })
}

function updateMe (filter, user, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  // role can only be user
  if (user.role && user.role !== 'user') {
    return cb(Boom.unauthorized('Can only demote self, not promte'))
  }

  update(filter, user, opts, cb)
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
    const user2 = Object.assign({}, user)
    user.$pull = { 'company': { 'edition': user.company.edition } }
    user2.$push = { 'company': user.company }
    delete user.company
    delete user2.company

    removeCompany(pushCompany)

    function removeCompany (done) {// eslint-disable-line
      User.findOneAndUpdate(filter, user, opts, function (err, _user) {
        if (err && err.code !== 16837) {
          log.error({ err: err, requestedUser: filter }, 'error pulling user.company')
          return cb(Boom.internal())
        }

        done()
      })
    }

    function pushCompany () { // eslint-disable-line
      opts.new = true

      User.findOneAndUpdate(filter, user2, opts, function (err, user) {
        if (err) {
          log.error({ err: err, requestedUser: filter }, 'error pushing user.company')
          return cb(Boom.internal())
        }

        return cb(null, user.toObject({ getters: true }))
      })
    }
  } else {
    User.findOneAndUpdate(filter, user, opts, (err, _user) => {
      if (err) {
        log.error({ err: err, requestedUser: filter }, 'error updating user')
        return cb(Boom.internal())
      }
      if (!_user) {
        log.error({ err: err, requestedUser: filter }, 'user not found')
        return cb(Boom.notFound())
      }

      cb(null, _user.toObject({ getters: true }))
    })
  }
}

function get (filter, query, cb) {
  cb = cb || query // fields is optional

  const fields = fieldsParser(query.fields)

  if (typeof filter === 'string') {
    filter = { id: filter }
  }

  User.findOne(filter, fields, (err, user) => {
    if (err) {
      log.error({ err: err, requestedUser: filter }, 'error getting user')
      return cb(Boom.internal())
    }
    if (!user) {
      log.warn({ err: err, requestedUser: filter }, 'could not find user')
      return cb(Boom.notFound())
    }

    cb(null, user.toObject({ getters: true }))
  })
}

function getByToken (token, cb) {
  User.findOne({ 'bearer.token': token }, (err, user) => {
    if (err) {
      log.error({ err: err, requestedUser: user }, 'error getting user')
      return cb(Boom.internal())
    }
    if (!user) {
      log.error({ err: err, requestedUser: user }, 'error getting user')
      return cb(Boom.notFound())
    }

    cb(null, user)
  })
}

function list (activeAchievements, cb) {
  const usersToSearch = []
  const points = {}

  // list unique users at their points
  activeAchievements.forEach(achv => {
    achv.users.forEach(user => {
      if (usersToSearch.indexOf(user) === -1) {
        usersToSearch.push(user)
        points[user] = 0
      }

      /**
       * ADAPT TO SPEED DATES !!!!
       */
      points[user] += achv.value
    })
  })

  const fields = {
    id: 1,
    name: 1,
    img: 1
  }

  User.find({ id: { $in: usersToSearch } }, fields, (err, users) => {
    if (err) {
      log.error({ err: err }, 'error getting all users')
      return cb(Boom.internal())
    }

    // fill the points for each user
    for (var i = 0; i < users.length; i++) {
      users[i]['points'] = points[users[i].id]
    }

    // sort by points in descending order
    users.sort(function (a, b) { return b.points - a.points })

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
      log.error({ err: err, ids: ids }, 'error getting multiple users')
      return cb(Boom.internal())
    }

    cb(null, users)
  })
}

function removeCompany (filter, editionId, cb) {
  if (typeof filter === 'string') {
    filter = { id: filter }
  }

  const update = {
    $pull: {
      'company': { edition: editionId }
    }
  }

  User.findOneAndUpdate(filter, update, (err, user) => {
    if (err) {
      log.error({ err: err, requestedUser: filter, edition: editionId }, 'error deleting user.company')
      return cb(Boom.internal())
    }
    if (!user) {
      log.error({ err: err, requestedUser: filter, edition: editionId }, 'error deleting user.company')
      return cb(Boom.notFound())
    }

    cb(null, user.toObject({ getters: true }))
  })
}

function remove (filter, cb) {
  if (typeof filter === 'string') {
    filter = { id: filter }
  }

  User.findOneAndRemove(filter, (err, user) => {
    if (err) {
      log.error({ err: err, requestedUser: filter }, 'error deleting user')
      return cb(Boom.internal())
    }
    if (!user) {
      log.error({ err: err, requestedUser: filter }, 'error deleting user')
      return cb(Boom.notFound())
    }

    return cb(null, user)
  })
}

function sign (attendeeId, companyId, payload, cb) {
  // todo verify
  const filter = {
    id: attendeeId,
    signatures: {
      $elemMatch: {
        day: payload.day,
        edition: payload.editionId
      }
    }
  }

  const sig = {companyId: companyId, date: new Date()}

  const update = {
    $addToSet: {
      'signatures.$.signatures': sig
    }
  }

  User.findOneAndUpdate(filter, update, (err, user) => {
    if (err) {
      log.error({ err: err, attendeeId: attendeeId, companyId: companyId, day: payload.day, editionId: payload.editionId }, 'Error signing user')
      return cb(Boom.internal())
    }
    if (!user) {
      // day,event combination entry did not exist
      return addNewDayEntry(
        { id: filter.id },
        {
          $push: {
            signatures: {
              day: payload.day,
              edition: payload.editionId,
              signatures: [sig]
            }
          }
        }, cb)
    }

    cb(null, user.toObject({ getters: true }))
  })

  function addNewDayEntry (filter, update, cb) {
    User.findOneAndUpdate(filter, update, (err, user) => {
      if (err) {
        log.error({ err: err, attendeeId: attendeeId, companyId: companyId, day: payload.day, editionId: payload.editionId }, 'Error signing user')
        return cb(Boom.internal())
      }
      if (!user) {
        log.error({ err: err, attendeeId: attendeeId, companyId: companyId, day: payload.day, editionId: payload.editionId }, 'Error signing user')
        return cb(Boom.notFound())
      }

      return cb(null, user.toObject({ getters: true }))
    })
  }
}

function redeemCard (attendeeId, payload, cb) {
  // todo verify
  const filter = {
    id: attendeeId,
    signatures: {
      $elemMatch: {
        day: payload.day,
        edition: payload.editionId
      }
    }
  }

  const update = {
    $set: {
      'signatures.$.redeemed': true
    }
  }

  // this should not be here
  User.findOne(filter, (_err, _user) => {
    if (_err) {
      log.error({ err: _err, attendeeId: attendeeId, day: payload.day, editionId: payload.editionId }, 'Error getting user')
      return cb(Boom.internal())
    }
    if (!_user) {
      // day,event combination entry did not exist
      log.error({ err: _err, attendeeId: attendeeId, day: payload.day, editionId: payload.editionId }, 'Error getting user')
      return cb(Boom.notFound())
    }

    // this should not be hardcoded
    let signatures = _user.signatures.filter(s => s.day === payload.day && s.edition === payload.editionId)

    if (signatures && signatures.length > 0 && signatures[0].signatures.length < 6) {
      log.error({ user: _user }, 'not enough signatures to validate card')
      return cb(Boom.badData({ user: _user }, 'not enough signatures to validate card'))
    }

    if (signatures[0].redeemed !== undefined && signatures[0].redeemed) {
      return cb(Boom.conflict({ user: _user }, 'card already validated'))
    }

    User.findOneAndUpdate(filter, update, (err, user) => {
      if (err) {
        log.error({ err: err, attendeeId: attendeeId, day: payload.day, editionId: payload.editionId }, 'Error signing user')
        return cb(Boom.internal())
      }
      if (!user) {
        // day,event combination entry did not exist
        log.error({ err: err, attendeeId: attendeeId, day: payload.day, editionId: payload.editionId }, 'Error signing user')
        return cb(Boom.notFound())
      }

      cb(null, user.toObject({ getters: true }))
    })
  })
}

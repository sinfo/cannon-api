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

async function create (user) {
  user.id = user.id || Math.random().toString(36).substr(2, 20)
  user.role = user.role || config.auth.permissions[0]
  user.resgistered = user.resgistered || Date.now()
  user.updated = user.updated || Date.now()

  return User.create(user)
}

async function updateMe (filter, user, opts) {
  // if (typeof opts === 'function') {
  //   cb = opts
  //   opts = {}
  // }

  // role can only be user
  if (user.role && user.role !== 'user') {
    return Boom.unauthorized('Can only demote self, not promte')
  }

  update(filter, user, opts)
}

async function update (filter, user, opts) {
  user.updated = Date.now()

  if (typeof filter === 'string') {
    filter = { id: filter }
  }

  if (user && user.company) {
    const user2 = Object.assign({}, user)
    user.$pull = { 'company': { 'edition': user.company.edition } }
    user2.$push = { 'company': user.company }
    delete user.company
    delete user2.company

    try {
      await User.findOneAndUpdate(filter, user, opts)
    } catch (err) {
      if (err && err.code !== 16837) {
        log.error({ err: err, requestedUser: filter }, 'error pulling user.company')
        return Boom.internal()
      }
    }
    try {
      opts.new = true
      return await User.findOneAndUpdate(filter, user2, opts)
    } catch (err) {
      if (err) {
        log.error({ err: err, requestedUser: filter }, 'error pushing user.company')
        return Boom.internal()
      }
    }

  } else {
    return await User.findOneAndUpdate(filter, user)
  }
}

async function get (filter, query) {

  const fields = fieldsParser(query.fields)

  if (typeof filter === 'string') {
    filter = { id: filter }
  }

  return await User.findOne(filter, fields) //fields is always empty ¯\_(ツ)_/¯
}

async function getByToken (token) {
  let user = await User.findOne({ 'bearer.token': token })
  if (!user) {
    log.error({ err: err, requestedUser: user }, 'error getting user')
    return cb(Boom.notFound())
  }
  return user
}

async function list (activeAchievements) {
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

  let users = await User.find({ id: { $in: usersToSearch } }, fields)
  
  for (var i = 0; i < users.length; i++) {
    users[i]['points'] = points[users[i].id]
  }
   
  // sort by points in descending order
  users.sort(function (a, b) { return b.points - a.points })

  return users
}

async function getMulti (ids, query) {

  const filter = { id: { $in: ids } }
  const fields = fieldsParser(query.fields)
  const options = {
    skip: query.skip,
    limit: query.limit,
    sort: fieldsParser(query.sort)
  }

  return User.find(filter, fields, options)
}

async function removeCompany (filter, editionId) {
  if (typeof filter === 'string') {
    filter = { id: filter }
  }

  const update = {
    $pull: {
      'company': { edition: editionId }
    }
  }

  let user = await User.findOneAndUpdate(filter, update)
    if (!user) {
      log.error({ err: err, requestedUser: filter, edition: editionId }, 'error deleting user.company')
      return cb(Boom.notFound())
    }
  return user 
}

async function remove (filter) {
  if (typeof filter === 'string') {
    filter = { id: filter }
  }

  return await User.findOneAndRemove(filter)
    // if (err) {
    //   log.error({ err: err, requestedUser: filter }, 'error deleting user')
    //   return cb(Boom.internal())
    // }
    // if (!user) {
    //   log.error({ err: err, requestedUser: filter }, 'error deleting user')
    //   return cb(Boom.notFound())
    // }

}

async function sign (attendeeId, companyId, payload, cb) {
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

  let user = await User.findOneAndUpdate(filter, update)
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
      }
    )
  }
  return user
    if (err) {
      log.error({ err: err, attendeeId: attendeeId, companyId: companyId, day: payload.day, editionId: payload.editionId }, 'Error signing user')
      return cb(Boom.internal())
    }


  async function addNewDayEntry (filter, update) {
    let user = await User.findOneAndUpdate(filter, update)
    if (!user) {
      log.error({ err: err, attendeeId: attendeeId, companyId: companyId, day: payload.day, editionId: payload.editionId }, 'Error signing user')
      return Boom.notFound()
    }
    return user
    if (err) {
      log.error({ err: err, attendeeId: attendeeId, companyId: companyId, day: payload.day, editionId: payload.editionId }, 'Error signing user')
      return cb(Boom.internal())
    }
  }
}

async function redeemCard (attendeeId, payload, cb) {
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
  let user = await User.findOne(filter)
  if (_err) {
    log.error({ err: _err, attendeeId: attendeeId, day: payload.day, editionId: payload.editionId }, 'Error getting user')
    return Boom.internal()
  }
  if (!_user) {
    // day,event combination entry did not exist
    log.error({ err: _err, attendeeId: attendeeId, day: payload.day, editionId: payload.editionId }, 'Error getting user')
    return Boom.notFound()
  }

  // this should not be hardcoded
  let signatures = _user.signatures.filter(s => s.day === payload.day && s.edition === payload.editionId)
  if (signatures || signatures.length == 0){
    log.error({ user: _user }, 'not enough signatures to validate card')
    return Boom.badData({ user: _user }, 'not enough signatures to validate card')
  }

  if (signatures[0].signatures.length < 6) {
    log.error({ user: _user }, 'not enough signatures to validate card')
    return Boom.badData({ user: _user }, 'not enough signatures to validate card')
  }

  if (signatures[0].redeemed !== undefined && signatures[0].redeemed) {
    return Boom.conflict({ user: _user }, 'card already validated')
  }

  user = await User.findOneAndUpdate(filter, update)
  if (!user) {
    // day,event combination entry did not exist
    log.error({ err: err, attendeeId: attendeeId, day: payload.day, editionId: payload.editionId }, 'Error signing user')
    return Boom.notFound()
  }
  return user
}

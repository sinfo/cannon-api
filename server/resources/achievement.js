const Boom = require('boom')
const slug = require('slug')
const server = require('../').hapi
const log = require('../helpers/logger')
const fieldsParser = require('../helpers/fieldsParser')
const Achievement = require('../db/achievement')

server.method('achievement.create', create, {})
server.method('achievement.update', update, {})
server.method('achievement.updateMulti', updateMulti, {})
server.method('achievement.get', get, {})
server.method('achievement.getByUser', getByUser, {})
server.method('achievement.removeAllFromUser', removeAllFromUser, {})
server.method('achievement.list', list, {})
server.method('achievement.remove', remove, {})
server.method('achievement.addUser', addUser, {})
server.method('achievement.addMultiUsers', addMultiUsers, {})
server.method('achievement.addMultiUsersBySession', addMultiUsersBySession, {})
server.method('achievement.addUserToStandAchievement', addUserToStandAchievement, {})
server.method('achievement.addCV', addCV, {})
server.method('achievement.getPointsForUser', getPointsForUser, {})
server.method('achievement.removeCV', removeCV, {})
server.method('achievement.getActiveAchievements', getActiveAchievements, {})

function create (achievement, cb) {
  achievement.id = achievement.id || slug(achievement.name)

  achievement.updated = achievement.created = Date.now()

  Achievement.create(achievement, (err, _achievement) => {
    if (err) {
      if (err.code === 11000) {
        return cb(Boom.conflict(`achievement "${achievement.id}" is a duplicate`))
      }

      log.error({err: err, achievement: achievement.id}, 'error creating achievement')
      return cb(Boom.internal())
    }

    cb(null, _achievement.toObject({ getters: true }))
  })
}

function update (filter, achievement, cb) {
  if (typeof filter === 'string') {
    filter = { id: filter }
  }

  achievement.updated = Date.now()

  Achievement.findOneAndUpdate(filter, achievement, (err, _achievement) => {
    if (err) {
      log.error({err: err, achievement: filter}, 'error updating achievement')
      return cb(Boom.internal())
    }
    if (!_achievement) {
      log.error({err: err, achievement: filter}, 'error updating achievement')
      return cb(Boom.notFound())
    }

    cb(null, _achievement.toObject({ getters: true }))
  })
}

function updateMulti (filter, achievement, cb) {
  if (typeof filter === 'string') {
    filter = { id: filter }
  }

  achievement.updated = Date.now()

  Achievement.update(filter, achievement, {multi: true}, (err, _achievements) => {
    if (err) {
      log.error({err: err, achievement: filter}, 'error updating achievements')
      return cb(Boom.internal())
    }
    if (!_achievements) {
      log.warn({err: err, achievement: filter}, 'could not find achievements')
      return cb(Boom.notFound())
    }

    cb(null, _achievements)
  })
}

function get (filter, cb) {
  // log.debug({id: id}, 'getting achievement')

  if (typeof filter === 'string') {
    filter = { id: filter }
  }

  Achievement.findOne(filter, (err, achievement) => {
    if (err) {
      log.error({err: err, achievement: filter}, 'error getting achievement')
      return cb(Boom.internal('error getting achievement'))
    }
    if (!achievement) {
      log.error({err: 'not found', achievement: filter}, 'achievement not found')
      return cb(Boom.notFound('achievement not found'))
    }

    cb(null, achievement.toObject({ getters: true }))
  })
}

function getByUser (filter, cb) {
  // log.debug({id: id}, 'getting achievement')
  const now = new Date()
  
  filter = {
    users: {$in: [filter]},
    'validity.from': { $lte: now },
    'validity.to': { $gte: now }
  }

  Achievement.find(filter, (err, achievements) => {
    if (err) {
      log.error({err: err, achievement: filter}, 'error getting achievements')
      return cb(Boom.internal('error getting achievements'))
    }
    if (!achievements) {
      log.error({err: 'not found', achievement: filter}, 'achievements not found')
      return cb(Boom.notFound('achievements not found'))
    }

    cb(null, achievements)
  })
}

function removeAllFromUser (userId, cb) {
  Achievement.update({ users: userId }, { $pull: { users: userId } }, { multi: true }, (err, achievements) => {
    if (err) {
      log.error({err: err, userId: userId}, 'error removing user from multiple achievements')
      return cb(Boom.internal('error getting achievements'))
    }

    if (!achievements) {
      log.error({err: 'not found', userId: userId}, 'achievements not found')
      return cb(Boom.notFound('achievements not found'))
    }

    cb(null, achievements)
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

  Achievement.find(filter, fields, options, (err, achievements) => {
    if (err) {
      log.error({err: err}, 'error getting all achievements')
      return cb(Boom.internal())
    }

    cb(null, achievements)
  })
}

function remove (id, cb) {
  Achievement.findOneAndRemove({id: id}, (err, achievement) => {
    if (err) {
      log.error({err: err, achievement: id}, 'error deleting achievement')
      return cb(Boom.internal())
    }
    if (!achievement) {
      log.error({err: 'not found', achievement: id}, 'error deleting achievement')
      return cb(Boom.notFound('achievement not found'))
    }

    return cb(null, achievement)
  })
}

function addCV (userId, cb) {
  const achievementKind = 'cv'
  const now = new Date()

  const changes = {
    $addToSet: {
      users: userId
    }
  }

  Achievement.findOneAndUpdate({
    kind: achievementKind,
    'validity.from': { $lte: now },
    'validity.to': { $gte: now }
  }, changes, (err, achievement) => {
    if (err) {
      log.error({err: err, achievement: achievementId}, 'error adding user to cv achievement')
      return cb(Boom.internal())
    }

    if (achievement === null) {
      log.error({userId: userId}, 'error trying to add user to cv achievement')
      return cb(new Error('error trying to add user to cv achievement'), null)
    }

    cb(null, achievement.toObject({ getters: true }))
  })
}

function removeCV (userId, cb) {
  const achievementKind = 'cv'
  const now = new Date()

  const changes = {
    $pull: {
      users: userId
    }
  }

  Achievement.findOneAndUpdate({
    kind: achievementKind,
    'validity.from': { $lte: now },
    'validity.to': { $gte: now }
  }, changes, (err, achievement) => {
    if (err) {
      log.error({err: err, achievement: achievementId}, 'error removing user from cv achievement')
      return cb(Boom.internal())
    }

    if (achievement === null) {
      log.error({userId: userId}, 'error trying to remove user from cv achievement')
      return cb(new Error('error trying to remove user from cv achievement'), null)
    }

    cb(null, achievement.toObject({ getters: true }))
  })
}

function addUser (achievementId, userId, cb) {
  if (!achievementId || !userId) {
    log.error({userId: userId, achievementId: achievementId}, 'missing arguments on addUser')
    return cb()
  }
  const changes = {
    $addToSet: {
      users: userId
    }
  }

  const now = new Date()

  Achievement.findOneAndUpdate({
    id: achievementId,
    'validity.from': { $lte: now },
    'validity.to': { $gte: now }
  }, changes, (err, achievement) => {
    if (err) {
      log.error({err: err, achievement: achievementId}, 'error adding user to achievement')
      return cb(Boom.internal())
    }

    if (achievement === null) {
      log.error({achievementId: achievementId, userId: userId}, 'error trying to add user to not valid achievement')
      return cb(new Error('error trying to add user to not valid achievement'), null)
    }

    cb(null, achievement.toObject({ getters: true }))
  })
}

function getPointsForUser (activeAchievements, userId, cb) {
  const result = { achievements: [], points: 0 }

  // list unique users at their points
  result.achievements = activeAchievements.filter((achievement) => {
    return achievement.users.indexOf(userId) !== -1
  })

  // fill the points
  result.achievements.forEach(achv => {
    result.points += achv.value
  })

  cb(null, result)
}

function addMultiUsers (achievementId, usersId, cb) {
  if (!usersId) {
    log.error('tried to add multiple users to achievement but no users where given')
    return cb()
  }

  const changes = {
    $addToSet: {
      users: { $each: usersId }
    }
  }

  const now = new Date()

  Achievement.findOneAndUpdate({
    id: achievementId,
    'validity.from': { $lte: now },
    'validity.to': { $gte: now }
  }, changes, (err, achievement) => {
    if (err) {
      log.error({err: err, achievement: achievementId}, 'error adding user to achievement')
      return cb(Boom.internal())
    }

    cb(null, achievement.toObject({ getters: true }))
  })
}

function addMultiUsersBySession (sessionId, usersId, cb) {
  if (!usersId) {
    log.error('tried to add multiple users to achievement but no users where given')
    return cb()
  }

  const changes = {
    $addToSet: {
      users: { $each: usersId }
    }
  }

  const now = new Date()
  
  Achievement.findOneAndUpdate({
    session: sessionId,
    'validity.from': { $lte: now },
    'validity.to': { $gte: now }
  }, changes, (err, achievement) => {
    if (err) {
      log.error({err: err, sessionId: sessionId}, 'error adding user to achievement')
      return cb(Boom.internal())
    }
    
    if (achievement === null) {
      log.error({sessionId: sessionId}, 'error trying to add multiple users to not valid achievement in session')
      return cb(new Error('error trying to add multiple users to not valid achievement in session'), null)
    }

    cb(null, achievement.toObject({ getters: true }))
  })
}

function addUserToStandAchievement (companyId, userId, cb) {
  if (!userId) {
    log.error('tried to user to company achievement but no user was given')
    return cb()
  }

  const changes = {
    $addToSet: {
      users: userId
    }
  }

  const now = new Date()
  
  Achievement.findOneAndUpdate({
    id: { $regex: `stand-${companyId}-` },
    'kind': 'stand',
    'validity.from': { $lte: now },
    'validity.to': { $gte: now }
  }, changes, (err, achievement) => {
    if (err) {
      log.error({err: err, companyId: companyId, userId: userId}, 'error adding user to stand achievement')
      return cb(Boom.internal())
    }
    
    if (achievement === null) {
      log.error({ companyId: companyId, userId: userId }, 'error trying to add user to not valid stand achievement')
      return cb(new Error('error trying to add user to not valid stand achievement'), null)
    }

    cb(null, achievement.toObject({ getters: true }))
  })
}

// _date is a string, converted to Date inside this function
function getActiveAchievements (query, cb) {
  var date
  cb = cb || query

  if (query.date === undefined) {
    date = new Date() // now
  } else {
    date = new Date(query.date)
    if (isNaN(date.getTime())) {
      log.error({ query: query.date }, 'invalid date given on query to get active achievements')
      return cb(Boom.notAcceptable('invalid date given in query'))
    }
  }

  Achievement.find({
    'validity.from': { $lte: date },
    'validity.to': { $gte: date }
  }, (err, achievements) => {
    if (err) {
      log.error({ err: err, date: date }, 'error getting active achievements on a given date')
      return cb(err)
    }

    cb(null, achievements)
  })
}

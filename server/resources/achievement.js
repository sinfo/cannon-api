const Boom = require('boom')
const slug = require('slug')
const server = require('../').hapi
const log = require('../helpers/logger')
const fieldsParser = require('../helpers/fieldsParser')
const Achievement = require('../db/achievement')
const AchievementKind = require('../db/achievementKind')

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
server.method('achievement.generateCodeSession', generateCodeSession, {})
server.method('achievement.getActiveAchievementsCode', getActiveAchievementsCode, {})
server.method('achievement.getSpeedDatePointsForUser', getSpeedDatePointsForUser, {})
server.method('achievement.addUserToSpeedDateAchievement', addUserToSpeedDateAchievement, {})
server.method('achievement.checkUserStandDay', checkUserStandDay, {})
server.method('achievement.createSecret', createSecret, {})
server.method('achievement.addUserToSecret', addUserToSecret, {})

function create (achievement, cb) {
  achievement.id = achievement.id || slug(achievement.name)

  log.error({ach: achievement}, 'id')

  achievement.updated = achievement.created = Date.now()

  Achievement.create(achievement, (err, _achievement) => {
    if (err) {
      if (err.code === 11000) {
        return cb(Boom.conflict(`achievement "${achievement.id}" is a duplicate`))
      }

      log.error({ err: err, achievement: achievement.id }, 'error creating achievement')
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
      log.error({ err: err, achievement: filter }, 'error updating achievement')
      return cb(Boom.internal())
    }
    if (!_achievement) {
      log.error({ err: err, achievement: filter }, 'error updating achievement')
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

  Achievement.update(filter, achievement, { multi: true }, (err, _achievements) => {
    if (err) {
      log.error({ err: err, achievement: filter }, 'error updating achievements')
      return cb(Boom.internal())
    }
    if (!_achievements) {
      log.warn({ err: err, achievement: filter }, 'could not find achievements')
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
      log.error({ err: err, achievement: filter }, 'error getting achievement')
      return cb(Boom.internal('error getting achievement'))
    }
    if (!achievement) {
      log.error({ err: 'not found', achievement: filter }, 'achievement not found')
      return cb(Boom.notFound('achievement not found'))
    }

    cb(null, achievement.toObject({ getters: true }))
  })
}

function getByUser (filter, cb) {
  // log.debug({id: id}, 'getting achievement')
  const now = new Date()

  filter = {
    users: { $in: [filter] },
    'validity.from': { $lte: now },
    'validity.to': { $gte: now }
  }

  Achievement.find(filter, (err, achievements) => {
    if (err) {
      log.error({ err: err, achievement: filter }, 'error getting achievements')
      return cb(Boom.internal('error getting achievements'))
    }
    if (!achievements) {
      log.error({ err: 'not found', achievement: filter }, 'achievements not found')
      return cb(Boom.notFound('achievements not found'))
    }

    cb(null, achievements)
  })
}

function removeAllFromUser (userId, cb) {
  Achievement.update({ users: userId }, { $pull: { users: userId } }, { multi: true }, (err, achievements) => {
    if (err) {
      log.error({ err: err, userId: userId }, 'error removing user from multiple achievements')
      return cb(Boom.internal('error getting achievements'))
    }

    if (!achievements) {
      log.error({ err: 'not found', userId: userId }, 'achievements not found')
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
      log.error({ err: err }, 'error getting all achievements')
      return cb(Boom.internal())
    }

    cb(null, achievements)
  })
}

function remove (id, cb) {
  Achievement.findOneAndRemove({ id: id }, (err, achievement) => {
    if (err) {
      log.error({ err: err, achievement: id }, 'error deleting achievement')
      return cb(Boom.internal())
    }
    if (!achievement) {
      log.error({ err: 'not found', achievement: id }, 'error deleting achievement')
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
      log.error({ err: err, achievement: achievement }, 'error adding user to cv achievement')
      return cb(Boom.internal())
    }

    if (achievement === null) {
      log.error({ userId: userId }, 'error trying to add user to cv achievement')
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
      log.error({ err: err, achievement: achievement }, 'error removing user from cv achievement')
      return cb(Boom.internal())
    }

    if (achievement === null) {
      log.error({ userId: userId }, 'error trying to remove user from cv achievement')
      return cb(new Error('error trying to remove user from cv achievement'), null)
    }

    cb(null, achievement.toObject({ getters: true }))
  })
}

function addUser (achievementId, userId, cb) {
  if (!achievementId || !userId) {
    log.error({ userId: userId, achievementId: achievementId }, 'missing arguments on addUser')
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
      log.error({ err: err, achievement: achievementId }, 'error adding user to achievement')
      return cb(Boom.internal())
    }

    if (achievement === null) {
      log.error({ achievementId: achievementId, userId: userId }, 'error trying to add user to not valid achievement')
      return cb(new Error('error trying to add user to not valid achievement'), null)
    }

    cb(null, achievement.toObject({ getters: true }))
  })
}

function getPointsForUser (activeAchievements, userId, cb) {
  const result = { achievements: [], points: 0 }

  // list unique users at their points
  result.achievements = activeAchievements.filter((achievement) => {
    return achievement.users.indexOf(userId) !== -1 && achievement.kind !== 'speedDate'
  })

  // fill the points
  result.achievements.forEach(achv => {
    if (achv.kind !== 'speedDate') {
      result.points += achv.value
    } else {
      result.points += getSpeedDatePoints(achv, userId)
    }
  })

  cb(null, result)
}

function getSpeedDatePointsForUser (userId, cb) {
  const result = { achievements: [], points: 0 }
  const filter = {
    kind: 'speedDate'
  }

  Achievement.find(filter, (err, achievements) => {
    if (err) {
      log.error({err: err}, 'Error finding achievements')
    }

    achievements.forEach(ach => {
      result.points += getSpeedDatePoints(ach, userId)
      result.achievements.push({
        achievement: ach,
        frequence: userFrequence(ach, userId)
      })
    })

    return cb(null, result)
  })
}

function userFrequence (achievement, userId) {
  let count = 0
  achievement.users.forEach(u => {
    if (u === userId) {
      count++
    }
  })

  return count > 3 ? 3 : count
}

function getSpeedDatePoints (achievement, userId) {
  let count = 0
  let points = 0
  achievement.users.forEach(u => {
    if (u === userId) {
      points += count >= 3 ? 0 : achievement.value / Math.pow(2, count++)
    }
  })

  return points
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
      log.error({ err: err, achievement: achievementId }, 'error adding user to achievement')
      return cb(Boom.internal())
    }

    cb(null, achievement.toObject({ getters: true }))
  })
}

function addMultiUsersBySession (sessionId, usersId, credentials, code, cb) {
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

  if (credentials.scope !== 'user') {
    Achievement.findOneAndUpdate({
      session: sessionId,
      'validity.from': { $lte: now },
      'validity.to': { $gte: now }
    }, changes, (err, achievement) => {
      if (err) {
        log.error({ err: err, sessionId: sessionId }, 'error adding user to achievement')
        return cb(Boom.internal())
      }

      if (achievement === null) {
        log.error({ sessionId: sessionId }, 'error trying to add multiple users to not valid achievement in session')
        return cb(new Error('error trying to add multiple users to not valid achievement in session'), null)
      }

      cb(null, achievement.toObject({ getters: true }))
    })
  } else { // Self check in
    if (usersId.length === 1 && usersId[0] === credentials.user.id) {
      Achievement.findOne({
        session: sessionId,
        'validity.from': { $lte: now },
        'validity.to': { $gte: now },
        'code.created': {$lte: now},
        'code.expiration': {$gte: now},
        'code.code': code
      }, (err, achievement) => {
        if (err) {
          log.error({ err: err, sessionId: sessionId }, 'error adding user to achievement')
          return cb(Boom.internal())
        }

        if (achievement === null) {
          log.error({ sessionId: sessionId }, 'error trying to add user to not valid achievement in session')
          return cb(Boom.notFound('error trying to add user to not valid achievement in session'), null)
        }

/** |===========================================================================================================|
 *  |  UGLY FIX: DO NOT KEEP THIS FOR LONGER THAN NECESSARY.                                                    |
 *  |  Currently, 2 workshops are concurrent iff their codes are concurrent                                     |
 *  |  This solution requires human coordination and is ill advised.                                            |
 *  |                                                                                                           |
 *  |  A good solution (at time of writing is it too late to implement this solution as an event is ongoing)    |
 *  |  is storing more session information on session-related achievements.                                     |
 *  |                                                                                                           |
 *  |  Information that is accessed together should be kept together - Lauren Schaefer 2021                     |
 *  |===========================================================================================================| */
        if (achievement.kind === AchievementKind.WORKSHOP) {
          const query = {
            $or: [
              {
                $and: [
                  {'code.created': {$gte: new Date(achievement.code.created)}},
                  {'code.created': {$lte: new Date(achievement.code.expiration)}}
                ]
              },
              {
                $and: [
                  {'code.expiration': {$gte: new Date(achievement.code.created)}},
                  {'code.expiration': {$lte: new Date(achievement.code.expiration)}}
                ]
              }
            ],
            users: usersId[0],
            id: {$ne: achievement.id}
          }

          Achievement.count(query, (err, ct) => {
            if (err) {
              log.error({ err: err, sessionId: sessionId }, 'error adding user to achievement')
              return cb(Boom.internal())
            }

            if (ct > 0) {
              const changes = {
                $pull: {users: usersId[0]}
              }

              log.warn({ user: usersId[0] }, 'User breaking the rules')

              Achievement.update(query, changes, (err, ach) => {
                if (err) {
                  log.error({ err: err, sessionId: sessionId }, 'error adding user to achievement')
                  return cb(Boom.internal())
                }

                log.error({id: usersId[0]}, 'user tried to check in to concurrent workshops')
                return cb(Boom.forbidden('user tried to check in to concurrent workshops'))
              })
            } else {
              Achievement.findOneAndUpdate({
                session: sessionId,
                'validity.from': { $lte: now },
                'validity.to': { $gte: now },
                'code.created': {$lte: now},
                'code.expiration': {$gte: now},
                'code.code': code
              }, changes, (err, achievement) => {
                if (err) {
                  log.error({ err: err, sessionId: sessionId }, 'error adding user to achievement')
                  return cb(Boom.internal())
                }

                if (achievement === null) {
                  log.error({ sessionId: sessionId }, 'error trying to add user to not valid achievement in session')
                  return cb(Boom.notFound('error trying to add user to not valid achievement in session'), null)
                }

                return cb(null, achievement.toObject({ getters: true }))
              })
            }
          })
        } else {
          Achievement.findOneAndUpdate({
            session: sessionId,
            'validity.from': { $lte: now },
            'validity.to': { $gte: now },
            'code.created': {$lte: now},
            'code.expiration': {$gte: now},
            'code.code': code
          }, changes, (err, achievement) => {
            if (err) {
              log.error({ err: err, sessionId: sessionId }, 'error adding user to achievement')
              return cb(Boom.internal())
            }

            if (achievement === null) {
              log.error({ sessionId: sessionId }, 'error trying to add user to not valid achievement in session')
              return cb(Boom.notFound('error trying to add user to not valid achievement in session'), null)
            }

            cb(null, achievement.toObject({ getters: true }))
          })
        }
      })
    } else {
      return cb(Boom.badRequest('invalid payload for user self sign'), null)
    }
  }
}

function checkUserStandDay (userId, cb) {
  if (!userId) {
    log.error('tried to user to company achievement but no user was given')
    return cb()
  }
  const now = new Date()

  const filterA = {
    'kind': AchievementKind.STANDDAY,

    'validity.from': { $lte: now },
    'validity.to': { $gte: now }
  }

  const filterB = {
    'kind': AchievementKind.STAND,

    'validity.from': { $lte: now },
    'validity.to': { $gte: now }
  }

  Achievement.findOne(filterA, (err, achievement) => {
    if (err) {
      log.error({ err: err, userId: userId }, 'error checking user for stand day achievement')
      return cb(Boom.internal())
    }

    if (achievement === null) {
      // No achievement of this kind
      return cb()
    }

    if (achievement.users && achievement.users.includes(userId)) { // User already has achievement
      return cb()
    }

    Achievement.find(filterB, (err, achievements) => { // Else, we check if condition is true
      if (err) {
        log.error({ err: err, userId: userId }, 'error checking user for stand day achievement')
        return cb(Boom.internal())
      }

      if (achievements === null) {
        log.error({ userId: userId }, 'error checking user for stand day achievement')
        return cb(new Error('error checking user for stand day achievement'), null)
      }

      if (achievements.length === 0) {
        return cb()
      }

      let done = true
      achievements.forEach(ach => {
        if (!ach.users.includes(userId)) {
          done = false
        }
      })

      if (done) {
        const update = {
          $addToSet: {
            users: userId
          }
        }
        Achievement.findOneAndUpdate(filterA, update, (err, achievement) => {
          if (err) {
            log.error({ err: err, userId: userId }, 'error adding user to stand day achievement')
            return cb(Boom.internal())
          }

          if (achievement === null) {
            log.error({ userId: userId }, 'error trying to add user to not valid stand day achievement')
            return cb(new Error('error trying to add user to not valid stand day achievement'), null)
          }

          cb(null, achievement.toObject({ getters: true }))
        })
      } else {
        return cb()
      }
    })
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
      log.error({ err: err, companyId: companyId, userId: userId }, 'error adding user to stand achievement')
      return cb(Boom.internal())
    }

    if (achievement === null) {
      log.error({ companyId: companyId, userId: userId }, 'error trying to add user to not valid stand achievement')
      return cb(new Error('error trying to add user to not valid stand achievement'), null)
    }

    cb(null, achievement.toObject({ getters: true }))
  })
}

function addUserToSpeedDateAchievement (companyId, userId, hhs, cb) {
  if (!userId) {
    log.error('tried to user to company achievement but no user was given')
    return cb()
  }

  const changes = {
    $push: {
      users: hhs.length > 0 ? { $each: Array(3).fill(userId) } : userId
    }
  }

  const now = new Date()

  Achievement.findOneAndUpdate({
    id: { $regex: `speedDate-${companyId}-` },
    'kind': 'speedDate',
    'validity.from': { $lte: now },
    'validity.to': { $gte: now }
  }, changes, (err, achievement) => {
    if (err) {
      log.error({ err: err, companyId: companyId, userId: userId }, 'error adding user to speed date achievement')
      return cb(Boom.internal())
    }

    if (achievement === null) {
      log.error({ companyId: companyId, userId: userId }, 'error trying to add user to not valid speed date achievement')
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
    if (isNaN(date.getTime())) {
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

function getActiveAchievementsCode (query, cb) {
  var start, end
  cb = cb || query

  if (query.start === undefined) {
    start = new Date() // now
  } else {
    start = new Date(query.start)
    if (isNaN(start.getTime())) {
      log.error({ query: query.start }, 'invalid start date given on query to get active achievements')
      return cb(Boom.notAcceptable('invalid start date given in query'))
    }
  }
  if (query.end === undefined) {
    end = new Date() // now
  } else {
    end = new Date(query.end)
    if (isNaN(end.getTime())) {
      log.error({ query: query.end }, 'invalid end date given on query to get active achievements')
      return cb(Boom.notAcceptable('invalid end date given in query'))
    }
  }

  if (end < start) {
    log.error({start: start, end: end}, 'end date is before start date')
  }

  const filter = {
    'validity.from': { $gte: start },
    'validity.to': { $lte: end }
  }

  if (query.kind) {
    filter.kind = query.kind
  }

  Achievement.find(filter, (err, achievements) => {
    if (err) {
      log.error({ err: err, start: start, end: end }, 'error getting active achievements on a given date')
      return cb(err)
    }

    cb(null, achievements)
  })
}

function generateCodeSession (sessionId, expiration, cb) {
  if (!expiration) {
    log.error('No duration was given')
    return cb(new Error('No duration was given'))
  }

  let created = new Date()
  let expires = new Date(expiration)
  if (created >= expires) {
    log.error({expires: expires}, 'expiration date is in the past')
    return cb(new Error('expiration date is in the past'))
  }

  let code = randomString(12)

  const changes = {
    $set: {
      code: {
        created: created,
        expiration: expires,
        code: code
      }
    }
  }

  Achievement.findOneAndUpdate({
    session: sessionId,
    'validity.to': { $gte: created }
  }, changes, (err, achievement) => {
    if (err) {
      log.error({ err: err, sessionId: sessionId }, 'error adding code to achievement')
      return cb(Boom.internal())
    }

    if (achievement === null) {
      log.error({ sessionId: sessionId }, 'error trying to add code to not valid achievement in session')
      return cb(new Error('error trying to add code to not valid achievement in session'), null)
    }

    cb(null, achievement.toObject({ getters: true }))
  })
}

function randomString (size) {
  var text = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (var i = 0; i < size; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return text
}

function createSecret (payload, cb) {
  const options = {
    kind: AchievementKind.SECRET,
    id: new RegExp(payload.event)
  }

  Achievement.find(options, (err, achs) => {
    if (err) {
      log.error({error: err})
      return cb(Boom.internal())
    }

    if (achs === null) {
      log.error('error trying to create secret achievement')
      return cb(new Error('error trying to create secret achievement'), null)
    }

    const n = achs.length

    const from = new Date()
    const to = new Date(from)
    from.setHours(0)
    from.setMinutes(0)
    from.setSeconds(0)
    from.setMilliseconds(0)

    to.setHours(23)
    to.setMinutes(59)
    to.setSeconds(59)
    to.setMilliseconds(999)

    const code = randomString(12)

    const achievement = {
      name: 'Secret Achievement!',
      id: `${payload.event}_secret_achievement_${n}`,
      description: 'Secret achievement valid for a limited time!',
      instructions: 'Redeem the code that appears in the chat at random times!',
      img: `https://sinfo.ams3.cdn.digitaloceanspaces.com/static/${payload.event}/achievements/secret_code.webp`,
      value: payload.points > 0 ? payload.points : 10,
      users: [],
      validity: {
        from: from,
        to: to
      },
      code: {
        code: code
      },
      kind: AchievementKind.SECRET
    }

    achievement.updated = achievement.created = achievement.code.created = Date.now()
    const expiration = new Date(payload.validity)
    if (expiration <= achievement.code.created) {
      log.error({expires: expiration}, 'expiration date is in the past')
      return cb(Boom.badRequest())
    }
    achievement.code.expiration = expiration

    Achievement.create(achievement, (err, _achievement) => {
      if (err) {
        if (err.code === 11000) {
          log.error({achievement: achievement}, 'duplicate')
          return cb(Boom.conflict(`achievement "${achievement.id}" is a duplicate`))
        }

        log.error({ err: err, achievement: achievement.id }, 'error creating achievement')
        return cb(Boom.internal())
      }

      cb(null, _achievement.toObject({ getters: true }))
    })
  })
}

function addUserToSecret (id, code, cb) {
  if (!id) {
    log.error('tried to redeem secret but no user was given')
    return cb()
  }

  const now = new Date()

  const changes = {
    $addToSet: {
      users: id
    }
  }

  const query = {
    kind: AchievementKind.SECRET,
    'validity.from': { $lte: now },
    'validity.to': { $gte: now },
    'code.created': { $lte: now },
    'code.expiration': { $gte: now },
    'code.code': code
  }

  Achievement.findOneAndUpdate(query, changes, (err, achievement) => {
    if (err) {
      log.error({ err: err }, 'error adding user to secret achievement')
      return cb(Boom.internal())
    }

    if (achievement === null) {
      log.error({ code: code }, 'no valid secret achievements with that code')
      return cb(Boom.notFound('no valid secret achievements with that code'))
    }

    cb(null, achievement.toObject({ getters: true }))
  })
}

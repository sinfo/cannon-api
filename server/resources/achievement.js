const Boom = require('@hapi/boom')
const uuid = require('uuid')
const server = require('../').hapi
const aws = require('../plugins/aws')
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
server.method('achievement.getAchievementBySession', getAchievementBySession, {})

async function create(data) {
  let achievement = {
    id: data.id,
    name: data.name,
    event: data.event,
    session: data.session,
    description: data.description,
    category: data.category,
    instructions: data.instructions,
    value: data.value,
    validity: {
      from: data.validFrom,
      to: data.validTo
    },
    kind: data.kind
  }

  achievement.id = achievement.id || uuid.v4()
  achievement.updated = achievement.created = Date.now()

  const imgUrl = await uploadAchievementImage(achievement, data.img)
  if (!imgUrl) {
    log.error('Error setting image URL for achievement ' + achievement.id)
    throw Boom.internal('Error setting image URL for achievement ' + achievement.id)
  }

  achievement.img = imgUrl

  return Achievement.create(achievement).catch((err) => {
    if (err.code === 11000) {
      log.error({ msg: "achievement is a duplicate" })
      throw Boom.conflict(`achievement is a duplicate`)
    }
    throw err
  })

}

async function update(filter, achievement) {
  if (typeof filter === 'string') {
    filter = { id: filter }
  }

  achievement.updated = Date.now()

  return Achievement.findOneAndUpdate(filter, achievement, { new: true })
}

async function updateMulti(filter, achievement) {
  if (typeof filter === 'string') {
    filter = { id: filter }
  }

  achievement.updated = Date.now()

  return Achievement.updateMany(filter, achievement)
}

async function get(filter) {
  // log.debug({id: id}, 'getting achievement')

  if (typeof filter === 'string') {
    filter = { id: filter }
  }

  return Achievement.findOne(filter)
}

async function getByUser(filter) {
  // log.debug({id: id}, 'getting achievement')
  const now = new Date()

  filter = {
    users: { $in: [filter] },
    'validity.from': { $lte: now },
    'validity.to': { $gte: now }
  }

  return Achievement.find(filter)
}

async function removeAllFromUser(userId) {
  return Achievement.updateMany({ users: userId }, { $pull: { users: userId } })

}

async function list(query) {
  const filter = {}
  const fields = fieldsParser(query.fields)
  const options = {
    skip: query.skip,
    limit: query.limit,
    sort: fieldsParser(query.sort)
  }

  return Achievement.find(filter, fields, options)
}

async function remove(id) {
  const achievement = await Achievement.findOne({ id: id })
  await removeAchievementImage(achievement)
  return Achievement.findOneAndRemove({ id: id })
}

// 500, 404
async function addCV(userId) {
  const achievementKind = 'cv'
  const now = new Date()

  const changes = {
    $addToSet: {
      users: userId
    }
  }

  return Achievement.findOneAndUpdate({
    kind: achievementKind,
    'validity.from': { $lte: now },
    'validity.to': { $gte: now }
  }, changes)
}

// 500, 404
async function removeCV(userId) {
  const achievementKind = 'cv'
  const now = new Date()

  const changes = {
    $pull: {
      users: userId
    }
  }

  return Achievement.findOneAndUpdate({
    kind: achievementKind,
    'validity.from': { $lte: now },
    'validity.to': { $gte: now }
  }, changes, { new: true })
}

//500, 404
async function addUser(achievementId, userId) {
  if (!achievementId || !userId) {
    log.error({ userId: userId, achievementId: achievementId }, 'missing arguments on addUser')
    throw Boom.badData()
  }
  const changes = {
    $addToSet: {
      users: userId
    }
  }

  const now = new Date()

  return Achievement.findOneAndUpdate({
    id: achievementId,
    'validity.from': { $lte: now },
    'validity.to': { $gte: now }
  }, changes)
}

function getPointsForUser(activeAchievements, userId) {
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

  return result
}

async function getSpeedDatePointsForUser(userId) {
  const result = { achievements: [], points: 0 }
  const filter = {
    kind: 'speedDate'
  }

  let achievements = await Achievement.find(filter).catch((err) => {
    log.error({ err: err }, 'Error finding achievements')
    throw Boom.boomify(err)
  })

  achievements.forEach(ach => {
    result.points += getSpeedDatePoints(ach, userId)
    result.achievements.push({
      achievement: ach,
      frequence: userFrequence(ach, userId)
    })
  })

  return result
}

function userFrequence(achievement, userId) {
  let count = 0
  achievement.users.forEach(u => {
    if (u === userId) {
      count++
    }
  })

  return count > 3 ? 3 : count
}

function getSpeedDatePoints(achievement, userId) {
  let count = 0
  let points = 0
  achievement.users.forEach(u => {
    if (u === userId) {
      points += count >= 3 ? 0 : achievement.value / Math.pow(2, count++)
    }
  })

  return points
}

//500
async function addMultiUsers(achievementId, usersId) {
  if (!usersId) {
    log.error('tried to add multiple users to achievement but no users where given')
    throw Boom.badData()
  }

  const changes = {
    $addToSet: {
      users: { $each: usersId }
    }
  }

  const now = new Date().now()

  return Achievement.findOneAndUpdate({
    id: achievementId,
    'validity.from': { $lte: now },
    'validity.to': { $gte: now }
  }, changes)
}


async function addMultiUsersBySession(sessionId, usersId, credentials, code, unregisteredUsersNumber) {
  if (!usersId) {
    log.error('tried to add multiple users to achievement but no users where given')
    throw Boom.badData('tried to add multiple users to achievement but no users where given')
  }

  const changes = {
    $addToSet: {
      users: { $each: usersId }
    },
    $inc: {
      unregisteredUsers: unregisteredUsersNumber ? unregisteredUsersNumber : 0
    }
  }

  const now = new Date()

  if (credentials.scope !== 'user') {
    let achievement = await Achievement.findOneAndUpdate({
      session: sessionId,
      'validity.from': { $lte: now },
      'validity.to': { $gte: now }
    }, changes, { new: true }).catch((err) => {

      log.error({ err: err, sessionId: sessionId }, 'error adding user to achievement')
      throw Boom.internal('error adding user to achievement')
    })

    if (achievement === null) {
      log.error({ sessionId: sessionId }, 'error trying to add multiple users to not valid achievement in session')
      throw Boom.notFound('error trying to add multiple users to not valid achievement in session')
    }

    return achievement.toObject({ getters: true })
  } else { // Self check in
    if (usersId.length === 1 && usersId[0] === credentials.user.id) {
      let achievement = await Achievement.findOne({
        session: sessionId,
        'validity.from': { $lte: now },
        'validity.to': { $gte: now },
        'code.created': { $lte: now },
        'code.expiration': { $gte: now },
        'code.code': code
      }).catch((err) => {

        log.error({ err: err, sessionId: sessionId }, 'error adding user to achievement')
        throw Boom.internal('error adding user to achievement')
      })

      if (achievement === null) {
        log.error({ sessionId: sessionId }, 'error trying to add user to not valid achievement in session')
        throw Boom.notFound('error trying to add user to not valid achievement in session')
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
                { 'code.created': { $gte: new Date(achievement.code.created) } },
                { 'code.created': { $lte: new Date(achievement.code.expiration) } }
              ]
            },
            {
              $and: [
                { 'code.expiration': { $gte: new Date(achievement.code.created) } },
                { 'code.expiration': { $lte: new Date(achievement.code.expiration) } }
              ]
            }
          ],
          users: usersId[0],
          id: { $ne: achievement.id }
        }

        let ct = await Achievement.count(query).catch((err) => {

          log.error({ err: err, sessionId: sessionId }, 'error adding user to achievement')
          throw Boom.internal('error adding user to achievement')
        })

        if (ct > 0) {
          const changes = {
            $pull: { users: usersId[0] }
          }

          log.warn({ user: usersId[0] }, 'User breaking the rules')

          await Achievement.updateOne(query, changes, { new: true }).catch((err) => {

            log.error({ err: err, sessionId: sessionId }, 'error adding user to achievement')
            throw Boom.internal('error adding user to achievement')
          })
          log.error({ id: usersId[0] }, 'user tried to check in to concurrent workshops')
          throw Boom.forbidden('user tried to check in to concurrent workshops')
        } else {
          let achievement = await Achievement.findOneAndUpdate({
            session: sessionId,
            'validity.from': { $lte: now },
            'validity.to': { $gte: now },
            'code.created': { $lte: now },
            'code.expiration': { $gte: now },
            'code.code': code
          }, changes, { new: true }).catch((err) => {

            log.error({ err: err, sessionId: sessionId }, 'error adding user to achievement')
            throw Boom.internal('error adding user to achievement')
          })

          if (achievement === null) {
            log.error({ sessionId: sessionId }, 'error1 trying to add user to not valid achievement in session')
            throw Boom.notFound('error1 trying to add user to not valid achievement in session')
          }

          return achievement.toObject({ getters: true })
        }

      } else {
        let achievement = await Achievement.findOneAndUpdate({
          session: sessionId,
          'validity.from': { $lte: now },
          'validity.to': { $gte: now },
          'code.created': { $lte: now },
          'code.expiration': { $gte: now },
          'code.code': code
        }, changes, { new: true }).catch((err) => {
          log.error({ err: err, sessionId: sessionId }, 'error adding user to achievement')
          throw Boom.internal('error adding user to achievement')
        })
        if (achievement === null) {
          log.error({ sessionId: sessionId }, 'error trying to add user to not valid achievement in session')
          throw Boom.notFound('error trying to add user to not valid achievement in session')
        }

        return achievement.toObject({ getters: true })
      }
    } else {
      throw Boom.badRequest('invalid payload for user self sign')
    }
  }
}

async function checkUserStandDay(userId) {
  if (!userId) {
    log.error('tried to user to company achievement but no user was given')
    return null
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

  let achievement = await Achievement.findOne(filterA).catch((err) => {

    log.error({ err: err, userId: userId }, 'error checking user for stand day achievement')
    throw Boom.internal()
  })


  if (achievement === null) {
    // No achievement of this kind
    return null
  }

  if (achievement.users && achievement.users.includes(userId)) { // User already has achievement
    return null
  }

  let achievements = await Achievement.find(filterB).catch((err) => { // Else, we check if condition is true

    log.error({ err: err, userId: userId }, 'error checking user for stand day achievement')
    throw Boom.internal()
  })

  if (achievements === null) {
    log.error({ userId: userId }, 'error checking user for stand day achievement')
    throw Boom.internal('error checking user for stand day achievement')
  }

  if (achievements.length === 0) {
    return null
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
    let achievement = await Achievement.findOneAndUpdate(filterA, update).catch((err) => {

      log.error({ err: err, userId: userId }, 'error adding user to stand day achievement')
      throw Boom.internal()
    })

    if (achievement === null) {
      log.error({ userId: userId }, 'error trying to add user to not valid stand day achievement')
      throw Boom.notFound('error trying to add user to not valid stand day achievement')
    }

    return achievement.toObject({ getters: true })

  } else {
    return null
  }
}

//500, 404
async function addUserToStandAchievement(companyId, userId) {
  if (!userId) {
    log.error('tried to user to company achievement but no user was given')
    throw Boom.badData()
  }

  const changes = {
    $addToSet: {
      users: userId
    }
  }

  const now = new Date()

  return Achievement.findOneAndUpdate({
    id: { $regex: `stand-${companyId}-` },
    'kind': 'stand',
    'validity.from': { $lte: now },
    'validity.to': { $gte: now }
  }, changes)
}


//500, 404
async function addUserToSpeedDateAchievement(companyId, userId, hhs) {
  if (!userId) {
    log.error('tried to user to company achievement but no user was given')
    throw Boom.badData()
  }

  const changes = {
    $push: {
      users: hhs.length > 0 ? { $each: Array(3).fill(userId) } : userId
    }
  }

  const now = new Date()

  return Achievement.findOneAndUpdate({
    id: { $regex: `speedDate-${companyId}-` },
    'kind': 'speedDate',
    'validity.from': { $lte: now },
    'validity.to': { $gte: now }
  }, changes, { new: true })
}

// _date is a string, converted to Date inside this function
async function getActiveAchievements(query) {
  var date
  if (query === undefined || query.date === undefined) {
    date = new Date() // now
  } else {
    date = new Date(query.date)
    if (isNaN(date.getTime())) {
      log.error({ query: query.date }, 'invalid date given on query to get active achievements')
      throw Boom.notAcceptable('invalid date given in query')
    }
  }

  return Achievement.find({
    'validity.from': { $lte: date },
    'validity.to': { $gte: date }
  })
}

async function getActiveAchievementsCode(query) {
  var start, end

  if (query.start === undefined) {
    start = new Date() // now
  } else {
    start = new Date(query.start)
    if (isNaN(start.getTime())) {
      log.error({ query: query.start }, 'invalid start date given on query to get active achievements')
      throw Boom.notAcceptable('invalid start date given in query')
    }
  }
  if (query.end === undefined) {
    end = new Date() // now
  } else {
    end = new Date(query.end)
    if (isNaN(end.getTime())) {
      log.error({ query: query.end }, 'invalid end date given on query to get active achievements')
      throw Boom.notAcceptable('invalid end date given in query')
    }
  }

  if (end < start) {
    log.error({ start: start, end: end }, 'end date is before start date')
    throw Boom.notAcceptable('invalid end date given in query')
  }

  const filter = {
    'validity.from': { $gte: start },
    'validity.to': { $lte: end }
  }

  if (query.kind) {
    filter.kind = query.kind
  }



  return Achievement.find(filter)
}

//500, 404
async function generateCodeSession(sessionId, expiration) {
  if (!expiration) {
    log.error('No duration was given')
    throw Boom.badData()
  }

  let created = new Date()
  let expires = new Date(expiration)
  if (created >= expires) {
    log.error({ expires: expires }, 'expiration date is in the past')
    throw Boom.badData('expiration date is in the past')
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

  return Achievement.findOneAndUpdate({
    session: sessionId,
    'validity.to': { $gte: created }
  }, changes, { new: true })
}

function randomString(size) {
  var text = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (var i = 0; i < size; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return text
}


async function createSecret(payload) {
  const options = {
    kind: AchievementKind.SECRET,
    id: new RegExp(payload.event)
  }

  let achs = await Achievement.find(options).catch((err) => {
    log.error({ error: err })
    throw Boom.internal()
  })

  if (achs === null) {
    log.error('error trying to create secret achievement')
    return new Error('error trying to create secret achievement')
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
    log.error({ expires: expiration }, 'expiration date is in the past')
    throw Boom.badRequest()
  }
  achievement.code.expiration = expiration



  let ach = await Achievement.create(achievement).catch((err) => {
    if (err.code === 11000) {
      log.error({ achievement: achievement }, 'duplicate')
      Boom.conflict(`achievement "${ach.id}" is a duplicate`)
    }

    log.error({ err: err, achievement: ach.id }, 'error creating achievement')
    throw Boom.internal()
  })

  return ach.toObject({ getters: true })
}

async function addUserToSecret(id, code) {
  if (!id) {
    log.error('tried to redeem secret but no user was given')
    throw Boom.boomify()
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

  return Achievement.findOneAndUpdate(query, changes, { new: true })
}

async function getAchievementBySession(id) {
  let filter = { session: id }

  return Achievement.findOne(filter)
}

/* Image Functions */
function getDataFromStream(stream) {
  return new Promise((resolve, reject) => {
    let data = []

    stream.on('data', (chunk) => {
      data.push(chunk)
    })

    stream.on('end', () => {
      resolve(Buffer.concat(data))
    })

    stream.on('error', (err) => {
      reject(err)
    })
  })
}

function getFileName(achievement) {
  return achievement.id + '.webp'
}

function getAchievementPath(achievement) {
  return `static/${achievement.event}/achievements/${achievement.kind}s/`
}

async function uploadAchievementImage(achievement, file) {
  const path = getAchievementPath(achievement)
  const fileName = getFileName(achievement)
  const data = await getDataFromStream(file)
  return aws.upload(path, data, fileName, true)
}

async function removeAchievementImage(achievement) {
  const path = getAchievementPath(achievement)
  const fileName = getFileName(achievement)
  return aws.delete(path, fileName)
}

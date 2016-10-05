var Boom = require('boom')
var slug = require('slug')
var server = require('../').hapi
var log = require('../helpers/logger')
var fieldsParser = require('../helpers/fieldsParser')
var Achievement = require('../db/achievement')

server.method('achievement.create', create, {})
server.method('achievement.update', update, {})
server.method('achievement.updateMulti', updateMulti, {})
server.method('achievement.get', get, {})
server.method('achievement.getByUser', getByUser, {})
server.method('achievement.list', list, {})
server.method('achievement.remove', remove, {})
server.method('achievement.addUser', addUser, {})
server.method('achievement.addCV', addCV, {})

function create (achievement, cb) {
  achievement.id = achievement.id || slug(achievement.name)

  achievement.updated = achievement.created = Date.now()

  Achievement.create(achievement, function (err, _achievement) {
    if (err) {
      if (err.code === 11000) {
        return cb(Boom.conflict('achievement "' + achievement.id + '" is a duplicate'))
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

  Achievement.findOneAndUpdate(filter, achievement, function (err, _achievement) {
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

  Achievement.update(filter, achievement, {multi: true}, function (err, _achievements) {
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

  Achievement.findOne(filter, function (err, achievement) {
    log.error({err: err})
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

  filter = {users: {$in: [filter]}}

  Achievement.find(filter, function (err, achievements) {
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

function list (query, cb) {
  cb = cb || query // fields is optional

  var filter = {}
  var fields = fieldsParser(query.fields)
  var options = {
    skip: query.skip,
    limit: query.limit,
    sort: fieldsParser(query.sort)
  }

  Achievement.find(filter, fields, options, function (err, achievements) {
    if (err) {
      log.error({err: err}, 'error getting all achievements')
      return cb(Boom.internal())
    }

    cb(null, achievements)
  })
}

function remove (id, cb) {
  Achievement.findOneAndRemove({id: id}, function (err, achievement) {
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
  var achievementId = 'submitted-cv'

  get({id: achievementId, users: {$in: [userId]}}, function (err, result) {
    if (err) {
      log.error({err: err})
      if (err.output && err.output.statusCode === 404) {
        return addUser(achievementId, userId, cb)
      }
      return cb(err)
    }
    return cb(Boom.conflict('user already has achievement'))
  })
}

function addUser (achievementId, userId, cb) {
  if (!achievementId || !userId) {
    log.error({userId: userId, achievementId: achievementId}, 'missing arguments on addUser')
    return cb()
  }

  var changes = {
    $addToSet: {
      users: userId
    }
  }

  Achievement.findOneAndUpdate({ id: achievementId }, changes, function (err, achievement) {
    if (err) {
      log.error({err: err, achievement: achievementId}, 'error adding user to achievement')
      return cb(Boom.internal())
    }

    cb(null, achievement.toObject({ getters: true }))
  })
}

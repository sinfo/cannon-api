var Boom = require('boom');
var slug = require('slug');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var fieldsParser = require('server/helpers/fieldsParser');
var Achievement = require('server/db/achievement');

server.method('achievement.create', create, {});
server.method('achievement.update', update, {});
server.method('achievement.get', get, {});
server.method('achievement.list', list, {});
server.method('achievement.remove', remove, {});
server.method('achievement.addUser', addUser, {});


function create(achievement, cb) {
  achievement.id = achievement.id || slug(achievement.name);

  achievement.updated = achievement.created = Date.now();

  Achievement.create(achievement, function(err, _achievement) {
    if (err) {
      if(err.code == 11000) {
        return cb(Boom.conflict('achievement is a duplicate'));
      }

      log.error({err: err, achievement: achievement.id}, 'error creating achievement');
      return cb(Boom.internal());
    }

    cb(null, _achievement.toObject({ getters: true }));
  });
}

function update(id, achievement, cb) {

  achievement.updated = Date.now();

  Achievement.findOneAndUpdate({id: id}, achievement, function(err, _achievement) {
    if (err) {
      log.error({err: err, achievement: id}, 'error updating achievement');
      return cb(Boom.internal());
    }
    if (!_achievement) {
      log.error({err: err, achievement: id}, 'error updating achievement');
      return cb(Boom.notFound('achievement not found'));
    }

    cb(null, _achievement.toObject({ getters: true }));
  });
}

function get(id, cb) {
  // log.debug({id: id}, 'getting achievement')

  Achievement.findOne({id: id}, function(err, achievement) {
    if (err) {
      log.error({err: err, achievement: id}, 'error getting achievement');
      return cb(Boom.internal('error getting achievement'));
    }
    if (!achievement) {
      log.error({err: 'not found', achievement: id}, 'error getting achievement');
      return cb(Boom.notFound('achievement not found'));
    }

    cb(null, achievement.toObject({ getters: true }));
  });
}

function list(query, cb) {
  cb = cb || query; // fields is optional

  var filter = {};
  var fields = fieldsParser(query.fields);
  var options = {
    skip: query.skip,
    limit: query.limit,
    sort: fieldsParser(query.sort)
  };

  Achievement.find(filter, fields, options, function(err, achievements) {
    if (err) {
      log.error({err: err}, 'error getting all achievements');
      return cb(Boom.internal());
    }

    cb(null, achievements);
  });
}

function remove(id, cb) {
  Achievement.findOneAndRemove({id: id}, function(err, achievement){
    if (err) {
      log.error({err: err, achievement: id}, 'error deleting achievement');
      return cb(Boom.internal());
    }
    if (!achievement) {
      log.error({err: 'not found', achievement: id}, 'error deleting achievement');
      return cb(Boom.notFound('achievement not found'));
    }

    return cb(null, achievement);
  });
}


function addUser(achievementId, userId, cb) {
  if(!achievementId || !userId) {
    log.error({userId: userId, achievementId: achievementId}, 'missing arguments on addUser');
    return cb();
  }

  var changes = {
    $addToSet: {
      users: userId
    }
  };

  Achievement.findOneAndUpdate({ id: achievementId }, changes, function(err, achievement) {
    if (err) {
      log.error({err: err, achievement: achievementId}, 'error adding user to achievement');
      return cb(Boom.internal());
    }

    cb(null, achievement);
  });
}


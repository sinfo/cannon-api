var Boom = require('boom');
var slug = require('slug');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var Achievement = require('server/models/achievement');

function create(achievement, cb) {
  achievement.id = slug(achievement.name);

  Achievement.create(achievement, function(err, _achievement) {
    if (err) {
      if(err.code == 11000) {
        return cb(Boom.conflict('achievement is a duplicate'));
      }

      log.error({ err: err, achievement: achievement.id}, 'error creating achievement');
      return cb(Boom.internal());
    }

    cb(null, _achievement);
  });
}

function update(id, achievement, cb) {
  Achievement.findOneAndUpdate({id: id}, achievement, function(err, _achievement) {
    if (err) {
      log.error({ err: err, achievement: id}, 'error updating achievement');
      return cb(Boom.internal());
    }
    if (!_achievement) {
      log.error({ err: err, achievement: id}, 'error updating achievement');
      return cb(Boom.notFound());
    }

    cb(null, _achievement);
  });
}

function get(id, cb) {
  Achievement.findOne({id: id}, function(err, achievement) {
    if (err) {
      log.error({ err: err, achievement: id}, 'error getting achievement');
      return cb(Boom.internal());
    }
    if (!achievement) {
      log.error({ err: err, achievement: id}, 'error getting achievement');
      return cb(Boom.notFound());
    }

    cb(null, achievement);
  });
}

function list(cb) {
  Achievement.find({}, function(err, achievements) {
    if (err) {
      log.error({ err: err}, 'error getting all achievements');
      return cb(Boom.internal());
    }
    
    cb(null, achievements);
  });
}

function remove(id, cb) {
  Achievement.findOneAndRemove({id: id}, function(err, achievement){
    if (err) {
      log.error({ err: err, achievement: id}, 'error deleting achievement');
      return cb(Boom.internal());
    }
    if (!achievement) {
      log.error({ err: err, achievement: id}, 'error deleting achievement');
      return cb(Boom.notFound());
    }

    return cb(null, achievement);
  });
}



server.method('achievement.create', create, {});
server.method('achievement.update', update, {});
server.method('achievement.get', get, {});
server.method('achievement.list', list, {});
server.method('achievement.remove', remove, {});

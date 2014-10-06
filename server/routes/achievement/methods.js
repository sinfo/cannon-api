var Boom = require('boom');
var slug = require('slug');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var fieldsParser = require('server/helpers/fieldsParser');
var Achievement = require('server/models/achievement');

server.method('achievement.create', create, {});
server.method('achievement.update', update, {});
server.method('achievement.get', get, {});
server.method('achievement.list', list, {});
server.method('achievement.remove', remove, {});


function create(achievement, cb) {
  achievement.id = slug(achievement.name);

  Achievement.create(achievement, function(err, _achievement) {
    if (err) {
      if(err.code == 11000) {
        return cb(Boom.conflict('achievement is a duplicate'));
      }

      log.error({user: request.auth.credentials.id, err: err, achievement: achievement.id}, 'error creating achievement');
      return cb(Boom.internal());
    }

    cb(null, _achievement);
  });
}

function update(id, achievement, cb) {
  Achievement.findOneAndUpdate({id: id}, achievement, function(err, _achievement) {
    if (err) {
      log.error({user: request.auth.credentials.id, err: err, achievement: id}, 'error updating achievement');
      return cb(Boom.internal());
    }
    if (!_achievement) {
      log.error({user: request.auth.credentials.id, err: err, achievement: id}, 'error updating achievement');
      return cb(Boom.notFound());
    }

    cb(null, _achievement);
  });
}

function get(id, fields, cb) {
  cb = cb || fields; // fields is optional

  Achievement.findOne({id: id}, fieldsParser(fields), function(err, achievement) {
    if (err) {
      log.error({user: request.auth.credentials.id, err: err, achievement: id}, 'error getting achievement');
      return cb(Boom.internal());
    }
    if (!achievement) {
      log.error({user: request.auth.credentials.id, err: 'not found', achievement: id}, 'error getting achievement');
      return cb(Boom.notFound());
    }

    cb(null, achievement);
  });
}

function list(fields, cb) {
  cb = cb || fields; // fields is optional

  Achievement.find({}, fieldsParser(fields), function(err, achievements) {
    if (err) {
      log.error({user: request.auth.credentials.id, err: err}, 'error getting all achievements');
      return cb(Boom.internal());
    }
    
    cb(null, achievements);
  });
}

function remove(id, cb) {
  Achievement.findOneAndRemove({id: id}, function(err, achievement){
    if (err) {
      log.error({user: request.auth.credentials.id, err: err, achievement: id}, 'error deleting achievement');
      return cb(Boom.internal());
    }
    if (!achievement) {
      log.error({user: request.auth.credentials.id, err: 'not found', achievement: id}, 'error deleting achievement');
      return cb(Boom.notFound());
    }

    return cb(null, achievement);
  });
}
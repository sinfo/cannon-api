var Boom = require('boom');
var slug = require('slug');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var dupKeyParser = require('server/helpers/dupKeyParser');
var User = require('server/models/user');

server.method('user.create', create, {});
server.method('user.update', update, {});
server.method('user.get', get, {});
server.method('user.getByToken', getByToken, {});
server.method('user.list', list, {});
server.method('user.remove', remove, {});

function create(user, cb) {
  user.id = user.id || slug(user.name).toLowerCase();

  User.create(user, function(err, _user) {
    if (err) {
      if(err.code == 11000) {
      	log.warn({err:err, requestedUser: user.id}, 'user is a duplicate');
        return cb(Boom.conflict(dupKeyParser(err.err)+' is a duplicate'));
      }

      log.error({ err: err, user: user.id}, 'error creating user');
      return cb(Boom.internal());
    }

    cb(null, _user);
  });
}

function update(id, user, cb) {
  User.findOneAndUpdate({id: id}, user, function(err, _user) {
    if (err) {
      log.error({err: err, requestedUser: id}, 'error updating user');
      return cb(Boom.internal());
    }
    if (!_user) {
      log.error({err: err, requestedUser: id}, 'error updating user');
      return cb(Boom.notFound());
    }

    cb(null, _user);
  });
}

function get(id, cb) {
  User.findOne({$or:[ {id: id}, {'facebook.id': id} ]}, function(err, user) {
    if (err) {
      log.error({err: err, requestedUser: id}, 'error getting user');
      return cb(Boom.internal());
    }
    if (!user) {
      log.error({err: err, requestedUser: id}, 'error getting user');
      return cb(Boom.notFound());
    }

    cb(null, user);
  });
}

function getByToken(token, cb) {
  User.findOne({'bearer.token': token}, function(err, user) {
    if (err) {
      log.error({err: err, requestedUser: id}, 'error getting user');
      return cb(Boom.internal());
    }
    if (!user) {
      log.error({err: err, requestedUser: id}, 'error getting user');
      return cb(Boom.notFound());
    }

    cb(null, user);
  });
}

function list(cb) {
  User.find({}, function(err, users) {
    if (err) {
      log.error({err: err}, 'error getting all users');
      return cb(Boom.internal());
    }
    
    cb(null, users);
  });
}

function remove(id, cb) {
  User.findOneAndRemove({id: id}, function(err, user){
    if (err) {
      log.error({err: err, requestedUser: id}, 'error deleting user');
      return cb(Boom.internal());
    }
    if (!user) {
      log.error({err: err, requestedUser: id}, 'error deleting user');
      return cb(Boom.notFound());
    }

    return cb(null, user);
  });
}

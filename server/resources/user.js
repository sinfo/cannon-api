var Boom = require('boom');
var slug = require('slug');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var dupKeyParser = require('server/helpers/dupKeyParser');
var fieldsParser = require('server/helpers/fieldsParser');
var config = require('config');
var User = require('server/db/user');

server.method('user.create', create, {});
server.method('user.update', update, {});
server.method('user.get', get, {});
server.method('user.getByToken', getByToken, {});
server.method('user.list', list, {});
server.method('user.remove', remove, {});

function create(user, cb) {
  user.id = user.id || slug(user.name).toLowerCase();
  user.role = user.role || config.auth.permissions[0];
  user.resgistered = Date.now();

  User.create(user, function(err, _user) {
    if (err) {
      if(err.code == 11000) {
      	log.warn({err:err, requestedUser: user.id}, 'user is a duplicate');
        return cb(Boom.conflict(dupKeyParser(err.err)+' is a duplicate'));
      }

      log.error({ err: err, user: user.id}, 'error creating user');
      return cb(Boom.internal());
    }

    cb(null, _user.toObject({ getters: true }));
  });
}

function update(filter, user, opts, cb) {

  user.updated = Date.now();

  if(typeof opts == 'function') {
    cb = opts;
    opts = {};
  }

  if(typeof filter == 'string') {
    filter = { id: filter };
  }

  User.findOneAndUpdate(filter, user, opts, function(err, _user) {
    if (err) {
      log.error({err: err, requestedUser: filter}, 'error updating user');
      return cb(Boom.internal());
    }
    if (!_user) {
      log.error({err: err, requestedUser: filter}, 'user not found');
      return cb(Boom.notFound());
    }

    cb(null, _user.toObject({ getters: true }));
  });
}

function get(filter, query, cb) {
  cb = cb || query; // fields is optional

  var fields = fieldsParser(query.fields);

  if(typeof filter == 'string') {
    filter = { id: filter };
  }

  User.findOne(filter, fields, function(err, user) {
    if (err) {
      log.error({err: err, requestedUser: filter}, 'error getting user');
      return cb(Boom.internal());
    }
    if (!user) {
      log.warn({err: err, requestedUser: filter}, 'could not find user');
      return cb(Boom.notFound());
    }

    cb(null, user);
  });
}

function getByToken(token, cb) {
  User.findOne({'bearer.token': token}, function(err, user) {
    if (err) {
      log.error({err: err, requestedUser: user}, 'error getting user');
      return cb(Boom.internal());
    }
    if (!user) {
      log.error({err: err, requestedUser: user}, 'error getting user');
      return cb(Boom.notFound());
    }

    cb(null, user);
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

  User.find(filter, fields, options, function(err, users) {
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

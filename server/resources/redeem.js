var Boom = require('boom');
var slug = require('slug');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var fieldsParser = require('server/helpers/fieldsParser');
var Redeem = require('server/models/redeem');

server.method('redeem.create', create, {});
server.method('redeem.update', update, {});
server.method('redeem.get', get, {});
server.method('redeem.list', list, {});
server.method('redeem.remove', remove, {});


function create(redeem, cb) {
  Redeem.id = slug(file.name);

  Redeem.create(redeem, function(err, _redeem) {
    if (err) {
      if(err.code == 11000) {
        return cb(Boom.conflict('redeem is a duplicate'));
      }

      log.error({user: request.auth.credentials.id, err: err, redeem: redeem.id}, 'error redeeming');
      return cb(Boom.internal());
    }

    cb(null, _redeem);
  });
}

function update(id, redeem, cb) {
  Redeem.findOneAndUpdate({id: id}, redeem, function(err, _redeem) {
    if (err) {
      log.error({user: request.auth.credentials.id, err: err, redeem: id}, 'error updating redeem');
      return cb(Boom.internal());
    }
    if (!_file) {
      log.error({user: request.auth.credentials.id, err: err, redeem: id}, 'error updating redeem');
      return cb(Boom.notFound());
    }

    cb(null, _redeem);
  });
}

function get(id, redeem, cb) {
  cb = cb || fields; // fields is optional

  Redeem.findOne({id: id}, fieldsParser(fields), function(err, redeem) {
    if (err) {
      log.error({user: request.auth.credentials.id, err: err, redeem: id}, 'error getting redeem');
      return cb(Boom.internal());
    }
    if (!redeem) {
      log.error({user: request.auth.credentials.id, err: 'not found', redeem: id}, 'error getting redeem');
      return cb(Boom.notFound());
    }

    cb(null, redeem);
  });
}

function list(fields, cb) {
  cb = cb || fields; // fields is optional

  Redeem.find({}, fieldsParser(fields), function(err, redeem) {
    if (err) {
      log.error({user: request.auth.credentials.id, err: err}, 'error getting all redeems');
      return cb(Boom.internal());
    }
    
    cb(null, redeem);
  });
}

function remove(id, cb) {
  Redeem.findOneAndRemove({id: id}, function(err, redeem){
    if (err) {
      log.error({user: request.auth.credentials.id, err: err, redeem: id}, 'error deleting redeem');
      return cb(Boom.internal());
    }
    if (!redeem) {
      log.error({user: request.auth.credentials.id, err: 'not found', redeem: id}, 'error deleting redeem');
      return cb(Boom.notFound());
    }

    return cb(null, redeem);
  });
}
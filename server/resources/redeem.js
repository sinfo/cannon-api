var Boom = require('boom');
var slug = require('slug');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var fieldsParser = require('server/helpers/fieldsParser');
var Redeem = require('server/db/redeem');

server.method('redeem.create', create, {});
server.method('redeem.update', update, {});
server.method('redeem.get', get, {});
server.method('redeem.list', list, {});
server.method('redeem.remove', remove, {});


function create(redeem, cb) {

  Redeem.created = Date.now();

  Redeem.create(redeem, function(err, _redeem) {
    if (err) {
      if(err.code == 11000) {
        return cb(Boom.conflict('redeem is a duplicate'));
      }

      log.error({err: err, redeem: redeem.id}, 'error redeeming');
      return cb(Boom.internal());
    }

    cb(null, _redeem.toObject({ getters: true }));
  });
}

function update(id, redeem, cb) {
  Redeem.findOneAndUpdate({id: id}, redeem, function(err, _redeem) {
    if (err) {
      log.error({err: err, redeem: id}, 'error updating redeem');
      return cb(Boom.internal());
    }
    if (!_redeem) {
      log.error({err: err, redeem: id}, 'error updating redeem');
      return cb(Boom.notFound());
    }

    cb(null, _redeem.toObject({ getters: true }));
  });
}

function get(id, query, cb) {
  cb = cb || query; // fields is optional
  var fields = fieldsParser(query.fields);

  Redeem.findOne({id: id}, fields, function(err, redeem) {
    if (err) {
      log.error({err: err, redeem: id}, 'error getting redeem');
      return cb(Boom.internal());
    }
    if (!redeem) {
      log.error({err: 'not found', redeem: id}, 'error getting redeem');
      return cb(Boom.notFound());
    }

    cb(null, redeem);
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

  Redeem.find(filter, fields, options, function(err, redeem) {
    if (err) {
      log.error({err: err}, 'error getting all redeems');
      return cb(Boom.internal());
    }
    
    cb(null, redeem);
  });
}

function remove(id, cb) {
  Redeem.findOneAndRemove({id: id}, function(err, redeem){
    if (err) {
      log.error({err: err, redeem: id}, 'error deleting redeem');
      return cb(Boom.internal());
    }
    if (!redeem) {
      log.error({err: 'not found', redeem: id}, 'error deleting redeem');
      return cb(Boom.notFound());
    }

    return cb(null, redeem);
  });
}
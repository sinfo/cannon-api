var Boom = require('boom');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var options = require('server/options');
var fieldsParser = require('server/helpers/fieldsParser');
var CV = require('server/db/cv');

server.method('cv.create', create, {});
server.method('cv.update', update, {});
server.method('cv.updateFile', updateFile, {});
server.method('cv.get', get, {});
server.method('cv.list', list, {});
server.method('cv.remove', remove, {});


function create(cv, id, cb) {
  cb || (cb = id);
  cv.id = (cv.id || cv.file);
  cv.user = (cv.user || id);
  cv.expires = (cv.expires || options.cv.expires);
  if(typeof id === 'string'){ cv.id + '-' + id;}

  cv.updated = cv.created = Date.now();

  CV.create(cv, function(err, _cv) {
    if (err) {
      if(err.code == 11000) {
        return cb(Boom.conflict('cv is a duplicate'));
      }

      log.error({err: err, cv: cv.id}, 'error creating cv');
      return cb(Boom.internal());
    }

    cb(null, _cv.toObject({ getters: true }));
  });
}

//id can be from file, user or cv
function updateFile(id, file, query, cb) {
  var options  = {};
  log.debug(file);
  var filter = {$or:[ {id: id}, {user: id} ]};
  cb = cb || query;
  log.debug(query);
  if(query &&query.upsert === 'true'){
    log.debug('upsert cv');
    options.upsert = true;
  }

  CV.findOneAndUpdate({id: id}, {file: file}, options, function(err, _cv) {
    if (err) {
      log.error({err: err, cv: id}, 'error updating cv');
      return cb(Boom.internal());
    }
    if (!_cv) {
      log.error({err: err, cv: id}, 'error updating cv');
      return cb(Boom.notFound());
    }

    cb(null, _cv.toObject({ getters: true }));
  });
}

//id can be from file, user or cv
function update(id, cv, query, cb) {
  var options  = {};
  var filter = {$or:[ {id: id}, {user: id} ]};
  cb = cb || query;
  if(query && query.upsert === 'true'){
    log.debug('upsert cv');
    options.upsert = true;
  }

  CV.findOneAndUpdate({id: id}, cv, options, function(err, _cv) {
    if (err) {
      log.error({err: err, cv: id}, 'error updating cv');
      return cb(Boom.internal());
    }
    if (!_cv) {
      log.error({err: err, cv: id}, 'error updating cv');
      return cb(Boom.notFound());
    }

    cb(null, _cv.toObject({ getters: true }));
  });
}

function get(id, query, cb) {
  if(!id){ //check if cv exists use case
    return cb();
  }

  cb = cb || query; // fields is optional
  var fields = fieldsParser(query.fields);

  CV.findOne({id: id}, fields, function(err, cv) {
    if (err) {
      log.error({err: err, cv: id}, 'error getting cv');
      return cb(Boom.internal());
    }
    if (!cv) {
      log.error({err: 'not found', cv: id}, 'error getting cv');
      return cb(Boom.notFound());
    }

    cb(null, cv);
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

  CV.find(filter, fields, options, function(err, cv) {
    if (err) {
      log.error({err: err}, 'error getting all cvs');
      return cb(Boom.internal());
    }
    
    cb(null, cv);
  });
}

function remove(id, cb) {
  CV.findOneAndRemove({id: id}, function(err, cv){
    if (err) {
      log.error({err: err, cv: id}, 'error deleting cv');
      return cb(Boom.internal());
    }
    if (!cv) {
      log.error({err: 'not found', cv: id}, 'error deleting cv');
      return cb(Boom.notFound());
    }

    return cb(null, cv);
  });
}
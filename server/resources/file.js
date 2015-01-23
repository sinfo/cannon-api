var Boom = require('boom');
var slug = require('slug');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var fieldsParser = require('server/helpers/fieldsParser');
var File = require('server/models/file');

server.method('file.create', create, {});
server.method('file.update', update, {});
server.method('file.get', get, {});
server.method('file.list', list, {});
server.method('file.remove', remove, {});


function create(file, cb) {
  file.id = slug(file.name);

  File.create(file, function(err, _file) {
    if (err) {
      if(err.code == 11000) {
        return cb(Boom.conflict('file is a duplicate'));
      }

      log.error({err: err, file: file.id}, 'error creating file');
      return cb(Boom.internal());
    }

    cb(null, _file);
  });
}

function update(id, file, cb) {
  File.findOneAndUpdate({id: id}, file, function(err, _file) {
    if (err) {
      log.error({err: err, file: id}, 'error updating file');
      return cb(Boom.internal());
    }
    if (!_file) {
      log.error({err: err, file: id}, 'error updating file');
      return cb(Boom.notFound());
    }

    cb(null, _file);
  });
}

function get(id, query, cb) {
  cb = cb || query; // fields is optional
  var fields = fieldsParser(query.fields);

  File.findOne({id: id}, fields, function(err, file) {
    if (err) {
      log.error({err: err, file: id}, 'error getting file');
      return cb(Boom.internal());
    }
    if (!file) {
      log.error({err: 'not found', file: id}, 'error getting file');
      return cb(Boom.notFound());
    }

    cb(null, file);
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

  File.find(filter, fields, options, function(err, file) {
    if (err) {
      log.error({err: err}, 'error getting all files');
      return cb(Boom.internal());
    }
    
    cb(null, file);
  });
}

function remove(id, cb) {
  File.findOneAndRemove({id: id}, function(err, file){
    if (err) {
      log.error({err: err, file: id}, 'error deleting file');
      return cb(Boom.internal());
    }
    if (!file) {
      log.error({err: 'not found', file: id}, 'error deleting file');
      return cb(Boom.notFound());
    }

    return cb(null, file);
  });
}
var Joi = require('joi');
var log = require('server/helpers/logger');


var handlers = module.exports;

exports.create = {
  validate: {
    payload: {
    	id: Joi.string().required().description('File id'),
    	name: Joi.string().required().description('File name'),
    	kind: Joi.string().required().description('File category'),
    	extension: Joi.string().required().description('File type'),
    	created: Joi.date().required().description('Creation time and date'),
    	updated: Joi.date().required().description('Update time and date'),
    }
  },
  pre: [
    { method: 'file.create(payload)', assign: 'file' }
  ],
  handler: function (request, reply) {
    reply(request.file).created('/api/file/'+request.pre.file.id);
  },
  description: 'Creates a new file'
};


exports.update = {
  validate: {
    params: {
      id: Joi.string().required().description('Id of the file we want to update'),
    },
    payload: {
    	id: Joi.string().required().description('File id'),
    	name: Joi.string().required().description('File name'),
    	kind: Joi.string().required().description('File category'),
    	extension: Joi.string().required().description('File type'),
    	created: Joi.date().required().description('Creation time and date'),
    	updated: Joi.date().required().description('Update time and date'),
    }
  },
  pre: [
    { method: 'file.update(params.id, payload)', assign: 'file' }
  ],
  handler: function (request, reply) {
    reply(request.pre.file);
  },
  description: 'Updates a file'
};


exports.get = {
  validate: {
    params: {
      id: Joi.string().required().description('Id of the file we want to retrieve'),
    }
  },
  pre: [
    { method: 'file.get(params.id)', assign: 'file' }
  ],
  handler: function (request, reply) {
    reply(request.pre.file);
  },
  description: 'Gets an file'
};


exports.list = {
  pre: [
    { method: 'file.list()', assign: 'files' }
  ],
  handler: function (request, reply) {
    reply(request.pre.files);
  },
  description: 'Gets all the files'
};


exports.remove = {
  validate: {
    params: {
      id: Joi.string().required().description('Id of the file we want to remove'),
    }
  },
  pre: [
    { method: 'file.remove(params.id)', assign: 'file' }
  ],
  handler: function (request, reply) {
    reply(request.pre.file);
  },
  description: 'Removes a file'
};
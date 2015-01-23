var Joi = require('joi');
var log = require('server/helpers/logger');
var render = require('server/views/file');


var handlers = module.exports;

exports.create = {
  auth: {
    strategies: ['default', 'backup'],
  },
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
    reply(render(request.file)).created('/api/file/'+request.pre.file.id);
  },
  description: 'Creates a new file'
};


exports.update = {
  auth: {
    strategies: ['default', 'backup'],
  },
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
    reply(render(request.pre.file));
  },
  description: 'Updates a file'
};


exports.get = {
  auth: {
    strategies: ['default', 'backup'],
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id of the file we want to retrieve'),
    }
  },
  pre: [
    { method: 'file.get(params.id, query)', assign: 'file' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.file));
  },
  description: 'Gets an file'
};


exports.list = {
  auth: {
    strategies: ['default', 'backup'],
  },
  pre: [
    { method: 'file.list(query)', assign: 'files' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.files));
  },
  description: 'Gets all the files'
};


exports.remove = {
  auth: {
    strategies: ['default', 'backup'],
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id of the file we want to remove'),
    }
  },
  pre: [
    { method: 'file.remove(params.id)', assign: 'file' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.file));
  },
  description: 'Removes a file'
};
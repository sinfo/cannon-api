var Joi = require('joi');
var log = require('server/helpers/logger');
var render = require('server/views/file');
var configUpload = require('config').upload;
var optionsUpload = require('server/options').upload;


var handlers = module.exports;

exports.create = {
  tags: ['api','file'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['admin']
  },
  validate: {
    payload: {
    	id: Joi.string().required().description('File id'),
    	name: Joi.string().required().description('File name'),
    	kind: Joi.string().required().description('File category'),
    	extension: Joi.string().required().description('File type')
    }
  },
  pre: [
    { method: 'file.create(payload)', assign: 'file' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.file)).created('/api/file/'+request.pre.file.id);
  },
  description: 'Creates a new file'
};


exports.update = {
  tags: ['api','file'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['admin']
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id of the file we want to update'),
    },
    payload: {
    	id: Joi.string().description('File id'),
    	name: Joi.string().description('File name'),
    	kind: Joi.string().description('File category'),
    	extension: Joi.string().description('File type'),
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
  tags: ['api','file'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin']
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
  tags: ['api','file'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['admin']
  },
  validate: {
    query: {
      fields: Joi.string().default('id,name,img').description('Fields we want to retrieve'),
    }
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
  tags: ['api','file'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['admin']

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

exports.upload = {
  tags: ['api','file'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['admin']
  },
  payload: {
    output: 'stream',
    parse: true,
    allow: 'multipart/form-data',
    maxBytes: configUpload.maxSize
  },
  validate: {
    params: {
      kind: Joi.string().valid(optionsUpload.map(function(o){
        return o.kind;
      })).required().description('File category'),
    },
    payload: Joi.object().pattern(/(\w*\W*)*/,
      Joi.object({
        pipe: Joi.func().required().description('File stream'),
        hapi: Joi.object({
          filename: Joi.string().required().description('File name'),
          headers: Joi.object({
            'content-type': Joi.string().required().description('File mime type'),
            'content-disposition': Joi.string().required().regex(/\w*\W*filename\w*\W*/).description('File name')
          }).unknown().required().description('File headers')
        }).required().description('File')
      }).unknown()
    ).required()
  },
  pre: [
    { method: 'file.upload(params.kind, payload)', assign: 'file' },
    { method: 'file.createArray(pre.file)', assign: 'fileInfo' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.fileInfo)).created('/api/file/'+request.pre.fileInfo.id);
  },
  description: 'Uploads one or more files'
};

exports.uploadUsers = {
  tags: ['api','file'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin']
  },
  payload: {
    output: 'stream',
    parse: true,
    allow: 'multipart/form-data',
    maxBytes: configUpload.maxSize
  },
  validate: {
    params: {
      kind: Joi.string().valid(optionsUpload.map(function(o){
        return o.kind;
      })).required().description('File category'),
    },
    payload: Joi.object().pattern(/(\w*\W*)*/,
      Joi.object({
        pipe: Joi.func().required().description('File stream'),
        hapi: Joi.object({
          filename: Joi.string().required().description('File name'),
          headers: Joi.object({
            'content-type': Joi.string().required().description('File mime type'),
            'content-disposition': Joi.string().required().regex(/\w*\W*filename\w*\W*/).description('File name')
          }).unknown().required().description('File headers')
        }).required().description('File')
      }).unknown()
    ).required()
  },
  pre: [
    { method: 'file.cv()', assign:'cv'},
    { method: 'file.upload(params.kind, payload)', assign: 'file' },
    { method: 'file.createArray(pre.file)', assign: 'fileInfo' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.fileInfo)).created('/api/file/'+request.pre.fileInfo.id);
  },
  description: 'Uploads one or more files'
};
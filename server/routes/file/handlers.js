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
      user: Joi.string().required().description('File user'),
    	name: Joi.string().required().description('File name'),
    	kind: Joi.string().required().description('File category'),
    	extension: Joi.string().required().description('File type')
    }
  },
  pre: [
    { method: 'file.create(payload)', assign: 'file' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.file)).created('/file/'+request.pre.file.id);
  },
  description: 'Creates a new file model'
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
      user: Joi.string().description('File user'),
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
  description: 'Updates a file model'
};


exports.get = {
  tags: ['api','file'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['admin']
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id or user of the file we want to retrieve'),
    }
  },
  pre: [
    { method: 'file.get(params.id, query)', assign: 'file' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.file));
  },
  description: 'Gets the model of the file'
};

exports.getMe = {
  tags: ['api','file'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin']
  },
  pre: [
    { method: 'file.get(auth.credentials.user.id, query)', assign: 'file' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.file));
  },
  description: 'Gets the file model of the user'
};

exports.download = {
  tags: ['api','file'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['admin']
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id or user of the file we want to retrieve'),
    }
  },
  pre: [
    { method: 'file.get(params.id, query)', assign: 'file' }
  ],
  handler: function (request, reply) {
    var path = configUpload.path + '/' + request.pre.file.id;
    var options = {
      filename: request.pre.file.name,
      mode: 'attachment'
    };
    reply.file(path, options);
  },
  description: 'Downloads the file'
};

exports.downloadMe = {
  tags: ['api','file'],
  auth: {
    strategies: ['backup'],
    scope: ['user', 'admin']
  },
  pre: [
    { method: 'file.get(auth.credentials.user.id, query)', assign: 'file' }
  ],
  handler: function (request, reply) {
    var path = configUpload.path + '/' + request.pre.file.id;
    var options = {
      filename: request.pre.file.name,
      mode: 'attachment'
    };
    reply.file(path, options).type('application/pdf');
  },
  description: 'Downloads the file of the user'
};

exports.list = {
  tags: ['api','file'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['admin']
  },
  validate: {
    query: {
      fields: Joi.string().description('Fields we want to retrieve'),
      sort: Joi.string().description('Sort fields we want to retrieve'),
      skip: Joi.number().description('Number of documents we want to skip'),
      limit: Joi.number().description('Limit of documents we want to retrieve')
    }
  },
  pre: [
    { method: 'file.list(query)', assign: 'files' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.files));
  },
  description: 'Gets all the file models'
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

exports.removeMe = {
  tags: ['api','file'],
  auth: {
    strategies: ['default', 'backup'],
    scope: ['user', 'admin']

  },
  pre: [
    { method: 'file.remove(auth.credentials.user.id)', assign: 'file' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.file));
  },
  description: 'Removes user file'
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
    query: {
      upsert: Joi.string().default('true'),
    },
    params: {
      id: Joi.string().required().description('Id of the user whose file we want to upload'),
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
    ).required().length(1)
  },
  pre: [
    { method: 'user.get(params.id)', assign: 'user' },
    { method: 'file.uploadCV(payload)', assign: 'file' },
    { method: 'file.get(auth.credentials.user.id)', assign: 'oldFile', failAction: 'log'},
    [
      { method: 'file.delete(pre.oldFile.id)', assign: 'deleteFile', failAction: 'log'},
      { method: 'file.update(pre.oldFile.id, pre.file, auth.credentials.user.id, query)', assign: 'fileInfo' }
    ]
  ],
  handler: function (request, reply) {
    reply(render(request.pre.fileInfo)).created('/api/file/'+request.pre.fileInfo.id);
  },
  description: 'Uploads a file'
};

exports.uploadMe = {
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
    query: {
      upsert: Joi.string().invalid('false').default('true'),
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
    ).required().length(1)
  },
  pre: [
    { method: 'file.uploadCV(payload)', assign: 'file' },
    { method: 'file.get(auth.credentials.user.id)', assign: 'oldFile', failAction: 'log'},
    [
      { method: 'file.delete(pre.oldFile.id)', assign: 'deleteFile', failAction: 'log'},
      { method: 'file.update(pre.oldFile.id, pre.file, auth.credentials.user.id, query)', assign: 'fileInfo' }
    ]
  ],
  handler: function (request, reply) {
    reply(render(request.pre.fileInfo)).created('/api/file/'+request.pre.fileInfo.id);
  },
  description: 'Uploads a file of the user'
};
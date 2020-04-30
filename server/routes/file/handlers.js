const Joi = require('joi')
const render = require('../../views/file')
const configUpload = require('../../../config').upload
const server = require('../../').hapi

exports = module.exports

exports.create = {
  tags: ['api', 'file'],
  auth: {
    strategies: ['default'],
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
    reply(render(request.pre.file)).created('/file/' + request.pre.file.id)
  },
  description: 'Creates a new file model'
}

exports.update = {
  tags: ['api', 'file'],
  auth: {
    strategies: ['default'],
    scope: ['admin']
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id of the file we want to update')
    },
    payload: {
      id: Joi.string().description('File id'),
      user: Joi.string().description('File user'),
      name: Joi.string().description('File name'),
      kind: Joi.string().description('File category'),
      extension: Joi.string().description('File type')
    }
  },
  pre: [
    { method: 'file.update(params.id, payload)', assign: 'file' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.file))
  },
  description: 'Updates a file model'
}

exports.get = {
  tags: ['api', 'file'],
  auth: {
    strategies: ['default'],
    scope: ['admin']
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id or user of the file we want to retrieve')
    }
  },
  pre: [
    { method: 'file.get(params.id, query)', assign: 'file' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.file))
  },
  description: 'Gets the model of the file'
}

exports.getMe = {
  tags: ['api', 'file'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin']
  },
  pre: [
    { method: 'file.get(auth.credentials.user.id, query)', assign: 'file' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.file))
  },
  description: 'Gets the file model of the user'
}

exports.download = {
  tags: ['api', 'file'],
  auth: {
    strategies: ['default'],
    scope: ['admin']
  },
  validate: {
    params: {
      id: Joi.string().required().description('Id or user of the file we want to retrieve')
    }
  },
  pre: [
    { method: 'file.get(params.id, query)', assign: 'file' }
  ],
  handler: function (request, reply) {
    const path = configUpload.path + '/' + request.pre.file.id
    const options = {
      filename: request.pre.file.name,
      mode: 'attachment'
    }
    reply.file(path, options)
  },
  description: 'Downloads the file'
}

exports.downloadMe = {
  tags: ['api', 'file'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin']
  },
  pre: [
    { method: 'file.get(auth.credentials.user.id, query)', assign: 'file' }
  ],
  handler: function (request, reply) {
    const path = configUpload.path + '/' + request.pre.file.id
    const options = {
      filename: request.pre.file.name,
      mode: 'attachment'
    }
    reply.file(path, options).type('application/pdf')
  },
  description: 'Downloads the file of the user'
}

exports.downloadZip = {
  tags: ['api', 'file'],
  auth: {
    strategies: ['default'],
    scope: ['team', 'admin']
  },
  validate: {
    query: {
      editionId: Joi.string().required().description('The edition of the event')
    }
  },
  handler: function (request, reply) {
    server.methods.file.zipFiles(null, (err, zip) => {
      return reply.file(configUpload.cvsZipPath, { mode: 'attachment', filename: 'CVs.zip' }) // Return generic zip
    })
  },
  description: 'Downloads users files'
}
exports.downloadCompany = {
  tags: ['api', 'file'],
  auth: {
    strategies: ['default'],
    scope: ['company', 'team', 'admin']
  },
  validate: {
    params: {
      companyId: Joi.string().required().description('Company Id')
    },
    query: {
      editionId: Joi.string().required().description('The edition of the event'),
      links: Joi.boolean().description('Selects only the files from linked users')
    }
  },
  pre: [
    [
      // Verify the user has access to the company
      { method: 'link.checkCompany(auth.credentials.user.id, params.companyId, query.editionId)'},
      // Make sure enpoint is still open
      { method: 'endpoint.isValid(params.companyId, query.editionId)'}
    ],
    { method: 'endpoint.incrementVisited(params.companyId, query.editionId)'}
  ],
  handler: function (request, reply) {
    // Concat links CVs if asked. Select generic CVs zip if not
    if (request.query.links) {
      server.methods.link.list(request.params.companyId, request.query, (err, links) => {
        return server.methods.file.zipFiles(links, handleZip)
      })
    }else{
      return server.methods.file.zipFiles(null, handleZip)
    }

    function handleZip (err, zip) {
      if (!zip) {
        return reply.file(configUpload.cvsZipPath, { mode: 'attachment', filename: 'CVs.zip' }) // Return generic zip
      }
      /*return reply(zip).bytes(zip.length).header('Content-Type', 'application/zip')
      .header('Content-Disposition', 'attachment; filename=linksCVs.zip') // Return Links zip
      */
      return reply.file(configUpload.cvsLinkPath, { mode: 'attachment', filename: 'LinksCVs.zip' }) // Return links zip
    }
  },
  description: 'Downloads users files'
}

exports.list = {
  tags: ['api', 'file'],
  auth: {
    strategies: ['default'],
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
    reply(render(request.pre.files))
  },
  description: 'Gets all the file models'
}

exports.remove = {
  tags: ['api', 'file'],
  auth: {
    strategies: ['default'],
    scope: ['admin']

  },
  validate: {
    params: {
      id: Joi.string().required().description('Id of the file we want to remove')
    }
  },
  pre: [
    { method: 'file.remove(params.id)', assign: 'file' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.file))
  },
  description: 'Removes a file'
}

exports.removeMe = {
  tags: ['api', 'file'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin']

  },
  pre: [
    { method: 'file.removeFromUser(auth.credentials.user.id)', assign: 'file' },
    {method: 'achievement.removeCV(auth.credentials.user.id)', assign: 'achievement', failAction: 'log'},
  ],
  handler: function (request, reply) {
    reply(render(request.pre.file))
  },
  description: 'Removes user file'
}

exports.upload = {
  tags: ['api', 'file'],
  auth: {
    strategies: ['default'],
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
      upsert: Joi.string().default('true')
    },
    params: {
      id: Joi.string().required().description('Id of the user whose file we want to upload')
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
    { method: 'file.get(auth.credentials.user.id)', assign: 'oldFile', failAction: 'log' },
    [
      { method: 'file.delete(pre.oldFile.id)', assign: 'deleteFile', failAction: 'log' },
      { method: 'file.update(pre.oldFile.id, pre.file, auth.credentials.user.id, query)', assign: 'fileInfo' }
    ]
  ],
  handler: function (request, reply) {
    reply(render(request.pre.fileInfo)).created('/api/file/' + request.pre.fileInfo.id)
  },
  description: 'Uploads a file'
}

exports.uploadMe = {
  tags: ['api', 'file'],
  auth: {
    strategies: ['default'],
    scope: ['user', 'company', 'team', 'admin']
  },
  payload: {
    output: 'stream',
    parse: true,
    allow: 'multipart/form-data',
    maxBytes: configUpload.maxSize
  },
  validate: {
    query: {
      upsert: Joi.string().invalid('false').default('true')
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
    {method: 'file.uploadCV(payload)', assign: 'file'},
    {method: 'file.get(auth.credentials.user.id)', assign: 'oldFile', failAction: 'log'},
    [
      {method: 'file.delete(pre.oldFile.id)', assign: 'deleteFile', failAction: 'log'},
      {method: 'file.update(pre.oldFile.id, pre.file, auth.credentials.user.id, query)', assign: 'fileInfo'}
    ],
    {method: 'achievement.addCV(auth.credentials.user.id)', assign: 'achievement', failAction: 'log'},
  ],
  handler: function (request, reply) {
    reply(render(request.pre.fileInfo)).created('/api/file/' + request.pre.fileInfo.id)
  },
  description: 'Uploads a file of the user'
}

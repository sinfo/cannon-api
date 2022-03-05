const Joi = require('joi')
const render = require('../../views/file')
const configUpload = require('../../../config').upload
const server = require('../../').hapi
const log = require('../../helpers/logger')
const Boom = require('boom')

exports = module.exports

exports.create = {
  options:{
    tags: ['api', 'file'],
    auth: {
      strategies: ['default'],
      scope: ['admin']
    },
    validate: {
      payload: Joi.object({
        id: Joi.string().required().description('File id'),
        user: Joi.string().required().description('File user'),
        name: Joi.string().required().description('File name'),
        kind: Joi.string().required().description('File category'),
        extension: Joi.string().required().description('File type')
      })
    },
    description: 'Creates a new file model'
  },
  handler: async (request, h) => {
    try{
      let file = await request.server.methods.file.create(request.payload)
      return h.response(render(file)).created('/files/' + ach.id)
    }catch (err) {
      if (err.code === 11000) {
        log.error({msg: "file is a duplicate" })
        return Boom.conflict(`file "${file.id}" is a duplicate`)
      }
      log.error({ err: err, msg:'error creating file'}, 'error creating file')
      return Boom.internal()
    }
  },
}

exports.update = {
  options:{
    tags: ['api', 'file'],
    auth: {
      strategies: ['default'],
      scope: ['admin']
    },
    validate: {
      params: Joi.object({
        id: Joi.string().required().description('Id of the file we want to update')
      }),
      payload: Joi.object({
        id: Joi.string().description('File id'),
        user: Joi.string().description('File user'),
        name: Joi.string().description('File name'),
        kind: Joi.string().description('File category'),
        extension: Joi.string().description('File type')
      })
    },
    description: 'Updates a file model'
  },
  handler: async (request, h) => {
    try{
      let file = await request.server.methods.file.update(request.params.id, request.payload)
      if (!file) {
        log.error({ err: err, file: filter }, 'error updating file')
        return Boom.notFound()
      }
      return h.response(render(file))
    }catch (err) {
      log.error({ err: err, file: filter }, 'error updating file')
      return Boom.internal()
    }
  },
}

exports.get = {
  options:{
    tags: ['api', 'file'],
    auth: {
      strategies: ['default'],
      scope: ['admin']
    },
    validate: {
      params: Joi.object({
        id: Joi.string().required().description('Id or user of the file we want to retrieve')
      })
    },
    pre: [
      { method: 'file.get(params.id, query)', assign: 'file' }
    ],
    description: 'Gets the model of the file'
  },
  handler: async (request, h) => {
    try{
      let file = await request.server.methods.file.get(request.params.id)
      if (!file) {
        log.error({ err: err, file: filter }, 'error getting file')
        return Boom.notFound()
      }
      return h.response(render(file))
    }catch (err) {
      log.error({ err: err, file: filter }, 'error getting file')
      return Boom.internal()
    }
  },
}

exports.getMe = {
  options:{
    tags: ['api', 'file'],
    auth: {
      strategies: ['default'],
      scope: ['user', 'company', 'team', 'admin']
    },
    description: 'Gets the file model of the user'
  },
  handler: async (request, h) => {
    try{
      let file = await request.server.methods.file.getByUser(request.auth.credentials.user.id)
      if (!file) {
        log.error({ err: err, file: filter }, 'error getting file')
        return Boom.notFound()
      }
      return h.response(render(file))
    }catch (err) {
      log.error({ err: err, file: filter }, 'error getting file')
      return Boom.internal()
    }
  },
}

exports.download = {
  options:{
    tags: ['api', 'file'],
    auth: {
      strategies: ['default'],
      scope: ['admin']
    },
    validate: {
      params: Joi.object({
        id: Joi.string().required().description('Id or user of the file we want to retrieve')
      })
    },
    description: 'Downloads the file'
  },
  handler: async (request, h) => {
    let file = await request.server.methods.file.get(request.params.id, request.query)
    
    const path = configUpload.path + '/' + file.id
    const options = {
      filename: file.name,
      mode: 'attachment'
    }
    return h.response.file(path, options)
  },
}

exports.downloadMe = {
  options:{
    tags: ['api', 'file'],
    auth: {
      strategies: ['default'],
      scope: ['user', 'company', 'team', 'admin']
    },
    description: 'Downloads the file of the user'
  },
  handler: async (request, reply) => {
    let file = await request.server.methods.file.get(request.auth.credentials.user.id, request.query)
    const path = configUpload.path + '/' + file.id
    const options = {
      filename: file.name,
      mode: 'attachment'
    }
    return h.response.file(path, options).type('application/pdf')
  },
}

exports.downloadZip = {
  options:{
    tags: ['api', 'file'],
    auth: {
      strategies: ['default'],
      scope: ['team', 'admin']
    },
    validate: {
      query: Joi.object({
        editionId: Joi.string().required().description('The edition of the event')
      })
    },
    description: 'Downloads users files'
  },
  handler: function (request, reply) {
    server.methods.file.zipFiles(null, (_, zip) => {
      return reply.file(configUpload.cvsZipPath, { mode: 'attachment', filename: 'CVs.zip' }) // Return generic zip
    })
  },
}

exports.downloadCompany = {
  options:{
    tags: ['api', 'file'],
    auth: {
      strategies: ['default'],
      scope: ['company', 'team', 'admin']
    },
    validate: {
      params: Joi.object({
        companyId: Joi.string().required().description('Company Id')
      }),
      query: Joi.object({
        editionId: Joi.string().required().description('The edition of the event'),
        links: Joi.boolean().description('Selects only the files from linked users')
      })
    },
    pre: [
      [
        // Verify the user has access to the company
        { method: 'link.checkCompany(auth.credentials.user.id, params.companyId, query.editionId)' },
        // Make sure enpoint is still open
        { method: 'endpoint.isValid(params.companyId, query.editionId)' }
      ],
      { method: 'endpoint.incrementVisited(params.companyId, query.editionId)' }
    ],
    description: 'Downloads users files'
  },
  handler: function (request, reply) {
    // Concat links CVs if asked. Select generic CVs zip if not
    if (request.query.links) {
      server.methods.link.list(request.params.companyId, request.query, (_, links) => {
        return server.methods.file.zipFiles(links, handleZip)
      })
    } else {
      return server.methods.file.zipFiles(null, handleZip)
    }

  function handleZip (err, zip) {// eslint-disable-line
      if (!zip) {
        return reply.file(configUpload.cvsZipPath, { mode: 'attachment', filename: 'CVs.zip' }) // Return generic zip
      }
      /* return reply(zip).bytes(zip.length).header('Content-Type', 'application/zip')
      .header('Content-Disposition', 'attachment; filename=linksCVs.zip') // Return Links zip
      */
      return reply.file(configUpload.cvsLinkPath, { mode: 'attachment', filename: 'LinksCVs.zip' }) // Return links zip
    }
  },
}

exports.list = {
  options:{
    tags: ['api', 'file'],
    auth: {
      strategies: ['default'],
      scope: ['admin']
    },
    validate: {
      query: Joi.object({
        fields: Joi.string().description('Fields we want to retrieve'),
        sort: Joi.string().description('Sort fields we want to retrieve'),
        skip: Joi.number().description('Number of documents we want to skip'),
        limit: Joi.number().description('Limit of documents we want to retrieve')
      })
    },
    pre: [
      { method: 'file.list(query)', assign: 'files' }
    ],
    description: 'Gets all the file models'
  },
  handler: function (request, reply) {
    reply(render(request.pre.files))
  },
}

exports.remove = {
  options:{
    tags: ['api', 'file'],
    auth: {
      strategies: ['default'],
      scope: ['admin']

    },
    validate: {
      params: Joi.object({
        id: Joi.string().required().description('Id of the file we want to remove')
      })
    },
    pre: [
      { method: 'file.remove(params.id)', assign: 'file' }
    ],
    description: 'Removes a file'
  },
  handler: function (request, reply) {
    reply(render(request.pre.file))
  },
}

exports.removeMe = {
  options:{
    tags: ['api', 'file'],
    auth: {
      strategies: ['default'],
      scope: ['user', 'company', 'team', 'admin']

    },
    pre: [
      { method: 'file.removeFromUser(auth.credentials.user.id)', assign: 'file' },
      { method: 'achievement.removeCV(auth.credentials.user.id)', assign: 'achievement', failAction: 'log' }
    ],
    description: 'Removes user file'
  },
  handler: function (request, reply) {
    reply(render(request.pre.file))
  },
}

exports.upload = {
  options:{
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
      query: Joi.object({
        upsert: Joi.string().default('true')
      }),
      params: Joi.object({
        id: Joi.string().required().description('Id of the user whose file we want to upload')
      }),
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
    description: 'Uploads a file'
  },
  handler: function (request, reply) {
    reply(render(request.pre.fileInfo)).created('/api/file/' + request.pre.fileInfo.id)
  },
}

exports.uploadMe = {
  options:{
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
      query: Joi.object({
        upsert: Joi.string().invalid('false').default('true')
      }),
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
      { method: 'file.get(auth.credentials.user.id)', assign: 'oldFile', failAction: 'log' },
      [
        { method: 'file.delete(pre.oldFile.id)', assign: 'deleteFile', failAction: 'log' },
        { method: 'file.update(pre.oldFile.id, pre.file, auth.credentials.user.id, query)', assign: 'fileInfo' }
      ],
      { method: 'achievement.addCV(auth.credentials.user.id)', assign: 'achievement', failAction: 'log' }
    ],
    description: 'Uploads a file of the user'
  },
  handler: function (request, reply) {
    reply(render(request.pre.fileInfo)).created('/api/file/' + request.pre.fileInfo.id)
  },
}

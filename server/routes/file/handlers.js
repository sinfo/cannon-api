const Joi = require('joi')
const render = require('../../views/file')
const configUpload = require('../../../config').upload
const server = require('../../').hapi
const log = require('../../helpers/logger')
const Boom = require('@hapi/boom')

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
    try {
      let file = await request.server.methods.file.create(request.payload)
      return h.response(render(file)).created('/files/' + file.id)
    } catch (err) {
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
    try {
      let file = await request.server.methods.file.update(request.params.id, request.payload)
      if (!file) {
        log.error({ err: err, file: filter }, 'error updating file')
        return Boom.notFound()
      }
      return h.response(render(file))
    } catch (err) {
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
    description: 'Gets the model of the file'
  },
  handler: async (request, h) => {
    try {
      let file = await request.server.methods.file.get(request.params.id)
      if (!file) {
        log.error({ err: err }, 'error getting file')
        return Boom.notFound()
      }
      return h.response(render(file))
    } catch (err) {
      log.error({ err: err}, 'error getting file')
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
    const userId = request.auth.credentials.user.id;
    try {
      let file = await request.server.methods.file.get(userId, request.query)
      if (!file) {
        log.error({ err: err, userId: userId }, 'error getting file')
        return Boom.notFound()
      }
      return h.response(render(file))
    } catch (err) {
      log.error({ err: err, userId: userId }, 'error getting file')
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
    return h.file(path, options)
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
  handler: async (request, h) => {
    let file = await request.server.methods.file.get(request.auth.credentials.user.id, request.query)
    const path = configUpload.path + '/' + file.id
    const options = {
      filename: file.name,
      mode: 'attachment'
    }
    return h.file(path, options).type('application/pdf')
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
  handler: async function (request, h) {
    try {
      await request.server.methods.file.zipFiles(null)
      return h.file(configUpload.cvsZipPath, { mode: 'attachment', filename: 'CVs.zip' }) // Return generic zip
    } catch(err){
      log.error({err: err}, 'error downloading file')
      return Boom.boomify(err)
    }
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
    description: 'Downloads users files'
  },
  handler: async function (request, h) {
    try {
      await request.server.methods.link.checkCompany(request.auth.credentials.user.id, request.params.companyId, request.query.editionId)
      await request.server.methods.endpoint.isValid(request.params.companyId, request.query.editionId)
      await request.server.methods.endpoint.incrementVisited(request.params.companyId, request.query.editionId)
      if (request.query.links) {
          let links = await request.server.methods.link.list(request.params.companyId, request.query)
          await request.server.methods.file.zipFiles(links)
          return handleZip(true)
      } else {
        await request.server.methods.file.zipFiles(null)
        return handleZip(false)
      }
  } catch(err){
    log.error({err: err}, 'error downloading files')
    return Boom.boomify(err)
  }

  function handleZip (zip) {
      if (!zip) {
        return h.file(configUpload.cvsZipPath, { mode: 'attachment', filename: 'CVs.zip' }) // Return generic zip
      }
      /* return reply(zip).bytes(zip.length).header('Content-Type', 'application/zip')
      .header('Content-Disposition', 'attachment; filename=linksCVs.zip') // Return Links zip
      */
      return h.file(configUpload.cvsLinkPath, { mode: 'attachment', filename: 'LinksCVs.zip' }) // Return links zip
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
    description: 'Gets all the file models'
  },
  handler: async function (request, h) {
    try {
      let files = await request.server.methods.file.list(request.query)
      return h.response(render(files))
    }
    catch (err) {
      log.error({ err: err, msg: 'error getting file models' }, 'error getting file models')
      return Boom.boomify(err)
    }
  }  
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
    description: 'Removes a file'
  },
  handler: async function (request, h) {
    try {
      let file = await request.server.methods.file.remove(request.params.id)
      return h.response(render(file))
    }
    catch (err) {
      log.error({ err: err, msg: 'error removing a file' }, 'error removing a file')
      return Boom.boomify(err)
    }
  }
}

exports.removeMe = {
  options:{
    tags: ['api', 'file'],
    auth: {
      strategies: ['default'],
      scope: ['user', 'company', 'team', 'admin']

    },
    description: 'Removes user file'
  },
  handler: async function (request, h) {
    try {
      let file = await request.server.methods.file.removeFromUser(request.auth.credentials.user.id)
      await request.server.methods.achievement.removeCV(request.auth.credentials.user.id)
      return h.response(render(file))
    }
    catch (err) {
      log.error({ err: err, msg: 'error removing users file' }, 'error removing users file')
      return Boom.boomify(err)
    }
  }
}

exports.upload = {
  options: {
    tags: ['api', 'file'],
    auth: {
      strategies: ['default'],
      scope: ['admin']
    },
    payload: {
      output: 'stream',
      multipart: true,
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
    description: 'Uploads a file'
  },
  handler: async function (request, h) {
    try {
      let user = await request.server.methods.user.get(request.params.id)
      if (!user) {
        log.error({ err: err}, 'user not found')
        return Boom.notFound()
      }

      let file = await request.server.methods.file.uploadCV(request.payload)
      let oldFile = await request.server.methods.file.get(request.params.id)

      if (oldFile !== -1)
        await request.server.methods.file.delete(oldFile.id)

        let fileInfo = await request.server.methods.file.update(oldFile !== -1 ? oldFile.id : file.id, file, request.params.id, request.query)
      
      return h.response(render(fileInfo)).created('/api/file/' + fileInfo.id)
    } catch (err) {
      log.error({ err: err, msg: 'error uploading file' }, 'error uploading file')
      return Boom.boomify(err)
    }
  }
}

exports.uploadMe = {
  options: {
    tags: ['api', 'file'],
    auth: {
      strategies: ['default'],
      scope: ['user', 'company', 'team', 'admin']
    },
    payload: {
      output: 'stream',
      multipart: true,
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
    description: 'Uploads a file of the user'
  },

  handler: async function (request, h) {
    try {
      let file = await request.server.methods.file.uploadCV(request.payload)
      let oldFile = await request.server.methods.file.get(request.auth.credentials.user.id)

      if (oldFile !== -1)
        await request.server.methods.file.delete(oldFile.id)

      let fileInfo = await request.server.methods.file.update(oldFile !== -1 ? oldFile.id : file.id, file, request.auth.credentials.user.id, request.query)
      await request.server.methods.achievement.addCV(request.auth.credentials.user.id)
      return h.response(render(fileInfo)).created('/api/file/' + fileInfo.id)
    } catch (err) {
      log.error({ err: err, msg: 'error uploading file' }, 'error uploading file')
      return Boom.boomify(err)
    }
  }  
}
const Joi = require('joi')
const render = require('../../views/file')
const configUpload = require('../../../config').upload
exports = module.exports
  tags: ['api', 'file'],
      id: Joi.string().required().description('File id'),
      name: Joi.string().required().description('File name'),
      kind: Joi.string().required().description('File category'),
      extension: Joi.string().required().description('File type')
    reply(render(request.pre.file)).created('/file/' + request.pre.file.id)
}
  tags: ['api', 'file'],
      id: Joi.string().required().description('Id of the file we want to update')
      id: Joi.string().description('File id'),
      name: Joi.string().description('File name'),
      kind: Joi.string().description('File category'),
      extension: Joi.string().description('File type')
    reply(render(request.pre.file))
}
  tags: ['api', 'file'],
      id: Joi.string().required().description('Id or user of the file we want to retrieve')
    reply(render(request.pre.file))
}
  tags: ['api', 'file'],
    reply(render(request.pre.file))
}
  tags: ['api', 'file'],
      id: Joi.string().required().description('Id or user of the file we want to retrieve')
    const path = configUpload.path + '/' + request.pre.file.id
    const options = {
    }
    reply.file(path, options)
}
  tags: ['api', 'file'],
    strategies: ['backup'],
    const path = configUpload.path + '/' + request.pre.file.id
    const options = {
    }
    reply.file(path, options).type('application/pdf')
}
  tags: ['api', 'file'],
  validate: {
    query: {
      fields: Joi.string().description('Fields we want to retrieve'),
      sort: Joi.string().description('Sort fields we want to retrieve'),
      skip: Joi.number().description('Number of documents we want to skip'),
      limit: Joi.number().description('Limit of documents we want to retrieve')
    }
  },
    reply(render(request.pre.files))
}
  tags: ['api', 'file'],
      id: Joi.string().required().description('Id of the file we want to remove')
    reply(render(request.pre.file))
}
  tags: ['api', 'file'],
    reply(render(request.pre.file))
}
  tags: ['api', 'file'],
      upsert: Joi.string().default('true')
      id: Joi.string().required().description('Id of the user whose file we want to upload')
    { method: 'file.get(auth.credentials.user.id)', assign: 'oldFile', failAction: 'log' },
      { method: 'file.delete(pre.oldFile.id)', assign: 'deleteFile', failAction: 'log' },
    reply(render(request.pre.fileInfo)).created('/api/file/' + request.pre.fileInfo.id)
}
  tags: ['api', 'file'],
      upsert: Joi.string().invalid('false').default('true')
    {method: 'file.uploadCV(payload)', assign: 'file'},
    {method: 'file.get(auth.credentials.user.id)', assign: 'oldFile', failAction: 'log'},
      {method: 'file.delete(pre.oldFile.id)', assign: 'deleteFile', failAction: 'log'},
      {method: 'file.update(pre.oldFile.id, pre.file, auth.credentials.user.id, query)', assign: 'fileInfo'}
    ],
    {method: 'achievement.addCV(auth.credentials.user.id)', assign: 'achievement', failAction: 'log'},
    {method: 'user.updatePoints(auth.credentials.user.id, pre.achievement.value)', failAction: 'ignore'}
    reply(render(request.pre.fileInfo)).created('/api/file/' + request.pre.fileInfo.id)
}
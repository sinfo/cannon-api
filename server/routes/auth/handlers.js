const Joi = require('joi')
const render = require('../../views/auth')

exports = module.exports

exports.facebook = {
  options:{
    tags: ['api', 'auth'],
    auth: {
      strategies: ['default'],
      mode: 'try'
    },
    validate: {
      payload: Joi.object({
        id: Joi.string().required().description('facebook id of the member'),
        token: Joi.string().required().description('facebook token of the member')
      })
    },
    pre: [
      { method: 'auth.facebook(payload.id, payload.token)', assign: 'member' }
    ],
    description: 'Facebook login'
  },
  handler: function (request, reply) {
    reply(render(request.pre.member))
  },
}

exports.google = {
  options:{
    tags: ['api', 'auth'],
    auth: {
      strategies: ['default'],
      mode: 'try'
    },
    validate: {
      payload: Joi.object({
        id: Joi.string().required().description('google id of the member'),
        token: Joi.string().required().description('google token of the member')
      })
    },
    pre: [
      { method: 'auth.google(payload.id, payload.token)', assign: 'member' }
    ],
    description: 'Google login'
  },
  handler: function (request, reply) {
    reply(render(request.pre.member))
  },
}

exports.fenix = {
  options:{
    tags: ['api', 'auth'],
    auth: {
      strategies: ['default'],
      mode: 'try'
    },
    validate: {
      payload: Joi.object({
        code: Joi.string().required().description('fenix code of the member')
      })
    },
    pre: [
      { method: 'auth.fenix(payload.code)', assign: 'member' }
    ],
    description: 'Fenix login'
  },
  handler: function (request, reply) {
    reply(render(request.pre.member))
  },
}

exports.linkedin = {
  options:{
    tags: ['api', 'auth'],
    auth: {
      strategies: ['default'],
      mode: 'try'
    },
    validate: {
      payload: Joi.object({
        code: Joi.string().required().description('Linkedin code of the member')
      })
    },
    pre: [
      { method: 'auth.linkedin(payload.code)', assign: 'member' }
    ],
    description: 'Linkedin login'
  },
  handler: function (request, reply) {
    reply(render(request.pre.member))
  },
}

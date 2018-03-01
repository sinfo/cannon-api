const Joi = require('joi')
const render = require('../../views/auth')

exports = module.exports

exports.facebook = {
  tags: ['api', 'auth'],
  auth: {
    strategies: ['default'],
    mode: 'try'
  },
  validate: {
    payload: {
      id: Joi.string().required().description('facebook id of the member'),
      token: Joi.string().required().description('facebook token of the member')
    }
  },
  pre: [
    { method: 'auth.facebook(payload.id, payload.token)', assign: 'member' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.member))
  },
  description: 'Facebook login'
}

exports.google = {
  tags: ['api', 'auth'],
  auth: {
    strategies: ['default'],
    mode: 'try'
  },
  validate: {
    payload: {
      id: Joi.string().required().description('google id of the member'),
      token: Joi.string().required().description('google token of the member')
    }
  },
  pre: [
    { method: 'auth.google(payload.id, payload.token)', assign: 'member' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.member))
  },
  description: 'Google login'
}

exports.fenix = {
  tags: ['api', 'auth'],
  auth: {
    strategies: ['default'],
    mode: 'try'
  },
  validate: {
    payload: {
      code: Joi.string().required().description('fenix code of the member')
    }
  },
  pre: [
    { method: 'auth.fenix(payload.code)', assign: 'member' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.member))
  },
  description: 'Fenix login'
}

exports.linkedin = {
  tags: ['api', 'auth'],
  auth: {
    strategies: ['default'],
    mode: 'try'
  },
  validate: {
    payload: {
      code: Joi.string().required().description('LinkedIn code of the member')
    }
  },
  pre: [
    { method: 'auth.linkedIn(payload.code)', assign: 'member' }
  ],
  handler: function (request, reply) {
    reply(render(request.pre.member))
  },
  description: 'LinkedIn login'
}

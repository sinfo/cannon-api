const Joi = require('joi')
const render = require('../../views/auth')
const log = require('../../helpers/logger')
const Boom = require('@hapi/boom')

exports = module.exports

exports.facebook = {
  options: {
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
    description: 'Facebook login'
  },
  handler: async function (request, h) {
    try {
      let member = await request.server.methods.auth.facebookAuth(request.payload.id, request.payload.token);
      return h.response(render(member))
    } catch (err) {
      if (err.code === 11000) {
        log.error({ msg: "Could not login user with facebook." })
        return Boom.unauthorized(`User "${request.payload.id}" could not login with facebook.`)
      }

      log.error({ err: err, msg: 'Error with facebook login.' }, 'Error with facebook login.')
      return Boom.internal()
    }
  }
}

exports.google = {
  options: {
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
    description: 'Google login'
  },
  handler: async function (request, h) {
    try {
      log.info({payload: request.payload})
      let member = await request.server.methods.auth.google(request.payload.id, request.payload.token);
      log.info({member: member, render: render(member)})
      return h.response(render(member))
    } catch (err) {
      if (err.code === 11000) {
        log.error({ msg: "Could not login user with google." })
        return Boom.unauthorized(`User "${request.payload.id}" could not login with google.`)
      }

      log.error({ err: err, msg: 'Error with google login.' }, 'Error with google login.')
      return Boom.internal()
    }
  }
}

exports.fenix = {
  options: {
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
  handler: async function (request, h) {
    try {
      let member = await request.server.methods.auth.fenix(request.payload.id, request.payload.token);
      return h.response(render(member))
    } catch (err) {
      if (err.code === 11000) {
        log.error({ msg: "Could not login user with fenix." })
        return Boom.unauthorized(`User "${request.payload.id}" could not login with fenix.`)
      }

      log.error({ err: err, msg: 'Error with fenix login.' }, 'Error with fenix login.')
      return Boom.internal()
    }
  },
}

exports.linkedin = {
  options: {
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
    description: 'Linkedin login'
  },
  handler: async function (request, h) {
    try {
      let member = await request.server.methods.auth.linkedin(request.payload.code);
      return h.response(render(member))
    } catch (err) {
      if (err.code === 11000) {
        log.error({ msg: "Could not login user with linkedin." })
        return Boom.unauthorized(`User "${request.payload.id}" could not login with linkedin.`)
      }

      log.error({ err: err, msg: 'Error with linkedin login.' }, 'Error with linkedin login.')
      return Boom.internal()
    }
  }
}

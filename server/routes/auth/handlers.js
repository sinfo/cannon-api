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
        throw Boom.unauthorized(`User "${request.payload.id}" could not login with facebook.`)
      }

      log.error({ err: err, msg: 'Error with facebook login.' }, 'Error with facebook login.')
      throw Boom.internal()
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
        accessToken: Joi.string().required().description('google access token of the member')
      })
    },
    description: 'Google login'
  },
  handler: async function (request, h) {
    try {
      let member = await request.server.methods.auth.google(request.payload.accessToken);
      return h.response(render(member))
    } catch (err) {
      if (err.code === 11000) {
        log.error({ msg: "Could not login user with google." })
        throw Boom.unauthorized(`User "${request.payload.id}" could not login with google.`)
      }
 
      log.error({ err: err, msg: 'Error with google login.' }, 'Error with google login.')
      throw Boom.internal()
    }
  }
}

exports.microsoft = {
  options: {
    tags: ['api', 'auth'],
    auth: {
      strategies: ['default'],
      mode: 'try'
    },
    validate: {
      payload: Joi.object({
        accessToken: Joi.string().required().description('microsoft access token of the member')
      })
    },
    description: 'Microsoft login'
  },
  handler: async function (request, h) {
    try {
      let member = await request.server.methods.auth.microsoft(request.payload.accessToken)
      return h.response(render(member))
    } catch (err) {
      if (err.code === 11000) {
        log.error({ msg: "Could not login user with microsoft." })
        return Boom.unauthorized(`User with token ${request.payload.code} could not login with microsoft.`)
      }
 
      log.error({ err: err, msg: 'Error with microsoft login.' }, 'Error with microsoft login.')
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
        accessToken: Joi.string().required().description('fenix access token of the member')
      })
    },
    description: 'Fenix login'
  },
  handler: async function (request, h) {
    try {
      let member = await request.server.methods.auth.fenix(request.payload.accessToken);
      return h.response(render(member))
    } catch (err) {
      if (err.code === 11000) {
        log.error({ msg: "Could not login user with fenix." })
        throw Boom.unauthorized(`User "${request.payload.id}" could not login with fenix.`)
      }

      log.error({ err: err, msg: 'Error with fenix login.' }, 'Error with fenix login.')
      throw Boom.internal()
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
        accessToken: Joi.string().required().description('linkedin access token of the member')
      })
    },
    description: 'Linkedin login'
  },
  handler: async function (request, h) {
    try {
      let member = await request.server.methods.auth.linkedin(request.payload.accessToken);
      return h.response(render(member))
    } catch (err) {
      if (err.code === 11000) {
        log.error({ msg: "Could not login user with linkedin." })
        throw Boom.unauthorized(`User "${request.payload.id}" could not login with linkedin.`)
      }

      log.error({ err: err, msg: 'Error with linkedin login.' }, 'Error with linkedin login.')
      throw Boom.internal()
    }
  }
}

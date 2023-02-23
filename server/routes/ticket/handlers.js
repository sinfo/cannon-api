const Joi = require("joi");
const render = require("../../views/ticket");
const log = require('../../helpers/logger');
const Boom = require('@hapi/boom');
const renderUsers = require("../../views/user");

exports = module.exports;

exports.registerTicket = {
  options: {
    tags: ["api", "ticket"],
    auth: {
      strategies: ["default"],
      scope: ["user", "company", "team", "admin"]
    },
    validate: {
      params: Joi.object({
        sessionId: Joi.string().required().description("Id of the session")
      })
    },
    description: "Registers a ticket for the current user."
  },
  handler: async function (request, h) { 
    try {
      let session = await request.server.methods.session.get(request.params.sessionId)
      request.server.methods.session.ticketsNeeded(session)
      request.server.methods.session.inRegistrationPeriod(session)
      
      await request.server.methods.ticket.userRegistered(request.params.sessionId, request.auth.credentials.user.id)

      let ticket = await request.server.methods.ticket.addUser(request.params.sessionId, request.auth.credentials.user.id, session)
    
      request.server.methods.ticket.registrationEmail(ticket, session, request.auth.credentials.user)
    
      return h.response(render(ticket, session))
    } catch (err) {
      log.error({ err: err, msg:'error registering ticket'}, 'error registering ticket')
      throw Boom.boomify(err)
    }
  }
};

exports.voidTicket = {
  options: {
    tags: ["api", "ticket"],
    auth: {
      strategies: ["default"],
      scope: ["user", "company", "team", "admin"]
    },
    validate: {
      params: Joi.object({
        sessionId: Joi.string().required().description("Id of the session")
      })
    },
    description: "Voids a ticket for the current user."
  },
  handler: async function (request, h) {
    try {
      let session = await request.server.methods.session.get(request.params.sessionId)
      request.server.methods.session.ticketsNeeded(session)
      
      let ticket = await request.server.methods.ticket.get(request.params.sessionId)
      let removedTicket = await request.server.methods.ticket.removeUser(session.id, request.auth.credentials.user.id)
      let user = request.server.methods.ticket.getAcceptedUser(ticket, session, request.auth.credentials.user)
      
      if (user) {
        request.server.methods.ticket.registrationAcceptedEmail(ticket, session, user)
      }

      return h.response(render(removedTicket, session))
    } catch (err) {
      log.error({ err: err, msg:'error voiding ticket for current user'}, 'error voiding ticket for current user')
      throw Boom.boomify(err)
    }
  },
};

exports.confirmTicket = {
  options: {
    tags: ["api", "ticket"],
    auth: {
      strategies: ["default"],
      scope: ["user", "company", "team", "admin"]
    },
    validate: {
      params: Joi.object({
        sessionId: Joi.string().required().description("Id of the session")
      })
    },
    description: "Lets a user confirm that he is going on the day of the session.",
  },
  handler: async function (request, h) {
    try {
      let session = await request.server.methods.session.get(request.params.sessionId)
      request.server.methods.session.ticketsNeeded(session)
      request.server.methods.session.inConfirmationPeriod(session)
      await request.server.methods.ticket.userConfirmed(request.params.sessionId, auth.credentials.user.id)
      
      let ticket = await request.server.methods.ticket.confirmUser(request.params.sessionId, request.auth.credentials.user.id, session)
      request.server.methods.ticket.confirmationEmail(ticket, session, request.auth.credentials.user)
      return h.response(render(ticket, session))
    } catch (err) {
      log.error({ err: err, msg:'error confirming ticket for user'}, 'error confirming ticket for user')
      throw Boom.boomify(err)
    }
  },
};

exports.get = {
  options: {
    tags: ["api", "ticket"],
    auth: {
      strategies: ["default"],
      scope: ["user", "company", "team", "admin"],
      mode: "try"
    },
    validate: {
      params: Joi.object({
        sessionId: Joi.string().required().description("Id of the session")
      })
    },
    description: "Gets a ticket"
  },
  handler: async function (request, h) {
    try {
      let session = await request.server.methods.session.get(request.params.sessionId)
      let ticket = await request.server.methods.ticket.get(request.params.sessionId)
      if (ticket) {
        return h.response(render(ticket, session));
      } else {
        log.error({ err: err, msg:'ticket not found'}, 'ticket not found')
        throw Boom.boomify(err)
      }
    } catch (err) {
      log.error({ err: err, msg:'error getting ticket'}, 'error getting ticket')
      throw Boom.boomify(err)
    }
  },
};

exports.list = {
  options: {
    tags: ["api", "ticket"],
    auth: {
      strategies: ["default"],
      scope: ["user", "company", "team", "admin"]
    },
    validate: {
      query: Joi.object({
        fields: Joi.string().description("Fields we want to retrieve"),
        sort: Joi.string().description("Sort fields we want to retrieve"),
        skip: Joi.number().description("Number of documents we want to skip"),
        limit: Joi.number().description("Limit of documents we want to retrieve")
      })
    },
    description: "Gets all the tickets"
  },
  handler: async function (request, h) {
    try {
      let tickets = await request.server.methods.ticket.list(request.query)
      return h.response(render(tickets));
    } catch (err) {
      log.error({ err: err, msg:'error getting all tickets'}, 'error getting all tickets')
      throw Boom.boomify(err)
    }
  },
};

exports.registerPresence = {
  options: {
    tags: ["api", "ticket"],
    auth: {
      strategies: ["default"],
      scope: ["admin"]
    },
    validate: {
      params: Joi.object({
        sessionId: Joi.string().required().description("Id of the session"),
        userId: Joi.string().required().description("Id of the user")
      })
    },
    description: "Lets an admin confirm that the user showed up on the session."
  },
  handler: async function (request, h) {
    try {
      let session = await request.server.methods.session.get(request.params.sessionId)
      let ticket = await request.server.methods.ticket.registerUserPresence(request.params.sessionId, request.params.userId)
      return h.response(render(ticket, session))
    } catch (err) {
      log.error({ err: err, msg:'error registering presence'}, 'error registering presence')
      throw Boom.boomify(err)
    }
  },
};

exports.getUsers = {
  options: {
    tags: ["api", "ticket"],
    auth: {
      strategies: ["default"],
      scope: ["user", "company", "team", "admin"],
      mode: "try"
    },
    validate: {
      params: Joi.object({
        sessionId: Joi.string().required().description("Id of the session")
      })
    },
    description: "Gets the users"
  },
  handler: async function (request, h) {
    try {
      let session = await request.server.methods.session.get(request.params.sessionId)
      let userIds = await request.server.methods.ticket.getRegisteredUsers(request.params.sessionId, session)
      let users = await request.server.methods.user.getMulti(userIds)
      return h.response(renderUsers(users, request.auth.credentials && request.auth.credentials.user))
    } catch (err) {
      log.error({ err: err, msg:'error getting users'}, 'error getting users')
      throw Boom.boomify(err)
    }
  },
};

exports.getWaiting = {
  options: {
    tags: ["api", "ticket"],
    auth: {
      strategies: ["default"],
      scope: ["user", "company", "team", "admin"],
      mode: "try"
    },
    validate: {
      params: Joi.object({
        sessionId: Joi.string().required().description("Id of the session")
      })
    },
    description: "Gets the waiting users"
  },
  handler: async function (request, h) {
    try {
      let session = await request.server.methods.session.get(request.params.sessionId)
      let userIds = await request.server.methods.ticket.getWaitingUsers(request.params.sessionId, session)
      let users = await request.server.methods.user.getMulti(userIds)
      return h.response(renderUsers(users, request.auth.credentials && request.auth.credentials.user))
    } catch (err) {
      log.error({ err: err, msg:'error getting waiting users'}, 'error getting waiting users')
      throw Boom.boomify(err)
    }
  },
};

exports.getConfirmed = {
  options: {
    tags: ["api", "ticket"],
    auth: {
      strategies: ["default"],
      scope: ["user", "company", "team", "admin"],
      mode: "try"
    },
    validate: {
      params: Joi.object({
        sessionId: Joi.string().required().description("Id of the session")
      })
    },
    description: "Gets the confirmed users"
  },
  handler: async function (request, h) {
    try {
      let session = await request.server.methods.session.get(request.params.sessionId)
      let userIds = await request.server.methods.ticket.getConfirmedUsers(request.params.sessionId, session)
      let users = await request.server.methods.user.getMulti(userIds)
      return h.response(renderUsers(users, request.auth.credentials && request.auth.credentials.user))
    } catch (err) {
      log.error({ err: err, msg:'error getting confirmed users'}, 'error getting confirmed users')
      throw Boom.boomify(err)
    }
  },
};

exports.getUserSessions = {
  options: {
    tags: ["api", "ticket"],
    auth: {
      strategies: ["default"],
      scope: ["user", "company", "team", "admin"],
      mode: "try"
    },
    validate: {
      params: Joi.object({
        userId: Joi.string().required().description("Id of the user")
      })
    },
    description: "Gets the sessions for a user"
  },
  handler: async function (request, h) {
    try {
      let tickets = await request.server.methods.ticket.getUserSessions(request.params.userId)
      return h.response(tickets);
    } catch (err) {
      log.error({ err: err, msg:'error getting user sessions'}, 'error getting user sessions')
      throw Boom.boomify(err)
    }
  },
};

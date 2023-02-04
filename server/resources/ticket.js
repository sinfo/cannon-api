const Boom = require('@hapi/boom')
const server = require('../').hapi
const log = require('../helpers/logger')
const fieldsParser = require('../helpers/fieldsParser')
const Ticket = require('../db/ticket')
const config = require('../../config')

server.method('ticket.userConfirmed', userConfirmed, {})
server.method('ticket.userRegistered', userRegistered, {})
server.method('ticket.addUser', addUser, {})
server.method('ticket.removeUser', removeUser, {})
server.method('ticket.confirmUser', confirmUser, {})
server.method('ticket.registerUserPresence', registerUserPresence, {})
server.method('ticket.get', get, {})
server.method('ticket.updateMulti', updateMulti, {})
server.method('ticket.list', list, {})
server.method('ticket.getRegisteredUsers', getRegisteredUsers, {})
server.method('ticket.getWaitingUsers', getWaitingUsers, {})
server.method('ticket.getConfirmedUsers', getConfirmedUsers, {})
server.method('ticket.getAcceptedUser', getAcceptedUser, {})
server.method('ticket.confirmationEmail', confirmationEmail, {})
server.method('ticket.registrationEmail', registrationEmail, {})
server.method('ticket.registrationAcceptedEmail', registrationAcceptedEmail, {})
server.method('ticket.getUserSessions', getUserSessions, {})

async function userConfirmed(sessionId, userId) {
  let filter = { session: sessionId }

  let _ticket = await Ticket.findOne(filter)

  if (!_ticket) {
    log.warn({ err: err, session: sessionId }, 'ticket not found')
    return false
  }

  if (_ticket.confirmed.indexOf(userId) >= 0) {
    log.error({ err: err, session: sessionId, user: userId }, 'user alreday confirmed')
    throw Boom.conflict('user already confirmed')
  }

  return true
}

async function userRegistered(sessionId, userId) {
  let filter = { session: sessionId }

  let _ticket = await Ticket.findOne(filter)

  if (!_ticket) {
    log.warn({ err: err, session: sessionId }, 'ticket not found')
    return false
  }

  if (_ticket.users.indexOf(userId) >= 0) {
    log.error({ err: err, session: sessionId, user: userId }, 'user alreday registered')
    throw Boom.conflict('user already registered')
  }

  return true
}

async function addUser (sessionId, userId, sessionObj) {
  log.debug({ userId, sessionName: sessionObj.name }, 'got session')

  let filter = { session: sessionId }

  const changes = {
    $addToSet: {
      users: userId
    },
    // If ticket does not exist, lets set the sessionId
    $setOnInsert: {
      session: sessionId
    }
  }

  let _ticket = await Ticket.findOneAndUpdate(filter, changes, { new: true, upsert: true }).orFail('error registering ticket')

  return _ticket.toObject({ getters: true })
}

async function removeUser(sessionId, userId, session) {
  let filter = { session: sessionId }
  
  const changes = {
    $pull: {
      users: userId,
      confirmed: userId,
      present: userId
    }
  }

  let _ticket = await Ticket.findOneAndUpdate(filter, changes)

  if (!_ticket) {
    throw Boom.notFound('Couldn\'t find session')
  }

  return _ticket.toObject({ getters: true })
}

async function confirmUser(sessionId, userId, session) {
  let filter = { session: sessionId, users: { $in: [userId] } }

  const changes = {
    $addToSet: {
      confirmed: userId
    }
  }

  let _ticket = await Ticket.findOneAndUpdate(filter, changes)

  if (!_ticket) {
    throw Boom.notFound('Couldn\'t find session, make sure you\'re already registered in this session')
  }

  return _ticket.toObject({ getters: true })
}

async function registerUserPresence(sessionId, userId, session) {
  let filter = { session: sessionId }

  const changes = {
    $addToSet: {
      present: userId
    }
  }

  let _ticket = await Ticket.findOneAndUpdate(filter, changes)

  if (!_ticket) {
    throw Boom.notFound('Couldn\'t find session')
  }

  return _ticket.toObject({ getters: true })
}

async function get (filter) {
  if (typeof filter === 'string') {
    filter = { session: filter }
  }

  let ticket = await Ticket.findOne(filter)
  if (!ticket) {
    log.error({ err: err, requestedTicket: filter }, 'could not find ticket')
    throw Boom.notFound("Ticket not found")
  }

  return ticket
}

//this function does not return anything for now
//if you want all updated tickets, you can do a find
async function updateMulti(filter, ticket) {
  if (!ticket) {
    log.warn({ err: err, requestedTicket: filter }, 'could not find ticket')
    throw Boom.notFound()
  }

  if (typeof filter === 'string') {
    filter = { id: filter }
  }

  let res = await Ticket.updateMany(filter, ticket)

  log.debug("Matched ", res.matchedCount, " tickets and updated ", res.modifiedCount, " tickets")
}

async function list (query) {
  //cb = cb || query // fields is optional

  const filter = {}
  const fields = fieldsParser(query.fields)
  const options = {
    skip: query.skip,
    limit: query.limit,
    sort: fieldsParser(query.sort)
  }

  let tickets = await Ticket.find(filter, fields, options)

  return tickets
}

async function getUserSessions(id) {
  let filter = { users: id }
  let tickets = await Ticket.find(filter)

  const ids = tickets.map((ticket) => {
    return ticket.session
  })

  return ids
}

async function getRegisteredUsers (sessionId, session) {
  //cb = cb || session // session is optional

  const filter = { session: sessionId }

  const fields = { users: 1 }

  let ticket = await Ticket.findOne(filter, fields)

  if (!ticket) {
    log.warn({ err: err, requestedTicket: filter }, 'could not find ticket')
    throw Boom.notFound()
  }

  let users = ticket.users
  if (session && session.tickets && session.tickets.max) {
    users = users.slice(0, session.tickets.max)
  }

  return users
}

async function getWaitingUsers (sessionId, session) {
  //cb = cb || session // session is optional

  const filter = { session: sessionId }

  const fields = { users: 1 }

  let ticket = await Ticket.findOne(filter, fields)

  if (!ticket) {
    log.warn({ err: err, requestedTicket: filter }, 'could not find ticket')
    throw Boom.notFound()
  }

  let users = ticket.users
  if (session && session.tickets && session.tickets.max) {
    if (users.length > session.tickets.max) {
      users = users.slice(session.tickets.max)
    } else {
      users = []
    }
  }

  return users
}

async function getConfirmedUsers (sessionId, session) {
  //cb = cb || session // session is optional

  const filter = { session: sessionId }

  const fields = { users: 1 }

  let ticket = await Ticket.findOne(filter, fields)

  if (!ticket) {
    log.warn({ err: err, requestedTicket: filter }, 'could not find ticket')
    throw Boom.notFound()
  }

  const users = ticket.users.filter((o) => {
    return ticket.confirmed && ticket.confirmed.indexOf(o.id) !== -1
  })

  return users
}

function getAcceptedUser (ticket, session, user) {
  if (!session.tickets || !session.tickets.max || ticket.users.length <= session.tickets.max) {
    log.debug({ ticket: ticket }, 'ticket does not have waiting list')
    return null
  }

  if (ticket.users.indexOf(user.id) >= session.tickets.max) {
    log.debug({ ticket: ticket, user: user.id }, 'user was in the waiting list. voided ticket in waiting list')
    return null
  }

  return server.methods.user.get(ticket.users[session.tickets.max])
}

function registrationAcceptedEmail (ticket, session, user) {
  if (!user || !user.mail) {
    log.error({ user: user, ticket: ticket }, 'user does not have a valid email address')
    throw Boom.preconditionFailed('user does not have a valid email address')
  }

  if (ticket.users.indexOf(user.id) < 0) {
    log.error({ ticket: ticket, user: user }, 'error sending mail, user not in ticket')
    throw Boom.notFound()
  }

  server.methods.email.send(getRegistrationAcceptedEmail(session, user))
}

function confirmationEmail (ticket, session, user) {
  if (!user || !user.mail) {
    log.error({ user: user, ticket: ticket }, 'user does not have a valid email address')
    throw Boom.preconditionFailed('user does not have a valid email address')
  }

  if (ticket.confirmed.indexOf(user.id) < 0) {
    log.error({ ticket: ticket, user: user }, 'error sending mail, user not in the confirmed list of the ticket')
    throw Boom.notFound()
  }

  server.methods.email.send(getConfirmationEmail(session, user))
}

function registrationEmail (ticket, session, user) {
  const index = ticket.users.indexOf(user.id)

  if (!user || !user.mail) {
    log.error({ user: user, ticket: ticket }, 'user does not have a valid email address')
    throw Boom.preconditionFailed('user does not have a valid email address')
  }

  if (index < 0) {
    log.error({ ticket: ticket, user: user }, 'error sending mail, user not in ticket')
    throw Boom.notFound()
  }

  if (index >= session.tickets.max) {
    return server.methods.email.send(getWaitingListEmail(session, user))
  }
  server.methods.email.send(getResgisteredListEmail(session, user))
}

function getWaitingListEmail (session, user) {
  return {
    to: user.mail,
    name: user.name,
    subject: 'Waiting list for ' + session.name,
    body: `<h3>You are in the waiting list for the session <b>${session.name}</b></h3>
    <h2>If there is an opening you will receive an email.</h2>`
  }
}

function getResgisteredListEmail (session, user) {
  return {
    to: user.mail,
    name: user.name,
    subject: 'Registered for the session ' + session.name,
    body: `<h3>You have just been registered for the session <b>${session.name}</b></h3>
    <h2>You will need to confirm your presence on the day of the session.</h2>`
  }
}

function getRegistrationAcceptedEmail (session, user) {
  return {
    to: user.mail,
    name: user.name,
    subject: 'In the registration list for ' + session.name,
    body: `<h3>Due to a cancelation you just got registered for the session <b>${session.name}</b></h3>
    <h2>You will need to confirm your presence on the day of the session.</h2>`
  }
}

function getConfirmationEmail (session, user) {
  return {
    to: user.mail,
    name: user.name,
    subject: 'You are confirmed for ' + session.name,
    body: `<h3>You are now confirmed for <b>${session.name}</b> on the day <b>${session.date}</b></h3>
    <h2>Check this <a href="${config.webapp.url}/sessions/${session.id}">link</a> to read the description and requisites for the workshop<h2>`
  }
}

const Boom = require('@hapi/boom')
const server = require('../').hapi
const moment = require('moment')

server.method('session.get', get, {})
server.method('session.list', list, {})
server.method('session.ticketsNeeded', ticketsNeeded, {})
server.method('session.surveyNotNeeded', surveyNotNeeded, {})
server.method('session.inRegistrationPeriod', inRegistrationPeriod, {})
server.method('session.inConfirmationPeriod', inConfirmationPeriod, {})

async function get (id) {
  //cb = cb || query // fields is optional

  try {
    const session = await server.methods.deck.getSession(id)
    if (!session) throw Boom.badRequest("Could not find session")
    return session
  } catch (err) {
    throw Boom.badRequest("Error getting session")
  }
}

async function list () {
  //cb = cb || query // fields is optional

  try {
    const sessions = await server.methods.deck.getSessions()
    if (!sessions) throw Boom.badRequest("Could not find sessions")
    return sessions
  } catch (err) {
    throw Boom.badRequest()
  }
}

function ticketsNeeded (session) {
  if (!session.tickets || !session.tickets.needed) {
    throw Boom.badRequest('this session doesn\'t need tickets')
  }

  return true
}

function surveyNotNeeded (session) {
  if (session && session.surveyNeeded) {
    const boom = Boom.preconditionFailed('you need to submit the session survey to redeem')
    boom.output.payload.session = session

    return boom
  }

  return true
}

function inRegistrationPeriod (session) {
  const now = Date.now()
  if (now < moment(session.tickets.start) || now > moment(session.tickets.end) || now > moment(session.date)) {
    throw Boom.badRequest('out of registation period')
  }

  return true
}

function inConfirmationPeriod (session) {
  const now = new Date()
  const date = new Date(session.date)

  if (date.setHours(0, 0, 0, 0) !== now.setHours(0, 0, 0, 0)) {
    throw Boom.badRequest('out of confirmation period')
  }

  return true
}

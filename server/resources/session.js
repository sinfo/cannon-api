const Boom = require('@hapi/boom')
const server = require('../').hapi
const log = require('../helpers/logger')
const axios = require('axios')
const config = require('../../config')
const qs = require('qs')
const parseBody = require('../helpers/parseBody')
const moment = require('moment')

server.method('session.get', get, {})
server.method('session.list', list, {})
server.method('session.ticketsNeeded', ticketsNeeded, {})
server.method('session.surveyNotNeeded', surveyNotNeeded, {})
server.method('session.inRegistrationPeriod', inRegistrationPeriod, {})
server.method('session.inConfirmationPeriod', inConfirmationPeriod, {})

async function get (id, query) {
  //cb = cb || query // fields is optional

  query = (arguments.length === 2) ? {} : query

  const url = `${config.deck.url}/api/sessions/${id}?${qs.stringify(query)}`

  try {
    let response = await axios.get(url)
    //response.data is the session returned by deck
    if (!response.data || response.data.length == 0) {
      return Boom.badRequest("Could not find session")
    }
    return response.data
  } catch (err) {
    return Boom.badRequest()
  }
}

async function list (query) {
  //cb = cb || query // fields is optional

  const url = `${config.deck.url}/api/sessions?${qs.stringify(query)}`

  try {
    let response = await axios.get(url)
    //response.data is the sessions returned by deck
    if (!response.data || response.data.length == 0) {
      return Boom.badRequest("Could not find sessions")
    }
    return response.data
  } catch (err) {
    return Boom.badRequest()
  }
}

function ticketsNeeded (session) {
  if (!session.tickets || !session.tickets.needed) {
    return Boom.badRequest('this session doesn\'t need tickets')
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
    return Boom.badRequest('out of registation period')
  }

  return true
}

function inConfirmationPeriod (session) {
  const now = new Date()
  const date = new Date(session.date)

  if (date.setHours(0, 0, 0, 0) !== now.setHours(0, 0, 0, 0)) {
    return Boom.badRequest('out of confirmation period')
  }

  return true
}

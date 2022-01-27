const Boom = require('boom')
const server = require('../').hapi
const log = require('../helpers/logger')
const Resquest = require('request')
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

function get (id, query, cb) {
  cb = cb || query // fields is optional

  query = (arguments.length === 2) ? {} : query

  const url = `${config.deck.url}/api/sessions/${id}?${qs.stringify(query)}`

  Resquest.get(url, (err, response, body) => {
    if (err) {
      log.error({ err: err, id: id }, 'error getting session')
      return cb(Boom.internal())
    }

    if (!body) {
      log.warn({ err: err, id: id }, 'could not find session')
      return cb(Boom.notFound('session not found'))
    }

    parseBody(body, (err, session) => {
      if (err) {
        return cb(Boom.create(err.statusCode, err.message || err.statusCode === 404 && 'session not found', err.data))
      }
      cb(null, session)
    })
  })
}

function list (query, cb) {
  cb = cb || query // fields is optional

  const url = `${config.deck.url}/api/sessions?${qs.stringify(query)}`

  Resquest.get(url, (err, response, body) => {
    if (err) {
      log.error({ err: err }, 'error getting sessions')
      return cb(Boom.internal())
    }

    if (!body) {
      log.warn({ err: err }, 'could not find sessions')
      return cb(Boom.notFound('sessions not found'))
    }

    parseBody(body, (err, sessions) => {
      if (err) {
        return cb(Boom.create(err.statusCode, err.message, err.data))
      }

      cb(null, sessions)
    })
  })
}

function ticketsNeeded (session, cb) {
  if (!session.tickets || !session.tickets.needed) {
    return cb(Boom.badRequest('this session doesn\'t need tickets'))
  }

  cb(null, true)
}

function surveyNotNeeded (session, cb) {
  if (session && session.surveyNeeded) {
    const boom = Boom.preconditionFailed('you need to submit the session survey to redeem')
    boom.output.payload.session = session

    return cb(boom)
  }

  cb(null, true)
}

function inRegistrationPeriod (session, cb) {
  const now = Date.now()
  if (now < moment(session.tickets.start) || now > moment(session.tickets.end) || now > moment(session.date)) {
    return cb(Boom.badRequest('out of registation period'))
  }

  cb(null, true)
}

function inConfirmationPeriod (session, cb) {
  const now = new Date()
  const date = new Date(session.date)

  if (date.setHours(0, 0, 0, 0) !== now.setHours(0, 0, 0, 0)) {
    return cb(Boom.badRequest('out of confirmation period'))
  }

  cb(null, true)
}

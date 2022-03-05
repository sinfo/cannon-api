const Boom = require('boom')
const server = require('..').hapi
const log = require('../helpers/logger')
const HappyHour = require('../db/happy-hour')

server.method('happyHour.get', get, {})
server.method('happyHour.create', create, {})

async function get () {
  let now = new Date()

  const filter = {
    from: {'$lt': now},
    to: {'$gt': now}
  }

  let happyHours = await HappyHour.find(filter)

  if (!happyHours) {
    log.warn({ err: err }, 'could not find happy hours')
    return Boom.notFound()
  }

  return Array.from(happyHours, c => { return c.toObject() })
}

async function create (hh) {
  if (hh.from >= hh.to) {
    log.error({from: hh.from, to: hh.to}, 'from date is after to date')
  }

  try {
    let happyHour = await HappyHour.create(hh)
    return happyHour.toObject({ getters: true })
  } catch (err) {
    return Boom.internal('Error creating Happy Hour in database')
  }
}

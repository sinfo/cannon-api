const Joi = require('joi')
const renderCompanies = require('../../views/company')
const renderMembers = require('../../views/member')
const renderSessions = require('../../views/session')
const renderSpeakers = require('../../views/speaker')
const renderEvents = require('../../views/event')
const log = require('../../helpers/logger')
const Boom = require('@hapi/boom')

exports = module.exports

exports.getAll = {
    options: {
        tags: ['api', 'company'],
        description: 'Gets all companies for the latest edition'
    },
    handler: async (request, h) => {
        try {
            const latestEdition = await request.server.methods.deck.getLatestEdition()
            const companies = await request.server.methods.deck.getCompanies(latestEdition.id)
            return h.response(renderCompanies(companies))
        } catch (err) {
            log.error({ err: err}, 'error getting company')
            throw Boom.internal()
        }
    }
}

exports.getCompany = {
    options: {
        tags: ['api', 'company'],
        validate: {
            params: Joi.object({
            companyId: Joi.string().required().description('Id of the company')
            })
        },
        description: 'Gets specific company'
    },
    handler: async (request, h) => {
        try {
            const company = await request.server.methods.deck.getCompany(request.params.companyId)
            return h.response(renderCompanies(company))
        } catch (err) {
            log.error({ err: err}, 'error getting company')
            throw Boom.internal()
        }
    }
}

exports.getMembers = {
    options: {
      tags: ['api', 'member'],
      description: 'Get members'
    },
    handler: async (request, h) => {
      try {
        const latestEdition = await request.server.methods.deck.getLatestEdition()
        const members = await request.server.methods.deck.getMembers(latestEdition.id)
        return h.response(renderMembers(members))
      } catch(err) {
        log.error({ error: err })
        throw Boom.boomify(err)
      }
    }
}

exports.getEvents = {
    options: {
        tags: ['api', 'event'],
        description: 'Get all SINFO events'
    },
    handler: async (request, h) => {
        try {
            const events = await request.server.methods.deck.getEvents()
            return h.response(renderEvents(events))
        } catch(err) {
            log.error({ error: err })
            throw Boom.boomify(err)
        }
    }
}

exports.getLatestEvent = {
    options: {
        tags: ['api', 'event'],
        description: 'Get the current SINFO event'
    },
    handler: async (request, h) => {
        //try {
            const event = await request.server.methods.deck.getLatestEdition()
            return h.response(renderEvents(event))
        /*} catch(err) {
            log.error({ error: err })
            throw Boom.boomify(err)
        }*/
    }
}

exports.getSessions = {
    options: {
        tags: ['api', 'session'],
        validate: {
            query: Joi.object({
              withoutAchievements: Joi.boolean().default(false).description('Indicates if we want achievements or not')
            }),
        },
        description: 'Get all sessions'
    },
    handler: async (request, h) => {
        try {
            const latestEdition = await request.server.methods.deck.getLatestEdition()
            const sessions = await request.server.methods.deck.getSessions(latestEdition.id, request.query.withoutAchievements)
            return h.response(renderSessions(sessions))
        } catch(err) {
            log.error({ error: err })
            throw Boom.boomify(err)
        }
    }
}

exports.getSession = {
    options: {
        tags: ['api', 'session'],
        description: 'Get session for a specific event',
        validate: {
            params: Joi.object({
                sessionId: Joi.string().description('id of the session')
            })
        }
    },
    handler: async (request, h) => {
        try {
            const session = await request.server.methods.deck.getSession(request.params.sessionId)
            return h.response(renderSessions(session))
        } catch(err) {
            log.error({ error: err })
            throw Boom.boomify(err)
        }
    }
}


exports.getSpeakers = {
    options: {
        tags: ['api', 'speaker'],
        description: 'Get speakers for the current or previous edition'
    },
    handler: async (request, h) => {
        try {
            let previousEdition = false
            let edition = await request.server.methods.deck.getLatestEdition()
            let speakers
            
            speakers = await request.server.methods.deck.getSpeakers(edition.id)
            if (speakers.length === 0) {
                edition = await request.server.methods.deck.getPreviousEdition()
                speakers = await request.server.methods.deck.getSpeakers(edition.id)
                previousEdition = true
            }

            return h.response({
                eventId: edition,
                speakers: renderSpeakers(speakers),
                previousEdition: previousEdition
            })
        } catch(err) {
            log.error({ error: err })
            throw Boom.boomify(err)
        }
    }
}

exports.getSpeaker = {
    options: {
        tags: ['api', 'speaker'],
        description: 'Get speaker for the current or previous edition',
        validate: {
            params: Joi.object({
                speakerId: Joi.string().description('id of the speaker')
            })
        }
    },
    handler: async (request, h) => {
        try {
            const speaker = await request.server.methods.deck.getSpeaker(request.params.speakerId)
            return h.response(renderSpeakers(speaker))
        } catch(err) {
            log.error({ error: err })
            throw Boom.boomify(err)
        }
    }
}

exports.getCalendarUrl = {
    options: {
        tags: ['api', 'calendar'],
        description: 'Get the calendar url for the current edition'
    },
    handler: async (request, h) => {
        try {
            const edition = await request.server.methods.deck.getLatestEdition()
            return h.response(edition.calendarUrl)
        } catch(err) {
            log.error({ error: err })
            throw Boom.boomify(err)
        }
    }
}

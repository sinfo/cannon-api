const Joi = require('joi')
const renderCompanies = require('../../views/company')
const renderMembers = require('../../views/member')
const renderSessions = require('../../views/session')
const renderSpeakers = require('../../views/speaker')
const renderEvents = require('../../views/event')
const renderPrize = require('../../views/prize')
const renderUser = require('../../views/user')
const log = require('../../helpers/logger')
const Boom = require('@hapi/boom')

exports = module.exports

exports.getAll = {
    options: {
        tags: ['api', 'company'],
        validate: {
            query: Joi.object({
                edition: Joi.string().description('Event edition id (defaults to latest)')
            })
        },
        description: 'Gets all companies for a specific edition (defaults to latest)'
    },
    handler: async (request, h) => {
        try {
            const edition = request.query && request.query.edition ? request.query.edition : (await request.server.methods.deck.getLatestEdition()).id
            const companies = await request.server.methods.deck.getCompanies(edition)
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
            const latestEdition = await request.server.methods.deck.getLatestEdition()
            const members = await request.server.methods.user.getCompanyUsers(company.id, latestEdition.id)
            return h.response(renderCompanies({
              ...company,
              members: renderUser(members, null, latestEdition.id)
            }))
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
            let session = await request.server.methods.deck.getSession(request.params.sessionId)
            if (!session) { throw Boom.notFound() }
            const sessionPrize = await request.server.methods.prize.getPrizeBySession(request.params.sessionId)
            const achievement = await request.server.methods.achievement.getAchievementBySession(request.params.sessionId)
            return h.response({
              ...renderSessions(session),
              prize: sessionPrize ? renderPrize(sessionPrize) : undefined,
              users: achievement ? achievement.users : undefined,
              unregisteredUsers: achievement ? achievement.unregisteredUsers : undefined,
            })
        } catch(err) {
            log.error({ error: err })
            throw Boom.boomify(err)
        }
    }
}


exports.getSpeakers = {
    options: {
        tags: ['api', 'speaker'],
        description: 'Get speakers for the current or previous edition',
        validate: {
            query: Joi.object({
                previousEdition: Joi.boolean().default(false).description('Force returning speakers from the previous edition')
            })
        }
    },
    handler: async (request, h) => {
        try {
            let previousEdition = false

            // If the caller explicitly requested the previous edition, honor it.
            let edition
            if (request.query && request.query.previousEdition) {
                edition = await request.server.methods.deck.getPreviousEdition()
                previousEdition = true
            } else {
                edition = await request.server.methods.deck.getLatestEdition()
            }

            let speakers = await request.server.methods.deck.getSpeakers(edition.id)

            // If no speakers were found for the latest edition and the caller
            // didn't explicitly request previous, fall back to previous edition.
            if (!(request.query && request.query.previousEdition) && speakers.length === 0) {
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

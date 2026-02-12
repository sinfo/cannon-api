const Joi = require('joi')
const Boom = require('@hapi/boom')
const log = require('../../helpers/logger')
const createRateLimiter = require('../../helpers/rateLimiter')

const rateLimitPre = createRateLimiter({ limit: 1, windowMs: 5 * 60 * 1000 })

exports = module.exports

exports.create = {
	options: {
		tags: ['api', 'referrals'],
		auth: {
			strategies: ['default'],
			mode: 'try'
		},
		pre: [ { method: rateLimitPre, assign: 'rateLimit' } ],
		validate: {
			payload: Joi.object({
				ref: Joi.string().trim().required().description('Referral code')
			})
		},
		description: 'Registers a referral visit'
	},
		handler: async function (request, h) {
			// Fire-and-forget to keep response fast
			request.server.methods.referrals.create(request.payload, request)
				.catch(err => log.error({ err }, 'error creating referral visit'))
			return h.response({ success: true }).code(202)
		}
}

exports.stats = {
	options: {
		tags: ['api', 'referrals'],
		auth: {
			strategies: ['default'],
			scope: ['team', 'admin']
		},
		description: 'General referral statistics'
	},
	handler: async function (request, h) {
		try {
			const s = await request.server.methods.referrals.stats()
			return h.response(s)
		} catch (err) {
			log.error({ err }, 'error getting referrals stats')
			throw Boom.boomify(err)
		}
	}
}

exports.statsCode = {
	options: {
		tags: ['api', 'referrals'],
		auth: {
			strategies: ['default'],
			scope: ['team', 'admin']
		},
		validate: {
			params: Joi.object({
				code: Joi.string().required().description('Referral code')
			})
		},
		description: 'Statistics for a specific referral code'
	},
	handler: async function (request, h) {
		try {
			const s = await request.server.methods.referrals.statsCode(request.params.code)
			return h.response(s)
		} catch (err) {
			log.error({ err, code: request.params.code }, 'error getting referrals stats by code')
			throw Boom.boomify(err)
		}
	}
}

const Boom = require('@hapi/boom')
const server = require('../').hapi
const log = require('../helpers/logger')
const Referral = require('../db/referral')
const deviceFromUA = require('../helpers/deviceDetector')
const hashIp = require('../helpers/hashIp')

server.method('referrals.create', createReferral, {})
server.method('referrals.stats', statsGlobal, {})
server.method('referrals.statsCode', statsByCode, {})

async function createReferral (payload, request) {
	try {
		const ua = request.headers['user-agent'] || ''
		const device = deviceFromUA(ua)
		const ip = getClientIp(request)
		const ipHash = hashIp(ip)

		const doc = {
			code: payload.ref,
			timestamp: new Date(),
			ipHash,
			userAgent: ua,
			device,
			converted: false
		}

		const created = await Referral.create(doc)
		return created.toObject({ getters: true })
	} catch (err) {
		log.error({ err }, 'error creating referral visit')
		throw Boom.boomify(err)
	}
}

async function statsGlobal () {
	try {
		const totalVisits = await Referral.countDocuments({})
		const totalConverted = await Referral.countDocuments({ converted: true })

		const devicesAgg = await Referral.aggregate([
			{ $group: { _id: '$device', count: { $sum: 1 } } }
		])
		const devices = devicesAgg.reduce((acc, d) => { acc[d._id || 'unknown'] = d.count; return acc }, {})

		const codesAgg = await Referral.aggregate([
			{ $group: { _id: '$code', visits: { $sum: 1 }, converted: { $sum: { $cond: [{ $eq: ['$converted', true] }, 1, 0] } } } },
			{ $sort: { visits: -1 } }
		])
		const topCodes = codesAgg.map(c => ({ code: c._id, visits: c.visits, converted: c.converted }))

		return { totalVisits, totalConverted, devices, topCodes }
	} catch (err) {
		log.error({ err }, 'error computing referrals stats')
		throw Boom.boomify(err)
	}
}

async function statsByCode (code) {
	try {
		const visits = await Referral.countDocuments({ code })
		const converted = await Referral.countDocuments({ code, converted: true })
		const first = await Referral.findOne({ code }).sort({ timestamp: 1 }).lean()
		const last = await Referral.findOne({ code }).sort({ timestamp: -1 }).lean()
		const devicesAgg = await Referral.aggregate([
			{ $match: { code } },
			{ $group: { _id: '$device', count: { $sum: 1 } } }
		])
		const devices = devicesAgg.reduce((acc, d) => { acc[d._id || 'unknown'] = d.count; return acc }, {})

		return {
			code,
			visits,
			converted,
			devices,
			firstVisit: first ? first.timestamp : null,
			lastVisit: last ? last.timestamp : null
		}
	} catch (err) {
		log.error({ err, code }, 'error computing referrals stats by code')
		throw Boom.boomify(err)
	}
}

function getClientIp (request) {
	const xff = request.headers['x-forwarded-for']
	if (xff) {
		const parts = xff.split(',').map(s => s.trim()).filter(Boolean)
		if (parts.length) return parts[0]
	}
	return (request.info && request.info.remoteAddress) || '0.0.0.0'
}

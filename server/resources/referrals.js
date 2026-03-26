const Boom = require('@hapi/boom')
const server = require('../').hapi
const log = require('../helpers/logger')
const Referral = require('../db/referral')
const mongoose = require('mongoose')
const deviceFromUA = require('../helpers/deviceDetector')
const hashIp = require('../helpers/hashIp')
const getClientIp = require('../helpers/clientIp')

server.method('referrals.hit', hitReferral, {})
server.method('referrals.stats', statsGlobal, {})
server.method('referrals.statsCode', statsByCode, {})

async function hitReferral (payload, request) {
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
		// Ensure DB is connected before running heavy aggregation queries
		if (mongoose.connection.readyState !== 1) {
			log.error({ readyState: mongoose.connection.readyState }, 'database not connected for referrals stats')
			throw Boom.serverUnavailable('Database not connected')
		}
		log.info('computing referrals global stats')

		// Run queries in parallel and inspect results to get clearer errors
		const [totalVisitsRes, totalConvertedRes, devicesAggRes, codesAggRes] = await Promise.allSettled([
			Referral.countDocuments({}),
			Referral.countDocuments({ converted: true }),
			Referral.aggregate([{ $group: { _id: '$device', count: { $sum: 1 } } }]),
			Referral.aggregate([
				{ $group: { _id: '$code', visits: { $sum: 1 }, converted: { $sum: { $cond: [{ $eq: ['$converted', true] }, 1, 0] } } } },
				{ $sort: { visits: -1 } }
			])
		])

		const errors = []
		if (totalVisitsRes.status === 'rejected') errors.push({ op: 'totalVisits', err: totalVisitsRes.reason })
		if (totalConvertedRes.status === 'rejected') errors.push({ op: 'totalConverted', err: totalConvertedRes.reason })
		if (devicesAggRes.status === 'rejected') errors.push({ op: 'devicesAgg', err: devicesAggRes.reason })
		if (codesAggRes.status === 'rejected') errors.push({ op: 'codesAgg', err: codesAggRes.reason })

		if (errors.length) {
			// Log all failures with stacks where available
			errors.forEach(e => log.error({ err: e.err, op: e.op }, 'referrals stats DB operation failed'))
			// Surface first error to caller
			throw errors[0].err
		}

		const totalVisits = totalVisitsRes.value
		const totalConverted = totalConvertedRes.value
		const devicesAgg = devicesAggRes.value || []
		const devices = devicesAgg.reduce((acc, d) => { acc[d._id || 'unknown'] = d.count; return acc }, {})
		const codesAgg = codesAggRes.value || []
		const allCodes = codesAgg.map(c => ({ code: c._id, visits: c.visits, converted: c.converted }))

		return { totalVisits, totalConverted, devices, allCodes }
	} catch (err) {
		log.error({ err }, 'error computing referrals stats')
		throw Boom.boomify(err)
	}
}

async function statsByCode (code) {
	try {
		// Ensure DB is connected before running queries
		if (mongoose.connection.readyState !== 1) {
			log.error({ readyState: mongoose.connection.readyState }, 'database not connected for referrals stats by code')
			throw Boom.serverUnavailable('Database not connected')
		}
		log.info({ code }, 'computing referrals stats by code')

		const [visitsRes, convertedRes, firstRes, lastRes, devicesAggRes] = await Promise.allSettled([
			Referral.countDocuments({ code }),
			Referral.countDocuments({ code, converted: true }),
			Referral.findOne({ code }).sort({ timestamp: 1 }).lean(),
			Referral.findOne({ code }).sort({ timestamp: -1 }).lean(),
			Referral.aggregate([
				{ $match: { code } },
				{ $group: { _id: '$device', count: { $sum: 1 } } }
			])
		])

		const errors = []
		if (visitsRes.status === 'rejected') errors.push({ op: 'visits', err: visitsRes.reason })
		if (convertedRes.status === 'rejected') errors.push({ op: 'converted', err: convertedRes.reason })
		if (firstRes.status === 'rejected') errors.push({ op: 'first', err: firstRes.reason })
		if (lastRes.status === 'rejected') errors.push({ op: 'last', err: lastRes.reason })
		if (devicesAggRes.status === 'rejected') errors.push({ op: 'devicesAgg', err: devicesAggRes.reason })

		if (errors.length) {
			errors.forEach(e => log.error({ err: e.err, op: e.op, code }, 'referrals stats by code DB operation failed'))
			throw errors[0].err
		}

		const visits = visitsRes.value
		const converted = convertedRes.value
		const first = firstRes.value
		const last = lastRes.value
		const devicesAgg = devicesAggRes.value || []
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

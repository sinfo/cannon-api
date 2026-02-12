function createRateLimiter (opts = {}) {
	const limit = opts.limit || parseInt(process.env.CANNON_REFERRAL_RATE_LIMIT || '60', 10)
	const windowMs = opts.windowMs || parseInt(process.env.CANNON_REFERRAL_RATE_WINDOW_MS || '60000', 10)
	const store = new Map()

	return function rateLimitPre (request, h) {
		const ip = getClientIp(request)
		const now = Date.now()
		const entry = store.get(ip) || { count: 0, resetAt: now + windowMs }

		if (now > entry.resetAt) {
			entry.count = 0
			entry.resetAt = now + windowMs
		}

		entry.count += 1
		store.set(ip, entry)

		if (entry.count > limit) {
			// Too many requests
			return h.response({ error: 'Too Many Requests' }).code(429).takeover()
		}

		return h.continue
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

module.exports = createRateLimiter

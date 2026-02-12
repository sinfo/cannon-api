const crypto = require('crypto')

// Hash an IP using SHA-256. Optionally include a salt from env for stability.
module.exports = function hashIp (ip) {
	const salt = process.env.CANNON_REFERRAL_IP_SALT || ''
	const data = `${ip || ''}${salt}`
	const hash = crypto.createHash('sha256').update(data).digest('hex')
	return hash
}

function getClientIp (request) {
	const xff = request.headers['x-forwarded-for']
	if (xff) {
		const parts = xff.split(',').map(s => s.trim()).filter(Boolean)
		if (parts.length) return parts[0]
	}
	return (request.info && request.info.remoteAddress) || '0.0.0.0'
}

module.exports = getClientIp

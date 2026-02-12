module.exports = function deviceFromUA (ua) {
	try {
		if (!ua || typeof ua !== 'string') return 'desktop'
		const lower = ua.toLowerCase()
		const isMobile = /mobile|iphone|ipod|ipad|android|blackberry|iemobile|opera mini/.test(lower)
		return isMobile ? 'mobile' : 'desktop'
	} catch (e) {
		return 'desktop'
	}
}

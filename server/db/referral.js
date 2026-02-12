const mongoose = require('mongoose')

const schema = new mongoose.Schema({
	code: { type: String, index: true, required: true },
	timestamp: { type: Date, default: Date.now, index: true },
	ipHash: { type: String, index: true },
	userAgent: { type: String },
	device: { type: String, enum: ['mobile', 'desktop'], default: 'desktop', index: true },
	converted: { type: Boolean, default: false, index: true }
})

schema.index({ code: 1, converted: 1 })
schema.index({ code: 1, timestamp: -1 })

module.exports = mongoose.model('ReferralVisit', schema)

let mongoose = require('mongoose')

let prizeSchema = mongoose.Schema({
  id: { type: String, unique: true },
  name: {
    type: String,
    required: true
  },
  img: {
    type: String,
    required: true
  },
  edition: {
    type: String,
    required: true
  },
  sessions: [String],
  days: [Date],
  cv: Boolean,
  created: Date,
  updated: Date,
})

prizeSchema.index({ id: 1 }, { unique: true })

module.exports = mongoose.model('Prize', prizeSchema)

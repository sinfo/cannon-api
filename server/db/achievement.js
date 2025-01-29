let mongoose = require('mongoose')

let achievementSchema = mongoose.Schema({
  id: { type: String, unique: true },
  session: String,
  company: String,
  name: String,
  description: String,
  instructions: String,
  img: String,
  event: String,
  code: {
    created: Date,
    expiration: Date,
    code: String
  },
  unregisteredUsers: {
    type: Number,
    default: 0
  },
  value: Number,
  users: {
    type: [String],
    default: []
  },
  validity: {
    from: Date,
    to: Date
  },
  created: Date,
  updated: Date,
  kind: {
    type: String, // cv, for example
    default: 'session'
  },
  category: String
})

achievementSchema.index({ id: 1 }, { unique: true })

module.exports = mongoose.model('Achievement', achievementSchema)

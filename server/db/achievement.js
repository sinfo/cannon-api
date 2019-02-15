const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  id: {type: String, unique: true},
  session: String,
  name: String,
  description: String,
  instructions: String,
  img: String,
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
  }
})

module.exports = mongoose.model('Achievement', schema)

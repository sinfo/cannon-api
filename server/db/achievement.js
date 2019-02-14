const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  id: {type: String, unique: true},
  session: String,
  name: String,
  description: String,
  instructions: String,
  img: String,
  value: Number,
  users: [String],
  validity: {
    from: Date,
    to: Date
  },
  created: Date,
  updated: Date
})

module.exports = mongoose.model('Achievement', schema)

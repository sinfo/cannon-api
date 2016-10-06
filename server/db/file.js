const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  id: {type: String, unique: true},
  user: {type: String, unique: true},
  name: String,
  kind: String,
  extension: String,
  created: Date,
  updated: Date
})

module.exports = mongoose.model('File', schema)

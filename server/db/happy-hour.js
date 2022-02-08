const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  from: Date,
  to: Date
})

module.exports = mongoose.model('HappyHour', schema)

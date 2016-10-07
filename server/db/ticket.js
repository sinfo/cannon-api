const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  session: {type: String, unique: true},
  users: Array,
  confirmed: Array,
  present: Array
})

module.exports = mongoose.model('Ticket', schema)

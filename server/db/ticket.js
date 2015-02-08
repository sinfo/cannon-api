var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  session: {type: String, unique: true},
  users: Array,
  confirmed: Array,
  waiting: Array,
  present: Array,
});

var Ticket = module.exports = mongoose.model('Ticket', schema);
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  id: {type: String, unique: true},
  file: {type: String, unique: true},
  area: String,
  startup: Boolean,
  internship: Boolean,
  startsWorking: Date,
  expires: Date,
});

var CV = module.exports = mongoose.model('CV', schema);
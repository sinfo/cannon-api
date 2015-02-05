var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  id: {type: String, unique: true},
  user: {type: String, unique: true},
  file: {type: String, unique: true},
  area: String,
  startup: Boolean,
  internship: Boolean,
  available: Date,
  expires: Date,
  updated: Date,
  created: Date,
});

var CV = module.exports = mongoose.model('CV', schema);
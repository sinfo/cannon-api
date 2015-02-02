var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  id: {type: String, unique: true},
  name: String,
  kind: String,
  extension: String,
  updated: Date
});

var File = module.exports = mongoose.model('File', schema);
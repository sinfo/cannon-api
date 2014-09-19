var mongoose = require('mongoose');

var fileSchema = new mongoose.Schema({
  id: {type: String, unique: true},
  name: String,
  kind: String,
  extension: String,
  created: Date,
  updated: Date
});

var File = module.exports = mongoose.model('File', fileSchema);
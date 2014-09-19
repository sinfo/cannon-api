var mongoose = require('mongoose');

var fileSchema = new mongoose.Schema({
  id: {type: String, unique: true},
  name: String,
  kind: String,
  extension: String,
  date: { type: Date, default: Date.now }
});
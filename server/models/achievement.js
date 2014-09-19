var mongoose = require('mongoose');

var achievementSchema = new mongoose.Schema({
  id: {type: String, unique: true},
  category: String,
  name: String,
  description: String,
  instructions: String,
  img: String,
  value: Number,
  created: Date,
  updated: Date
});

var Achievement = module.exports = mongoose.model('Achievement', achievementSchema);
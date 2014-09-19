var mongoose = require('mongoose');

var achievementSchema = new mongoose.Schema({
  id: {type: String, unique: true},
  group: String,
  name: String,
  description: String,
  instructions: String,
  img: String,
  points: Number,
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});
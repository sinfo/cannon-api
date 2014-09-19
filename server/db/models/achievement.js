var mongoose = require('mongoose');

var achievmentSchema = new mongoose.Schema({
  id: {type: String, unique: true},
  name: String,
  description: String,
  instructions: String,
  img: String,
  points: Number,
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});
var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  id: {type: String, unique: true},
  name: String,
  facebook: String,
  role: String,
  mail: String,
  points: Number,
  achievements: [{
    id: String,
    date: Date
  }]
});

var User = module.exports = mongoose.model('User', userSchema);
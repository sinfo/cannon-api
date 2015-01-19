var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  id: {type: String, unique: true},
  name: String,
  bearer: [{
    token: {type: String, unique: true},
    date: Date
  }],
  facebook: {
    id: String,
    token: {type: String, unique: true}
  },
  fenix: {
    id: String,
    token: {type: String, unique: true},
    refreshToken: {type: String, unique: true}
  },
  role: String,
  mail: {type: String, unique: true},
  points:{
    available: Number,
    total: Number
  },
  achievements: [{
    id: String,
    date: Date
  }],
  files: [String]
});

var User = module.exports = mongoose.model('User', schema);
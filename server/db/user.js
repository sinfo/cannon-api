var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  id: {type: String, unique: true},
  name: String,
  bearer: [{
    token: {type: String, unique: true, sparse: true},
    date: Date
  }],
  facebook: {
    id: String,
    token: {type: String, unique: true, sparse: true}
  },
  google: {
    id: String,
    token: {type: String, unique: true, sparse: true}
  },
  fenix: {
    id: String,
    token: {type: String, unique: true, sparse: true},
    refreshToken: {type: String, unique: true, sparse: true}
  },
  role: String,
  mail: {type: String, unique: true, sparse: true},
  points:{
    available: Number,
    total: Number
  },
  achievements: [{
    id: String,
    date: Date
  }],
  files: [String],
  registered: Date
});

var User = module.exports = mongoose.model('User', schema);
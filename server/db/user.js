var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  id: {type: String, unique: true},
  name: String,
  img: String,
  bearer: [{
    token: {type: String, unique: true, sparse: true},
    refreshToken: {type: String, unique: true, sparse: true},
    ttl: Number,
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
    refreshToken: {type: String, unique: true, sparse: true},
    ttl: Number,
    created: Date
  },
  role:  {type: String, default: 'user'},
  mail: {type: String, unique: true, sparse: true},
  points:{
    available: Number,
    total: Number
  },
  achievements: [{
    id: String,
    date: Date
  }],
  area: String,
  skills: Array,
  job: {
    startup: Boolean,
    internship: Boolean,
    start: Date,
  },
  registered: Date,
  updated: Date
});

var User = module.exports = mongoose.model('User', schema);
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  id: {type: String, unique: true},
  name: String,
  hawk: {
    id: {type: String, unique: true},
    key: {type: String, unique: true}
  },
  facebook: {
    id: String,
    token: String
  },
  fenix: {
    id: String,
    token: String,
    refreshToken: String
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
  }]
});

schema.statics.findAll = function (cb) {
  this.find({}, cb);
};

schema.statics.findById = function (id, cb) {
  this.find({id: id}, cb);
};

schema.statics.findByRole = function (role, cb) {
  this.find({role: role}, cb);
};

schema.statics.del = function (id, cb) {
  this.remove({id: id}, cb);
};

var User = module.exports = mongoose.model('User', schema);
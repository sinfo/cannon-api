var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  session: {type: String, unique: false},
  responses: [Object]
});

var Survey = module.exports = mongoose.model('Survey', schema);
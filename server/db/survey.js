var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  session: {type: String, unique: false},
  responses: [{
    age: String,
    gender: String,
    area: String,
    areaOther: String,
    isIST: Boolean,
    satisfaction: String,
    logistics: {
      instalations: Number,
      location: Number,
      organization: Number,
      communication: Number,
    },
    session: {
      organization: Number,
      content: Number,
      speaker: Number,
      duration: Number,
      recommend: Number,
    },
    suggestions: String
  }]
});

var Survey = module.exports = mongoose.model('Survey', schema);
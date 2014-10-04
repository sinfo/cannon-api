var Joi = require('joi');

var validators = {
  
  generator: {
    params: { id: Joi.string().required() }
  },

  redirect: {
    params: { id: Joi.string().required() }
  },

};

module.exports = validators;

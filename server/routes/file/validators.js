var Joi = require('joi');

var validators = {
	
	get: {
		params: { id: Joi.string().required() },
		query: false
	},

	update:{
		params: { id: Joi.string().required() },
		query: false
	},

	create: {
		params: false,
		query: false,
		payload: {
			id: Joi.string().required(),
			name: Joi.string().required(),
			kind: Joi.string().required(),
			extension:  Joi.string().required(),
			created: Joi.date().required(), 
			updated: Joi.date().required(),
		}
	}
};

model.exports = validators;

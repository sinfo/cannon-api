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
			achievement: Joi.string().required(),
			entries: Joi.number().required(),
			created: Joi.date().required(),
			expires: Joi.date().required(),
		}
	}
};

model.exports = validators;

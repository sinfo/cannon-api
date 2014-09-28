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
			facebook: {
				id: Joi.string().required(),
				token: Joi.string().required(),
			},
			fenix: {
				id: Joi.string().required(),
				token: Joi.string().required(),
				refreshToken: Joi.string().required(),
			  },
			  role: Joi.string().required(),,
			  mail: Joi.string().required(),,
			  points:{
				available: entries: Joi.number().required(),
				total: entries: Joi.number().required(),
			  },
			  achievements: [{
				id: Joi.string().required(),
				date: Joi.date().required(),
			  }]
			}
	}
};

model.exports = validators;

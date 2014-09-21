var Joi = require('joi');

var achievementValidator = {
	
	get: {
		params: { id: Joi.string().required() },
		query: false
	}

	update:{
		params: { id: Joi.string().required() },
		query: false
	}

	create: {
		params: false,
		query: false,
		payload: {
			id: 					Joi.string().required(),
		  event: 				Joi.string().required(),
		  category: 		Joi.string().required(),
		  name: 				Joi.string().required(),
		  description: 	Joi.string().required(),
		  instructions: Joi.string().required(),
		  img: 					Joi.string().required(),
		  value: 				Joi.number().required(),
		}
	}
}

model.exports = achievementValidator;
const server = require('../../').hapi
const handlers = require('./handlers')

server.route({
	method: 'POST',
	path: '/referrals',
	options: handlers.create.options,
	handler: handlers.create.handler
})

server.route({
	method: 'GET',
	path: '/referrals/stats',
	options: handlers.stats.options,
	handler: handlers.stats.handler
})

server.route({
	method: 'GET',
	path: '/referrals/stats/{code}',
	options: handlers.statsCode.options,
	handler: handlers.statsCode.handler
})

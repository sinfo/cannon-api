var fs = require('fs');

var config = {
  url: process.env.CANNON_URL || 'http://localhost:8080',
  port: process.env.CANNON_PORT || 8080,
};

config.upload = {
  path: process.env.CANNON_UPLOAD_PATH || 'root/cannon_uploads'
};

config.mongo = {
  url: process.env.CANNON_MONGO_URL || 'mongodb://localhost/cannon'
};

config.facebook = {
  cookie: process.env.CANNON_COOKIE_NAME || 'cannon cookie',
  password: process.env.CANNON_COOKIE_PASSWORD || 'YOUR COOKIE PASSWORD',
  clientId: process.env.CANNON_FACEBOOK_APP_ID || 'YOUR APP ID',
  clientSecret: process.env.CANNON_FACEBOOK_APP_SECRET || 'YOUR APP SECRET',
};

config.bunyan = {
  name: require('./package.json').name,
  level: process.env.CANNON_LOG_LEVEL || 'trace'
};

config.logs = {
  path: process.env.CANNON_LOG_PATH || '/tmp/logs/',
};

config.token = {
  expiration: process.env.CANNON_TOKEN_EXPIRATION || 10,
  privateKey: process.env.CANNON_TOKEN_PRIVATE_KEY || fs.readFileSync('./keys/token'),
  publicKey: process.env.CANNON_TOKEN_PUBLIC_KEY || fs.readFileSync('./keys/token.pub'),
  algorithm: process.env.CANNON_TOKEN_ALGORITHM || 'RS256',
  issuer: process.env.CANNON_TOKEN_ISSUER || 'cannon masters'
};


module.exports = config;
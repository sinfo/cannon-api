var crypto = require('crypto');

module.exports = function getToken(){
  var token = {
    token: crypto.randomBytes(64).toString('hex'),
    date: Date.now(),
    revoked: false
  };
  return token;
};
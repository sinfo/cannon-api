var Boom = require('boom');
var server = require('server').hapi;
var config = require('config');
var log = require('server/helpers/logger');
var async = require('async');
var facebook = require('server/helpers/facebook');
var Token = require('server/auth/token');
var Fenix = require('fenixedu')(config.fenix);
var google = require('server/helpers/google');

server.method('auth.facebook', facebookAuth, {});
server.method('auth.fenix', fenixAuth, {});
server.method('auth.google', googleAuth, {});
server.method('auth.addFacebook', addFacebookAuth, {});
server.method('auth.refreshToken', refreshToken, {});

function facebookAuth(id, token, cb){
  facebook.debugToken(id, token, function(err, isValid) {
    if(err) {
      return cb(Boom.unauthorized(err));
    }

    if(!isValid) {
      return cb(Boom.unauthorized('nice try'));
    }

    server.methods.user.get({'facebook.id': id}, function(err, user){
      if(err) {
        if(!err.output || err.output.statusCode != 404) {
          log.error({err: err, facebook: id }, '[facebook-login] error getting user');
          return cb(err);
        }

        // This facebook id is not on db, let's find out who it belongs to
        return facebook.getMe(token, function(err, facebookUser) {
          if(err){
            log.error({err: err, id: id, token: token }, '[facebook-login] error retrieving user info from facebook');
            return cb(Boom.unauthorized('couldn\'t retrieve your info from facebook'));
          }

          var changedAttributes = {
            facebook: {
              id: facebookUser.id,
              token: token
            }
          };

          // If user does not exist, lets set the id, name and email
          changedAttributes.$setOnInsert = {
            id: Math.random().toString(36).substr(2,20), // generate random id
            name: facebookUser.name,
            // mail: facebookUser.email,
          };

          var filter = { name: facebookUser.name };
          if(facebookUser.email) {
            filter = { mail: facebookUser.email };
            changedAttributes.$setOnInsert.mail = facebookUser.email;
          }

          log.debug({facebookUser: facebookUser.id}, '[facebook-login] got facebook user');

          // Update the facebook details of the user with this email, ou create a new user if it does not exist
          return server.methods.user.update(filter, changedAttributes, {upsert: true}, function(err, result){
            if(err){
              log.error({user: {mail: facebookUser.email}, changedAttributes: changedAttributes }, '[facebook-login] error upserting user');
              return cb(err);
            }

            log.debug({id: result.id}, '[facebook-login] upserted user');

            return authenticate(result.id, null, cb);
          });
        });
      }

      var changedAttributes = { 'facebook.token': token };

      return authenticate(user.id, changedAttributes, cb);
    });
  });
}

function googleAuth(id, token, cb) {
  google.debugToken(id, token, function(err, isValid) {
      if(err) {
        return cb(Boom.unauthorized(err));
      }

      if(!isValid) {
        return cb(Boom.unauthorized('nice try'));
      }

      server.methods.user.get({'google.id': id}, function(err, user){
      if(err) {
        if(!err.output || err.output.statusCode != 404) {
          log.error({err: err, google: id }, '[google-login] error getting user');
          return cb(err);
        }

        // This google id is not on db, let's find out who it belongs to
        return google.getMe(id, function(err, googleUser) {
          if(err){
            log.error({err: err, id: id, token: token }, '[google-login] error retrieving user info from google');
            return cb(Boom.unauthorized('couldn\'t retrieve your info from google'));
          }

          console.log(googleUser);
          var changedAttributes = {
            google: {
              id: googleUser.id,
              img: googleUser.image.url + '0',
              token: token
            }
          };

          // If user does not exist, lets set the id, name and email
          changedAttributes.$setOnInsert = {
            id: Math.random().toString(36).substr(2,20), // generate random id
            name: googleUser.displayName,
          };

          google.getMail(token, function(err, mail) {
            if(err){
              log.error({err: err, id: id, token: token }, '[google-login] error retrieving user email from google');
              return cb(Boom.unauthorized('couldn\'t retrieve your info from google'));
            }

            var filter = { name: googleUser.name };

            if(mail) {
              filter = { mail: mail };
              changedAttributes.$setOnInsert.mail = mail;
            }

            log.debug({googleUser: googleUser.id}, '[google-login] got google user');

            // Update the facebook details of the user with this email, or create a new user if it does not exist
            return server.methods.user.update(filter, changedAttributes, {upsert: true}, function(err, result){
              if(err){
                log.error({user: {mail: mail}, changedAttributes: changedAttributes }, '[google-login] error upserting user');
                return cb(err);
              }

              log.debug({id: result.id}, '[google-login] upserted user');

              return authenticate(result.id, null, cb);
            });
          });
        });
      }

    var changedAttributes = { 'google.token': token };

    return authenticate(user.id, changedAttributes, cb);
  });   
     
   });
}


function fenixAuth(code, cb){

  async.waterfall([

    function getAccessToken(cbAsync){
      Fenix.auth.getAccessToken(code, function(err, response, body) {

        var auth;

        if(err || !body){
          log.error({err: err, response: response.statusCode, body: body}, '[fenix-login] error getting access token');
          return cbAsync(Boom.unauthorized(body));
        }

        auth = {
          token: body.access_token, // jshint ignore:line
          refreshToken: body.refresh_token, // jshint ignore:line
          ttl: body.expires_in, // jshint ignore:line
          created: Date.now(),
        };

        cbAsync(null, auth);
      });
    },

    function getPerson(auth, cbAsync){
      Fenix.person.getPerson(auth.token, function(err, fenixUser){

        var user;
        var _auth = auth;

        if(err || !fenixUser) {
          log.error({err: err, user: fenixUser}, '[fenix-login] error getting person');
          return cbAsync(Boom.unauthorized());
        }

        _auth.id = fenixUser.username;
        user = {
          auth: _auth,
          name: fenixUser.name,
          email:{
            main: fenixUser.email,
            others: fenixUser.personalEmails.concat(fenixUser.workEmails)
          }
        };
        cbAsync(null, user);
      });
    },

    function compareUser(fenixUser, cbAsync){
      server.methods.user.get({'fenix.id': fenixUser.auth.id}, function(err, user){

        var changedAttributes = {};
        var query = {};

        if(err && (!err.output || err.output.statusCode != 404)){
          log.error({err: err, fenix: fenixUser.auth.id}, '[fenix-login] error getting user');
          return cbAsync(err);
        }
        if(user && user.id){
          changedAttributes = { fenix: fenixUser.auth };

          return authenticate(user.id, changedAttributes, cbAsync);
        }

        changedAttributes.fenix = fenixUser.auth;

        // If user does not exist, lets set the id, name and email
        changedAttributes.$setOnInsert = {
          id: Math.random().toString(36).substr(2,20), // generate random id
          name: fenixUser.name,
          mail: fenixUser.email.main,
        };

        fenixUser.email.others.push(fenixUser.email.main);

        query.mail = {$in: fenixUser.email.others};

        log.debug({fenixUser: fenixUser.id}, '[fenix-login] got fenix user');

        // Update the fenix details of the user with any this emails, ou create a new user if it does not exist
        server.methods.user.update(query, changedAttributes, {upsert: true}, function(err, result){
          if(err){
            log.error({query: query, changedAttributes: changedAttributes }, '[fenix-login] error upserting user');
            return cbAsync(err);
          }

          log.debug({id: result.id}, '[fenix-login] upserted user');

          return authenticate(result.id, null, cbAsync);
        });
      });
    }
  ], cb);
}


function authenticate(userId, changedAttributes, cb) {
  var newToken = Token.getJWT(userId);
  changedAttributes = changedAttributes || {};
  changedAttributes.$push = { bearer: newToken };

  server.methods.user.update({id: userId}, changedAttributes, function(err, result){
    if(err){
      log.error({user: userId, changedAttributes: changedAttributes }, '[login] error updating user');
      return cb(err);
    }
    log.info({user: userId}, '[login] user logged in ');
    return  cb(err, newToken);
  });
}

function addFacebookAuth(user, id, token, cb) {

  async.waterfall([
    function debugToken(cbAsync){
      facebook.debugToken(id, token, function(err, isValid) {
        if(err) {
          return cbAsync(Boom.unauthorized(err));
        }

        if(!isValid) {
          return cbAsync(Boom.unauthorized('nice try'));
        }
        cbAsync();
      });
    },
    function getUser(cbAsync){
      server.methods.user.get({'facebook.id': id}, function(err, _user){
        var filter = { id: user.id };
        var changedAttributes;
        if(err) {
          if(!err.output || err.output.statusCode != 404) {
            log.error({err: err, facebook: id }, '[facebook-login] error getting user');
            return cbAsync(err);
          }

          // This facebook id is not on db, let's find out who it belongs to
          return facebook.getMe(token, function(err, facebookUser) {
            if(err){
              log.error({err: err, id: id, token: token }, '[facebook-login] error retrieving user info from facebook');
              return cbAsync(Boom.unauthorized('couldn\'t retrieve your info from facebook'));
            }

            changedAttributes = {
              facebook: {
                id: facebookUser.id,
                token: token
              }
            };

            if(!user.mail && facebookUser.email) {
              changedAttributes.mail = facebookUser.email;
            }
            log.debug({facebookUser: facebookUser.id}, '[facebook-login] got facebook user');

            return cbAsync(null, filter, changedAttributes);
          });
        }

        // Merging achievements with the same id must be done before doing this, so does the points also 
        //changedAttributes.achievements = (user.achievements || []).concat(_user.achievements);

        changedAttributes = {
          facebook: {
            id: _user.facebook.id,
            token: _user.facebook.token
          }
        };

        return cbAsync(null, filter, changedAttributes);
      });
    },
    function updateUser(filter, changedAttributes, cbAsync){
      // Update the facebook details of the user with this email, ou create a new user if it does not exist
      server.methods.user.update(filter, changedAttributes, function(err, result){
        if(err){
          log.error({user: user.id, changedAttributes: changedAttributes }, '[facebook-login] error upserting user');
          return cbAsync(err);
        }

        log.debug({id: result.id}, '[facebook-login] upserted user');

        return cbAsync(null, result);
      });
    }
  ], cb);
}

function refreshToken(user, token, refresh, cb){

  Token.verifyToken(user, refresh, true, function(err, decoded){
    if(err){
      return cb(err);
    }

    var newToken = Token.getJWT(user);
    var filter = { id: user, bearer: {$elemMatch: {refreshToken: refresh, token: token}}};
    var update = { $set: {'bearer.$': newToken}};

    server.methods.user.update(filter, update, function(err, result){
      if(err){
        log.error({user: user }, '[login] error updating user');
        return cb(Boom.unauthorized());
      }
      return  cb(err, newToken);
    });
  });
}
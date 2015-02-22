var Boom = require('boom');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var fieldsParser = require('server/helpers/fieldsParser');
var Ticket = require('server/db/ticket');
var config = require('config');

server.method('ticket.userConfirmed', userConfirmed, {});
server.method('ticket.userRegistered', userRegistered, {});
server.method('ticket.addUser', addUser, {});
server.method('ticket.removeUser', removeUser, {});
server.method('ticket.confirmUser', confirmUser, {});
server.method('ticket.registerUserPresence', registerUserPresence, {});
server.method('ticket.get', get, {});
server.method('ticket.updateMulti', updateMulti, {});
server.method('ticket.list', list, {});
server.method('ticket.getRegisteredUsers', getRegisteredUsers, {});
server.method('ticket.getWaitingUsers', getWaitingUsers, {});
server.method('ticket.getConfirmedUsers', getConfirmedUsers, {});
server.method('ticket.getAcceptedUser', getAcceptedUser, {});
server.method('ticket.confirmationEmail', confirmationEmail, {});
server.method('ticket.registrationEmail', registrationEmail, {});
server.method('ticket.registrationAcceptedEmail', registrationAcceptedEmail, {});

function userConfirmed(sessionId, userId, cb){
  Ticket.findOne({session: sessionId}, function(err, _ticket){
    if (err) {
      log.error({ err: err, session: sessionId}, 'error getting ticket');
      return cb(Boom.internal());
    }
    if (!_ticket) {
      log.warn({ err: err, session: sessionId}, 'ticket not found');
      return cb(null, false);
    }
    if (_ticket.confirmed.indexOf(userId) >= 0){
      log.error({ err: err, session: sessionId, user: userId}, 'user alreaday confirmed');
      return cb(Boom.conflict('user alreaday confirmed'));
    }
    cb(null, true);
  });
}

function userRegistered(sessionId, userId, cb){
  Ticket.findOne({session: sessionId}, function(err, _ticket){
    if (err) {
      log.error({ err: err, session: sessionId}, 'error getting ticket');
      return cb(Boom.internal());
    }
    if (!_ticket) {
      log.warn({ err: err, session: sessionId}, 'ticket not found');
      return cb(null, false);
    }
    if (_ticket.users.indexOf(userId) >= 0){
      log.error({ err: err, session: sessionId, user: userId}, 'user alreaday registered');
      return cb(Boom.conflict('user alreaday registered'));
    }
    cb(null, true);
  });
}

function addUser(sessionId, userId, session, cb) {
  log.debug({session: session}, 'got session');

  var changes = {
    $addToSet: {
      users: userId
    },
    // If ticket does not exist, lets set the sessionId
    $setOnInsert: {
      session: sessionId
    },
  };

  Ticket.findOneAndUpdate({ session: sessionId }, changes, {upsert: true}, function(err, _ticket) {
    if (err) {
      log.error({ err: err, session: sessionId}, 'error registering ticket');
      return cb(Boom.internal());
    }

    cb(null, _ticket.toObject({ getters: true }));
  });
}

function removeUser(sessionId, userId, session, cb) {
  var changes = {
    $pull: {
      users: userId,
      confirmed: userId,
      present: userId,
    },
  };

  Ticket.findOneAndUpdate({ session: sessionId }, changes, function(err, _ticket) {
    if (err) {
      log.error({ err: err, session: sessionId}, 'error voiding ticket');
      return cb(Boom.internal());
    }

    if(!_ticket) {
      return cb(Boom.notFound('Couln\'t find session'));
    }

    cb(null, _ticket.toObject({ getters: true }));
  });
}

function confirmUser(sessionId, userId, session, cb) {
  var changes = {
    $addToSet: {
      confirmed: userId
    },
  };

  Ticket.findOneAndUpdate({ session: sessionId, users: { $in: [userId] } }, changes, function(err, _ticket) {
    if (err) {
      log.error({ err: err, session: sessionId}, 'error confirming ticket');
      return cb(Boom.internal());
    }

    if(!_ticket) {
      return cb(Boom.notFound('Couln\'t find session, make sure you\'re already registered in this session'));
    }

    cb(null, _ticket.toObject({ getters: true }));
  });
}

function registerUserPresence(sessionId, userId, session, cb) {
  var changes = {
    $addToSet: {
      present: userId
    },
  };

  Ticket.findOneAndUpdate({ session: sessionId }, changes, function(err, _ticket) {
    if (err) {
      log.error({ err: err, session: sessionId}, 'error confirming ticket');
      return cb(Boom.internal());
    }

    if(!_ticket) {
      return cb(Boom.notFound('Couldn\'t find session'));
    }

    cb(null, _ticket.toObject({ getters: true }));
  });
}

function get(filter, query, cb) {
  cb = cb || query; // fields is optional

  var fields = fieldsParser(query.fields);

  if(typeof filter == 'string') {
    filter = { session: filter };
  }

  Ticket.findOne(filter, fields, function(err, ticket) {
    if (err) {
      log.error({err: err, requestedTicket: filter}, 'error getting ticket');
      return cb(Boom.internal());
    }
    if (!ticket) {
      log.warn({err: err, requestedTicket: filter}, 'could not find ticket');
      return cb(Boom.notFound());
    }

    cb(null, ticket);
  });
}

function updateMulti(filter, ticket, cb) {

  if(typeof filter == 'string') {
    filter = { id: filter };
  }

  Ticket.update(filter, ticket, {multi: true}, function(err, tickets) {
    if (err) {
      log.error({err: err, requestedTicket: filter}, 'error updating ticket');
      return cb(Boom.internal());
    }
    if (!ticket) {
      log.warn({err: err, requestedTicket: filter}, 'could not find ticket');
      return cb(Boom.notFound());
    }

    cb(null, tickets);
  });
}

function list(query, cb) {
  cb = cb || query; // fields is optional

  var filter = {};
  var fields = fieldsParser(query.fields);
  var options = {
    skip: query.skip,
    limit: query.limit,
    sort: fieldsParser(query.sort)
  };

  Ticket.find(filter, fields, options, function(err, tickets) {
    if (err) {
      log.error({err: err}, 'error getting all tickets');
      return cb(Boom.internal());
    }

    cb(null, tickets);
  });
}


function getRegisteredUsers(sessionId, session, cb) {
  cb = cb || session; // session is optional

  var filter = { session: sessionId };

  Ticket.findOne(filter, {users: 1}, function(err, ticket) {
    if (err) {
      log.error({err: err, requestedTicket: filter}, 'error getting ticket');
      return cb(Boom.internal());
    }
    if (!ticket) {
      log.warn({err: err, requestedTicket: filter}, 'could not find ticket');
      return cb(Boom.notFound());
    }

    var users = ticket.users;
    if(session && session.tickets && session.tickets.max) {
      users = users.slice(0, session.tickets.max);
    }

    cb(null, users);
  });
}

function getWaitingUsers(sessionId, session, cb) {
  cb = cb || session; // session is optional

  var filter = { session: sessionId };

  Ticket.findOne(filter, {users: 1}, function(err, ticket) {
    if (err) {
      log.error({err: err, requestedTicket: filter}, 'error getting ticket');
      return cb(Boom.internal());
    }
    if (!ticket) {
      log.warn({err: err, requestedTicket: filter}, 'could not find ticket');
      return cb(Boom.notFound());
    }

    var users = ticket.users;
    if(session && session.tickets && session.tickets.max) {
      if (users.length > session.tickets.max) {
        users = users.slice(session.tickets.max);
      }
      else {
        users = [];
      }
    }

    cb(null, users);
  });
}

function getConfirmedUsers(sessionId, session, cb) {
  cb = cb || session; // session is optional

  var filter = { session: sessionId };

  Ticket.findOne(filter, {users: 1}, function(err, ticket) {
    if (err) {
      log.error({err: err, requestedTicket: filter}, 'error getting ticket');
      return cb(Boom.internal());
    }
    if (!ticket) {
      log.warn({err: err, requestedTicket: filter}, 'could not find ticket');
      return cb(Boom.notFound());
    }

    var users = ticket.users.filter(function (o) {
      return ticket.confirmed && ticket.confirmed.indexOf(o.id) !== -1;
    });

    cb(null, users);
  });
}

function getAcceptedUser(ticket, session, user, cb) {
  if(!session.tickets || !session.tickets.max || ticket.users.length <= session.tickets.max){
    log.debug({ticket: ticket}, 'ticket does not have waiting list');
    return cb(Boom.notFound('user list does not have waiting list'));
  }

  if(ticket.users.indexOf(user.id) >= session.tickets.max){
    log.debug({ticket: ticket, user: user.id}, 'user was in the waiting list');
    return cb(Boom.preconditionFailed('voided ticket in waiting list'));
  }

  server.methods.user.get(ticket.users[session.tickets.max], cb);
}

function registrationAcceptedEmail(ticket, session, user, cb){

  if(!user || !user.mail){
    log.error({user: user, ticket: ticket}, 'user does not have a valid email address');
    return cb(Boom.preconditionFailed('user does not have a valid email address'));
  }

  if(ticket.users.indexOf(user.id) < 0){
    log.error({ticket: ticket, user: user}, 'error sending mail, user not in ticket');
    return cb(Boom.notFound());
  }

  server.methods.email.send(getRegistrationAcceptedEmail(session, user), cb);
}

function confirmationEmail(ticket, session, user, cb){

  if(!user || !user.mail){
    log.error({user: user, ticket: ticket}, 'user does not have a valid email address');
    return cb(Boom.preconditionFailed('user does not have a valid email address'));
  }

  if(ticket.confirmed.indexOf(user.id) < 0){
    log.error({ticket: ticket, user: user}, 'error sending mail, user not in the confirmed list of the ticket');
    return cb(Boom.notFound());
  }

  server.methods.email.send(getConfirmationEmail(session, user), cb);
}


function registrationEmail(ticket, session, user, cb) {
  var index = ticket.users.indexOf(user.id);

  if(!user || !user.mail){
    log.error({user: user, ticket: ticket}, 'user does not have a valid email address');
    return cb(Boom.preconditionFailed('user does not have a valid email address'));
  }

  if(index < 0){
    log.error({ticket: ticket, user: user}, 'error sending mail, user not in ticket');
    return cb(Boom.notFound());
  }

  if(index >= session.tickets.max){
    return server.methods.email.send(getWaitingListEmail(session, user), cb);
  }
  server.methods.email.send(getResgisteredListEmail(session, user), cb);
}

function getWaitingListEmail(session, user){
  return {
    to: user.mail,
    subject: '[SINFO] Waiting list for ' + session.name,

    text: 'You are in the waiting list for the session ' + session.name + '\n - ' + config.webapp.url + '/sessions/' + session.id + '\nIf there is an opening you will receive an email.'
  };
}

function getResgisteredListEmail(session, user){
  return {
    to: user.mail,
    subject: '[SINFO] Registered for the session ' + session.name,
    text: 'You have just been registered for the session ' + session.name + '\n - ' + config.webapp.url + '/sessions/' + session.id + '\nYou will need to confirm your presence on the day of the session.'
  };
}

function getRegistrationAcceptedEmail(session, user){
  return {
    to: user.mail,
    subject: '[SINFO] In the registration list for ' + session.name,
    text: 'Due to a cancelation you just got registered for the session ' + session.name + '\n - ' + config.webapp.url + '/sessions/' + session.id + '\nYou will need to confirm your presence on the day of the session.'
  };
}

function getConfirmationEmail(session, user){
  return {
    to: user.mail,
    subject: '[SINFO] You are confirmed for ' + session.name,
    text: 'You are now confirmed for ' + session.name + '\n - ' + config.webapp.url + '/sessions/' + session.id + '\n\n'
  };
}

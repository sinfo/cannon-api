var Boom = require('boom');
var server = require('server').hapi;
var log = require('server/helpers/logger');
var fieldsParser = require('server/helpers/fieldsParser');
var Ticket = require('server/db/ticket');

server.method('ticket.addUser', addUser, {});
server.method('ticket.removeUser', removeUser, {});
server.method('ticket.confirmUser', confirmUser, {});
server.method('ticket.registerUserPresence', registerUserPresence, {});
server.method('ticket.get', get, {});
server.method('ticket.list', list, {});
server.method('ticket.getRegisteredUsers', getRegisteredUsers, {});
server.method('ticket.registrationEmail', registrationEmail, {});

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
      return cb(Boom.notFound('Couln\'t find session'));
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


function registrationEmail(ticket, session, user, cb) {
  var index = ticket.users.indexOf(user.id);

  if(!user || !user.mail){
    log.error({user: user, ticket: ticket}, 'user does not have a valid email address');    
    cb(Boom.preconditionFailed('user does not have a valid email address'));
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
    text: 'You are in the waiting list for the session ' + session.name + '.'
  };
}

function getResgisteredListEmail(session, user){
  return {
    to: user.mail,
    subject: '[SINFO] Registered list for ' + session.name,
    text: 'You are in the registered list for the session ' + session.name + '.'
  };
}
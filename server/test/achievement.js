var Lab = require('lab');
var Code = require('code');

var server = require('server').hapi;

var lab = exports.lab = Lab.script();
var token = require('server/auth/token');

var aux = token.getJWT('john.doe');


var credentialsA = {
  user: {
    id: 'john.doe',
    name: 'John Doe',
  },
  bearer: aux.token,
  scope: 'admin',
};


var credentialsB = {
  user: {
    id: 'john.doe',
    name: 'John Doe',
  },
  bearer: aux.token,
  scope: 'user',
};
var achievementId = 'WENT-TO-SINFO-XXII';

var achievementA = {
  name: 'WENT TO SINFO XXII',
  event: 'SINFO XXII',
  value: 10
};


var changesToA = {
  name: 'WENT TO SINFO XXIII'
};

lab.experiment('Achievement', function() {

  lab.test('Create as an admin', function(done) {
    var options = {
      method: 'POST',
      url: '/achievements',
      credentials: credentialsA,
      payload: achievementA
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(201);
      Code.expect(result).to.be.instanceof(Object);
      Code.expect(result.id).to.equal(achievementId);
      Code.expect(result.name).to.equal(achievementA.name);

      done();
    });
  });


  lab.test('List all as an admin', function(done) {
    var options = {
      method: 'GET',
      url: '/achievements',
      credentials: credentialsA,
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(result).to.be.instanceof(Array);
      Code.expect(result[0].name).to.be.string;
      done();
    });
  });

  lab.test('Get one as an admin', function(done) {
    var options = {
      method: 'GET',
      url: '/achievements/'+achievementId,
      credentials: credentialsA,
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(result).to.be.instanceof(Object);
      Code.expect(result.id).to.equal(achievementId);
      Code.expect(result.name).to.equal(achievementA.name);

      done();
    });
  });


  lab.test('List all as an user', function(done) {
    var options = {
      method: 'GET',
      url: '/achievements',
      credentials: credentialsB,
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(result).to.be.instanceof(Array);
      Code.expect(result[0].name).to.be.string;
      done();
    });
  });

  lab.test('Get one  as an user', function(done) {
    var options = {
      method: 'GET',
      url: '/achievements/'+achievementId,
      credentials: credentialsB,
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(result).to.be.instanceof(Object);
      Code.expect(result.id).to.equal(achievementId);
      Code.expect(result.name).to.equal(achievementA.name);

      done();
    });
  });

  lab.test('Update as an admin', function(done) {
    var options = {
      method: 'PUT',
      url: '/achievements/'+achievementId,
      credentials: credentialsA,
      payload: changesToA
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(result).to.be.instanceof(Object);
      Code.expect(result.id).to.equal(achievementId);
      Code.expect(result.name).to.equal(changesToA.name);

      done();
    });
  });

  lab.test('Update as a user', function(done) {
    var options = {
      method: 'PUT',
      url: '/achievements/'+achievementId,
      credentials: credentialsB,
      payload: changesToA
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(403);

      done();
    });
  });
  lab.test('Delete as an admin', function(done) {
    var options = {
      method: 'DELETE',
      url: '/achievements/'+achievementId,
      credentials: credentialsA,
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(result).to.be.instanceof(Object);
      Code.expect(result.id).to.equal(achievementId);
      Code.expect(result.name).to.equal(changesToA.name);
      done();
    });
  });

  lab.test('Create as a user', function(done) {
    var options = {
      method: 'POST',
      url: '/achievements',
      credentials: credentialsB,
      payload: achievementA
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(403);

      done();
    });
  });

  lab.test('Delete as a user', function(done) {
    var options = {
      method: 'DELETE',
      url: '/achievements/'+achievementId,
      credentials: credentialsB,
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(403);
      done();
    });
  });


});
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
    role: 'admin',
  },
  bearer: aux.token,
  scope: 'admin',
};


var credentialsB = {
  user: {
    id: 'john.doe',
    name: 'John Doe',
    role:'admin',
  },
  bearer: aux.token,
  scope: 'user',
};

var fileA = {
  id: 'readme',
  user:'john.doe',
  name: 'readme',
  kind: 'important',
  extension: 'txt',
};

var changesToA = {
  id: 'readme',
  name: 'README',
  kind: 'important',
  extension: 'txt',
};

lab.experiment('File', function() {

  lab.test('Create as an admin', function(done) {
    var options = {
      method: 'POST',
      url: '/files',
      credentials: credentialsA,
      payload: fileA
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(201);
      Code.expect(result).to.be.instanceof(Object);
      Code.expect(result.id).to.equal(fileA.id);
      Code.expect(result.name).to.equal(fileA.name);
      Code.expect(result.extension).to.equal(fileA.extension);

      done();
    });
  });


  lab.test('List all as an admin', function(done) {
    var options = {
      method: 'GET',
      url: '/files',
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
      url: '/files/'+fileA.id,
      credentials: credentialsA,
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(result).to.be.instanceof(Object);
      Code.expect(result.id).to.equal(fileA.id);
      Code.expect(result.name).to.equal(fileA.name);
      Code.expect(result.extension).to.equal(fileA.extension);

      done();
    });
  });


  lab.test('List all as a user', function(done) {
    var options = {
      method: 'GET',
      url: '/files',
      credentials: credentialsB,
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(403);
      done();
    });
  });

  lab.test('Get one as a user', function(done) {
    var options = {
      method: 'GET',
      url: '/files/'+fileA.id,
      credentials: credentialsB,
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(403);
      done();
    });
  });

  lab.test('Update as an admin', function(done) {
    var options = {
      method: 'PUT',
      url: '/files/'+fileA.id,
      credentials: credentialsA,
      payload: changesToA
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(result).to.be.instanceof(Object);
      Code.expect(result.id).to.equal(fileA.id);
      Code.expect(result.name).to.equal(changesToA.name);
      Code.expect(result.extension).to.equal(fileA.extension);

      done();
    });
  });

  lab.test('Update as an user', function(done) {
    var options = {
      method: 'PUT',
      url: '/files/'+fileA.id,
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
      url: '/files/'+fileA.id,
      credentials: credentialsA,
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(result).to.be.instanceof(Object);
      Code.expect(result.id).to.equal(fileA.id);
      Code.expect(result.name).to.equal(changesToA.name);
      Code.expect(result.extension).to.equal(fileA.extension);
      done();
    });
  });


  lab.test('Create as an user', function(done) {
    var options = {
      method: 'POST',
      url: '/files',
      credentials: credentialsB,
      payload: fileA
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(403);
      done();
    });
  });

  lab.test('Delete as an user', function(done) {
    var options = {
      method: 'DELETE',
      url: '/files/'+fileA.id,
      credentials: credentialsB,
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(403);
      done();
    });
  });


});
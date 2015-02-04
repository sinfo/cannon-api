var Lab = require('lab');
var Code = require('code');

var server = require('server').hapi;

var lab = exports.lab = Lab.script();


var credentials = {
  id: 'john.doe',
  name: 'John Doe',
  roles: [{
    id: 'development-team',
    isTeamLeader: false
  }],
};

var userA = {
  id: 'john.doo',
  name:'John Doe',
  mail:'john@doe.com'
};

var changesToA = {
  name: 'John Doe Doe',
};


lab.experiment('User', function() {

  lab.test('Create', function(done) {
    var options = {
      method: 'POST',
      url: '/users',
      credentials: credentials,
      payload: userA
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(201);
      Code.expect(result).to.be.instanceof(Object);
      Code.expect(result.id).to.equal(userA.id);
      Code.expect(result.name).to.equal(userA.name);

      done();
    });
  });


  lab.test('List all', function(done) {
    var options = {
      method: 'GET',
      url: '/users',
      credentials: credentials,
    };

    server.inject(options, function(response) {
      var result = response.result;

      console.log(result);

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(result).to.be.instanceof(Array);
      Code.expect(result[0].name).to.be.string;
      done();
    });
  });

  lab.test('Get one', function(done) {
    var options = {
      method: 'GET',
      url: '/users/'+userA.id,
      credentials: credentials,
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(result).to.be.instanceof(Object);
      Code.expect(result.id).to.equal(userA.id);
      Code.expect(result.name).to.equal(userA.name);

      done();
    });
  });

  lab.test('Update', function(done) {
    var options = {
      method: 'PUT',
      url: '/users/'+userA.id,
      credentials: credentials,
      payload: changesToA
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(result).to.be.instanceof(Object);
      Code.expect(result.id).to.equal(userA.id);
      Code.expect(result.name).to.equal(changesToA.name);

      done();
    });
  });

  lab.test('Delete', function(done) {
    var options = {
      method: 'DELETE',
      url: '/users/'+userA.id,
      credentials: credentials,
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(result).to.be.instanceof(Object);
      Code.expect(result.id).to.equal(userA.id);
      Code.expect(result.name).to.equal(changesToA.name);
      done();
    });
  });

});
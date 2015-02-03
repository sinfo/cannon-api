var Lab = require('lab');
var Code = require('code');

var server = require('../').hapi;

var lab = exports.lab = Lab.script();


var credentials = {
  id: 'john.doe',
  name: 'John Doe',
  roles: [{
    id: 'development-team',
    isTeamLeader: false
  }],
};

var achievementId = 'WENT-TO-SINFO-XXII';

var achievementA = {
  name: 'WENT TO SINFO XXII',
};


var changesToA = {
  name: 'WENT TO SINFO XXIII'
};

lab.experiment('Achievement', function() {

  lab.test('Create', function(done) {
    var options = {
      method: 'POST',
      url: '/achievements',
      credentials: credentials,
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


  lab.test('List all', function(done) {
    var options = {
      method: 'GET',
      url: '/achievements',
      credentials: credentials,
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(result).to.be.instanceof(Array);
      Code.expect(result[0].name).to.be.string;
      done();
    });
  });

  lab.test('Get one', function(done) {
    var options = {
      method: 'GET',
      url: '/achievements/'+achievementId,
      credentials: credentials,
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

  lab.test('Update 1', function(done) {
    var options = {
      method: 'POST',
      url: '/achievements/'+achievementId,
      credentials: credentials,
      payload: changesToA
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(404);
      done();
    });
  });

  lab.test('Update', function(done) {
    var options = {
      method: 'PUT',
      url: '/achievements/'+achievementId,
      credentials: credentials,
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

  lab.test('Delete', function(done) {
    var options = {
      method: 'DELETE',
      url: '/achievements/'+achievementId,
      credentials: credentials,
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

});
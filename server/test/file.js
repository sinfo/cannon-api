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

var fileA = {
  id: 'readme',
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

  lab.test('Create', function(done) {
    var options = {
      method: 'POST',
      url: '/files',
      credentials: credentials,
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


  lab.test('List all', function(done) {
    var options = {
      method: 'GET',
      url: '/files',
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
      url: '/files/'+fileA.id,
      credentials: credentials,
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

  lab.test('Update', function(done) {
    var options = {
      method: 'PUT',
      url: '/files/'+fileA.id,
      credentials: credentials,
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

  lab.test('Delete', function(done) {
    var options = {
      method: 'DELETE',
      url: '/files/'+fileA.id,
      credentials: credentials,
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

});
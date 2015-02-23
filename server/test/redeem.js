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

var userA = {
  id: 'john.doe',
  name:'John Doe',
  mail:'john@doe.com',
  facebook: {
    token: 'kjasgfasgfhjasgijki8'
  },
  google: {
    token:'13751fdsgsd7'
  },
  fenix: {
    token: '1agasgre',
    refreshToken: '2fherhbhd',
  },

};

var credentialsB = {
  user: {
    id: 'john.doe',
    name: 'John Doe',
  },
  bearer: aux.token,
  scope: 'user',
};


var achievementA = {
  id: 'WENT-TO-SINFO-XXII',
  name: 'WENT TO SINFO XXII',
  event: 'SINFO XXII',
  value: 10
};


var redeemA = {
  id: 'RANDOM-STRING',
  achievement: achievementA.id,
  // entries: 5,
};


lab.experiment('Redeem', function() {

  lab.before(function (done) {

    var options = {
      method: 'POST',
      url: '/achievements',
      credentials: credentialsA,
      payload: achievementA
    };

    server.inject(options, function(response) {
    });

    var userOptions = {
      method: 'POST',
      url: '/users',
      credentials: credentialsA,
      payload: userA
    };

    server.inject(userOptions, function(response) {
      done();
    });
  });

  lab.after(function (done) {
    var userOptions = {
      method: 'DELETE',
      url: '/users/'+userA.id,
      credentials: credentialsA,
    };

    server.inject(userOptions, function(response) {
      done();
    });
  });


  lab.test('Create as an admin', function(done) {
    var options = {
      method: 'POST',
      url: '/redeem',
      credentials: credentialsA,
      payload: redeemA
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(201);
      Code.expect(result).to.be.instanceof(Object);
      Code.expect(result.id).to.equal(redeemA.id);
      Code.expect(result.name).to.equal(redeemA.name);

      done();
    });
  });

  lab.test('Get one as an user', function(done) {
    var options = {
      method: 'GET',
      url: '/redeem/'+redeemA.id,
      credentials: credentialsB,
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(result).to.be.instanceof(Object);
      Code.expect(result.success).to.equal(true);

      done();
    });
  });

  lab.test('Create again as an admin', function(done) {
    var options = {
      method: 'POST',
      url: '/redeem',
      credentials: credentialsA,
      payload: redeemA
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(201);
      Code.expect(result).to.be.instanceof(Object);
      Code.expect(result.id).to.equal(redeemA.id);
      Code.expect(result.name).to.equal(redeemA.name);

      done();
    });
  });

  lab.test('Delete as an admin', function(done) {
    var options = {
      method: 'DELETE',
      url: '/redeem/'+redeemA.id,
      credentials: credentialsA,
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(200);
      Code.expect(result).to.be.instanceof(Object);
      Code.expect(result.id).to.equal(redeemA.id);
      Code.expect(result.name).to.equal(redeemA.name);
      done();
    });
  });

  lab.test('Create as an user', function(done) {
    var options = {
      method: 'POST',
      url: '/redeem',
      credentials: credentialsB,
      payload: redeemA
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
      url: '/redeem/'+redeemA.id,
      credentials: credentialsB,
    };

    server.inject(options, function(response) {
      var result = response.result;

      Code.expect(response.statusCode).to.equal(403);
      done();
    });
  });

  lab.after(function(done) {
    var options = {
      method: 'DELETE',
      url: '/achievements/'+achievementA.id,
      credentials: credentialsA,
    };

    server.inject(options, function(response) {
      done();
    });
  });

});
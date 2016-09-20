var Lab = require('lab')
var Code = require('code')

var server = require('server').hapi

var lab = exports.lab = Lab.script()
var token = require('server/auth/token')

var aux = token.getJWT('john.doe')

var credentialsA = {
  user: {
    id: 'john.doe',
    name: 'John Doe'
  },
  bearer: aux.token,
  scope: 'admin'
}

var credentialsB = {
  user: {
    id: 'john.doe',
    name: 'John Doe'
  },
  bearer: aux.token,
  scope: 'user'
}

var userA = {
  id: 'john.doe',
  name: 'John Doe',
  mail: 'john@doe.com'
}

var changesToA = {
  name: 'John Doe Doe'
}

lab.experiment('User', function () {
  lab.test('Create as admin', function (done) {
    var options = {
      method: 'POST',
      url: '/users',
      credentials: credentialsA,
      payload: userA
    }

    server.inject(options, function (response) {
      var result = response.result

      Code.expect(response.statusCode).to.equal(201)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(userA.id)
      Code.expect(result.name).to.equal(userA.name)

      done()
    })
  })

  lab.test('List all as admin', function (done) {
    var options = {
      method: 'GET',
      url: '/users',
      credentials: credentialsA
    }

    server.inject(options, function (response) {
      var result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Array)
      Code.expect(result[0].name).to.be.string
      done()
    })
  })

  lab.test('Get one as admin', function (done) {
    var options = {
      method: 'GET',
      url: '/users/' + userA.id,
      credentials: credentialsA
    }

    server.inject(options, function (response) {
      var result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(userA.id)
      Code.expect(result.name).to.equal(userA.name)

      done()
    })
  })

  lab.test('Get one as user', function (done) {
    var options = {
      method: 'GET',
      url: '/users/' + userA.id,
      credentials: credentialsB
    }

    server.inject(options, function (response) {
      var result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(userA.id)
      Code.expect(result.name).to.equal(userA.name)

      done()
    })
  })

  lab.test('Get me as admin', function (done) {
    var options = {
      method: 'GET',
      url: '/users/me',
      credentials: credentialsA
    }

    server.inject(options, function (response) {
      var result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(userA.id)
      Code.expect(result.name).to.equal(userA.name)

      done()
    })
  })

  lab.test('Get me as user', function (done) {
    var options = {
      method: 'GET',
      url: '/users/me',
      credentials: credentialsB
    }

    server.inject(options, function (response) {
      var result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(userA.id)
      Code.expect(result.name).to.equal(userA.name)

      done()
    })
  })

  lab.test('Update as admin', function (done) {
    var options = {
      method: 'PUT',
      url: '/users/' + userA.id,
      credentials: credentialsA,
      payload: changesToA
    }

    server.inject(options, function (response) {
      var result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(userA.id)
      Code.expect(result.name).to.equal(changesToA.name)

      done()
    })
  })

  lab.test('List all as user', function (done) {
    var options = {
      method: 'GET',
      url: '/users',
      credentials: credentialsB
    }

    server.inject(options, function (response) {
      var result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Array)
      Code.expect(result[0].name).to.be.string
      done()
    })
  })

  lab.test('Update as user', function (done) {
    var options = {
      method: 'PUT',
      url: '/users/' + userA.id,
      credentials: credentialsB,
      payload: changesToA
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(403)
      done()
    })
  })

  lab.test('Delete as admin', function (done) {
    var options = {
      method: 'DELETE',
      url: '/users/' + userA.id,
      credentials: credentialsA
    }

    server.inject(options, function (response) {
      var result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(userA.id)
      Code.expect(result.name).to.equal(changesToA.name)
      done()
    })
  })

  lab.test('Create as user', function (done) {
    var options = {
      method: 'POST',
      url: '/users',
      credentials: credentialsB,
      payload: userA
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(403)
      done()
    })
  })

  lab.test('Delete as user', function (done) {
    var options = {
      method: 'DELETE',
      url: '/users/' + userA.id,
      credentials: credentialsB
    }

    server.inject(options, function (response) {
      Code.expect(response.statusCode).to.equal(403)
      done()
    })
  })
})

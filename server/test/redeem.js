const Lab = require('lab')
const Code = require('code')

const server = require('../').hapi

const lab = exports.lab = Lab.script()
const token = require('../auth/token')

const aux = token.createJwt('john.doe')

const credentialsA = {
  user: {
    id: 'john.doe',
    name: 'John Doe'
  },
  bearer: aux.token,
  scope: 'admin'
}

const userA = {
  id: 'john.doe',
  name: 'John Doe',
  mail: 'john@doe.com',
  facebook: {
    token: 'kjasgfasgfhjasgijki8'
  },
  google: {
    token: '13751fdsgsd7'
  },
  fenix: {
    token: '1agasgre',
    refreshToken: '2fherhbhd'
  }

}

const credentialsB = {
  user: {
    id: 'john.doe',
    name: 'John Doe'
  },
  bearer: aux.token,
  scope: 'user'
}

const achievementA = {
  id: 'WENT-TO-SINFO-XXII',
  name: 'WENT TO SINFO XXII',
  event: 'SINFO XXII',
  value: 10
}

const redeemA = {
  id: 'RANDOM-STRING',
  achievement: achievementA.id
  // entries: 5,
}

lab.experiment('Redeem', () => {
  lab.before((done) => {
    const options = {
      method: 'POST',
      url: '/achievements',
      credentials: credentialsA,
      payload: achievementA
    }

    server.inject(options, (response) => {
    })

    const userOptions = {
      method: 'POST',
      url: '/users',
      credentials: credentialsA,
      payload: userA
    }

    server.inject(userOptions, (response) => {
      done()
    })
  })

  lab.after((done) => {
    const userOptions = {
      method: 'DELETE',
      url: '/users/' + userA.id,
      credentials: credentialsA
    }

    server.inject(userOptions, (response) => {
      done()
    })
  })

  lab.test('Create as an admin', (done) => {
    const options = {
      method: 'POST',
      url: '/redeem',
      credentials: credentialsA,
      payload: redeemA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(201)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(redeemA.id)
      Code.expect(result.name).to.equal(redeemA.name)

      done()
    })
  })

  lab.test('Get one as an user', (done) => {
    const options = {
      method: 'POST',
      url: '/redeem/' + redeemA.id,
      credentials: credentialsB
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.success).to.equal(true)

      done()
    })
  })

  lab.test('Create again as an admin', (done) => {
    const options = {
      method: 'POST',
      url: '/redeem',
      credentials: credentialsA,
      payload: redeemA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(201)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(redeemA.id)
      Code.expect(result.name).to.equal(redeemA.name)

      done()
    })
  })

  lab.test('Delete as an admin', (done) => {
    const options = {
      method: 'DELETE',
      url: '/redeem/' + redeemA.id,
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(redeemA.id)
      Code.expect(result.name).to.equal(redeemA.name)
      done()
    })
  })

  lab.test('Create as an user', (done) => {
    const options = {
      method: 'POST',
      url: '/redeem',
      credentials: credentialsB,
      payload: redeemA
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)
      done()
    })
  })

  lab.test('Delete as an user', (done) => {
    const options = {
      method: 'DELETE',
      url: '/redeem/' + redeemA.id,
      credentials: credentialsB
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)
      done()
    })
  })

  lab.after((done) => {
    const options = {
      method: 'DELETE',
      url: '/achievements/' + achievementA.id,
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      done()
    })
  })
})

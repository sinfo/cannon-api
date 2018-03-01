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

const userB = {
  id: 'john.doe.the.second',
  name: 'John Doe The Second',
  mail: 'john_the_second@doe.com',
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

const achievementB = {
  id: 'WENT-TO-SOME-WORKHOP-AT-SINFO-XXII',
  name: 'WENT TO SOME WORKSHOP AT SINFO XXII',
  event: 'SINFO XXII',
  value: 5
}

const achievementC = {
  id: 'WENT-TO-SOME-OTHER-WORKHOP-AT-SINFO-XXII',
  name: 'WENT TO SOME OTHER WORKSHOP AT SINFO XXII',
  event: 'SINFO XXII',
  value: 6
}

const redeemA = {
  id: 'RANDOM-STRING',
  achievement: achievementA.id,
  user: userA.id
  // entries: 5,
}

const redeemB = {
  id: 'REDEEM-B',
  achievement: achievementB.id,
  user: userA.id
}

const redeemC = {
  id: 'REDEEM-C',
  achievement: achievementC.id,
  user: userA.id
}

const redeemD = {
  id: 'REDEEM-D',
  achievement: achievementB.id,
  user: userB.id
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

    const optionsB = {
      method: 'POST',
      url: '/achievements',
      credentials: credentialsA,
      payload: achievementB
    }

    server.inject(optionsB, (response) => {
    })

    const optionsC = {
      method: 'POST',
      url: '/achievements',
      credentials: credentialsA,
      payload: achievementC
    }

    server.inject(optionsC, (response) => {
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
      Code.expect(result.user).to.equal(redeemA.user)

      done()
    })
  })

  lab.test('Get one as an user', (done) => {
    const options = {
      method: 'GET',
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

    const optionsB = {
      method: 'POST',
      url: '/redeem',
      credentials: credentialsA,
      payload: redeemB
    }

    const optionsC = {
      method: 'POST',
      url: '/redeem',
      credentials: credentialsA,
      payload: redeemC
    }

    const optionsD = {
      method: 'POST',
      url: '/redeem',
      credentials: credentialsA,
      payload: redeemD
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(201)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(redeemA.id)
      Code.expect(result.name).to.equal(redeemA.name)
      Code.expect(result.user).to.equal(redeemA.user)

      server.inject(optionsB, (responseB) => {
        const resultB = responseB.result

        Code.expect(responseB.statusCode).to.equal(201)
        Code.expect(resultB).to.be.instanceof(Object)
        Code.expect(resultB.id).to.equal(redeemB.id)
        Code.expect(resultB.name).to.equal(redeemB.name)
        Code.expect(resultB.user).to.equal(redeemB.user)

        server.inject(optionsC, (responseC) => {
          const resultC = responseC.result

          Code.expect(responseC.statusCode).to.equal(201)
          Code.expect(resultC).to.be.instanceof(Object)
          Code.expect(resultC.id).to.equal(redeemC.id)
          Code.expect(resultC.name).to.equal(redeemC.name)
          Code.expect(resultC.user).to.equal(redeemC.user)

          server.inject(optionsD, (responseD) => {
            const resultD = responseD.result

            Code.expect(responseD.statusCode).to.equal(201)
            Code.expect(resultD).to.be.instanceof(Object)
            Code.expect(resultD.id).to.equal(redeemD.id)
            Code.expect(resultD.name).to.equal(redeemD.name)
            Code.expect(resultD.user).to.equal(redeemD.user)

            done()
          })
        })
      })
    })
  })

  lab.test('Get all redeem codes of user as user', (done) => {
    const options = {
      method: 'GET',
      url: '/redeem/me',
      credentials: credentialsB
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Array)

      Code.expect(result.length).to.equal(3)

      Code.expect(result[0].id).to.equal(redeemA.id)
      Code.expect(result[0].name).to.equal(redeemA.name)
      Code.expect(result[0].user).to.equal(userA.id)

      Code.expect(result[1].id).to.equal(redeemB.id)
      Code.expect(result[1].name).to.equal(redeemB.name)
      Code.expect(result[1].user).to.equal(userA.id)

      Code.expect(result[2].id).to.equal(redeemC.id)
      Code.expect(result[2].name).to.equal(redeemC.name)
      Code.expect(result[2].user).to.equal(userA.id)
      done()
    })
  })

  lab.test('Delete as an admin', (done) => {
    const options = {
      method: 'DELETE',
      url: '/redeem/' + redeemA.id,
      credentials: credentialsA
    }

    const optionsB = {
      method: 'DELETE',
      url: '/redeem/' + redeemB.id,
      credentials: credentialsA
    }

    const optionsC = {
      method: 'DELETE',
      url: '/redeem/' + redeemC.id,
      credentials: credentialsA
    }

    const optionsD = {
      method: 'DELETE',
      url: '/redeem/' + redeemD.id,
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.a.number()
      // Code.expect(result).to.equal(1)

      server.inject(optionsB, (responseB) => {
        const resultB = responseB.result

        Code.expect(response.statusCode).to.equal(200)
        Code.expect(result).to.be.a.number()
        Code.expect(result).to.equal(1)

        server.inject(optionsC, (responseC) => {
          const resultC = responseC.result

          Code.expect(responseC.statusCode).to.equal(200)
          Code.expect(result).to.be.a.number()
          Code.expect(result).to.equal(1)

          server.inject(optionsD, (responseD) => {
            const resultD = responseD.result

            Code.expect(responseD.statusCode).to.equal(200)
            Code.expect(result).to.be.a.number()
            Code.expect(result).to.equal(1)

            done()
          })
        })
      })
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
    const optionsB = {
      method: 'DELETE',
      url: '/achievements/' + achievementB.id,
      credentials: credentialsA
    }

    const optionsC = {
      method: 'DELETE',
      url: '/achievements/' + achievementC.id,
      credentials: credentialsA
    }

    server.inject(options, (response) => {
      server.inject(optionsB, (response) => {
        server.inject(optionsC, (response) => {
          done()
        })
      })
    })
  })
})

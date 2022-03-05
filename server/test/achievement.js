const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const async = require('async')

const server = require('../').hapi

const lab = exports.lab = Lab.script()
const token = require('../auth/token')

const aux = token.createJwt('john.doe')

const secretId = 'secret_achievement_'

const session = 'session-code-id'

const credentialsA = {
  user: {
    id: 'john.doe',
    name: 'John Doe'
  },
  bearer: aux.token,
  scope: 'admin'
}

const credentialsB = {
  user: {
    id: 'john.doe',
    name: 'John Doe'
  },
  bearer: aux.token,
  scope: 'user'
}
const achievementId = 'WENT-TO-SINFO-XXII'

const achievementA = {
  name: 'WENT TO SINFO XXII',
  session: session,
  event: 'SINFO XXII',
  value: 10,
  validity: {
    from: new Date(),
    to: new Date(new Date().getTime() + (1000 * 60 * 60)) // 1 h
  }
}

const changesToA = {
  name: 'WENT TO SINFO XXIII'
}

const event = 'SINFO XXII'

let codeA = ''
let codeB = ''

lab.experiment('Achievement', () => {
  lab.after(( ) => {
    const optionsA = {
      method: 'DELETE',
      url: `/achievements/${event}_${secretId}0`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      }
    }

    const optionsB = {
      method: 'DELETE',
      url: `/achievements/${event}_${secretId}1`,
      auth:{credentials: credentialsA,
        strategy: 'default'}
    }

    async.parallel([
      (cb) => {
        server.inject(optionsA, (response) => {
          return cb()
        })
      },
      (cb) => {
        server.inject(optionsB, (response) => {
          return cb()
        })
      }
    ], (_, results) => {
       
    })
  })

  lab.test('Create as an admin', ( ) => {
    const options = {
      method: 'POST',
      url: '/achievements',
      auth:{credentials: credentialsA,
        strategy: 'default'},
      payload: achievementA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(201)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(achievementId)
      Code.expect(result.name).to.equal(achievementA.name)

       
    })
  })

  lab.test('List all as an admin', ( ) => {
    const options = {
      method: 'GET',
      url: '/achievements',
      auth:{credentials: credentialsA,
        strategy: 'default'}
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Array)
      Code.expect(result[0].name).to.be.string
       
    })
  })

  lab.test('Get one as an admin', ( ) => {
    const options = {
      method: 'GET',
      url: '/achievements/' + achievementId,
      auth:{credentials: credentialsA,
        strategy: 'default'}
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(achievementId)
      Code.expect(result.name).to.equal(achievementA.name)
      Code.expect(result.session).to.equal(achievementA.session)

       
    })
  })

  lab.test('List all as an user', ( ) => {
    const options = {
      method: 'GET',
      url: '/achievements',
      auth:{credentials: credentialsB,
        strategy: 'default'}
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Array)
      Code.expect(result[0].name).to.be.string
       
    })
  })

  lab.test('Get one  as an user', ( ) => {
    const options = {
      method: 'GET',
      url: '/achievements/' + achievementId,
      auth:{credentials: credentialsB,
        strategy: 'default'}
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(achievementId)
      Code.expect(result.name).to.equal(achievementA.name)

       
    })
  })

  lab.test('Get one by session', ( ) => {
    const options = {
      method: 'GET',
      url: '/achievements/session/' + session,
      auth:{credentials: credentialsA,
        strategy: 'default'}
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(achievementId)
      Code.expect(result.name).to.equal(achievementA.name)
      Code.expect(result.session).to.equal(session)

       
    })
  })

  lab.test('Update as an admin', ( ) => {
    const options = {
      method: 'PUT',
      url: '/achievements/' + achievementId,
      auth:{credentials: credentialsA,
        strategy: 'default'},
      payload: changesToA
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(achievementId)
      Code.expect(result.name).to.equal(changesToA.name)

       
    })
  })

  lab.test('Update as a user', ( ) => {
    const options = {
      method: 'PUT',
      url: '/achievements/' + achievementId,
      auth:{credentials: credentialsB,
        strategy: 'default'},
      payload: changesToA
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)

       
    })
  })

  lab.test('Delete as an admin', ( ) => {
    const options = {
      method: 'DELETE',
      url: '/achievements/' + achievementId,
      auth:{credentials: credentialsA,
        strategy: 'default'}
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.id).to.equal(achievementId)
      Code.expect(result.name).to.equal(changesToA.name)
       
    })
  })

  lab.test('Create as a user', ( ) => {
    const options = {
      method: 'POST',
      url: '/achievements',
      auth:{credentials: credentialsB,
        strategy: 'default'},
      payload: achievementA
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)

       
    })
  })

  lab.test('Delete as a user', ( ) => {
    const options = {
      method: 'DELETE',
      url: '/achievements/' + achievementId,
      auth:{credentials: credentialsB,
        strategy: 'default'}
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(403)
       
    })
  })

  lab.test('Create secret achievement', ( ) => {
    const value = 50
    const payload = {
      validity: new Date(new Date().getTime() + (1000 * 60 * 60)),
      event: 'SINFO XXII',
      points: value
    }

    const options = {
      method: 'POST',
      url: '/achievements/secret',
      auth:{credentials: credentialsA,
        strategy: 'default'},
      payload: payload
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(201)
      Code.expect(result.id).to.equal(`${event}_${secretId}0`)
      Code.expect(result.value).to.equal(value)
      codeA = result.code.code

      server.inject(options, (response) => {
        const result = response.result

        Code.expect(response.statusCode).to.equal(201)
        Code.expect(result.id).to.equal(`${event}_${secretId}1`)
        Code.expect(result.value).to.equal(value)
        codeB = result.code.code

         
      })
    })
  })

  lab.test('List secret with codes', ( ) => {
    const start = new Date(new Date().getTime() - (24 * 1000 * 60 * 60))
    const end = new Date(new Date().getTime() + (24 * 1000 * 60 * 60))
    const query = `?start=${start}&end=${end}&kind=secret
    `
    const options = {
      method: 'GET',
      url: `/achievements/code${query}`,
      auth:{credentials: credentialsA,
        strategy: 'default'}
    }

    server.inject(options, (response) => { // Admin
      const result = response.result

      result.sort((a, b) => { return a < b ? 1 : -1 })

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Array)
      Code.expect(result.length).to.equal(2)
      Code.expect(result[0].code).to.be.instanceof(Object)
      Code.expect(result[0].code.code).to.equal(codeA)
      Code.expect(result[1].code).to.be.instanceof(Object)
      Code.expect(result[1].code.code).to.equal(codeB)

       
    })
  })

  lab.test('Sign in to secret with code', ( ) => {
    const options = {
      method: 'POST',
      url: `/achievements/redeem/secret`,
      auth:{credentials: credentialsB,
        strategy: 'default'},
      payload: {code: codeA}
    }

    server.inject(options, (response) => {
      const result = response.result

      Code.expect(response.statusCode).to.equal(200)
      Code.expect(result).to.be.instanceof(Object)
      Code.expect(result.code.code).to.equal(codeA)
      Code.expect(result.users.length).to.equal(1)
      Code.expect(result.users[0]).to.equal(credentialsB.user.id)

       
    })
  })

  lab.test('Sign in to secret with code fail', ( ) => {
    const options = {
      method: 'POST',
      url: `/achievements/redeem/secret`,
      auth:{credentials: credentialsB,
        strategy: 'default'},
      payload: {code: 'wrongcode123'}
    }

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(404)

       
    })
  })
})

const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const async = require('async')
const slug = require('slug')

const server = require('./server').hapi

const lab = exports.lab = Lab.script()
const token = require('./server/auth/token')

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
const achievementId = slug(achievementA.name)

const changesToA = {
  name: 'WENT TO SINFO XXIII'
}

const event = 'SINFO XXII'

let codeA = ''
let codeB = ''

lab.experiment('Achievement', () => {
  lab.after(async () => {
    const optionsA = {
      method: 'DELETE',
      url: `/achievements/${achievementId}`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      }
    }
    await server.inject(optionsA) 
  })

  lab.test('Create as an admin',async () => {
    const options = {
      method: 'POST',
      url: '/achievements',
      auth:{credentials: credentialsA,
        strategy: 'default'},
      payload: achievementA
    }

    let result = await server.inject(options)
    
    Code.expect(result.statusCode).to.equal(201)
    Code.expect(result.result).to.be.instanceof(Object)
    Code.expect(result.result.id).to.equal(achievementId)
    Code.expect(result.result.name).to.equal(achievementA.name)
  })
})
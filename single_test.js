const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const slug = require('slug')

const server = require('./server').hapi

const lab = exports.lab = Lab.script()
const token = require('./server/auth/token')
const AchievementKind = require('./server/db/achievementKind')

const aux = token.createJwt('john.doe')
const auxB = token.createJwt('jane.doe')

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

const credentialsC = {
  user: {
    id: 'john.doe',
    name: 'John Doe'
  },
  bearer: aux.token,
  scope: 'team'
}

const credentialsD = {
  user: {
    id: 'jane.doe',
    name: 'Jane Doe'
  },
  bearer: auxB.token,
  scope: 'user'
}

let code = ''

const userA = {
  id: 'john.doe',
  name: 'John Doe',
  mail: 'john@doe.com'
}

const achievementA = {
  name: 'WENT TO SINFO XXII',
  event: 'SINFO XXII',
  session: 'not', // HACK
  value: 10,
  validity: {
    from: new Date(),
    to: new Date(new Date().getTime() + (1000 * 60 * 60)) // 1 h
  }
}
const achievementId = slug(achievementA.name)

const changesToA = {
  name: 'John Doe Doe'
}

const promoteAtoCompany = {
  role: 'company',
  company: {
    edition: 'sinfo25',
    company: 'sinfo-consulting'
  }
}

const updatedACompany = {
  company: {
    edition: 'sinfo25',
    company: 'sinfo-operations'
  }
}

const sessionA = 'sessionA'
const sessionB = 'sessionB'
const wsIdA = 'ws1'
const wsIdB = 'ws2'

const wsA = {
  name: 'WS A',
  event: 'SINFO 28',
  id: wsIdA,
  value: 10,
  session: sessionA,
  validity: {
    from: new Date(),
    to: new Date(new Date().getTime() + (1000 * 60 * 60))
  },
  kind: AchievementKind.WORKSHOP
}

const wsB = {
  name: 'WS B',
  event: 'SINFO 28',
  id: wsIdB,
  value: 10,
  session: sessionB,
  validity: {
    from: new Date(),
    to: new Date(new Date().getTime() + (1000 * 60 * 60))
  },
  kind: AchievementKind.WORKSHOP
}

let codewsA = ''
let codewsB = ''

lab.experiment('User', () => {
  lab.before( async () => {
    const expires = new Date(new Date().getTime() + (1000 * 60 * 60))

    const optionsA = {
      method: 'POST',
      url: '/achievements',
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: wsA
    }

    const optionsB = {
      method: 'POST',
      url: '/achievements',
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: wsB
    }

    const optionsC = {
      method: 'POST',
      url: `/sessions/${sessionA}/generate`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: {expiration: expires}
    }

    const optionsD = {
      method: 'POST',
      url: `/sessions/${sessionB}/generate`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: {expiration: expires}
    }

 
    let response = await server.inject(optionsA)
    Code.expect(response.statusCode).to.equal(201)
    response = await server.inject(optionsB)
    Code.expect(response.statusCode).to.equal(201)
    response  = await server.inject(optionsC)
    Code.expect(response.statusCode).to.equal(200)
    codewsA = response.result.code.code
    response = await server.inject(optionsD)
    Code.expect(response.statusCode).to.equal(200)
    codewsB = response.result.code.code
  })

  lab.after( async () => {
    const optionsA = {
      method: 'DELETE',
      url: '/achievements/' + achievementId,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    const optionsB = {
      method: 'DELETE',
      url: '/achievements/' + wsIdA,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    const optionsC = {
      method: 'DELETE',
      url: '/achievements/' + wsIdB,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }


    let response = await server.inject(optionsA)
    Code.expect(response.statusCode).to.equal(200)
    response = await server.inject(optionsB)
    Code.expect(response.statusCode).to.equal(200)
    response = await server.inject(optionsC)
    Code.expect(response.statusCode).to.equal(200)
  })

  lab.test('Create as admin',  async () => {
    const options = {
      method: 'POST',
      url: '/users',
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: userA
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(201)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(userA.id)
    Code.expect(result.name).to.equal(userA.name)

  })

  lab.test('Block double concurrent workshop',  async () => {
    const optionsA = {
      method: 'POST',
      url: `/sessions/${sessionA}/check-in`,
      auth:{
        credentials: credentialsD,
        strategy: 'default'
      },
      payload: {
        users: [credentialsD.user.id],
        code: codewsA
      }
    }

    const optionsB = {
      method: 'POST',
      url: `/sessions/${sessionB}/check-in`,
      auth:{
        credentials: credentialsD,
        strategy: 'default'
      },
      payload: {
        users: [credentialsD.user.id],
        code: codewsB
      }
    }

    const optionsC = {
      method: 'GET',
      url: '/achievements/active/me',
      auth:{
        credentials: credentialsD,
        strategy: 'default'
      },
    }

    let response = await server.inject(optionsA)
    let result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(wsIdA)
    Code.expect(result.name).to.equal(wsA.name)
    Code.expect(result.users).to.contain(credentialsD.user.id)

    response = await server.inject(optionsB)
    Code.expect(response.statusCode).to.equal(403)

    response = await server.inject(optionsC)
    result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result.points).to.equal(0)
    Code.expect(result.achievements.length).to.equal(0)
  })

  lab.test('Double sign in same workshop should not deduce points',  async () => {
    const optionsA = {
      method: 'POST',
      url: `/sessions/${sessionA}/check-in`,
      auth:{
        credentials: credentialsD,
        strategy: 'default'
      },
      payload: {
        users: [credentialsD.user.id],
        code: codewsA
      }
    }

    const optionsB = {
      method: 'GET',
      url: '/achievements/active/me',
      auth:{
        credentials: credentialsD,
        strategy: 'default'
      },
    }

    let response = await server.inject(optionsA)
    let result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(wsIdA)
    Code.expect(result.name).to.equal(wsA.name)
    Code.expect(result.users).to.contain(credentialsD.user.id)

    response = await server.inject(optionsA)
    result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(wsIdA)
    Code.expect(result.name).to.equal(wsA.name)
    Code.expect(result.users).to.contain(credentialsD.user.id)

    response = await server.inject(optionsB)
    result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result.points).to.equal(wsA.value)
    Code.expect(result.achievements.length).to.equal(1)
  })

  lab.test('List all as admin',  async () => {
    const options = {
      method: 'GET',
      url: '/users',
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Array)
      
  })

  lab.test('List all with achievement as admin',  async () => {
    const opt1 = {
      method: 'GET',
      url: '/users',
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    const opt2 = {
      method: 'POST',
      url: '/achievements',
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: achievementA
    }

    const opt3 = {
      method: 'POST',
      url: `/sessions/${achievementA.session}/check-in`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: { users: [userA.id] }
    }

    let response = await server.inject(opt2)
    let result = response.result

    Code.expect(response.statusCode).to.equal(201)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(achievementId)
    Code.expect(result.name).to.equal(achievementA.name)

    response = await server.inject(opt3)
    Code.expect(response.statusCode).to.equal(200)

    response = await server.inject(opt1)
    result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Array)
    Code.expect(result[0].name).to.be.string
    
  })

  lab.test('Post code as admin and sign as user',  async () => {
    const expires = new Date(new Date().getTime() + (1000 * 60 * 60))

    const opt1 = {
      method: 'POST',
      url: `/sessions/${achievementA.session}/generate`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: {expiration: expires}
    }

    let response = await server.inject(opt1)
    let result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(achievementId)
    Code.expect(result.name).to.equal(achievementA.name)
    Code.expect(new Date(result.code.expiration).toISOString()).to.equal(expires.toISOString())
    Code.expect(result.code.code.length).to.equal(12)

    code = result.code.code

    const opt2 = {
      method: 'POST',
      url: `/sessions/${achievementA.session}/check-in`,
      auth:{
        credentials: credentialsD,
        strategy: 'default'
      },
      payload: {
        users: [credentialsD.user.id],
        code: code
      }
    }

    response = await server.inject(opt2)
    result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(achievementId)
    Code.expect(result.name).to.equal(achievementA.name)
    Code.expect(result.users).to.contain(credentialsD.user.id)
  })

  lab.test('Self sign fail',  async () => {
    const opt1 = {
      method: 'GET',
      url: `/achievements/${achievementId}`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    let response = await server.inject(opt1)
    let result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(achievementId)
    Code.expect(result.name).to.equal(achievementA.name)

    const opt2 = {
      method: 'POST',
      url: `/sessions/${achievementA.session}/check-in`,
      auth:{
        credentials: credentialsD,
        strategy: 'default'
      },
      payload: {
        users: [credentialsD.user.id],
        code: 'bad'
      }
    }

    response = await server.inject(opt2)
    Code.expect(response.statusCode).to.equal(404)

    const opt3 = {
      method: 'POST',
      url: `/sessions/${achievementA.session}/check-in`,
      auth:{
        credentials: credentialsD,
        strategy: 'default'
      },
      payload: {
        users: [credentialsA.user.id],
        code: code
      }
    }

    response = await server.inject(opt3)
    Code.expect(response.statusCode).to.equal(400)
  
  })

  lab.test('Get one with codes',  async () => {
    const opt1 = {
      method: 'GET',
      url: `/achievements/${achievementId}/code`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    const opt2 = {
      method: 'GET',
      url: `/achievements/${achievementId}/code`,
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
    }

    const opt3 = {
      method: 'GET',
      url: `/achievements/${achievementId}/code`,
      auth:{
        credentials: credentialsC,
        strategy: 'default'
      },
    }

    let response = await server.inject(opt1) // Admin
    let result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(achievementId)
    Code.expect(result.name).to.equal(achievementA.name)
    Code.expect(result.code).to.be.instanceof(Object)
    Code.expect(result.code.code).to.equal(code)

    response = await server.inject(opt3) // Team
    result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(achievementId)
    Code.expect(result.name).to.equal(achievementA.name)
    Code.expect(result.code).to.be.instanceof(Object)
    Code.expect(result.code.code).to.equal(code)

    response = await server.inject(opt2)// User
    Code.expect(response.statusCode).to.equal(403)

  })

  lab.test('List with codes',  async () => {
    const start = new Date(achievementA.validity.from.getTime() - (1000 * 60 * 60))
    const end = new Date(achievementA.validity.to.getTime() + (1000 * 60 * 60))
    const query = `?start=${start}&end=${end}`
    const opt1 = {
      method: 'GET',
      url: `/achievements/code${query}`,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    const opt2 = {
      method: 'GET',
      url: `/achievements/code${query}`,
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
    }

    const opt3 = {
      method: 'GET',
      url: `/achievements/code${query}`,
      auth:{
        credentials: credentialsC,
        strategy: 'default'
      },
    }

    let response = await server.inject(opt1) // Admin
    let result = response.result

    let sorted = result.filter(elem => elem.id === achievementId)

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Array)
    Code.expect(sorted.length).to.equal(1)
    Code.expect(sorted[0].id).to.equal(achievementId)
    Code.expect(sorted[0].name).to.equal(achievementA.name)
    Code.expect(sorted[0].code).to.be.instanceof(Object)
    Code.expect(sorted[0].code.code).to.equal(code)

    response = await server.inject(opt3) // Team
    result = response.result

    sorted = result.filter(elem => elem.id === achievementId)

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Array)
    Code.expect(sorted.length).to.equal(1)
    Code.expect(sorted[0].id).to.equal(achievementId)
    Code.expect(sorted[0].name).to.equal(achievementA.name)
    Code.expect(sorted[0].code).to.be.instanceof(Object)
    Code.expect(sorted[0].code.code).to.equal(code)

    response = await server.inject(opt2) // User
    Code.expect(response.statusCode).to.equal(403)

  })

  lab.test('Get one as admin',  async () => {
    const options = {
      method: 'GET',
      url: '/users/' + userA.id,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(userA.id)
    Code.expect(result.name).to.equal(userA.name)
  })

  lab.test('Get one as user',  async () => {
    const options = {
      method: 'GET',
      url: '/users/' + userA.id,
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(userA.id)
    Code.expect(result.name).to.equal(userA.name)
  })

  lab.test('Get me as admin',  async () => {
    const options = {
      method: 'GET',
      url: '/users/me',
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(userA.id)
    Code.expect(result.name).to.equal(userA.name)

   
  })

  lab.test('Get me as user',  async () => {
    const options = {
      method: 'GET',
      url: '/users/me',
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(userA.id)
    Code.expect(result.name).to.equal(userA.name)

   
  })

  lab.test('Update as admin',  async () => {
    const options = {
      method: 'PUT',
      url: '/users/' + userA.id,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: changesToA
    }

    let response = await server.inject(options)
    const result = response.result
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(userA.id)
    Code.expect(result.name).to.equal(changesToA.name)
  })

  lab.test('Promote to team as user',  async () => {
    const options = {
      method: 'PUT',
      url: '/users/' + userA.id,
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
      payload: { role: 'team' }
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)
  
  })

  lab.test('Promote to team as team',  async () => {
    const options = {
      method: 'PUT',
      url: '/users/' + userA.id,
      auth:{
        credentials: credentialsC,
        strategy: 'default'
      },
      payload: { role: 'team' }
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(userA.id)
    Code.expect(result.role).to.be.equal('team')
  
  })

  lab.test('Promote to company as team',  async () => {
    const options = {
      method: 'PUT',
      url: '/users/' + userA.id,
      auth:{
        credentials: credentialsC,
        strategy: 'default'
      },
      payload: promoteAtoCompany
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(userA.id)
    Code.expect(result.company[0]).to.be.instanceof(Object)
    Code.expect(result.company[0].edition).to.equal(promoteAtoCompany.company.edition)
    Code.expect(result.company[0].company).to.equal(promoteAtoCompany.company.company)
    Code.expect(result.company[0].company).to.equal(promoteAtoCompany.company.company)
    Code.expect(result.role).to.be.equal('company')
  })

  lab.test('Update A company as team',  async () => {
    const options = {
      method: 'PUT',
      url: '/users/' + userA.id,
      auth:{
        credentials: credentialsC,
        strategy: 'default'
      },
      payload: updatedACompany
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(userA.id)
    Code.expect(result.company[0]).to.be.instanceof(Object)
    Code.expect(result.company[0].edition).to.equal(updatedACompany.company.edition)
    Code.expect(result.company[0].company).to.equal(updatedACompany.company.company)
    Code.expect(result.company[1]).to.not.exist()
  })

  lab.test('Delete A company as team',  async () => {
    const options = {
      method: 'DELETE',
      url: '/users/' + userA.id + '/company?editionId=' + updatedACompany.company.edition,
      auth:{
        credentials: credentialsC,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(userA.id)
    Code.expect(result.company[0]).to.not.exist()
   
  })

  lab.test('Demote me',  async () => {
    const options = {
      method: 'PUT',
      url: '/users/me',
      auth:{
        credentials: credentialsC,
        strategy: 'default'
      },
      payload: { role: 'user' }
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceOf(Object)
    Code.expect(result.id).to.equal(userA.id)
    Code.expect(result.role).to.be.equal('user')
  })

  lab.test('Update me as user',  async () => {
    const options = {
      method: 'PUT',
      url: '/users/me',
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
      payload: { role: 'team' }
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(401)
      
  })

  lab.test('Promote to company as user',  async () => {
    const options = {
      method: 'PUT',
      url: '/users/' + userA.id,
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
      payload: promoteAtoCompany
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)
      
  })

  lab.test('List all as user',  async () => {
    const options = {
      method: 'GET',
      url: '/users',
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Array)
    Code.expect(result[0].name).to.be.string
      
  })

  lab.test('Update as user',  async () => {
    const options = {
      method: 'PUT',
      url: '/users/' + userA.id,
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
      payload: changesToA
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)
      
  })

  lab.test('Delete as admin',  async () => {
    const options = {
      method: 'DELETE',
      url: '/users/' + userA.id,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(userA.id)
    Code.expect(result.name).to.equal(changesToA.name)
  })

  lab.test('Create as user',  async () => {
    const options = {
      method: 'POST',
      url: '/users',
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
      payload: userA
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)
      
  })

  lab.test('Delete as user',  async () => {
    const options = {
      method: 'DELETE',
      url: '/users/' + userA.id,
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)
  })
})

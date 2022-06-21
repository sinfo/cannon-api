const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

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
  value: 10,
  validity: {
    from: new Date(),
    to: new Date(new Date().getTime() + (1000 + 60 + 60)) // 1 h
  }
}

const achievementB = {
  id: 'WENT-TO-SOME-WORKHOP-AT-SINFO-XXII',
  name: 'WENT TO SOME WORKSHOP AT SINFO XXII',
  event: 'SINFO XXII',
  value: 5,
  validity: {
    from: new Date(),
    to: new Date(new Date().getTime() + (1000 + 60 + 60)) // 1 h
  }
}

const achievementC = {
  id: 'WENT-TO-SOME-OTHER-WORKHOP-AT-SINFO-XXII',
  name: 'WENT TO SOME OTHER WORKSHOP AT SINFO XXII',
  event: 'SINFO XXII',
  value: 6,
  validity: {
    from: new Date(),
    to: new Date(new Date().getTime() + (1000 + 60 + 60)) // 1 h
  }
}

const redeemA = {
  id: 'RANDOM-STRING',
  achievement: achievementA.id,
  expires: new Date(new Date().getTime() + (1000 * 60 * 60)) // 1 h
  // entries: 5,
}

const redeemB = {
  id: 'REDEEM-B',
  achievement: achievementB.id,
  expires: new Date(new Date().getTime() + (1000 * 60 * 60)) // 1 h
}

const redeemC = {
  id: 'REDEEM-C',
  achievement: achievementC.id,
  expires: new Date(new Date().getTime() + (1000 * 60 * 60)) // 1 h
}

const redeemD = {
  id: 'REDEEM-D',
  achievement: achievementB.id,
  expires: new Date(new Date().getTime() + (1000 * 60 * 60)) // 1 h
}

lab.experiment('Redeem', () => {
  lab.before( async () => {
    const options = {
      method: 'POST',
      url: '/achievements',
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: achievementA
    }

    server.inject(options)

    const optionsB = {
      method: 'POST',
      url: '/achievements',
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: achievementB
    }

    server.inject(optionsB, (response) => {
    })

    const optionsC = {
      method: 'POST',
      url: '/achievements',
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: achievementC
    }

    await server.inject(optionsC)

    const userOptions = {
      method: 'POST',
      url: '/users',
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: userA
    }

    await server.inject(userOptions)
  })

  lab.after( async () => {
    const userOptions = {
      method: 'DELETE',
      url: '/users/' + userA.id,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    await server.inject(userOptions)
  })

  lab.test('Create as an admin',  async () => {
    const options = {
      method: 'POST',
      url: '/redeem',
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: redeemA
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(201)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(redeemA.id)
    Code.expect(result.name).to.equal(redeemA.name)
    Code.expect(result.user).to.equal(redeemA.user)
  
  })

  lab.test('Get one as an user',  async () => {
    const options = {
      method: 'GET',
      url: '/redeem/' + redeemA.id,
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.success).to.equal(true)

      
  })

  lab.test('Create again as an admin',  async () => {
    const options = {
      method: 'POST',
      url: '/redeem',
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: redeemA
    }

    const optionsB = {
      method: 'POST',
      url: '/redeem',
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: redeemB
    }

    const optionsC = {
      method: 'POST',
      url: '/redeem',
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: redeemC
    }

    const optionsD = {
      method: 'POST',
      url: '/redeem',
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: redeemD
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(409)

    let responseB = await server.inject(optionsB)
    const resultB = responseB.result
  
    Code.expect(responseB.statusCode).to.equal(201)
    Code.expect(resultB).to.be.instanceof(Object)
    Code.expect(resultB.id).to.equal(redeemB.id)
    Code.expect(resultB.name).to.equal(redeemB.name)
    Code.expect(resultB.user).to.equal(redeemB.user)
  
    let responseC = await server.inject(optionsC)
    const resultC = responseC.result
  
    Code.expect(responseC.statusCode).to.equal(201)
    Code.expect(resultC).to.be.instanceof(Object)
    Code.expect(resultC.id).to.equal(redeemC.id)
    Code.expect(resultC.name).to.equal(redeemC.name)
    Code.expect(resultC.user).to.equal(redeemC.user)
  
    let responseD = await server.inject(optionsD)
    const resultD = responseD.result
  
    Code.expect(responseD.statusCode).to.equal(201)
    Code.expect(resultD).to.be.instanceof(Object)
    Code.expect(resultD.id).to.equal(redeemD.id)
    Code.expect(resultD.name).to.equal(redeemD.name)
    Code.expect(resultD.user).to.equal(redeemD.user)

  })

  lab.test('Delete as an admin',  async () => {
    const options = {
      method: 'DELETE',
      url: '/redeem/' + redeemA.id,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    const optionsB = {
      method: 'DELETE',
      url: '/redeem/' + redeemB.id,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    const optionsC = {
      method: 'DELETE',
      url: '/redeem/' + redeemC.id,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    const optionsD = {
      method: 'DELETE',
      url: '/redeem/' + redeemD.id,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    const result = response.result
    Code.expect(result).to.equal(1)

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.a.number()
    

    let responseB = await server.inject(optionsB)
    const resultB = responseB.result

    Code.expect(responseB.statusCode).to.equal(200)
    Code.expect(resultB).to.be.a.number()
    Code.expect(resultB).to.equal(1)

    let responseC = await server.inject(optionsC)
    const resultC = responseC.result

    Code.expect(responseC.statusCode).to.equal(200)
    Code.expect(resultC).to.be.a.number()
    Code.expect(resultC).to.equal(1)

    let responseD = await server.inject(optionsD)
    const resultD = responseD.result

    Code.expect(responseD.statusCode).to.equal(200)
    Code.expect(resultD).to.be.a.number()
    Code.expect(resultD).to.equal(1)
  })

  lab.test('Create as an user',  async () => {
    const options = {
      method: 'POST',
      url: '/redeem',
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
      payload: redeemA
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)  
      Code.expect(response.statusCode).to.equal(403)
    Code.expect(response.statusCode).to.equal(403)  
      Code.expect(response.statusCode).to.equal(403)
    Code.expect(response.statusCode).to.equal(403)  
  })

  lab.test('Delete as an user',  async () => {
    const options = {
      method: 'DELETE',
      url: '/redeem/' + redeemA.id,
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)
  })

  lab.after( async () => {
    const options = {
      method: 'DELETE',
      url: '/achievements/' + achievementA.id,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }
    const optionsB = {
      method: 'DELETE',
      url: '/achievements/' + achievementB.id,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    const optionsC = {
      method: 'DELETE',
      url: '/achievements/' + achievementC.id,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    await server.inject(options)
    await server.inject(optionsB)
    await server.inject(optionsC)
  })
})

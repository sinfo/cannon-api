const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const log = require('../helpers/logger')

const server = require('../').hapi

const lab = exports.lab = Lab.script()
const token = require('../auth/token')

const aux = token.createJwt('john.doe')

const credentialsA = {
  user: {
    id: 'john.doe',
    name: 'John Doe',
    role: 'admin'
  },
  bearer: aux.token,
  scope: 'admin'
}

const credentialsB = {
  user: {
    id: 'john.doe',
    name: 'John Doe',
    role: 'admin'
  },
  bearer: aux.token,
  scope: 'user'
}

const fileA = {
  id: 'readme',
  user: 'john.doe',
  name: 'readme',
  kind: 'important',
  extension: 'txt'
}

const changesToA = {
  id: 'readme',
  name: 'README',
  kind: 'important',
  extension: 'txt'
}

lab.experiment('File', () => {
  lab.test('Create as an admin',  async () => {
    const options = {
      method: 'POST',
      url: '/files',
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
      payload: fileA
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(201)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(fileA.id)
    Code.expect(result.name).to.equal(fileA.name)
    Code.expect(result.extension).to.equal(fileA.extension)

      
  })

  lab.test('List all as an admin',  async () => {
    const options = {
      method: 'GET',
      url: '/files',
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Array)
    Code.expect(result[0].name).to.be.string
      
  })

  lab.test('Get one as an admin',  async () => {
    const options = {
      method: 'GET',
      url: '/files/' + fileA.id,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(fileA.id)
    Code.expect(result.name).to.equal(fileA.name)
    Code.expect(result.extension).to.equal(fileA.extension)

      
  })

  lab.test('List all as a user',  async () => {
    const options = {
      method: 'GET',
      url: '/files',
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)
      
  })

  lab.test('Get one as a user',  async () => {
    const options = {
      method: 'GET',
      url: '/files/' + fileA.id,
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)
      
  })

  lab.test('Update as an admin',  async () => {
    const options = {
      method: 'PUT',
      url: '/files/' + fileA.id,
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
    Code.expect(result.id).to.equal(fileA.id)
    Code.expect(result.name).to.equal(changesToA.name)
    Code.expect(result.extension).to.equal(fileA.extension)

  })

  lab.test('Update as an user',  async () => {
    const options = {
      method: 'PUT',
      url: '/files/' + fileA.id,
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
      payload: changesToA
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)
  })

  /* lab.test('Delete as an admin',  async () => {
    const options = {
      method: 'DELETE',
      url: '/files/' + fileA.id,
      auth:{
        credentials: credentialsA,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    const result = response.result

    Code.expect(response.statusCode).to.equal(200)
    Code.expect(result).to.be.instanceof(Object)
    Code.expect(result.id).to.equal(fileA.id)
    Code.expect(result.name).to.equal(changesToA.name)
    Code.expect(result.extension).to.equal(fileA.extension)
  }) */

  lab.test('Create as an user',  async () => {
    const options = {
      method: 'POST',
      url: '/files',
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
      payload: fileA
    }
    
    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)
      
  })

  lab.test('Delete as an user',  async () => {
    const options = {
      method: 'DELETE',
      url: '/files/' + fileA.id,
      auth:{
        credentials: credentialsB,
        strategy: 'default'
      },
    }

    let response = await server.inject(options)
    Code.expect(response.statusCode).to.equal(403)
  })
})

const server = require('../').hapi
const Boom = require('@hapi/boom')
const log = require('../helpers/logger')
const token = require('../auth/token')
const facebook = require('../helpers/facebook')
const google = require('../helpers/google')
const fenix = require('../helpers/fenix')
const linkedin = require('../helpers/linkedin')
const microsoft = require('../helpers/microsoft')

server.method('auth.facebook', facebookAuth, {})
server.method('auth.fenix', fenixAuth, {})
server.method('auth.google', googleAuth, {})
server.method('auth.linkedin', linkedinAuth, {})
server.method('auth.microsoft', microsoftAuth, {})

async function facebookAuth(id, token) {
  try {
    // Check with Facebook if token is valid
    await facebook.verifyToken(id, token)

    // Get user profile information from Facebook
    let fbUser = await facebook.getFacebookUser(token)

    // Get user in cannon by Facebook User email
    let res = await facebook.getUser(fbUser)

    // If user does not exist we create, otherwise we update existing user
    if (res.createUser) {
      let userId = await facebook.createUser(fbUser)
      await authenticate(userId, {
        name: fbUser.name,
        img: fbUser.picture
      })
    }

    const changedAttributes = {
      facebook: {
        id: fbUser.id
      }
    }
    return await authenticate(res.userId, changedAttributes)
  }
  catch (err) {
    Boom.unauthorized(err)
  }
}

async function googleAuth(accessToken) {
  try {
    // Get user profile information from Google
    let googleUser = await google.getGoogleUser(accessToken)

    // Get user in cannon by Google User email
    let res = await google.getUser(googleUser)

    // If user does not exist we create, otherwise we update existing user
    if (res.createUser) {
      let userId = await google.createUser(googleUser)
      return await authenticate(userId, {
        name: googleUser.name,
        img: googleUser.picture
      })
    }

    const changedAttributes = {
      google: {
        id: googleUser.sub
      }
    }

    return await authenticate(res.userId, changedAttributes)
  } catch (err) {
    Boom.unauthorized(err)
  }
}

async function microsoftAuth(accessToken) {
  try {
    // Get user profile information from Microsoft
    const microsoftUser = await microsoft.getMicrosoftUser(accessToken)

    // Get user in cannon by Microsoft User mail
    const res = await microsoft.getUser(microsoftUser)

    // If the user does not exist we create, otherwise we update the existing user
    if (res.createUser) {
      const userId = await microsoft.createUser(microsoftUser)
      return authenticate(userId, {
        name: microsoftUser.name,
        mail: microsoftUser.email,
      })
    }

    const changedAttributes = {
      microsoft: {
        id: microsoftUser.sub
      }
    }

    return await authenticate(res.userId, changedAttributes)
  } catch (err) {
    Boom.unauthorized(err)
  }

}

async function fenixAuth(accessToken) {
  try {
    // Get user profile information from Fenix
    let fenixUser = await fenix.getFenixUser(accessToken)

    // Get user in cannon by Fenix User email
    let res = await fenix.getUser(fenixUser)

    // If user does not exist we create, otherwise we update existing user
    if (res.createUser) {
      let userId = await fenix.createUser(fenixUser)
      return authenticate(userId, {
        name: fenixUser.name,
        img: `https://fenix.tecnico.ulisboa.pt/user/photo/${fenixUser.username}`
      })
    }

    const changedAttributes = {
      fenix: {
        id: fenixUser.username
      }
    }

    return authenticate(res.userId, changedAttributes)
  } catch (err) {
    Boom.unauthorized(err)
  }
}

async function linkedinAuth(accessToken) {
  try {
    // Get user profile information from Linkedin
    let linkedinUser = await linkedin.getLinkedinUser(accessToken)

    // Get user in cannon by Linkedin User email
    let res = await linkedin.getUser(linkedinUser)

    // If user does not exist we create, otherwise we update existing user
    if (res.createUser) {
      let userId = await linkedin.createUser(linkedinUser)
      return await authenticate(userId, {
        name: `${linkedinUser.firstName} ${linkedinUser.lastName}`,
        mail: linkedinUser.emailAddress,
        img: linkedinUser.pictureUrl
      })
    }

    const changedAttributes = {
      linkedin: {
        id: linkedinUser.id
      },
    }
    return authenticate(res.userId, changedAttributes)
  } catch (err) {
    Boom.unauthorized(err)
  }
}

async function authenticate(userId, changedAttributes) {
  log.info('authenticate')
  const newToken = token.createJwt(userId)
  if (changedAttributes != null) {
    changedAttributes = { $set: changedAttributes }
    await server.methods.user.update({ id: userId }, changedAttributes)
  }
  log.info({ userId }, '[login] user logged in')
  // Finally resolves a new JWT token from Cannon that authenticates the user on the following requests
  log.info('authenticate done')
  return newToken
}

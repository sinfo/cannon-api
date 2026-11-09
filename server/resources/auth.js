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

async function facebookAuth (id, token) {
  try {
    // Check with Facebook if token is valid
    await facebook.verifyToken(id, token)

    // Get user profile information from Facebook
    const fbUser = await facebook.getFacebookUser(token)

    // Get user in cannon by Facebook User email
    const res = await facebook.getUser(fbUser)

    // If user does not exist we create, otherwise we update existing user
    if (res.createUser) {
      const userId = await facebook.createUser(fbUser)
      return await authenticate(userId, {
        name: fbUser.name,
        img: fbUser.picture
      })
    }

    const changedAttributes = {
      facebook: {
        id: fbUser.id
      }
    }

    if ((!res.user || !res.user.name || !res.user.name.trim()) && fbUser.name) {
      changedAttributes.name = fbUser.name
    }
    if ((!res.user || !res.user.img) && fbUser.picture) {
      changedAttributes.img = fbUser.picture
    }

    return await authenticate(res.userId, changedAttributes)
  } catch (err) {
    throw Boom.unauthorized(err)
  }
}

async function googleAuth (accessToken) {
  try {
    // Get user profile information from Google
    const googleUser = await google.getGoogleUser(accessToken)

    // Get user in cannon by Google User email
    const res = await google.getUser(googleUser)

    const name = googleUser.name || [googleUser.given_name, googleUser.family_name].filter(Boolean).join(' ') || undefined
    const img = googleUser.picture

    // If user does not exist we create, otherwise we update existing user
    if (res.createUser) {
      const userId = await google.createUser(googleUser)
      return await authenticate(userId, {
        name: name,
        img: img
      })
    }

    const changedAttributes = {
      google: {
        id: googleUser.sub
      }
    }

    if ((!res.user || !res.user.name || !res.user.name.trim()) && name) {
      changedAttributes.name = name
    }
    if ((!res.user || !res.user.img) && img) {
      changedAttributes.img = img
    }

    return await authenticate(res.userId, changedAttributes)
  } catch (err) {
    throw Boom.unauthorized(err)
  }
}

async function microsoftAuth (accessToken) {
  try {
    // Get user profile information from Microsoft
    const microsoftUser = await microsoft.getMicrosoftUser(accessToken)

    // Get user in cannon by Microsoft User mail
    const res = await microsoft.getUser(microsoftUser)

    const name = microsoftUser.name || microsoftUser.displayName || [microsoftUser.given_name || microsoftUser.givenName, microsoftUser.family_name || microsoftUser.surname].filter(Boolean).join(' ') || undefined
    const mail = microsoftUser.email || microsoftUser.mail || microsoftUser.userPrincipalName || microsoftUser.preferred_username

    // If the user does not exist we create, otherwise we update the existing user
    if (res.createUser) {
      const userId = await microsoft.createUser(microsoftUser)
      return await authenticate(userId, {
        name: name,
        mail: mail
      })
    }

    const changedAttributes = {
      microsoft: {
        id: microsoftUser.sub || microsoftUser.id
      }
    }

    if ((!res.user || !res.user.name || !res.user.name.trim()) && name) {
      changedAttributes.name = name
    }
    if ((!res.user || !res.user.mail) && mail) {
      changedAttributes.mail = mail
    }

    return await authenticate(res.userId, changedAttributes)
  } catch (err) {
    throw Boom.unauthorized(err)
  }
}

async function fenixAuth (accessToken) {
  try {
    // Get user profile information from Fenix
    const fenixUser = await fenix.getFenixUser(accessToken)

    // Get user in cannon by Fenix User email
    const res = await fenix.getUser(fenixUser)

    const name = fenixUser.name || fenixUser.displayName || undefined
    const img = `https://fenix.tecnico.ulisboa.pt/user/photo/${fenixUser.username}`

    // If user does not exist we create, otherwise we update existing user
    if (res.createUser) {
      const userId = await fenix.createUser(fenixUser)
      return await authenticate(userId, {
        name: name,
        img: img
      })
    }

    const changedAttributes = {
      fenix: {
        id: fenixUser.username
      }
    }

    if ((!res.user || !res.user.name || !res.user.name.trim()) && name) {
      changedAttributes.name = name
    }
    if ((!res.user || !res.user.img) && img) {
      changedAttributes.img = img
    }

    return await authenticate(res.userId, changedAttributes)
  } catch (err) {
    throw Boom.unauthorized(err)
  }
}

async function linkedinAuth (accessToken) {
  try {
    // Get user profile information from Linkedin
    const linkedinUser = await linkedin.getLinkedinUser(accessToken)

    // Get user in cannon by Linkedin User email
    const res = await linkedin.getUser(linkedinUser)

    const name = linkedinUser.name || [linkedinUser.firstName, linkedinUser.lastName].filter(Boolean).join(' ') || undefined

    // If user does not exist we create, otherwise we update existing user
    if (res.createUser) {
      const userId = await linkedin.createUser(linkedinUser)
      return await authenticate(userId, {
        name: name,
        mail: linkedinUser.emailAddress,
        img: linkedinUser.pictureUrl
      })
    }

    const changedAttributes = {
      linkedin: {
        id: linkedinUser.id
      }
    }

    if ((!res.user || !res.user.name || !res.user.name.trim()) && name) {
      changedAttributes.name = name
    }
    if ((!res.user || !res.user.mail) && linkedinUser.emailAddress) {
      changedAttributes.mail = linkedinUser.emailAddress
    }
    if ((!res.user || !res.user.img) && linkedinUser.pictureUrl) {
      changedAttributes.img = linkedinUser.pictureUrl
    }

    return await authenticate(res.userId, changedAttributes)
  } catch (err) {
    throw Boom.unauthorized(err)
  }
}

async function authenticate (userId, changedAttributes) {
  log.info('authenticate')
  const newToken = token.createJwt(userId)
  if (changedAttributes != null && Object.keys(changedAttributes).length > 0) {
    changedAttributes = { $set: changedAttributes }
    await server.methods.user.update({ id: userId }, changedAttributes)
  }
  log.info({ userId }, '[login] user logged in')
  // Finally resolves a new JWT token from Cannon that authenticates the user on the following requests
  log.info('authenticate done')
  return newToken
}

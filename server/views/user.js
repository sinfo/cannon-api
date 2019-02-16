module.exports = function render (content, user) {
  if (content instanceof Array) {
    return content.map(model => renderObject(model, user))
  }

  return renderObject(content, user)
}

function renderObject (model, user) {
  const result = {}
  const isAdmin = user && (user.role === 'admin' || model.id === user.id)
  const isTeam = user && (user.role === 'team' || isAdmin)

  result.id = model.id
  result.name = model.name
  result.img = model.img || 'https://sinfo.ams3.cdn.digitaloceanspaces.com/static/26-sinfo/hacky/hacky.png'
  result.role = model.role
  result.points = model.points !== undefined && typeof model.points === 'number'
    ? model.points : undefined
  result.registered = model.registered
  result.signatures = model.signatures && model.signatures.map(signature => ({
    edition: signature && signature.edition,
    day: signature && signature.day,
    redeemed: signature && signature.redeemed,
    signatures: signature && signature.signatures
  }))

  if (isAdmin || isTeam) {
    result.mail = model.mail
    result.facebook = model.facebook && {
      id: model.facebook && model.facebook.id
    }
    result.linkedIn = model.linkedIn && {
      id: model.linkedIn && model.linkedIn.id
    }
    result.google = model.google && {
      id: model.google && model.google.id
    }
    result.fenix = model.fenix && {
      id: model.fenix && model.fenix.id
    }
    result.job = model.job && {
      startup: model.job && model.job.startup,
      internship: model.job && model.job.internship,
      start: model.job && model.job.start
    }
    result.updated = model.updated
    result.company = model.company && model.company.map(participation => ({
      edition: participation && participation.edition,
      company: participation && participation.company
    }))
  }

  return result
}

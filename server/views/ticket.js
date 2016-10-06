module.exports = function render (content, session) {
  if (content instanceof Array) {
    return content.map(model => renderObject(model, session))
  }

  return renderObject(content, session)
}

function renderObject (model, session) {
  return {
    session: model.session,
    users: model.users && session && session.tickets && model.users.slice(0, session.tickets.max),
    confirmed: model.confirmed,
    waiting: model.users && session && session.tickets && model.users.slice(session.tickets.max),
    present: model.present
  }
}

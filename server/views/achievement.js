module.exports = function render (content, wCode = false) {
  if (content instanceof Array) {
    return content.map(a => renderObject(a, wCode))
  }

  return renderObject(content, wCode)
}

function renderObject (model, wCode) {
  return {
    id: model.id,
    event: model.event,
    session: model.session,
    unregisteredUsers: model.unregisteredUsers,
    name: model.name,
    description: model.description,
    instructions: model.instructions,
    img: model.img,
    value: model.value,
    users: model.users,
    created: model.created,
    updated: model.updated,
    validity: model.validity,
    kind: model.kind,
    code: wCode ? model.code : undefined
  }
}

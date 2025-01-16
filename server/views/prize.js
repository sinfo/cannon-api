module.exports = function render (content) {
  if (content instanceof Array) {
    return content.map(a => renderObject(a))
  }

  return renderObject(content)
}

function renderObject (model) {
  return {
    id: model.id,
    edition: model.edition,
    name: model.name,
    img: model.img,
    sessions: model.sessions,
    created: model.created,
    updated: model.updated
  }
}

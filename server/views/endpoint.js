module.exports = function render (content) {
  if (content instanceof Array) {
    return content.map(renderObject)
  }

  return renderObject(content)
}

function renderObject (model) {
  return {
    company: model.company,
    edition: model.edition,
    visited: model.visited,
    validaty: {
      from: model.validaty.from,
      to: model.validaty.to
    },
    created: model.created,
    updated: model.updated
  }
}

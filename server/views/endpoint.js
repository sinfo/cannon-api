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
    validity: {
      from: model.validity.from,
      to: model.validity.to
    },
    created: model.created,
    updated: model.updated
  }
}

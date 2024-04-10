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
    expire: model.validity.to,
    description: model.description,
    code: model.code
  }
}

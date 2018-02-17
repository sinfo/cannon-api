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
    user: model.user,
    attendee: model.attendee,
    note: model.note,
    created: model.created,
    updated: model.updated
  }
}

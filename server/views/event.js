module.exports = function render (content) {
    if (content instanceof Array) {
      return content.map(renderObject)
    }
  
    return renderObject(content)
  }
    
  function renderObject (model) {
    return {
        id: model.id,
        name: model.name,
        kind: model.kind,
        date: model.date,
        updated: model.updated,
        duration: model.duration,
        begin: model.begin,
        end: model.end,
        isOcurring: model.isOcurring
    }
  }
    
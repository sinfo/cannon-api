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
        img: model.img,
        github: model.github,
        facebook: model.facebook,
        mail: model.mail,
        twitter: model.witter
    }
  }
  
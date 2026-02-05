module.exports = function render (content) {
    if (content instanceof Array) {
      return content.map(renderObject)
    }
  
    return renderObject(content)
  }
  
  function renderObject (model) {
    return {
        name: model.name,
        img: model.img,
        socials: model.socials,
        team: model.team,
        sinfo_email: model.sinfo_email
    }
  }
  
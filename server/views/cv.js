module.exports = function render(content) {
  if(content instanceof Array) {
    return content.map(renderObject);
  }

  return renderObject(content);  
};

function renderObject(model) {
  return {
    id: model.id,
    file: model.file,
    user: model.user,
    area: model.area,
    startup: model.startup,
    internship: model.internship,
    available: model.available,
    expires: model.expires,
    updated: model.updated,
    created: model.created,
  };
}
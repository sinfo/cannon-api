module.exports = function render(content) {
  if(content instanceof Array) {
    return content.map(renderObject);
  }

  return renderObject(content);  
};

function renderObject(model) {
  return {
    id: model.id,
    achievement: model.achievement,
    entries: model.entries,
		created: model.created,
		expires: model.expires
  };
}
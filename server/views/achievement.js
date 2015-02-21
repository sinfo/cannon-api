module.exports = function render(content) {
  if(content instanceof Array) {
    return content.map(renderObject);
  }

  return renderObject(content);
};

function renderObject(model) {
  return {
    id: model.id,
    event: model.event,
    category: model.category,
    session: model.session,
    name: model.name,
		description: model.description,
		instructions: model.instructions,
		img: model.img,
		value: model.value,
		created: model.created,
		updated: model.updated
  };
}
module.exports = function render(content) {
  if(content instanceof Array) {
    return content.map(renderObject);
  }

  return renderObject(content);
};

function renderObject(model) {
  return {
    session: model.session,
    users: model.users,
    confirmed: model.confirmed,
		waiting: model.waiting,
    present: model.present,
  };
}
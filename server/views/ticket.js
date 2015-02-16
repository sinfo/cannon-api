module.exports = function render(content, session) {
  if(content instanceof Array) {
    return content.map(function(model){
      renderObject(model, session);
    });
  }

  return renderObject(content);
};

function renderObject(model, session) {
  return {
    session: model.session,
    users: model.users.slice(0, session.tickets.max),
    confirmed: model.confirmed,
		waiting: model.users.slice(session.tickets.max),
    present: model.present,
  };
}
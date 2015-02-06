module.exports = function render(content) {
  if(content instanceof Array) {
    return content.map(renderObject);
  }

  return renderObject(content);  
};

function renderObject(model) {
  return {
    id: model.id,
    token: model.token,
    refreshToken: model.refreshToken,
    ttl: model.ttl,
    date: model.date
  };
}
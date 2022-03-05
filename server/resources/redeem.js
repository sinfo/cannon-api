const Boom = require("boom");
const server = require("../").hapi;
const log = require("../helpers/logger");
const Redeem = require("../db/redeem");
const Achievement = require("../db/achievement");
const uuid = require("uuid");

server.method("redeem.create", create, {});
server.method("redeem.get", get, {});
server.method("redeem.remove", remove, {});
server.method("redeem.prepareRedeemCodes", prepareRedeemCodes, {});
server.method("redeem.use", use, {});

async function create(redeem) {
  redeem.created = Date.now();

  try {
    let _redeem = await Redeem.create(redeem)
    return _redeem.toObject({ getters: true })
  } catch (err) {
    return Boom.internal("Error creating redeem in database");
  }
}

async function get(id) {
  let filter = { id: id };

  let redeem = await Redeem.findOne(filter);

  if (!redeem) {
    log.error({ err: "not found", redeem: id }, "error getting redeem");
    return Boom.notFound("redeem code not found");
  }

  var now = new Date();
  var expirationDate = new Date(redeem.expires);

  if (now.getTime() > expirationDate.getTime()) {
    log.error(
      { err: "expired", redeem: id },
      "tried to redeem an expired code"
    );
    return Boom.notAcceptable("expired redeem code");
  }

  return redeem.toObject({ getters: true });
}

async function use(redeem, userId) {
  if (redeem === null) {
    log.error({ redeem: redeem.id }, "redeem code not found");
    return Boom.notAcceptable();
  }

  if (redeem.achievement === null) {
    log.error(
      { achievement: redeem.achievement },
      "achievement of redeem not found"
    );
    return Boom.notAcceptable();
  }

  if (
    redeem.available !== undefined &&
    redeem.available !== null &&
    redeem.available <= 0
  ) {
    log.info(
      { user: userId, redeem: redeem.id },
      "redeem code not available anymore"
    );
    return Boom.notAcceptable();
  }

  let filter = { id: redeem.achievement };

  let achievement = await Achievement.findOne(filter);

  if (!achievement) {
    log.error(
      { err: err, achievement: achievement.id },
      "achievement of redeem not found"
    );
    return Boom.notFound();
  }

  let now = new Date().getTime();

  if (
    achievement.validity !== undefined &&
    (achievement.validity.from.getTime() > now ||
      achievement.validity.to.getTime() < now)
  ) {
    log.info(
      { err: err, user: userId, redeem: redeem.id },
      "achievement expired"
    );
    return Boom.notAcceptable();
  }

  let users = achievement.users;

  if (users === undefined || users.length === undefined) {
    log.error({ err: err, user: userId }, "user not given");
    return Boom.notAcceptable();
  }

  let alreadyRedeemed = users.filter((u) => u === userId).length > 0;

  if (alreadyRedeemed) {
    log.info(
      { err: err, user: userId, redeem: redeem.id },
      "user already used the redeem code"
    );
    return Boom.notAcceptable();
  }

  // no limit to this redeem code
  if (redeem.available === null) return redeem;

  let available = redeem.available - 1;

  let filterRedeem = { id: redeem.id };
  let changes = { $set: { available: available } };

  let _redeem = await Redeem.findOneAndUpdate(filterRedeem, changes);

  if (!_redeem) {
    log.error({ err: "not found", redeem: redeem.id }, "error using redeem");
    return Boom.notFound();
  }

  log.info(
    { id: redeem.id, achievement: achievement.id, user: userId },
    "redeem code redeemed"
  );

  return redeem;
}

async function remove(id, achievement) {
  //cb = cb || achievement // achievement and user are optional

  let filter = { id: id };

  let redeem = await Reddem.findOne(filter);

  if (!redeem) {
    log.error({ err: "not found", redeem: id }, "error deleting redeem");
    return Boom.notFound();
  }

  let user = redeem.user;
  let _achievement = redeem.achievement;

  if (_achievement && user) {
    filter = { user: user, achievement: _achievement };
  }

  let res = await Redeem.remove(filter);

  log.debug("Ok? ", res.ok, ". Deleted ", res.deletedCount, " documents");

  if (!res.ok) {
    log.error(
      { err: "error deleting redeem", redeem: id },
      "error deleting redeem"
    );
    return Boom.internal();
  }
}

function prepareRedeemCodes(sessionId, users) {
  let redeemCodes = [];
  for (let i = 0; i < users.length; i++) {
    redeemCodes.push({
      id: uuid.v4(),
      user: users[i].id,
      achievement: "session-" + sessionId
    });
  }
  log.info(
    `${redeemCodes.length} redeem codes created for ${users.length} users`
  );
  return redeemCodes;
}

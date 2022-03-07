const Boom = require('@hapi/boom');
const log = require("../helpers/logger");
const server = require("../").hapi;
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

  let _redeem = await Redeem.create(redeem).catch((err) =>{
    if (err.code === 11000) {
      log.error({msg: "achievement is a duplicate" })
      throw Boom.conflict(`achievement is a duplicate`)
    }
    log.error({err: err},"Error creating redeem in database" )
    throw Boom.boomify(err);
  })
  return _redeem.toObject({ getters: true })
  
}

async function get(id) {
  let filter = { id: id };

  let redeem = await Redeem.findOne(filter);

  if (!redeem) {
    log.error({ err: "not found", redeem: id }, "error getting redeem");
    throw Boom.notFound("redeem code not found");
  }

  var now = new Date();
  var expirationDate = new Date(redeem.expires);

  if (now.getTime() > expirationDate.getTime()) {
    log.error(
      { err: "expired", redeem: id },
      "tried to redeem an expired code"
    );
    throw Boom.notAcceptable("expired redeem code");
  }

  return redeem.toObject({ getters: true });
}

async function use(redeem, userId) {
  if (redeem === null) {
    log.error({ redeem: redeem.id }, "redeem code not found");
    throw Boom.notAcceptable();
  }

  if (redeem.achievement === null) {
    log.error(
      { achievement: redeem.achievement },
      "achievement of redeem not found"
    );
    throw Boom.notAcceptable();
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
    throw Boom.notAcceptable();
  }

  let filter = { id: redeem.achievement };

  let achievement = await Achievement.findOne(filter);

  if (!achievement) {
    log.error(
      { err: err, achievement: achievement.id },
      "achievement of redeem not found"
    );
    throw Boom.notFound();
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
    throw Boom.notAcceptable();
  }

  let users = achievement.users;

  if (users === undefined || users.length === undefined) {
    log.error({ err: err, user: userId }, "user not given");
    throw Boom.notAcceptable();
  }

  let alreadyRedeemed = users.filter((u) => u === userId).length > 0;

  if (alreadyRedeemed) {
    log.info(
      { err: err, user: userId, redeem: redeem.id },
      "user already used the redeem code"
    );
    throw Boom.notAcceptable();
  }

  // no limit to this redeem code
  if (redeem.available === null) return redeem;

  let available = redeem.available - 1;

  let filterRedeem = { id: redeem.id };
  let changes = { $set: { available: available } };

  let _redeem = await Redeem.findOneAndUpdate(filterRedeem, changes);

  if (!_redeem) {
    log.error({ err: "not found", redeem: redeem.id }, "error using redeem");
    throw Boom.notFound();
  }

  log.info(
    { id: redeem.id, achievement: achievement.id, user: userId },
    "redeem code redeemed"
  );

  return redeem;
}

async function remove(id) {
  //cb = cb || achievement // achievement and user are optional

  let filter = { id: id };

  let redeem = await Redeem.findOne(filter);


  if (!redeem) {
    log.error({ err: "not found", redeem: id }, "error deleting redeem");
    throw Boom.notFound();
  }
 
  let res = await Redeem.deleteOne(filter).catch((err) =>{
    log.error({err: err})
    throw Boom.boomify(err)
  });

  return res.deletedCount
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

'use strict';

module.exports = function (err, res) {
  let msg = err.message.toLowerCase();

  switch(true) {
  case msg.includes('invalid filename'):
  case msg.includes('validation'):
    return res.status(400).json(`${err.name}: ${err.message}`);
  case msg.includes('invalid token'):
    return res.sendStatus(403);
  case msg.includes('authorization failed'):
    return res.status(403).json(`${err.name}: ${err.message}`);
  case msg.includes('path error'):
  case msg.includes('objectid failed'):
  case msg.includes('enoent'):
    return res.sendStatus(404);
  case msg.includes('duplicate key'):
    return res.status(409).send(`${err.name}: ${err.message}`);
  default:
    return res.status(500).send(`${err.name}: ${err.message}`);
  }
};

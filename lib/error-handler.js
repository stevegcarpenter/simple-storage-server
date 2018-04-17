'use strict';

module.exports = (code, err, res) =>
  res.status(code).send(`${err.name}: ${err.message}`);

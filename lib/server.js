'use strict';

const express = require('express');
const mongoose = require('mongoose');
const errorHandler = require('./error-handler');

const app = express();
const PORT = process.env.PORT;
const router = express.Router();
const MONGODB_URI = process.env.MONGODB_URI;

app.use(router);
require('../route/route-auth')(router);
app.all('/{0,}', (req, res) =>
  errorHandler(new Error('Path Error, Not Found'), res));

const server = {};
server.start = () => {
  return new Promise((resolve, reject) => {
    if (server.isOn)
      return reject(new Error('Server Error, server is already running.'));

    server.http = app.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
      server.isOn = true;
      mongoose.connect(MONGODB_URI);
      return resolve(server);
    });
  });
};

server.stop = () => {
  return new Promise((resolve, reject) => {
    if (!server.isOn)
      return reject(new Error('Server Error, server was not running'));

    server.http.close(() => {
      server.isOn = false;
      mongoose.disconnect();
      return resolve();
    });
  });
};

module.exports = server;

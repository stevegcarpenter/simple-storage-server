'use strict';

const express = require('express');
const mongoose = require('mongoose');
const errorHandler = require('errorHandler');

const app = express();
const PORT = process.env.PORT;
const router = express.Router();
const MONGODB_URI = process.env.MONGODB_URI;

/*****************************************************************************
 * Set up routes
 ****************************************************************************/
app.use('/api/v1', router);
require('../route/route-auth')(router);
// catch all
app.all('/{0,}', (req, res) => errorHandler(404, new Error('Not Found'), res));

const server = {};

// Start the server
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

// Stop the server
server.stop = () => {
  return new Promise((resolve, reject) => {
    if (!server.isOn)
      return reject(new Error('Server Error, server was not running'));

    server.http.close(() => {
      console.log('stopping server');
      server.isOn = false;
      mongoose.disconnect();
      return resolve();
    });
  });
};

module.exports = server;

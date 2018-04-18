'use strict';

const errorHandler = require('./error-handler.js');

module.exports = function(req, res, next) {
  let authHeaders = req.headers.authorization;
  if (!authHeaders) {
    return errorHandler(new Error('Authorization Failed, headers do not match requirement'), res);
  }

  let base64 = authHeaders.split('Basic ')[1];
  if (!base64) {
    return errorHandler(new Error('Authorization Failed, username and password required'), res);
  }

  let [username, password] = Buffer.from(base64, 'base64').toString().split(':');
  req.auth = {username, password};
  if (!req.auth.username) {
    return errorHandler(new Error('Authorization Failed, username required'), res);
  }
  if (!req.auth.password) {
    return errorHandler(new Error('Authorization Failed, password required'), res);
  }
  next();
};

'use strict';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');
const debug = require('debug')('http');

const Auth = mongoose.Schema({
  // usernames must be unique
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  email: {type: String, required: true},
  compareHash: {type: String, required: false},
});

Auth.methods.generatePasswordHash = function (password) {
  return bcrypt.hash(password, 10)
    .then(hash => this.password = hash)
    .then(() => this)
    .catch(err => err);
};

Auth.methods.comparePasswordHash = function (password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (error, valid) => {
      if (error) return reject(error);
      if (!valid)
        return reject(new Error('Authorization Failed. Password Invalid'));
      resolve(this);
    });
  });
};

Auth.methods.generateCompareHash = function () {
  this.compareHash = crypto.randomBytes(64).toString('hex');
  return this.save()
    .then(() => Promise.resolve(this.compareHash))
    .catch(console.error);
};

Auth.methods.generateToken = function () {
  return this.generateCompareHash()
    .then(compareHash => {
      debug('#generateToken compareHash: ', compareHash);
      return jwt.sign({token: compareHash}, process.env.APP_SECRET);
    })
    .catch(error => error);
};

module.exports = mongoose.model('auth', Auth);

'use strict';

const faker = require('faker');
require('jest');

const Auth = require('../../model/auth');
const mocks = module.exports = {};

mocks.auth = {};
mocks.auth.createOne = () => {
  let result = {};
  result.password = faker.internet.password(10 /* length */);

  return new Auth({
    username: faker.lorem.words(10).replace(/\s/g,'').slice(0, 10),
    email: faker.internet.email(),
  })
    .generatePasswordHash(result.password)
    .then(user => result.user = user)
    .then(user => user.generateToken())
    .then(token => result.token = token)
    .then(() => result);
};

mocks.auth.removeAll = () => Promise.all([Auth.remove()]);

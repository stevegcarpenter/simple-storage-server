'use strict';

const faker = require('faker');
const uuid = require('uuid/v4');
require('jest');

const Auth = require('../../model/auth');
const File = require('../../model/file');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'), {suffix: 'Prom'});

const TEST_FILE_DIR = `${__dirname}/../test-data`;

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
    .then(() => result)
    .catch(console.error);
};

mocks.auth.removeAll = () => Promise.all([Auth.remove()]);

mocks.file = {};
mocks.file.data = () => {
  let buffer = Buffer.from(faker.lorem.paragraph());
  let filename = uuid().concat('.ext');
  let fileData = {
    filename,
    fieldname: 'file',
    originalname: filename,
    buffer,
    ffilepath: `${TEST_FILE_DIR}/${filename}`,
  };

  return fileData;
};

// Create a random file, but don't save to db or put it in S3 bucket
mocks.file.createOne = () => {
  let fileData = mocks.file.data();

  return fs.writeFileProm(fileData.ffilepath, fileData.buffer)
    .then(() => fileData)
    .catch(console.error);
};

// Remove all files from the db and test-data directory, but not the S3 bucket
mocks.file.removeAll = () => Promise.all([File.remove()])
  .then(() => fs.readdirProm(`${TEST_FILE_DIR}`))
  .then(files => files.filter(f => f !== '.gitkeep'))
  .then(files => files.map(f => fs.unlinkProm(`${TEST_FILE_DIR}/${f}`)))
  .catch(console.error);

'use strict';

const debug = require('debug')('http:route-auth');

const Auth = require('../model/auth');
const bodyParser = require('body-parser').json();
const errorHandler = require('../lib/error-handler');

module.exports = router => {
  router.post('/register', bodyParser, (req, res) => {
    let uname = req.body.username;
    let pw = req.body.password;
    delete req.body.password;
    let email = req.body.email;

    debug(`/register: username: ${uname} password: ${pw} email: ${email}`);

    // Validate all arguments were provided
    if (!uname || !pw || !email) {
      return errorHandler(
        new Error('Validation: Username, password, and email are all required'),
        res);
    }

    // Validation: 3 <= username length =< 20
    if (uname.length < 3 || uname.length > 20) {
      return errorHandler(
        new Error('Validation: Username must be 3-20 characters in length'),
        res);
    }

    // Validation: username must only consist of alphanumeric characters
    if (!/^[a-z0-9]+$/.test(uname.toLowerCase())) {
      return errorHandler(
        new Error('Validation: Username must be alphanumeric'),
        res);
    }

    // Validation: password must exceed 8 character length
    if (pw.length < 8) {
      return errorHandler(
        new Error('Validation: Password must at be minimum 8 characters'),
        res);
    }

    let user = new Auth(req.body);

    user.generatePasswordHash(pw)
      .then(newUser => newUser.save())
      .then(userRes => userRes.generateToken())
      .then(token => res.status(201).json(token))
      .catch(err => errorHandler(err, res));
  });
};

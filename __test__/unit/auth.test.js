'use strict';

const Auth = require('../../model/auth.js');

describe('Auth Module', function () {
  let mock = {username: 'steve', password: 'a;nmgoiwl;@#'};
  let auth = new Auth();

  describe('#Auth Username', function () {
    it('Should have an _id property', () => {
      expect(auth).toHaveProperty('_id');
    });

    it('Should have a username property', () => {
      expect(new Auth(mock)).toHaveProperty('username');
    });

    it('Should have a password property', () => {
      expect(new Auth(mock)).toHaveProperty('password');
    });

    it('Should have a compareHash property', () => {
      expect(new Auth(mock)).toHaveProperty('compareHash');
    });

    it('should be an instance of an Object', () => {
      expect(auth).toBeInstanceOf(Object);
    });
  });
});

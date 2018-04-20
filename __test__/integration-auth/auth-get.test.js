'use strict';

const superagent = require('superagent');
const server = require('../../lib/server');
const mocks = require('../lib/mocks');

const PORT = process.env.PORT;
const ENDPOINT_LOGIN = `:${PORT}/login`;

describe('Auth POST', () => {
  beforeAll(server.start);
  afterAll(server.stop);

  describe('/login', () => {
    beforeAll(() => {
      return mocks.auth.createOne()
        .then(mockObj => this.mockObj = mockObj)
        .then(mockObj => superagent.get(ENDPOINT_LOGIN)
          .auth(mockObj.user.username, mockObj.password)
          .then(res => this.response = res));
    });
    afterAll(mocks.auth.removeAll);

    describe('Valid', () => {
      it('should respond with a status of 200', () => {
        expect(this.response.status).toBe(200);
      });

      it('should respond with a Content-Type of application/json', () => {
        expect(this.response.res.headers['content-type']).toMatch(/application\/json/i);
      });

      it('should successfully return back a token string in the body', () => {
        expect(typeof this.response.body).toEqual('string');
      });
    });

    describe('Invalid', () => {
      it('should responde with a 403 if an invalid password was given', () => {
        return superagent.get(ENDPOINT_LOGIN)
          .auth(this.mockObj.user.username, 'fakepassword')
          .catch(err => expect(err.status).toBe(403));
      });

      it('should responde with a 403 if an username was given', () => {
        return superagent.get(ENDPOINT_LOGIN)
          .auth('fakeusername', 'fakepassword')
          .catch(err => expect(err.status).toBe(403));
      });

      it('should respond with Content-Type application/json on 403 error', () => {
        return superagent.get(ENDPOINT_LOGIN)
          .auth('fakeusername', 'fakepassword')
          .catch(err =>
            expect(err.response.headers['content-type']).toMatch(/application\/json/i)
          );
      });
    });
  });
});

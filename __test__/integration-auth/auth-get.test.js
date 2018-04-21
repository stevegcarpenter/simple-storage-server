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
      it('should respond with a status of 200 for a valid login', () => {
        expect(this.response.status).toBe(200);
      });

      it('should respond with a Content-Type of application/json', () => {
        expect(this.response.res.headers['content-type']).toMatch(/application\/json/i);
      });

      it('should successfully return back a token string in the body', () => {
        expect(typeof this.response.body).toEqual('string');
      });

      it('should return a JSON Web Token in the response body', () => {
        let splitToken = this.response.body.split('.');
        let signature = JSON.parse(Buffer.from(splitToken[0], 'base64').toString());
        let token = JSON.parse(Buffer.from(splitToken[1], 'base64').toString());

        expect(signature.typ).toEqual('JWT');
        expect(token).toHaveProperty('token');
      });
    });

    describe('Invalid', () => {
      it('should respond with a 403 if an invalid password was given', () => {
        return superagent.get(ENDPOINT_LOGIN)
          .auth(this.mockObj.user.username, 'fakepassword')
          .catch(err => expect(err.status).toBe(403));
      });

      it('should respond with a 403 if an username was given', () => {
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

      it('should respond with a 403 (NOT AUTHORIZED) status given missing username', () => {
        let encoded = Buffer.from(`:${this.mockObj.password}`).toString('base64');

        return superagent.get(ENDPOINT_LOGIN)
          .set('Authorization', `Basic ${encoded}`)
          .catch(err => expect(err.status).toEqual(403));
      });

      it('should respond with a 403 (NOT AUTHORIZED) status given missing password', () => {
        let encoded = Buffer.from(`${this.mockObj.username}:`).toString('base64');

        return superagent.get(ENDPOINT_LOGIN)
          .set('Authorization', `Basic ${encoded}`)
          .catch(err => expect(err.status).toEqual(403));
      });

      it('should respond with a 403 (NOT AUTHORIZED) status given malformed user headers', () => {
        return superagent.get(ENDPOINT_LOGIN)
          .set('Authorization', 'Basic')
          .catch(err => expect(err.status).toEqual(403));
      });
    });
  });
});

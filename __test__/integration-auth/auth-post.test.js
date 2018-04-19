'use strict';

const superagent = require('superagent');
const faker = require('faker');
const server = require('../../lib/server');
const mocks = require('../lib/mocks');

const PORT = process.env.PORT;
const ENDPOINT_REGISTER = `:${PORT}/register`;

describe('Auth POST', () => {
  beforeAll(server.start);
  afterAll(server.stop);

  describe('/register', () => {
    // remove entries from database
    afterAll(mocks.auth.removeAll);

    describe('Valid', () => {
      it('should return a 204 status', () => {
        return superagent.post(ENDPOINT_REGISTER)
          .send({
            username: 'fakeuser1',
            password: 'fakepass1',
            email: 'a@a.com',
          })
          .then(res => {
            expect(res.status).toBe(204);
          })
          .catch(console.error);
      });
    });

    describe('Invalid', () => {
      it('should respond with a 404 status if a fake path is given', () => {
        return superagent.post(`${ENDPOINT_REGISTER}/fakepath`)
          .send({
            username: 'fakeusername',
            password: 'fake-password',
            email: faker.internet.email(),
          })
          .catch(err => expect(err.status).toBe(404));
      });

      it('should respond with a content-type application/json on 400 failure', () => {
        return superagent.post(ENDPOINT_REGISTER)
          .catch(err => {
            expect(err.response.headers['content-type']).toMatch(/application\/json/i);
          });
      });

      it('should respond with a 400 status if no body was provided', () => {
        return superagent.post(ENDPOINT_REGISTER)
          .catch(err => expect(err.status).toBe(400));
      });

      it('should respond with a 400 status if no username was provided', () => {
        return superagent.post(ENDPOINT_REGISTER)
          .send({
            password: 'fakepassword',
            email: faker.internet.email(),
          })
          .catch(err => expect(err.status).toBe(400));
      });

      it('should respond with a 400 status if no password was provided', () => {
        return superagent.post(ENDPOINT_REGISTER)
          .send({
            username: 'fakeusername',
            email: faker.internet.email(),
          })
          .catch(err => expect(err.status).toBe(400));
      });

      it('should respond with a 400 status if no email was provided', () => {
        return superagent.post(ENDPOINT_REGISTER)
          .send({
            username: 'fakeusername',
            password: 'fakepassword',
          })
          .catch(err => expect(err.status).toBe(400));
      });

      it('should respond with a 400 status if username is < 3 characters', () => {
        return superagent.post(ENDPOINT_REGISTER)
          .send({
            username: 'ab',
            password: 'fakepassword',
            email: faker.internet.email(),
          })
          .catch(err => expect(err.status).toBe(400));
      });

      it('should respond with a 400 status if username is > 20 characters', () => {
        return superagent.post(ENDPOINT_REGISTER)
          .send({
            username: 'abcdefghijklmnopqrstuvwxyz',
            password: 'fakepassword',
            email: faker.internet.email(),
          })
          .catch(err => expect(err.status).toBe(400));
      });

      it('should respond with a 400 status if username not alphanumeric', () => {
        return superagent.post(ENDPOINT_REGISTER)
          .send({
            username: 'abc%^)',
            password: 'fakepassword',
            email: faker.internet.email(),
          })
          .catch(err => expect(err.status).toBe(400));
      });

      it('should respond with a 400 status if the password is < 8 characters', () => {
        return superagent.post(ENDPOINT_REGISTER)
          .send({
            username: 'fakeusername',
            password: 'pass',
            email: faker.internet.email(),
          })
          .catch(err => expect(err.status).toBe(400));
      });
    });
  });
});

'use strict';

const superagent = require('superagent');
const server = require('../../lib/server');
const mocks = require('../lib/mocks');

const PORT = process.env.PORT;
const ENDPOINT_FILES = `:${PORT}/files`;

describe('Files DELETE', () => {
  beforeAll(server.start);
  afterAll(server.stop);

  describe('/files/:filename', () => {
    beforeAll(() => {
      return mocks.auth.createOne()
        .then(mockObj => this.mockObj = mockObj)
        .then(() => mocks.file.createOne())
        .then(fileData => this.fileData = fileData)
        .then(() => superagent.post(`${ENDPOINT_FILES}/${this.fileData.filename}`)
          .set('Authorization', `Bearer ${this.mockObj.token}`)
          .attach('file', this.fileData.ffilepath)
        )
        .then(() => superagent.delete(`${ENDPOINT_FILES}/${this.fileData.filename}`)
          .set('Authorization', `Bearer ${this.mockObj.token}`)
        )
        .then(res => this.response = res)
        .catch(console.error);
    });
    afterAll(mocks.auth.removeAll);
    afterAll(mocks.file.removeAll);

    describe('Valid', () => {
      it('should respond with a status of 204 (NO CONTENT) on successful deletion of a file', () => {
        expect(this.response.status).toEqual(204);
      });
    });

    describe('Invalid', () => {
      it('should respond with a 404 (NOT FOUND) status if a user tries to delete a non-existent file', () => {
        return superagent.delete(`${ENDPOINT_FILES}/fakefile.txt`)
          .set('Authorization', `Bearer ${this.mockObj.token}`)
          .catch(err => expect(err.status).toEqual(404));
      });

      it('should respond with 403 (FORBIDDEN) status when a user tries to delete a file without a token', () => {
        return superagent.delete(`${ENDPOINT_FILES}/${this.fileData.filename}`)
          .catch(err => expect(err.status).toEqual(403));
      });

      it('should respond with 403 (FORBIDDEN) status when a user tries to delete a file with an invalid token', () => {
        return superagent.delete(`${ENDPOINT_FILES}/${this.fileData.filename}`)
          .set('Authorization', `Bearer lksjdifoknwmeoknoewriguh90243kno4tnklwkn34toi34nlknsd`)
          .catch(err => expect(err.status).toEqual(403));
      });

      it('should respond with 404 (NOT FOUND) if a user tries to delete another users file', () => {
        return mocks.auth.createOne()
          .then(mockObj2 => superagent.delete(`${ENDPOINT_FILES}/${this.fileData.filename}`)
            .set('Authorization', `Bearer ${mockObj2.token}`)
          )
          .catch(err => expect(err.status).toEqual(404));
      });
    });
  });
});

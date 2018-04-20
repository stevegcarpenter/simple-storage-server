'use strict';

const superagent = require('superagent');
const server = require('../../lib/server');
const mocks = require('../lib/mocks');

const PORT = process.env.PORT;
const ENDPOINT_FILES = `:${PORT}/files`;

describe('Files POST', () => {
  describe('/files/:filename', () => {
    beforeAll(server.start);
    afterAll(server.stop);
    beforeAll(() => {
      return mocks.auth.createOne()
        .then(mockObj => this.mockObj = mockObj)
        .then(() => mocks.file.createOne())
        .then(fileData => this.fileData = fileData)
        .then(() => superagent.post(`${ENDPOINT_FILES}/${this.fileData.filename}`)
          .set('Authorization', `Bearer ${this.mockObj.token}`)
          .attach('file', this.fileData.ffilepath)
        )
        .then(res => this.response = res)
        .catch(console.error);
    });
    afterAll(mocks.auth.removeAll);
    afterAll(mocks.file.removeAll);

    describe('Valid', () => {
      it('should respond with a status of 201 (CREATED) on success', () => {
        expect(this.response.status).toEqual(201);
      });

      it('should respond with a Content-Type of application/json', () => {
        expect(this.response.res.headers['content-type']).toMatch(/application\/json/i);
      });

      it('should return the name of the file that was uploaded', () => {
        expect(this.response.body['Location'])
          .toEqual(`/files/${this.fileData.filename}`);
      });

      it('should allow different users to upload the same file without overwriting', () => {
        return mocks.auth.createOne()
          .then(mockObj2 => superagent.post(`${ENDPOINT_FILES}/${this.fileData.filename}`)
            .set('Authorization', `Bearer ${mockObj2.token}`)
            .attach('file', this.fileData.ffilepath)
          )
          .then(res => expect(res.status).toEqual(201))
          .catch(console.error);
      });
    });

    describe('Invalid', () => {
      it('should respond with a 409 (CONFLICT) status if a user tries to upload the same file twice', () => {
        return superagent.post(`${ENDPOINT_FILES}/${this.fileData.filename}`)
          .set('Authorization', `Bearer ${this.mockObj.token}`)
          .attach('file', this.fileData.ffilepath)
          .catch(err => expect(err.status).toEqual(409));
      });

      it('should respond with 403 (FORBIDDEN) status when a file is uploaded without a token', () => {
        return mocks.file.createOne()
          .then(fileData => superagent.post(`${ENDPOINT_FILES}/${fileData.filename}`)
            .attach('file', fileData.ffilepath)
          )
          .catch(err => expect(err.status).toEqual(403));
      });

      it('should respond with 403 (FORBIDDEN) status when a file is uploaded with an invalid token', () => {
        return mocks.file.createOne()
          .then(fileData => superagent.post(`${ENDPOINT_FILES}/${fileData.filename}`)
            .set('Authorization', `Bearer lksjdifoknwmeoknoewriguh90243kno4tnklwkn34toi34nlknsd`)
            .attach('file', fileData.ffilepath)
          )
          .catch(err => expect(err.status).toEqual(403));
      });
    });
  });
});

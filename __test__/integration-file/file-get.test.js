'use strict';

const superagent = require('superagent');
const server = require('../../lib/server');
const mocks = require('../lib/mocks');

const PORT = process.env.PORT;
const ENDPOINT_FILES = `:${PORT}/files`;

describe('Files GET', () => {
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
        .then(() => superagent.get(`${ENDPOINT_FILES}/${this.fileData.filename}`)
          .set('Authorization', `Bearer ${this.mockObj.token}`)
        )
        .then(res => this.response = res)
        .catch(console.error);
    });
    afterAll(mocks.auth.removeAll);
    afterAll(mocks.file.removeAll);

    describe('Valid', () => {
      it('should respond with a status of 200 (OK) on success', () => {
        expect(this.response.status).toEqual(200);
      });

      it('should respond with a Content-Type of application/json', () => {
        expect(this.response.res.headers['content-type']).toMatch(/application\/json/i);
      });
    });

    describe('Invalid', () => {
      it('should respond with a 404 (NOT FOUND) status if a user tries to get a non-existent file', () => {
        return superagent.get(`${ENDPOINT_FILES}/fakefile.txt`)
          .set('Authorization', `Bearer ${this.mockObj.token}`)
          .catch(err => expect(err.status).toEqual(404));
      });

      it('should respond with 403 (FORBIDDEN) status when a user tries to get a file without a token', () => {
        return superagent.get(`${ENDPOINT_FILES}/${this.fileData.filename}`)
          .catch(err => expect(err.status).toEqual(403));
      });

      it('should respond with 403 (FORBIDDEN) status when a user tries to get a file with an invalid token', () => {
        return superagent.get(`${ENDPOINT_FILES}/${this.fileData.filename}`)
          .set('Authorization', `Bearer lksjdifoknwmeoknoewriguh90243kno4tnklwkn34toi34nlknsd`)
          .catch(err => expect(err.status).toEqual(403));
      });

      it('should respond with 404 (NOT FOUND) if a user tries to fetch another users file', () => {
        return mocks.auth.createOne()
          .then(mockObj2 => superagent.get(`${ENDPOINT_FILES}/${this.fileData.filename}`)
            .set('Authorization', `Bearer ${mockObj2.token}`)
          )
          .catch(err => expect(err.status).toEqual(404));
      });
    });
  });

  describe('/files', () => {
    beforeAll(() => {
      return mocks.auth.createOne()
        .then(mockObj1 => this.mockObj1 = mockObj1)
        .then(() => mocks.file.createOne())
        .then(fileData1 => this.fileData1 = fileData1)
        .then(() => superagent.post(`${ENDPOINT_FILES}/${this.fileData1.filename}`)
          .set('Authorization', `Bearer ${this.mockObj1.token}`)
          .attach('file', this.fileData1.ffilepath)
        )
        .then(() => mocks.file.createOne())
        .then(fileData2 => this.fileData2 = fileData2)
        .then(() => superagent.post(`${ENDPOINT_FILES}/${this.fileData2.filename}`)
          .set('Authorization', `Bearer ${this.mockObj1.token}`)
          .attach('file', this.fileData2.ffilepath)
        )
        .then(() => superagent.get(`${ENDPOINT_FILES}`)
          .set('Authorization', `Bearer ${this.mockObj1.token}`)
        )
        .then(res => this.response = res)
        .catch(console.error);
    });
    afterAll(mocks.auth.removeAll);
    afterAll(mocks.file.removeAll);

    describe('Valid', () => {
      it('should respond with a status of 200 (OK) on successful retrieval of the users files', () => {
        expect(this.response.status).toEqual(200);
      });

      it('should respond with a Content-Type of application/json', () => {
        expect(this.response.res.headers['content-type']).toMatch(/application\/json/i);
      });

      it('should have returned an array of the 2 files this user uploaded', () => {
        expect(this.response.body).toBeInstanceOf(Array);
        expect(this.response.body.length).toEqual(2);
      });

      it(`should return no filenames for a new user that doesn't own any of the first users files`, () => {
        return mocks.auth.createOne()
          .then(mockObj2 => superagent.get(`${ENDPOINT_FILES}`)
            .set('Authorization', `Bearer ${mockObj2.token}`)
          )
          .then(res => expect(res.body.length).toEqual(0))
          .catch(console.error);
      });
    });

    describe('Invalid', () => {
      it('should respond with 403 (FORBIDDEN) status when a user tries to get files without a token', () => {
        return superagent.get(`${ENDPOINT_FILES}`)
          .catch(err => expect(err.status).toEqual(403));
      });

      it('should respond with 403 (FORBIDDEN) status when a user tries to get files with an invalid token', () => {
        return superagent.get(`${ENDPOINT_FILES}`)
          .set('Authorization', `Bearer lksjdifoknwmeoknoewriguh90243kno4tnklwkn34toi34nlknsd`)
          .catch(err => expect(err.status).toEqual(403));
      });
    });
  });
});

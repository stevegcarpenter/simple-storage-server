'use strict';

const eH = require('../../lib/error-handler');
const Res = require('../lib/response');
require('jest');


let validation = new Res(new Error('Validation Error'));
let invalidfname = new Res(new Error('Invalid Filename'));
let generic = new Res(new Error('Generic'));
let objectId = new Res(new Error('ObjectId failed'));
let patherr = new Res(new Error('Path Error'));
let noentity = new Res(new Error('ENOENT'));
let dupkey = new Res(new Error('Duplicate Key'));

describe('Error Handler', () => {
  it('should return an error 409 for any error containing Duplicate Key', () => {
    expect(eH(dupkey.error, dupkey).code).toBe(409);
  });

  it('should return an error 404 for any error containing ObjectId Failed, ENOENT, or path error', () => {
    expect(eH(objectId.error, objectId).code).toBe(404);
    expect(eH(patherr.error, patherr).code).toBe(404);
    expect(eH(noentity.error, noentity).code).toBe(404);
  });

  it('should return an error 400 for any error containing Validation Error', () => {
    expect(eH(validation.error, validation).code).toBe(400);
    expect(eH(invalidfname.error, invalidfname).code).toBe(400);
  });

  it('should return an error 500 for any other errors that occur', () => {
    expect(eH(generic.error, generic).code).toBe(500);
  });
});

'use strict';

const File = require('../../model/file.js');

describe('File Module', () => {
  let mock = {
    filename: 'fakefile',
    userId: 'abc123',
    objectKey: '123543243546',
    fileURI: 'http://a-file-uri',
  };
  let file = new File();

  it('Should have an _id property', () => {
    expect(file).toHaveProperty('_id');
  });

  it('Should have a filename property', () => {
    expect(new File(mock)).toHaveProperty('filename');
  });

  it('Should have a userId property', () => {
    expect(new File(mock)).toHaveProperty('userId');
  });

  it('Should have a objectKey property', () => {
    expect(new File(mock)).toHaveProperty('objectKey');
  });

  it('Should have a fileURI property', () => {
    expect(new File(mock)).toHaveProperty('fileURI');
  });

  it('should be an instance of an Object', () => {
    expect(file).toBeInstanceOf(Object);
  });
});

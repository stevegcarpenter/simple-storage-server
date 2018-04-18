'use strict';

const fs = require('fs');
const del = require('del');
const path = require('path');
const tempDir = `${__dirname}/../temp`;
const aws3 = require('../lib/aws-s3');
const mongoose = require('mongoose');
const debug = require('debug')('http:file');

const File = mongoose.Schema({
  name: {type: String, required: true, unique: true},
  userId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'auth'},
  // objectKey and fileURI returned by AWS
  objectKey: {type: String, required: true, unique: true},
  fileURI: {type: String, required: true, unique: true},
});

File.statics.upload = function (req) {
  return new Promise((resolve, reject) => {
    if (!req.file)
      return reject(new Error('Multi-part form data error: missing file data'));
    if (!req.file.path)
      return  reject(new Error('Multi-part form data error: missing file path'));

    debug('upload:');

    let params = {
      ACL: 'public-read',
      Bucket: process.env.AWS_BUCKET,
      Key: `/files/${req.file.filename}${path.extname(req.file.originalname)}`,
      Body: fs.createReadStream(req.file.path),
    };

    return aws3.uploadProm(params)
      .then(data => {
        debug('Returned from upload!');
        // remove file from temporary directory
        del(`${tempDir}/${req.file.filename}`);

        let fileData = {
          name: req.params.filename,
          userId: req.user._id,
          fileURI: data.Location,
          objectKey: data.Key,
        };

        debug('upload: File data:', fileData);

        resolve(fileData);
      })
      .catch(reject);
  });
};

File.methods.delete = function () {
  return new Promise((resolve, reject) => {
    debug('delete:');

    let params = {
      Bucket: process.env.AWS_BUCKET,
      Key: this.objectKey,
    };

    return(aws3.deleteProm(params))
      .then(data => debug('data', data))
      .then(this.remove())
      .then(resolve)
      .catch(reject);
  });

};

module.exports = mongoose.model('file', File);

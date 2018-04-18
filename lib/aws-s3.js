'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const aws3 = module.exports = {};

aws3.uploadProm = function (params){
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => err ?  reject(err) : resolve(data));
  });
};

aws3.deleteProm = function (params){
  return new Promise((resolve, reject) => {
    s3.deleteObject(params, (err, data) => err ? reject(err) : resolve(data));
  });
};

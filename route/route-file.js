'use strict';

const File = require('../model/file');
const bodyParser = require('body-parser').json();
const bearerAuth = require('../lib/bearer-auth-middleware');
const errorHandler = require('../lib/error-handler');

// Upload dependencies
const tempDir = `${__dirname}/../temp`;
const multer = require('multer');
const upload = multer({dest: tempDir});

module.exports = router => {
  router.put('/files/:filename', bearerAuth, bodyParser, upload.single('file'),
    (req, res) => {
      File.upload(req)
        .then(fileData => new File(fileData).save())
        .then(file => res.status(201).json({Location: `/files/${file.name}`}))
        .catch(err => errorHandler(err, res));
    });

  router.get('/files/:filename?', bearerAuth, (req, res) => {
    // TODO: Add Content-Length & Content-Type support
    // Get a single file
    if (req.params.filename) {
      return File.findOne({ name: req.params.filename, userId: req.user._id })
        .then(file => file
          ? file
          : Promise.reject(new Error('ENOENT: File Not Found'))
        )
        .then(file => res.status(200).json(file))
        .catch(err => errorHandler(err,res));
    }

    // Fetch all the users personal files
    return File.find({ userId: req.user._id })
      .then(files => files.map(file => file.name))
      .then(filenames => res.status(200).json(filenames))
      .catch(err => errorHandler(err, res));
  });

  router.delete('/files/:filename', bearerAuth, (req, res) => {
    return File.findOne({ name: req.params.filename, userId: req.user._id })
      .then(file => file
        ? file.delete()
        : Promise.reject(new Error('ENOENT: File Not Found'))
      )
      .then(() => res.sendStatus(204))
      .catch(err => errorHandler(err, res));
  });
};
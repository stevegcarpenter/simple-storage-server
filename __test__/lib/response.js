'use strict';

// Mock response object
module.exports = class {
  constructor(err) {
    this.error = err;
    this.code = null;
    this.message = null;
  }

  status(code) {
    this.code = code;
    return this;
  }

  send(message) {
    this.message = message;
    return this;
  }

  sendStatus(code) {
    this.code = code;
    return this;
  }

  json(data) {
    this.data = data;
    return this;
  }
};

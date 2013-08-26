var uuid = require('node-uuid');

function Worker(browser) {
  this.browser = browser;
  this.uuid = uuid.v1();
  this.status = 'created';
  this.identifier = null;
  this.results = false;
}

module.exports = Worker;

var Browser = require('./browser'),
    Worker = require('./worker'),
    events = require('events'),
    util = require('util'),
    ut = require('./util'),
    URI = require('uri-js');

function Job(client, url, port, timeout, remoteBrowsers) {
  events.EventEmitter.call(this);

  this.client = client;
  this.url = url;
  this.port = port;
  this.timeout = timeout;

  this.remoteBrowsers = remoteBrowsers.map(function (b) {
    return new Browser(b);
  });
  this.browsers = [];
  this.workers = [];
}

util.inherits(Job, events.EventEmitter);

Job.prototype.addBrowser = function () {
  for (var i = 0; i  < arguments.length; i += 1) {
    var browser = new Browser(arguments[i]),
        found = false;

    this.remoteBrowsers.forEach(function (remoteBrowser) {
      if (remoteBrowser.equals(browser)) {
        this.browsers.push(remoteBrowser);
        found = true;
      }
    }, this);

    if (!found) {
      console.warn('WARNING: Could not find browser: %s', browser);
    }
  }
};

Job.prototype.onData = function (uuid, browser, result) {
  var that = this;

  if (!browser || !uuid || !result) {
    if (!browser || !uuid) {
      console.error('ERROR: Received callback without browser or uuid');
    }

    if (!result) {
      console.log('ERROR: Received callback without data for %s, %s', browser, uuid);
      this.emit('error', browser);
    }
  } else {
    var worker = this.getWorker(uuid);

    if (worker) {
      console.log('INFO: Received results for %s. Shutting down worker %s', worker.browser, worker.identifier);
      that.emit('end', worker.browser, result);
      this.client.stopWorker(worker.identifier, function () {
        worker.status = 'terminated';
      });
    }
  }
};

Job.prototype.getWorker = function (uuid) {
  var result = null;

  this.workers.forEach(function (worker) {
    if (worker.uuid === uuid) {
      result = worker;
    }
  });

  return result;
}

Job.prototype.run = function () {
  var that = this;

  if (!this.browsers.length) {
    console.warn('WARNING: You must specify at least one browser');
  } else {
    console.log('INFO: Starting job');
    this.browsers.forEach(function (browser) {
      var worker = new Worker(browser);

      var options = ut.extend({}, browser, {
        timeout: that.timeout,
        url: null
      });

      var uri = URI.parse(that.url);

      uri.port = that.port;

      if (!uri.query) {
        uri.query = '';
      } else {
        uri.query += '&';
      }

      uri.query += 'browser=' + JSON.stringify(browser) + '&uuid=' + worker.uuid;

      options.url = URI.serialize(uri);

      that.client.createWorker(options, function (err, identifier) {
        if (err) {
          console.error('ERROR: Failed to start worker for %s', browser);
          worker.status = 'error';
          that.emit('error', browser);
        } else {
          console.log('INFO: Created worker for %s with identifier %s', browser, identifier);
          worker.status = 'queue';
          worker.identifier = identifier;
          that.emit('start', browser);
        }
      });

      that.workers.push(worker);
    });

    function updateWorkers () {
      that.client.getWorkers(function (err, remoteWorkers) {
        if (err) {
          console.error('ERROR: Failed to retrieve workers');
        } else {
          that.workers.forEach(function (worker) {
            var found = false;

            remoteWorkers.forEach(function (remoteWorker) {
              if (remoteWorker.id === worker.identifier) {
                found = true;
                worker.status = remoteWorker.status;
              }
            });

            if (!found) {
              if (worker.status !== 'error' && worker.status !== 'created') {
                worker.status = 'terminated';
              }
            }
          });
        }
      });

      if (that.workers.every(function (worker) {
        return worker.status === 'error' || worker.status === 'terminated';
      })) {
        console.log('INFO: All workers terminated');
        that.emit('complete');
      } else {
        setTimeout(updateWorkers, 5000);
      }
    }

    updateWorkers();
  }
};

module.exports = Job;

var browserStack = require('node-browserstack'),
    freeport = require('freeport'),
    Job = require('./job'),
    Tunnel = require('./tunnel'),
    Proxy = require('./proxy');

function Client(username, password, key) {
  this.username = username;
  this.password = password;
  this.key = key;
}

/**
 * @param {string} url
 * @param {Object} options
 * @param {function(Error, Job)}
 */
Client.prototype.createJob = function (url, options, callback) {
  var that = this,
      timeout = options && options.timeout || 30;

  freeport(function (err, port) {
    if (err) {
      console.error('ERROR: Could not find a free port');
      callback(err, null);
    } else {
      var proxy = new Proxy(url);

      proxy.start(port, function (err) {
        if (err) {
          console.error('ERROR: Could not start proxy server at port %s', port);
          callback(err, null);
        } else {
          console.log('INFO: Started proxy server at port %s', port);

          var tunnel = new Tunnel(that.key);

          tunnel.start(port, /^https/.test(url), function (err) {
            if (err) {
              console.error('ERROR: Could not start BrowserStack tunnel for port %s', port);
              callback(err, null);
            } else {
              console.log('INFO: Started BrowserStack tunnel for port %s', port);

              var client = browserStack.createTestClient(that.username, that.password);

              client.getBrowsers(function (err, browsers) {
                if (err) {
                  console.error('ERROR: Could not retrieve browser list from BrowserStack');
                  callback(err, null);
                } else {
                  var job = new Job(client, url, port, timeout, browsers);

                  proxy.on('data', job.onData.bind(job));

                  job.on('complete', function () {
                    proxy.stop(function () {
                      console.log('INFO: Stopped proxy server');
                    });
                    tunnel.stop(function () {
                      console.log('INFO: Stopped tunnel');
                    });
                  });

                  callback(null, job);
                }
              });
            }
          });
        }
      });
    }
  });
};

module.exports = Client;

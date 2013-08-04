var freeport = require('freeport'),
    BrowserStackTunnel = require('browserstacktunnel-wrapper');

function Tunnel(key) {
  this.key = key;
  this.tunnel = null;
}

Tunnel.prototype.start = function (port, callback) {
  this.tunnel = new BrowserStackTunnel({
    key: this.key,
    hosts: [{
      name: 'localhost',
      port: port,
      sslFlag: 0
    }]
  });

  this.tunnel.start(function (err) {
    if (err) {
      callback(err, null)
    } else {
      callback(null);
    }
  });
};

Tunnel.prototype.stop = function (callback) {
  this.tunnel.stop(callback);
};

module.exports = Tunnel;

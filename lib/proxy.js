var express = require('express'),
    http = require('http'),
    httpProxy = require('http-proxy'),
    URI = require('uri-js'),
    events = require('events'),
    util = require('util'),
    Browser = require('./browser');

function Proxy(url) {
  events.EventEmitter.call(this);

  var app = express(),
      proxy = new httpProxy.RoutingProxy(),
      uri = URI.parse(url),
      that = this;

  app.post(uri.path, function (req, res) {
    var browser = null,
        uuid = null;

    if (req.query['browser'] && req.query['uuid']) {
      try {
        browser = new Browser(JSON.parse(req.query['browser']));
      } catch (e) {}

      uuid = req.query['uuid'];
    }
    that.emit('data', uuid, browser, req, res);
  });

  app.all('*', function (req, res) {
    proxy.proxyRequest(req, res, {
      host: uri.host,
      port: uri.port
    });
  });

  this.server = http.createServer(app);
  this.process = null;
}

util.inherits(Proxy, events.EventEmitter);

Proxy.prototype.stop = function (callback) {
  this.process.close(callback);
};

Proxy.prototype.start = function (port, callback) {
  this.process = this.server.listen(port, callback);
};

module.exports = Proxy;

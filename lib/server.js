var express = require('express'),
    http = require('http'),
    httpProxy = require('http-proxy'),
    URI = require('uri-js'),
    events = require('events'),
    util = require('util'),
    Browser = require('./browser');

function Server(url) {
  events.EventEmitter.call(this);

  var app = express(),
      proxy = new httpProxy.RoutingProxy(),
      uri = URI.parse(url),
      that = this;

  app.post(uri.path, express.json(), function (req, res) {
    var browser = null,
        uuid = null,
        data = req.body;

    if (req.query['browser'] && req.query['uuid']) {
      try {
        browser = new Browser(JSON.parse(req.query['browser']));
      } catch (e) {}

      uuid = req.query['uuid'];

      if (browser && uuid) {
        res.send(200);
      } else {
        res.send(400, 'ERROR: Job has an invalid uuid or browser');
      }
    } else {
      res.send(400, 'ERROR: Job does not have a uuid or browser');
    }
    that.emit('data', uuid, browser, data);
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

util.inherits(Server, events.EventEmitter);

Server.prototype.stop = function (callback) {
  this.process.close(callback);
};

Server.prototype.start = function (port, callback) {
  this.process = this.server.listen(port, callback);
};

module.exports = Server;
## BrowserStack Workers

This is an abstraction layer built on top of the BrowserStack API to make it easier to run arbitrary jobs on BrowserStack workers. It is the basis for the BrowserStack testing framework that automatically runs your Jasmine or Mocha.js test suites on BrowserStack virtual machines. It can also be used to run other JavaScript tasks.

## Installation

    $ npm install browserstack-workers

## Usage

    var Client = require('browserstack-workers');

    var runner = new Client('<username>', '<password>', '<api-key>');

    runner.createJob('<url>', function (err, job) {
      job.addBrowser({
        browser: 'chrome',
        browser_version: '27',
        os: 'OS X',
        os_version: 'Mountain Lion'
      });

      job.addBrowser(...);

      job.on('start', function (browser) {
        // The worker for `browser` has been queued or started
      });

      job.on('end', function (browser, data) {
        // The worker for `browser` has finished and returned `data`
      });

      job.on('complete', function () {
        // All workers have completed
      });

      job.on('error', function (browser) {
        // The worker for `browser` generated an error
      });

      job.run();
    });

The class returned by `require('browserstack-workers')` creates a new instance of a BrowserStack client. As parameters it takes your BrowserStack `username`, `password` and `api-key`. An instance of the class only has a single method `createJob`.

The `createJob` takes as input a `url`, an optional options object and a callback. The URL is the "job" you want to run, and should be a HTML page on either a local or remote server. A secure tunnel to BrowserStack is automatically created. The options object currently only has a single value, `timeout` which should be the number of seconds a BrowserStack worker runs before being forcibly shut down. The callback is called with either an error object or a job instance.

The `job` instance has two public methods, `addBrowser` and `run`. The `addBrowser` method takes one or more browser specifications to create a BrowserStack worker for. The `run` method starts the runner and takes no parameters. The `job` instance is also an event emitter for the following events:

* `start`: called when a worker has been created. The browser associated with the worker is passed as an argument.
* `end`: called when a worker has finished. The browser associated with the worker, together with the result data is passed as an argument.
* `complete`: called when all workers have terminated.
* `error`: called when a worker error is detected. The browser associated with the worker is passed as an argument.

## Writing jobs

A job should be a HTML page on either a local or remote server. The page can contain anything and the only requirement for returning data is that the page transmits its "data" as a POST message to the URL it originated from (in JavaScript this can be accessed as `window.location.href`. The data it returns must be JSON sent as `application/json`. Workers are shut down as soon as the runner receives the results.

## License
 
BrowserStack Workers is licensed under the three-clause BSD license. Copyright 2013 Bram Stein, all rights reserved.

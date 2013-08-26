function Browser(options) {
  this.device = options.device || null;
  this.browser = options.browser || null;
  this.browser_version = options.browser_version || null;
  this.os = options.os || null;
  this.os_version = options.os_version || null;
  this.timeout = options.timeout || 30;
}

Browser.prototype.equals = function (other) {
  return ['device', 'browser', 'browser_version', 'os', 'os_version'].every(function (key) {
    if (!this[key] && !other[key]) {
      return true;
    } else if (!other[key] || !this[key]) {
      return false;
    } else {
      return this[key] === other[key];
    }
  }, this);
};

Browser.prototype.toString = function () {
  var result = '';

  if (this.browser) {
    result += this.browser;
    if (this.browser_version) {
      result += ' ' + this.browser_version + '';
    }
  }

  if (this.os) {
    result += ', ' + this.os;

    if (this.os_version) {
      result += ' ' + this.os_version + '';
    }
  }

  if (this.device) {
    result += ', ' + this.device;
  }

  return result;
};

module.exports = Browser;

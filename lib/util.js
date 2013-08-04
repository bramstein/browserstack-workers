module.exports.extend = function (var_args) {
  for (var i = 1; i < arguments.length; i += 1) {
    for (var p in arguments[i]) {
      if (arguments[i].hasOwnProperty(p)) {
        arguments[0][p] = arguments[i][p];
      }
    }
  }
  return arguments[0];
};

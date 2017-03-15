'use strict';

const lib = require('./lib');

module.exports.handler = lib.lambda(() => {
  return lib.getMostRecentStatus('temperature');
});

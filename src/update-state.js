'use strict';

const lib = require('./lib');

module.exports.handler = lib.lambda((event) => {
  const body = JSON.parse(event.body);

  if (!body || (body && !body.state)) {
    const err = new Error('State is mandatory');
    err.statusCode = 400;
    throw err;
  }

  return lib.insertStatus('state', {
    state: body.state
  });
});

'use strict';

const lib = require('./lib');

module.exports.handler = lib.lambda((event) => {
  const body = JSON.parse(event.body);

  if (!body || (body && !body.temperature)) {
    const err = new Error('Temperature is mandatory');
    err.statusCode = 400;
    throw err;
  }

  return lib.insertStatus('temperature', {
    temperature: body.temperature
  });
});

'use strict';

const AWS = require('aws-sdk');
const Promise = require('bluebird');
const Pusher = require('pusher');

AWS.config.setPromisesDependency(Promise);
AWS.config.update({region:'us-east-1'});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET
});

module.exports.insertStatus = (type, data) => {
  const item = Object.assign({
    type: type,
    datetime: (new Date()).getTime()
  }, data);

  return dynamodb.put({
    TableName: 'status',
    Item: item
  }).promise().then(() => {
    pusher.trigger('kegmeister', 'status-changed', {
      'type': type,
      'data': data
    });

    return item
  });
};

module.exports.getMostRecentStatus = (type) => {
  return dynamodb.query({
    TableName: 'status',
    Limit: 1,
    KeyConditionExpression: '#tp = :tp',
    ExpressionAttributeNames: {
      '#tp': 'type'
    },
    ExpressionAttributeValues: {
      ':tp': type
    },
    ScanIndexForward: false
  }).promise().then((data) => {
    if (data && data.Items && data.Items.length)
      return data.Items[0];

    return {};
  });
};

module.exports.lambda = func => (event, context, callback) => {
  return Promise.try(() => {
    return func(event);
  }).then((response) => {
    return callback(null, {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(response || {})
    });
  }).catch((err) => {
    return callback(err, {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({
        message: err.message || err
      })
    });
  })
};

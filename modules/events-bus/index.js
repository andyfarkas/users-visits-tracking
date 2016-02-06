'use strict';

module.exports = require('./src/events-bus')(
    require('amqplib/callback_api')
);
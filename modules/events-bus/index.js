'use strict';

module.exports = require('./src/events')(
    require('amqplib/callback_api')
);
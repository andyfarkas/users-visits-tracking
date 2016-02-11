'use strict';

const mock = require('./../../mockz/mockz').mock;
const assert = require('assert');
const sinon = require('sinon');

describe('EventsBus', function() {
    describe('connect()', function() {

        it('should connect to host using the amqp client', function() {
            let expectedHost = 'amqp_url';
            let amqpMock = mock({});
            amqpMock.method('connect').once().with(expectedHost);
            const EventsBus = require('../src/events-bus')(amqpMock.getMock());

            EventsBus.connect(expectedHost);
            amqpMock.verify();
        });

        it('should return connection as a promise', function(done) {
            const expectedConnection = {
                fake: 'connection'
            };
            const amqpFakeApi = {
                connect: function(host, callback) {
                    return callback(null, expectedConnection);
                }
            };
            const EventsBus = require('../src/events-bus')(amqpFakeApi);

            EventsBus.connect('amqp_url').then(function(connection) {
                assert.deepEqual(expectedConnection, connection);
            }).done(done);

        });

        it('tries to reconnect after a second if the connection attempt failed', function(done) {
            const expectedConnection = {
                fake: 'connection'
            };

            let returnError = true;
            const amqpApi = {
                connect: function(host, callback) {
                    if (returnError) {
                        returnError = false;
                        return callback({}, null);
                    }
                    return callback(null, expectedConnection);
                }
            };
            const EventsBus = require('../src/events-bus')(amqpApi);

            let clock = sinon.useFakeTimers();
            EventsBus.connect('amqp_url').then(function(connection) {
                assert.deepEqual(expectedConnection, connection);
            }).done(done);
            clock.tick(1000);
            clock.restore();
        });
    });

    describe('attachToExchange()', function() {
        it('should create channel', function() {
            const EventsBus = require('../src/events-bus')({});
            const connectionMock = mock({});
            connectionMock.method('createChannel').once();
            EventsBus.attachToExchange('exchange-name', connectionMock.getMock());
            connectionMock.verify();
        });

        it('should assert exchange to channel', function() {
            const EventsBus = require('../src/events-bus')({});
            const channelMock = mock({});
            channelMock.method('assertQueue');
            channelMock.method('assertExchange').once().with('exchange-name', 'direct', {durable: false});
            const connection = {
                createChannel: function(callback) {
                    callback(null, channelMock.getMock());
                }
            };
            EventsBus.attachToExchange('exchange-name', connection);
            channelMock.verify();
        });

        it('should assert queue to channel', function() {
            const EventsBus = require('../src/events-bus')({});
            const channelMock = mock({});
            channelMock.method('assertExchange');
            channelMock.method('assertQueue').once().with('', { exclusive: true });
            const connection = {
                createChannel: function(callback) {
                    callback(null, channelMock.getMock());
                }
            };
            EventsBus.attachToExchange('exchange-name', connection);
            channelMock.verify();
        });

        it('should return events exchange in promise', function(done) {
            const EventsBus = require('../src/events-bus')({});
            const queueFake = {};
            const channelMock = mock({
                assertQueue: function(queueName, options, callback) {
                    return callback(null, queueFake);
                }
            });
            channelMock.method('assertExchange');
            channelMock.method('consume');
            const channelFake = channelMock.getMock();
            const connection = {
                createChannel: function(callback) {
                    callback(null, channelFake);
                }
            };

            EventsBus.attachToExchange('exchange-name', connection).then(function(EventsExchange) {
                assert(EventsExchange);
            }).done(done);
        });
    });

});
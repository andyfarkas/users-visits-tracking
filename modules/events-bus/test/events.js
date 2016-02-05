'use strict';

const mock = require('./mockz').mock;
const assert = require('assert');
const sinon = require('sinon');

describe('EventsBus', function() {
    describe('connect()', function() {

        it('should connect to host using the amqp client', function() {
            let expectedHost = 'amqp_url';
            let amqpMock = mock({});
            amqpMock.method('connect').once().with(expectedHost);
            const EventsBus = require('../src/events')(amqpMock.getMock());

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
            const EventsBus = require('../src/events')(amqpFakeApi);

            let returnedConnection = null;
            EventsBus.connect('amqp_url').then(function(connection) {
                returnedConnection = connection;
            }).done(function() {
                assert.deepEqual(returnedConnection, expectedConnection);
                done();
            });

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
            const EventsBus = require('../src/events')(amqpApi);

            let returnedConnection = null;
            let clock = sinon.useFakeTimers();
            EventsBus.connect('amqp_url').then(function(connection) {
                returnedConnection = connection;
            }).done(function() {
                assert.deepEqual(returnedConnection, expectedConnection);
                done();
            });
            clock.tick(1000);
            clock.restore();
        });
    });

    describe('attachToExchange()', function() {
        it('should create channel', function() {
            const EventsBus = require('../src/events')({});
            const connectionMock = mock({});
            connectionMock.method('createChannel').once();
            EventsBus.attachToExchange('exchange-name', connectionMock.getMock());
            connectionMock.verify();
        });

        it('should assert exchange to channel', function() {
            const EventsBus = require('../src/events')({});
            const channelMock = mock({});
            channelMock.method('assertQueue');
            channelMock.method('assertExchange').once().with('exchange', 'direct', {durable: false});
            const connection = {
                createChannel: function(callback) {
                    callback(null, channelMock.getMock());
                }
            };
            EventsBus.attachToExchange('exchange-name', connection);
        });
    });

});
'use strict';

const expect = require('./mockz').expect;
const assert = require('assert');
const sinon = require('sinon');

describe('EventsBus', function() {
    describe('connect()', function() {

        it('should connect to host using the amqp client', function() {
            let expectedHost = 'amqp_url';
            let amqpToBeCalled = expect('connect');
            amqpToBeCalled.once().with(expectedHost);
            const EventsBus = require('../src/events')(amqpToBeCalled.getMock());

            EventsBus.connect(expectedHost);
            amqpToBeCalled.verify();
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

});
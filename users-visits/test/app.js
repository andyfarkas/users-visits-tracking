'use strict';

const mock = require('./../../mockz/mockz').mock;
const assert = require('assert');
const createApp = require('../src/app');

describe('Application', function() {
    describe('start()', function() {
        it('should connect to mongo', function() {
            const mongoFake = mock({});
            const exchangeMock = mock({});
            exchangeMock.method('on');
            const eventsBusFake = mock({
                attachToExchange: function() {
                    return exchangeMock.getMock();
                }
            });
            eventsBusFake.method('connect');
            const visitsFake = mock({});
            const usersFake = mock({});
            mongoFake.method('connect').once();
            const app = createApp(
                eventsBusFake.getMock(),
                mongoFake.getMock(),
                visitsFake.getMock(),
                usersFake.getMock()
            );
            app.start();
            mongoFake.verify();
        });

        it('should connect to events bus', function() {
            const mongoFake = mock({});
            const exchangeMock = mock({});
            exchangeMock.method('on');
            const eventsBusFake = mock({
                attachToExchange: function() {
                    return exchangeMock.getMock();
                }
            });
            eventsBusFake.method('connect').once();
            const visitsFake = mock({});
            const usersFake = mock({});
            mongoFake.method('connect');
            const app = createApp(
                eventsBusFake.getMock(),
                mongoFake.getMock(),
                visitsFake.getMock(),
                usersFake.getMock()
            );
            app.start();
            eventsBusFake.verify();
        });

        it('should start listening to users events', function() {
            const mongoFake = mock({});
            const exchangeMock = mock({});
            exchangeMock.method('on').once().with('user_joined');
            exchangeMock.method('on').once().with('user_left');
            const eventsBusFake = mock({
                attachToExchange: function() {
                    return exchangeMock.getMock();
                }
            });
            eventsBusFake.method('connect');
            const visitsFake = mock({});
            const usersFake = mock({});
            mongoFake.method('connect');
            const app = createApp(
                eventsBusFake.getMock(),
                mongoFake.getMock(),
                visitsFake.getMock(),
                usersFake.getMock()
            );
            app.start();
            exchangeMock.verify();
        });
    });

    describe('onUserJoined event fired with new user joining', function() {
        it('should create a new user with a new visit attached', function() {
            const mongoFake = mock({});
            let userJoinedCallback = function() {};
            const exchangeMock = mock({
                on: function(eventName, callback) {
                    if (eventName == 'user_joined') {
                        userJoinedCallback = callback;
                    }
                }
            });
            const eventsBusFake = mock({
                attachToExchange: function() {
                    return exchangeMock.getMock();
                }
            });
            eventsBusFake.method('connect');
            const visitsFake = mock({});
            const usersFake = mock({});
            mongoFake.method('connect');
            const app = createApp(
                eventsBusFake.getMock(),
                mongoFake.getMock(),
                visitsFake.getMock(),
                usersFake.getMock()
            );
            app.start();
            userJoinedCallback({
                username: 'a very first user'
            });
        });
    });
});
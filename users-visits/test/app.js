'use strict';

const mock = require('./../../mockz/mockz').mock;
const assert = require('assert');
const createApp = require('../src/app');
const Q = require('q');

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
        it('should create a new user with a new visit attached and put them online', function(done) {
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
            mongoFake.method('connect');

            const expectedVisit = {
                username: 'a very first user'
            };
            const newUser = {
                username: 'a very first user'
            };
            const expectedUser = {
                username: 'a very first user',
                lastVisit: expectedVisit,
                isOnline: true
            };
            const usersFake = mock({
                findByUsername: function() {
                    let deferred = Q.defer();
                    deferred.resolve(null);
                    return deferred.promise;
                },
                save: function(o) {
                    assert.deepEqual(o, expectedUser);
                    done();
                },
                create: function() {
                    return newUser;
                }
            });
            visitsFake.method('create').once().with('a very first user').returns(expectedVisit);
            visitsFake.method('save').once().with(expectedVisit).returns(expectedVisit);

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

    describe('onUserJoined event fired with an existing user joining', function() {
        it('should create a new visit attached to that user and put them online', function() {
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
            const existingUser = {
                username: 'an existing'
            };

            mongoFake.method('connect');

            const expectedVisit = {
                username: 'an existing'
            };
            const expectedUser = {
                username: 'an existing',
                lastVisit: expectedVisit,
                isOnline: true
            };

            const usersFake = mock({
                findByUsername: function() {
                    let deferred = Q.defer();
                    deferred.resolve(existingUser);
                    return deferred.promise;
                },
                save: function(o) {
                    assert.deepEqual(o, expectedUser);
                }
            });

            visitsFake.method('create').once().with('an existing').returns(expectedVisit);
            visitsFake.method('save').once().with(expectedVisit).returns(expectedVisit);

            const app = createApp(
                eventsBusFake.getMock(),
                mongoFake.getMock(),
                visitsFake.getMock(),
                usersFake.getMock()
            );

            app.start();
            userJoinedCallback({
                username: 'an existing'
            });

            visitsFake.verify();
            usersFake.verify();
        });
    });
});
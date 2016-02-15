'use strict';

const createApp = require('../src/app');
const createMongoFake = require('./fakes/mongo');
const createEventsBusFake = require('./fakes/events-bus');
const createUsersFake = require('./fakes/users');
const createVisistsFake = require('./fakes/visits');
const assert = require('assert');

describe('Application', function() {
    describe('when running and user_joined event received with new user', function() {
        it('should create new visit', function(done) {
            const mongo = createMongoFake();
            const eventsBus = createEventsBusFake();
            const users = createUsersFake();
            const visits = createVisistsFake();
            visits.save = function(visitToSave) {
                try {
                    assert.deepEqual(visitToSave.username, 'a new user');
                    done();
                } catch (err) {
                    done(err);
                }
            };
            const app = createApp(
                eventsBus,
                mongo,
                visits,
                users
            );
            app.start().then(function() {
                eventsBus.publish('user_joined', {
                    username: 'a new user'
                });
            });
        });

        it('should create new online user with last visit attached', function(done) {
            const mongo = createMongoFake();
            const eventsBus = createEventsBusFake();
            const users = createUsersFake();
            const visits = createVisistsFake();
            const expectedVisit = {
                username: 'a new user'
            };
            visits.create = function() {
                return expectedVisit;
            };
            users.save = function(userToSave) {
                try {
                    assert.deepEqual(userToSave.username, 'a new user');
                    assert.deepEqual(userToSave.lastVisit, expectedVisit);
                    assert.deepEqual(userToSave.isOnline, true);
                    done();
                } catch (err) {
                    done(err);
                }
            };
            const app = createApp(
                eventsBus,
                mongo,
                visits,
                users
            );
            app.start().then(function() {
                eventsBus.publish('user_joined', {
                    username: 'a new user'
                });
            });
        });
    });

    describe('when running and user_joined event received with existing user', function() {
        it('should attach last visit to that user and put them online', function(done) {
            const mongo = createMongoFake();
            const eventsBus = createEventsBusFake();
            const users = createUsersFake();
            const visits = createVisistsFake();
            const expectedVisit = {
                username: 'an existing user'
            };
            const expectedUser = {
                username: 'an existing user',
                isOnline: false
            };
            visits.create = function() {
                return expectedVisit;
            };
            users.addExpectedRecord('an existing user', expectedUser)
            users.save = function(userToSave) {
                try {
                    assert.deepEqual(userToSave.username, 'an existing user');
                    assert.deepEqual(userToSave.lastVisit, expectedVisit);
                    assert.deepEqual(userToSave.isOnline, true);
                    done();
                } catch (err) {
                    done(err);
                }
            };
            const app = createApp(
                eventsBus,
                mongo,
                visits,
                users
            );
            app.start().then(function() {
                eventsBus.publish('user_joined', {
                    username: 'a new user'
                });
            });
        });
    });
});
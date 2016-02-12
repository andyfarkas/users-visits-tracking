'use strict';

const createApp = require('../src/app');
const createMongoFake = require('./fakes/mongo');
const createEventsBusFake = require('./fakes/events-bus');
const createUsersFake = require('./fakes/users');
const createVisistsFake = require('./fakes/visits');
const assert = require('assert');

describe('Application', function() {
    describe('when started', function() {
        it('should create new visit on user_joined event', function(done) {
            const mongo = createMongoFake();
            const eventsBus = createEventsBusFake();
            const users = createUsersFake();
            const visits = createVisistsFake();
            visits.save = function(visitToSave) {
                assert.deepEqual(visitToSave.username, 'a new user');
                done();
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
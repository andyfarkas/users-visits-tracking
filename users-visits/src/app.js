'use strict';

let eventsBus = require('./events');
let mongoose = require('mongoose');
let Visits = require('./visits')(mongoose);
let Users = require('./users')(mongoose);
let U = require('./utils');

mongoose.connect('mongodb://mongo/test', function(){
  console.log('Connected to MongoDB');
});

U.sequence([
    eventsBus.connect,
    eventsBus.attachTo('users_events'),
    function(usersEvents) {
        usersEvents.on('user_joined', onUserJoined);
        usersEvents.on('user_left', onUserLeft);
    }
])('amqp://rabbitmq');

let onUserJoined = U.sequence([
    U.maybeGetProperty('username'),
    Visits.createNewVisitForUser,
    Visits.save,
    function attachVisitToUser(visit) {
        return U.sequence([
            U.maybeGetProperty('username'),
            Users.tryFindByUsername,
            U.either(
                function returnExistingUser(existingUser) { return existingUser; },
                function createNewUser() { return Users.createNew(visit.username); }
            ),
            Users.updateWithLastVisit(visit),
            Users.putOnline,
            Users.save
        ])(visit);
    },
    console.log
]);

let onUserLeft = U.sequence([
    U.maybeGetProperty('username'),
    Users.tryFindByUsername,
    U.maybeOf,
    function endVisitOfUser(user) {
        return U.sequence([
            Visits.getLastVisitForUser,
            Visits.end,
            Visits.save,
            function updateWithLastVisit(visit) {
                return U.sequence([
                    Users.updateWithLastVisit(visit),
                    Users.putOffline,
                    Users.save
                ])(user);
            }
        ])(user);
    },
    console.log
]);



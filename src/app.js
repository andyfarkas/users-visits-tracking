'use strict';

let events = require('./events')('amqp://rabbitmq');
let mongoose = require('mongoose');
let Visits = require('./visits')(mongoose);
let Users = require('./users')(mongoose);
let U = require('./utils');

mongoose.connect('mongodb://mongo/test', function(){
  console.log('Connected to MongoDB');
});

events.on('user_joined', U.sequence([
    U.maybeGetProperty('username'),
    Visits.createNewVisitForUser,
    Visits.save,
    function(visit) {
        return U.sequence([
            U.maybeGetProperty('username'),
            Users.tryFindByUsername,
            U.either(
                function(existingUser) {return existingUser;},
                function() { return Users.createNew(visit.username);}
            ),
            Users.updateLastVisit(visit),
            Users.putOnline,
            Users.save
        ])(visit);
    },
    console.log
]));

events.on('user_left', U.sequence([
    U.maybeGetProperty('username'),
    Users.tryFindByUsername,
    U.maybeOf,
    function(user) {
        return U.sequence([
            Visits.getLastVisitForUser,
            Visits.end,
            Visits.save,
            function(visit) {
                return U.sequence([
                    Users.updateLastVisit(visit),
                    Users.putOffline,
                    Users.save
                ])(user);
            }
        ])(user);
    },
    console.log
]));



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
  function(visit) {
    return U.sequence([
      U.maybeGetProperty('username'),
      Users.tryFindByUsername,
      U.either(
        Users.updateExistingUserLastVisit(visit),
        Users.createNewUserWithLastVisit(visit)
      ),
      Users.saveUser
    ])(visit);
  }
]));



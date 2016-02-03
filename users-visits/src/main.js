'use strict';

const mongoose = require('mongoose');
const EventsBus = require('./../../modules/events-bus/src/events')(
    require('amqplib/callback_api'),
    'amqp://rabbitmq'
);
const Mongo = require('./mongo')(
    mongoose,
    'mongodb://mongo/test'
);

const VisitsModel = mongoose.model('Visit', {
    username: String,
    start: Date,
    end: Date
});

const UsersModel = mongoose.model('User', {
    username: String,
    isOnline: Boolean,
    timeSpentOnline: Number,
    lastVisit: {}
});

const Visits = require('./visits')(VisitsModel);
const Users = require('./users')(UsersModel);

const app = require('./app')(
    EventsBus,
    Mongo,
    Visits,
    Users
);

app.start();
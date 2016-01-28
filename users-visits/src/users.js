'use strict';

let Q = require('q');
let R = require('ramda');

module.exports = function(mongoose) {

    class Users {

    }

    const User = mongoose.model('User', {
        username: String,
        isOnline: Boolean,
        timeSpentOnline: Number,
        lastVisit: {}
    });

    Users.tryFindByUsername = function(username) {
        let deferred = Q.defer();

        User.findOne({
            username: username
        }, function(error, user) {
            deferred.resolve(user);
        });

        return deferred.promise;
    };

    Users.updateWithLastVisit = R.curry(function(visit, user) {
        user.lastVisit = visit;
        return user;
    });

    Users.putOnline = function(user) {
        user.isOnline = true;
        return user;
    };

    Users.putOffline = function(user) {
        user.isOnline = false;
        return user;
    };

    Users.createNew = function(username) {
        return new User({
            username: username,
            timeSpentOnline: 0,
            lastVisit: null,
            isOnline: true
        });
    };

    Users.save = function(user) {
        let deferred = Q.defer();

        user.save(function(error) {
            return deferred.resolve(user);
        });

        return deferred.promise;
    };

    return Users;
};
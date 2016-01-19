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

    Users.updateExistingUserLastVisit = R.curry(function(visit, user) {
        console.log('existing user');
        user.lastVisit = visit;
        user.isOnline = true;
        return user;
    });

    Users.createNewUserWithLastVisit = R.curry(function(visit, user) {
        console.log('new user');
        return new User({
            username: visit.username,
            timeSpentOnline: 0,
            lastVisit: visit,
            isOnline: true
        });
    });

    Users.saveUser = function(user) {
        let deferred = Q.defer();

        user.save(function(error) {
            return deferred.resolve(user);
        });

        return deferred.promise;
    };

    return Users;
};
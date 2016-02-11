'use strict';

let Q = require('q');

module.exports = function(User) {

    class Users {

        static findByUsername(username) {
            let deferred = Q.defer();

            User.findOne({
                username: username
            }, function(error, user) {
                deferred.resolve(user);
            });

            return deferred.promise;
        }

        static create(username) {
            return new User({
                username: username,
                timeSpentOnline: 0,
                lastVisit: null,
                isOnline: true
            });
        }

        static save(user) {
            let deferred = Q.defer();

            user.save(function(error) {
                return deferred.resolve(user);
            });

            return deferred.promise;
        }

    }

    return Users;
};
'use strict';

const Q = require('q');
const R = require('ramda');

class User {

    constructor(data) {
        const self = this;
        R.forEach(function(key) {
            self[key] = data[key];
        }, R.keys(data));
    }

}

module.exports = function() {

    const data = [];

    class Users {

        static addExpectedRecord(username, obj) {
            data[username] = obj;
        }

        static findByUsername(username) {
            let deferred = Q.defer();

            if (data[username]) {
                deferred.resolve(data[username]);
            } else {
                deferred.resolve(null);
            }

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
            const deferred = Q.defer();
            deferred.resolve(user);
            return deferred.promise;
        }

    }

    return Users;
};
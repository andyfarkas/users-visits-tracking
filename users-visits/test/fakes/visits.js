'use strict';

const Q = require('q');
const R = require('ramda');

class Visit {
    constructor(data) {
        const self = this;
        R.forEach(function(key) {
            self[key] = data[key];
        }, R.keys(data));
    }
}

module.exports = function() {

    class Visits {
        static create(username) {
            return new Visit({
                username: username,
                start: new Date()
            });
        }

        static save(visit) {
            let deferred = Q.defer();
            deferred.resolve(visit);
            return deferred.promise;
        }
    }

    return Visits;
};
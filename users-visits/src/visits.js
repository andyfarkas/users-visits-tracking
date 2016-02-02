'use strict';

let Q = require('q');

module.exports = function(Visit) {

    class Visits {

        static createNewVisitForUser(username) {
            return new Visit({
                username: username,
                start: new Date()
            });
        }

        static save(visit) {
            let deferred = Q.defer();

            visit.save(function(error, visit) {
                deferred.resolve(visit);
            });

            return deferred.promise;
        }

        static end(visit) {
            visit.end = new Date();
            return visit;
        }

        static getLastVisitForUser(user) {
            let deferred = Q.defer();

            Visit.findOne({
                _id: user.lastVisit._id
            }, function(error, visit) {
                return deferred.resolve(visit);
            });

            return deferred.promise;
        }

    }

    return Visits;
};
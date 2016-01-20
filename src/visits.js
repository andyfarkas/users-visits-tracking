'use strict';

let Q = require('q');

module.exports = function(mongoose) {

    const Visit = mongoose.model('Visit', {
        username: String,
        start: Date,
        end: Date
    });

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
                console.log('Visit has been saved');
                deferred.resolve(visit);
            });

            return deferred.promise;
        }

        static end(visit) {
            visit.end = new Date();
            console.log('ending the visit');
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
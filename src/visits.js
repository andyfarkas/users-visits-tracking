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

        static saveVist(visit) {
            let deferred = Q.defer();

            visit.save(function(error, visit) {
                console.log('Visit has been created');
                deferred.resolve(visit);
            });

            return deferred.promise;
        }

    }

    return Visits;
};
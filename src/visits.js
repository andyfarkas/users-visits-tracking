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
            let deferred = Q.defer();

            let visit = new Visit({
                username: username,
                start: new Date()
            });

            visit.save(function(error, visit) {
                if (error) {
                    return deferred.reject(new Error(error));
                }

                console.log('Visit has been created');
                deferred.resolve(visit);
            });

            return deferred.promise;
        }

    }

    return Visits;
};
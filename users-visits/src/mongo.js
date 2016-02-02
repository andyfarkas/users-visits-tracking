'use strict';

const Q = require('q');

module.exports = function(
    mongoose,
    host
) {

    class Mongo {

        static connect() {
            let deferred = Q.defer();
            mongoose.connect(host, function() {
                console.log('Connected to MongoDB.');
                return deferred.resolve();
            });

            return deferred.promise;
        }

    }


    return Mongo;
};
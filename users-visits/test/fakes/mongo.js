'use strict';

const Q = require('q');

module.exports = function() {

    class Mongo {

        static connect() {
            let deferred = Q.defer();
            deferred.resolve();
            return deferred.promise;
        }

    }


    return Mongo;
};
'use strict';

const Q = require('q');
const createEventsExchange = require('./events-exchange');

module.exports = function() {

    let exchange = null;

    class EventsBus {

        static connect(host) {
            var deferred = Q.defer();
            deferred.resolve({});
            return deferred.promise;
        }

        static attachToExchange(exchangeName, connection) {
            let deferred = Q.defer();
            exchange = createEventsExchange();
            deferred.resolve(exchange);
            return deferred.promise;
        }

        static publish(eventName, data) {
            exchange.publish(eventName, data);
        }

    }

    return EventsBus;
};


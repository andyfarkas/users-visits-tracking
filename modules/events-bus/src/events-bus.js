'use strict';

const Q = require('q');
const R = require('ramda');
const createEventsExchange = require('./events-exchange');

module.exports = function(amqp) {

    class EventsBus {

        static connect(host) {}

        static attachToExchange(exchange, connection){}

    }

    EventsBus.connect = function(host) {
        var deferred = Q.defer();
        let connect = function() {
            amqp.connect(host, function(error, connection) {
                if (error) {
                    return setTimeout(connect, 1000);
                }

                return deferred.resolve(connection);
            });
        };

        connect();

        return deferred.promise;
    };

    EventsBus.attachToExchange = R.curry(function(exchangeName, connection) {
        let deferred = Q.defer();

        connection.createChannel(function(error, channel) {
            channel.assertExchange(exchangeName, 'direct', { durable: false });
            channel.assertQueue('', { exclusive: true }, function(error, queue) {
                return deferred.resolve(createEventsExchange(
                    exchangeName,
                    channel,
                    queue
                ));
            });
        });

        return deferred.promise;
    });

    return EventsBus;
};


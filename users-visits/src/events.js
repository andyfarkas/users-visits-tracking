'use strict';

let amqp = require('amqplib/callback_api');
let Q = require('q');
let R = require('ramda');
var U = require('./utils');

class EventsBus {

    static connect(host) {}

    static attachTo(){}

}

EventsBus.connect = R.curry(function(host) {
    var deferred = Q.defer();

    let connect = function() {
        amqp.connect(host, function(error, connection) {
            console.log('trying to connect to RabbitMQ ...');
            if (error) {
                return setTimeout(connect, 1000);
            }

            console.log('Connected to RabbitMQ');

            return deferred.resolve(connection);
        });
    };

    connect();

    return deferred.promise;
});

EventsBus.attachTo = R.curry(function(exchange, connection) {
    let deferred = Q.defer();

    connection.createChannel(function(error, channel) {
        channel.assertExchange(exchange, 'direct', { durable: false });
        channel.assertQueue('', { exclusive: true }, function(error, queue) {
            return deferred.resolve(new Events(
               exchange,
                channel,
                queue
            ));
        });
    });

    return deferred.promise;
});

class Events {

    constructor(exchange, channel, queue) {

        let self = this;

        let getJsonFromPayload = function(payload) {
            let message = payload.content.toString();
            let data = {};
            try {
                data = JSON.parse(message);
            } catch (e) {
                data = null;
            }

            return data;
        };

        let handleMessage = function(payload) {
            U.sequence([
                getJsonFromPayload,
                U.maybeOf,
                function(jsonMessage) {
                    U.sequence([
                        R.prop('fields'),
                        R.prop('routingKey'),
                        function(eventName) {
                            return U.sequence([
                                R.prop(eventName),
                                U.maybeOf
                            ])(self.listeners);
                        },
                        R.map(function(callback) {
                            callback(jsonMessage);
                        })
                    ])(payload);
                }
            ])(payload);
        };

        this.channel = channel;
        this.queue = queue;
        this.exchange = exchange;
        this.channel.consume(queue.queue, handleMessage, { noAck: true });
        this.listeners = {};
    }

    on(eventName, callback) {
        let self = this;
        this.listeners[eventName] = U.sequence([
            R.prop(eventName),
            U.ifFalsy(function() { return []; }),
            function(listeners) {
                listeners.push(callback);
                self.channel.bindQueue(self.queue.queue, self.exchange, eventName);
                return listeners;
            }
        ])(this.listeners);
    }

}

module.exports = EventsBus;


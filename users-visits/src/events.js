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

        this.channel = channel;
        this.queue = queue;
        this.exchange = exchange;
        this.listeners = {};
        this.channel.consume(queue.queue, handleMessage(this.listeners), { noAck: true });
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

let handleMessage = R.curry(function(listeners, payload) {
    return U.sequence([
        getJsonFromPayload,
        function sendJsonToListeners(jsonMessage) {
            return U.sequence([
                getEventNameFromPayload,
                getListenersForEvent(listeners),
                notifyListeners(jsonMessage)
            ])(payload);
        }
    ])(payload);
});

let getJsonFromPayload = function(payload) {
    let message = payload.content.toString();
    let data = {};
    try {
        data = JSON.parse(message);
    } catch (e) {
        data = null;
    }

    return U.maybeOf(data);
};

let getEventNameFromPayload = U.sequence([
    R.prop('fields'),
    R.prop('routingKey')
]);

let getListenersForEvent = R.curry(function(listeners, eventName) {
    return U.sequence([
        R.prop(eventName),
        U.maybeOf
    ])(listeners);
});

let notifyListeners = R.curry(function(jsonMessage, listeners) {
    return R.map(function(callback) {
        return callback(jsonMessage);
    }, listeners);
});

module.exports = EventsBus;


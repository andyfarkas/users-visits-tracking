'use strict';

const R = require('ramda');
const U = require('../../utils/index');

module.exports = function(exchangeName, channel, queue) {

    const listeners = [];
    channel.consume(queue.queue, handleMessage(listeners), { noAck: true });

    class EventsExchange {

        static on(eventName, callback) { }

    }

    EventsExchange.on = R.curry(function(eventName, callback) {
        listeners[eventName] = U.sequence([
            R.prop(eventName),
            U.default([]),
            function(listeners) {
                if (listeners.length < 1) {
                    channel.bindQueue(queue.queue, exchangeName, eventName);
                }
                listeners.push(callback);
                return listeners;
            }
        ])(listeners);
    });

    return EventsExchange;
};

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
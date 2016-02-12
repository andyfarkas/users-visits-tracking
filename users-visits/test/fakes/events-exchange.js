'use strict';

const R = require('ramda');

module.exports = function() {

    const listeners = [];

    class EventsExchange {

        static on(eventName, callback) {
            if (!listeners[eventName]) {
                listeners[eventName] = [];
            }
            listeners[eventName].push(callback);
        }

        static publish(eventName, data) {
            if (listeners[eventName]) {
                listeners[eventName].forEach(function(callback) {
                    callback(data);
                });
            }
        }
    }

    return EventsExchange;
};
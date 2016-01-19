'use strict';

let amqp = require('amqplib/callback_api');
let R = require('ramda');

class Events {

    constructor(host) {
        this.host = host;
        this.listeners = {};

        let self = this;
        let fireEvent = function(payload) {
            if (self.listeners[payload.fields.routingKey]) {
                self.listeners[payload.fields.routingKey].forEach(function(callback){
                    let message = payload.content.toString();
                    let data = {};
                    try {
                        data = JSON.parse(message);
                    } catch (e) {
                        data = message;
                    }
                    callback(data);
                });
            }
        };

        amqp.connect(host, function(error, conn) {
            if (error) {
                return console.log(error);
            }
            console.log('Connected to RabbitMQ');

            conn.createChannel(function(error, ch) {
                if (error) {
                    return console.log(error);
                }
                console.log('Channel created');

                ch.assertExchange('users', 'topic', {durable: false});

                ch.assertQueue('', {exclusive: true}, function(error, q) {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Queue asserted');

                    ch.bindQueue(q.queue, 'users', 'user_joined');
                    ch.bindQueue(q.queue, 'users', 'user_left');
                    ch.consume(q.queue, fireEvent, {noAck: true});
                });
            });
        });
    }

    on(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }

        this.listeners[eventName].push(callback);
    }
}

module.exports = function(host) {
    return new Events(host);
};


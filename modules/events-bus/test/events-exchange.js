'use strict';

const createEventsExchange = require('../src/events-exchange');
const mock = require('./../../mockz/mockz').mock;
const assert = require('assert');

describe('EventsExchange', function() {
    describe('on()', function() {
        it('should bind channel to queue for an event', function() {
            const queueFake = {
                queue: {

                }
            };
            const channelMock = mock({});
            channelMock.method('consume');
            channelMock.method('bindQueue').once().with(queueFake.queue, 'exchange-name', 'event-name');
            const EventsExchange = createEventsExchange(
                'exchange-name',
                channelMock.getMock(),
                queueFake
            );

            EventsExchange.on('event-name', function(){});
            channelMock.verify();
        });

        it('should bind channel to queue only once for the same event', function() {
            const queueFake = {
                queue: {

                }
            };
            const channelMock = mock({});
            channelMock.method('consume');
            channelMock.method('bindQueue').once().with(queueFake.queue, 'exchange-name', 'event-name');
            const EventsExchange = createEventsExchange(
                'exchange-name',
                channelMock.getMock(),
                queueFake
            );

            EventsExchange.on('event-name', function(){});
            EventsExchange.on('event-name', function(){});
            channelMock.verify();
        });

        it('should notify event listeners if the event was fired', function(done) {
            const queueFake = { queue: { } };
            let sendPayloadToEventBus = function(){};
            const channelMock = mock({
                consume: function(queue, callback, options) {
                     sendPayloadToEventBus = callback;
                }
            });
            channelMock.method('bindQueue');
            const EventsExchange = createEventsExchange(
                'exchange-name',
                channelMock.getMock(),
                queueFake
            );

            const expectedMessage = {
                message: 'hello'
            };
            EventsExchange.on('event-name', function(message){
                assert.deepEqual(message, expectedMessage);
                done();
            });

            const payload = {
                content: {
                    toString: function() {
                        return '{"message": "hello"}';
                    }
                },
                fields: {
                    routingKey: 'event-name'
                }
            };

            sendPayloadToEventBus(payload);
        });
    });
});


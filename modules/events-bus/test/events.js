'use strict';


describe('EventsBus', function() {
    describe('connect()', function() {
        it('should connect to host using the amqp client', function() {
            const mock = {
                connect: function(host, callback) {
                    console.log('connected');
                }
            };
            const EventsBus = require('../src/events')(mock);

            EventsBus.connect('amqp__url');
        })
    })
});
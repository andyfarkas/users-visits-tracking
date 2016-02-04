'use strict';

const R = require('ramda');
const assert = require('assert');

const each = R.addIndex(R.forEach);

class Mockz {

    static expect(method) {

        let obj = {};
        let calls = [];
        obj[method] = function() {
            calls.push({
                args: arguments
            });
        };

        let expectedArguments = undefined;
        let expectedNumberOfCalls;

        return {
            once: function() {
                expectedNumberOfCalls = 1;
                return {
                    with: function() {
                        expectedArguments = arguments;
                    }
                }
            },

            verify: function() {
                if (calls.length !== expectedNumberOfCalls) {
                    throw Error('Expected "' + method + '" to be called ' + expectedNumberOfCalls + ' times. But was called ' + calls.length + ' times.');
                }

                if (expectedArguments !== undefined) {
                    each(function(value, index) {
                        assert.deepEqual(value, calls[0].args[index]);
                    }, expectedArguments);
                }
            },

            getMock: function() {
                return obj;
            }
        }

    }

}

module.exports = Mockz;
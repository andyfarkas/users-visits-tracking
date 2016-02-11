'use strict';

const R = require('ramda');
const assert = require('assert');

const each = R.addIndex(R.forEach);

class Mockz {

    static mock(obj) {

        let methods = {};
        let calls = {};

        class Mocked {

            static method(method) {

                obj[method] = function() {
                    if (!calls[method]) {
                        calls[method] = [];
                    }

                    calls[method].push({
                        args: arguments
                    })
                };

                if (!methods[method]) {
                    methods[method] = [];
                }

                class MockedMethod {

                    static once() {

                        methods[method].push({
                            calls: 1
                        });

                        let index = methods[method].length - 1;

                        class CallsNumber {

                            static with() {
                                methods[method][index].args = arguments;
                            }

                        }

                        return CallsNumber;
                    }

                }

                return MockedMethod;

            }

            static getMock() {
                return obj;
            }

            static verify() {
                R.forEach(function(method) {
                    let methodExpectedCalls = methods[method];
                    each(function(call, index) {
                        if (!calls[method]) {
                            throw Error('Method "'+method+'()" expected to be called.');
                        }

                        if (calls[method].length > methods[method].length) {
                            throw Error('Method "'+method+'()" expected to be called ' + (methods[method].length) + ' times, but called ' + calls[method].length + ' times.');
                        }

                        if (!calls[method][index]) {
                            throw Error('Method "'+method+'()" expected to be called ' + (index+1) + ' times, but called ' + index + ' times.');
                        }

                        if (call.args) {
                            let expectedArgs = R.keys(call.args);
                            R.forEach(function(argKey) {
                                assert.deepEqual(calls[method][index].args[argKey], call.args[argKey]);
                            }, expectedArgs);
                        }

                    }, methodExpectedCalls);
                }, R.keys(methods));
                //
                //each(methods, function(value, key) {
                //    console.log(key);
                //});
            }

        }

        return Mocked;
    }

}

module.exports = Mockz;
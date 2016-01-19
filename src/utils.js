'use strict';

let R = require('ramda');

class Utils {

}

class Maybe {

    static Just(value) {
        return new Just(value);
    }

    static Nothing() {
        return new Nothing();
    }

    static of(value) {
        if (value) {
            return Maybe.Just(value);
        }

        return Maybe.Nothing();
    }

}

class Just {

    constructor(value) {
        this.value = value;
    }

    map(f) {
        console.log('mapping Just');
        return f(this.value);
    }

}

class Nothing {

    map(f) {
        console.log('mapping Nothing');
        return this;
    }

}

Utils.maybeGetProperty = R.curry(function(key, object) {
    return Maybe.of(R.prop(key, object));
});

Utils.then = R.curry(function(f, result) {

    if (result instanceof Just || result instanceof Nothing) {
        return result.map(f);
    }

    if (result.__proto__.toString() == '[object Promise]') {
        return result.then(f);
    }

    return f(result);
});

Utils.sequence = function(arr) {
    return R.apply(R.pipe, arr.map(function(f) {
        return Utils.then(f);
    }));
};

Utils.either = R.curry(function(truthy, falsy, value) {
    if (value) {
        return truthy(value);
    }

    return falsy(value);
});

module.exports = Utils;
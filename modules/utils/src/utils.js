'use strict';

const R = require('ramda');

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
        return f(this.value);
    }

}

class Nothing {

    map(f) {
        return this;
    }

}

Utils.maybeGetProperty = R.curry(function(key, object) {
    return Maybe.of(R.prop(key, object));
});

Utils.then = R.curry(function(f, parameter) {
    if (parameter instanceof Just || parameter instanceof Nothing) {
        return parameter.map(f);
    }

    if (parameter && parameter.__proto__.toString() == '[object Promise]') {
        return parameter.then(f);
    }

    let result = f(parameter);
    if (!result) {
        return false;
    }

    return result;
});

Utils.sequence = function(arr) {
    return R.apply(R.pipe, arr.map(function(f, index) {
        if(typeof f !== 'function') {
            throw Error('Function expected but got: ' + typeof f);
        }

        if (f.length == 0) {
            return f;
        }
        return Utils.then(f);
    }));
};

Utils.either = R.curry(function(truthy, falsy, value) {
    if (value) {
        return truthy(value);
    }

    return falsy(value);
});

Utils.default = R.curry(function(defaultValue, value) {
    if (value) {
        return value;
    }

    return defaultValue;
});

Utils.ifFalsy = function(f, value) {
    return Utils.either(function(){
        return value;
    }, f);
};

Utils.maybeOf = function(value) {
    return Maybe.of(value);
};

module.exports = Utils;
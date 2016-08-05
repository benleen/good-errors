'use strict';

// Load modules

const Stream = require('stream');


// Declare internals

const internals = {};


class Errors extends Stream.Transform {
    constructor(options) {

        options = Object.assign({}, options, {
            objectMode: true
        });
        super(options);
    }

    _transform(data, enc, next) {

        if (data.data instanceof Error) {
            internals.convertErrorProperties(data.data);
        }
        else if (typeof data.data === 'object') {
            internals.iterate(data.data, '');
        }

        return next(null, data);
    }
}


internals.convertErrorProperties = function (err) {

    err.stringifyable = {
        name: err.name,
        stack: err.stack,
        message: err.message
    };
};


internals.iterate = function (obj, stack) {

    const props = Object.keys(obj);
    for (let i = 0; i < props.length; ++i) {
        const prop = props[i];
        if (obj[prop] instanceof Error) {
            internals.convertErrorProperties(obj[prop]);
        }
        else if (typeof obj[prop] === 'object') {
            internals.iterate(obj[prop], stack + '.' + prop);
        }
    }
};


module.exports = Errors;

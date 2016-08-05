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

        internals.iterate(data.data);

        return next(null, data);
    }
}


internals.addStringifyable = function (err) {

    err.stringifyable = {
        name: err.name,
        stack: err.stack,
        message: err.message
    };
};


internals.iterate = function (obj) {

    if (obj && typeof obj === 'object') {

        if (obj instanceof Error) {
            internals.addStringifyable(obj);
        }

        const props = Object.keys(obj);
        for (let i = 0; i < props.length; ++i) {
            internals.iterate(obj[props[i]]);
        }
    }
};


module.exports = Errors;

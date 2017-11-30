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

        internals.deepAddStringifyAble(data.data);

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


internals.deepAddStringifyAble = function (obj, visited) {

    visited = visited || [];

    if (visited.indexOf(obj) >= 0) {
        return;
    }

    visited.push(obj);

    if (obj && typeof obj === 'object') {

        if (obj instanceof Error) {
            internals.addStringifyable(obj);
        }

        const props = Object.keys(obj);
        for (let i = 0; i < props.length; ++i) {
            internals.deepAddStringifyAble(obj[props[i]], visited);
        }
    }
};


module.exports = Errors;

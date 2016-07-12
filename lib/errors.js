'use strict';

const Stream = require('stream');

class Errors extends Stream.Transform {
    constructor(options) {

        options = Object.assign({}, options, {
            objectMode: true
        });
        super(options);
    }

    _transform(data, enc, next) {

        if (data.data instanceof Error) {
            data.data = { name: data.data.name, stack: data.data.stack, message: data.data.message };
        }
        return next(null, data);
    }
}

module.exports = Errors;

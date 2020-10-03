'use strict';

// Load the modules

const GoodErrors = require('..');

const Code = require('@hapi/code');
const Lab = require('@hapi/lab');
const Boom = require('@hapi/boom');
const Hapi = require('@hapi/hapi');
const Good = require('@hapi/good');
const Stream = require('stream');

const lab = (exports.lab = Lab.script());
const expect = Code.expect;
const describe = lab.describe;
const it = lab.it;

const internals = {
    buildSampleError: function () {

        const err = new Error('foo');
        err.stack = 'Some\nstack';
        return err;
    },
    sampleErrorAsStringifyable: {
        name: 'Error',
        stack: 'Some\nstack',
        message: 'foo'
    },
    goodErrorStreamInput: function (streamInput) {

        return new Promise((resolve, reject) => {

            const stream = new GoodErrors({});
            stream.on('readable', () => {

                return resolve(stream.read());
            });
            stream.end(streamInput);
        });
    }
};

describe('Errors', () => {

    it('add stringifyable property to error objects on a data propery', async () => {

        const input = { data: internals.buildSampleError() };
        const result = await internals.goodErrorStreamInput(input);
        expect(result.data.stringifyable).to.equal(
            internals.sampleErrorAsStringifyable
        );
    });

    it('add stringifyable property to error objects on the error property', async () => {

        const input = { error: internals.buildSampleError() };
        const result = await internals.goodErrorStreamInput(input);
        expect(result.error.stringifyable).to.equal(
            internals.sampleErrorAsStringifyable
        );
    });

    it('add stringifyable property to boom wrapped error objects', async () => {

        const input = { data: Boom.boomify(internals.buildSampleError()) };
        const result = await internals.goodErrorStreamInput(input);
        expect(result.data.isBoom).to.equal(true);
        expect(result.data.stringifyable).to.equal(
            internals.sampleErrorAsStringifyable
        );
    });

    it('add stringifyable property to errors nested in a passed error object (boom error)', async () => {

        const input = {
            data: Boom.internal('message', {
                err: internals.buildSampleError(),
                some: 'other',
                important: 'props'
            })
        };
        const result = await internals.goodErrorStreamInput(input);
        expect(result.data.isBoom).to.equal(true);
        expect(result.data.data.some).to.equal('other');
        expect(result.data.data.important).to.equal('props');
        expect(result.data.data.err.stringifyable).to.equal(
            internals.sampleErrorAsStringifyable
        );
    });

    it('leaves non error data untouched', async () => {

        const input = { data: { a: 1 } };
        const result = await internals.goodErrorStreamInput(input);
        expect(result).to.equal(input);
    });

    it('add stringifyable property to Error objects deeper in the passed object', async () => {

        const input = {
            data: { a: 1, b: { c: 'x', d: internals.buildSampleError() } }
        };
        const result = await internals.goodErrorStreamInput(input);
        expect(result.data.a).to.equal(1);
        expect(result.data.b.c).to.equal('x');
        expect(result.data.b.d.stringifyable).to.equal(
            internals.sampleErrorAsStringifyable
        );
    });

    it('leaves non objects untouched', async () => {

        const input = 'test';
        const result = await internals.goodErrorStreamInput(input);
        expect(result).to.equal(input);
    });

    it('accepts null without throwing', async () => {

        const input = null;
        await internals.goodErrorStreamInput(input);
    });

    it('accepts objects with null properties', async () => {

        const input = { x: null };
        const result = await internals.goodErrorStreamInput(input);
        expect(result).to.equal(input);
    });

    it('accepts undefined without throwing', async () => {

        const input = undefined;
        await internals.goodErrorStreamInput(input);
    });

    it('accepts objects with undefined properties', async () => {

        const input = { x: undefined };
        const result = await internals.goodErrorStreamInput(input);
        expect(result).to.equal(input);
    });

    it('accepts objects with circular dependencies', async () => {

        const input = {
            data: { a: 1, b: { c: 'x', d: internals.buildSampleError() } }
        };
        input.data.b.circ = input.data;
        const result = await internals.goodErrorStreamInput(input);
        expect(result.data).to.exist();
        expect(result.data.b.d.stringifyable).to.equal({
            name: 'Error',
            stack: 'Some\nstack',
            message: 'foo'
        });
    });

    it('ensures basic compatibility with hapi, good & good-squeeze for errors', async () => {

        const server = new Hapi.server();

        class ValidationWriteStream extends Stream.Writable {
            constructor(options) {

                options = Object.assign({}, options, {
                    objectMode: true
                });
                super(options);
            }
            _write(data, enc, next) {

                expect(data.error.stringifyable).to.exist();
                expect(data.error.stringifyable.message).to.equal('Boom!');
                expect(data.error.stringifyable.name).to.equal('Error');
                expect(data.error.stringifyable.stack).to.startWith(
                    'Error: Boom!\n    at handler'
                );

                return next(null, data);
            }
        }

        const options = {
            reporters: {
                reporter: [
                    {
                        module: '@hapi/good-squeeze',
                        name: 'Squeeze',
                        args: [{ error: '*' }]
                    },
                    { module: GoodErrors },
                    { module: ValidationWriteStream }
                ]
            }
        };

        await server.register({ plugin: Good, options });
        await server.start();
        await server.route({
            method: 'GET',
            path: '/',
            handler: () => Error('Boom!')
        });
        await server.inject('/');

    });
});

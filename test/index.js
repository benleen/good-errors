'use strict';

// Load modules

const GoodErrors = require('..');

const Code = require('code');
const Lab = require('lab');
const Boom = require('boom');
const Hapi = require('hapi');
const Good = require('good');
const Stream = require('stream');

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const describe = lab.describe;
const it = lab.it;

describe('Errors', () => {

    it('add stringifyable property to error objects on a data propery', () => {

        const stream = new GoodErrors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return;
            }

            expect(result.data.stringifyable).to.equal({ name: 'Error', stack: 'Some\nstack', message: 'foo' });
        });

        const err = new Error('foo');
        err.stack = 'Some\nstack';
        stream.end({ data: err });
    });

    it('add stringifyable property to error objects on the error property', () => {

        const stream = new GoodErrors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return;
            }

            expect(result.error.stringifyable).to.equal({ name: 'Error', stack: 'Some\nstack', message: 'foo' });
        });

        const error = new Error('foo');
        error.stack = 'Some\nstack';
        stream.end({ error });
    });

    it('add stringifyable property to boom wrapped error objects', () => {

        const stream = new GoodErrors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return;
            }

            expect(result.data.isBoom).to.equal(true);
            expect(result.data.stringifyable).to.equal({ name: 'Error', stack: 'Some\nstack', message: 'foo' });
        });

        let err = new Error('foo');
        err.stack = 'Some\nstack';
        err = Boom.boomify(err);
        stream.end({ data: err });
    });

    it('add stringifyable property to errors nested in a passed error object (boom error)', () => {

        const stream = new GoodErrors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return;
            }

            expect(result.data.isBoom).to.equal(true);
            expect(result.data.data.some).to.equal('other');
            expect(result.data.data.important).to.equal('props');
            expect(result.data.data.err.stringifyable).to.equal({ name: 'Error', stack: 'stack', message: 'some error' });
        });

        const err = new Error('some error');
        err.stack = 'stack';
        const b = Boom.internal('message', { err, some: 'other', important: 'props' });
        stream.end({ data: b });
    });

    it('leaves non error data untouched', () => {

        const stream = new GoodErrors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return;
            }

            expect(result).to.equal({ data: { a: 1 } });
        });

        stream.end({ data: { a: 1 } });
    });

    it('add stringifyable property to Error objects deeper in the passed object', () => {

        const stream = new GoodErrors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return;
            }

            expect(result.data.a).to.equal(1);
            expect(result.data.b.c).to.equal('x');
            expect(result.data.b.d.stringifyable).to.equal({ name: 'Error', stack: 'Some\nstack', message: 'foo' });
        });

        const err = new Error('foo');
        err.stack = 'Some\nstack';
        stream.end({ data: { a: 1, b: { c: 'x', d: err } } });
    });

    it('leaves non objects untouched', () => {

        const stream = new GoodErrors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return;
            }

            expect(result).to.equal('test');
        });

        stream.end('test');
    });


    it('accepts null', () => {

        const stream = new GoodErrors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return;
            }

            expect(result).to.equal(null);
        });

        stream.end(null);
    });

    it('accepts objects with null properties', () => {

        const stream = new GoodErrors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return;
            }

            expect(result).to.equal({ x: null });
        });

        stream.end({ x: null });
    });


    it('accepts undefined', () => {

        const stream = new GoodErrors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return;
            }

            expect(result).to.equal(undefined);
        });

        stream.end(undefined);
    });

    it('accepts objects with undefined properties', () => {

        const stream = new GoodErrors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return;
            }

            expect(result).to.equal({ x: undefined });
        });

        stream.end({ x: undefined });
    });

    it('accepts objects with circular dependencies', () => {

        const stream = new GoodErrors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return;
            }

            expect(result.data).to.exist();
            expect(result.data.b.d.stringifyable).to.equal({ name: 'Error', stack: 'Some\nstack', message: 'foo' });
        });

        const err = new Error('foo');
        err.stack = 'Some\nstack';
        const data = { a: 1, b: { c: 'x', d: err } };
        data.b.circ = data;
        stream.end({ data });
    });

    it('ensures basic compatibility with hapi, good & good-squeeze for errors', async () => {

        const server = new Hapi.server();

        class ValidationWriteStream extends Stream.Writable{
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
                expect(data.error.stringifyable.stack).to.startWith('Error: Boom!\n    at handler');

                return next(null, data);
            };
        }

        const options = {
            reporters: {
                reporter: [{ module: 'good-squeeze', name: 'Squeeze', args: [{ error: '*' }] },
                    { module: GoodErrors },
                    { module: ValidationWriteStream }]
            }
        };

        await server.register({ plugin: Good, options });
        await server.start();
        await server.route({ method: 'GET', path: '/', handler: () => Error('Boom!') });
        await server.inject('/');

    });
});

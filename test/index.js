'use strict';

// Load modules

const Errors = require('..').Errors;

const Code = require('code');
const Lab = require('lab');
const Boom = require('boom');

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const describe = lab.describe;
const it = lab.it;

describe('Errors', () => {

    it('add stringifyable property to error objects', (done) => {

        const stream = new Errors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return done();
            }

            expect(result.data.stringifyable).to.equal({ name: 'Error', stack: 'Some\nstack', message: 'foo' });
        });

        const err = new Error('foo');
        err.stack = 'Some\nstack';
        stream.end({ data: err });
    });

    it('add stringifyable property to boom wrapped error objects', (done) => {

        const stream = new Errors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return done();
            }

            expect(result.data.isBoom).to.equal(true);
            expect(result.data.stringifyable).to.equal({ name: 'Error', stack: 'Some\nstack', message: 'foo' });
        });

        let err = new Error('foo');
        err.stack = 'Some\nstack';
        err = Boom.wrap(err);
        stream.end({ data: err });
    });

    it('add stringifyable property to errors nested in a passed error object (boom error)', (done) => {

        const stream = new Errors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return done();
            }

            expect(result.data.isBoom).to.equal(true);
            expect(result.data.data.some).to.equal('other');
            expect(result.data.data.important).to.equal('props');
            expect(result.data.data.err.stringifyable).to.equal({ name: 'Error', stack: 'stack', message: 'some error' });
        });

        const err = new Error('some error');
        err.stack = 'stack';
        const b = Boom.internal('message', { err: err, some: 'other', important: 'props' });
        stream.end({ data: b });
    });

    it('leaves non error data untouched', (done) => {

        const stream = new Errors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return done();
            }

            expect(result).to.equal({ data: { a: 1 } });
        });

        stream.end({ data: { a: 1 } });
    });

    it('add stringifyable property to Error objects deeper in the passed object', (done) => {

        const stream = new Errors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return done();
            }

            expect(result.data.a).to.equal(1);
            expect(result.data.b.c).to.equal('x');
            expect(result.data.b.d.stringifyable).to.equal({ name: 'Error', stack: 'Some\nstack', message: 'foo' });
        });

        const err = new Error('foo');
        err.stack = 'Some\nstack';
        stream.end({ data: { a: 1, b: { c: 'x', d: err } } });
    });

    it('leaves non objects untouched', (done) => {

        const stream = new Errors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return done();
            }

            expect(result).to.equal('test');
        });

        stream.end('test');
    });


    it('accepts null', (done) => {

        const stream = new Errors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return done();
            }

            expect(result).to.equal(null);
        });

        stream.end(null);
    });

    it('accepts objects with null properties', (done) => {

        const stream = new Errors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return done();
            }

            expect(result).to.equal({ x: null });
        });

        stream.end({ x: null });
    });


    it('accepts undefined', (done) => {

        const stream = new Errors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return done();
            }

            expect(result).to.equal(undefined);
        });

        stream.end(undefined);
    });

    it('accepts objects with undefined properties', (done) => {

        const stream = new Errors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return done();
            }

            expect(result).to.equal({ x: undefined });
        });

        stream.end({ x: undefined });
    });

    it('accepts objects with circular dependencies', (done) => {

        const stream = new Errors({});

        stream.on('readable', () => {

            const result = stream.read();

            if (!result) {
                return done();
            }

            expect(result.data.a).to.equal(1);
            expect(result.data.b.c).to.equal('x');
            expect(result.data.b.d.stringifyable).to.equal({ name: 'Error', stack: 'Some\nstack', message: 'foo' });
        });

        const err = new Error('foo');
        err.stack = 'Some\nstack';
        const data = { a: 1, b: { c: 'x', d: err } };
        data.b.circ = data;
        stream.end({ data });
    });
});

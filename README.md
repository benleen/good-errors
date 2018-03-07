# good-errors
Utility stream to transform errors to object literals.

[![Build Status](https://travis-ci.org/benleen/good-errors.svg?branch=master&style=flat)](https://travis-ci.org/benleen/good-errors)

Example usage as hapijs server options:
```
const options = {
    ops: {
        interval: 1000
    },
    reporters: {
        consoleReporter: [
        {
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ log: '*', response: '*' }]
        },
        {
            module: 'good-errors',
            name: 'Errors'
        },
        {
            module: 'good-console'
        },
        'stdout',
        ],
    },
}
```
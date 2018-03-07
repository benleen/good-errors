# good-errors
Utility stream to transform errors to object literals.

[![Build Status](https://travis-ci.org/benleen/good-errors.svg?branch=master&style=flat)](https://travis-ci.org/benleen/good-errors)

Example usage as hapijs server options:
```
const options = {
<<<<<<< HEAD
    ops: {
        interval: 1000
    },
=======
>>>>>>> Ensure compatibility with Hapi 17. Exporting the Errors module as the main module. Updated multiple dependencies
    reporters: {
        consoleReporter: [
        {
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ log: '*', response: '*' }]
        },
        {
<<<<<<< HEAD
            module: 'good-errors',
            name: 'Errors'
=======
            module: 'good-errors'
>>>>>>> Ensure compatibility with Hapi 17. Exporting the Errors module as the main module. Updated multiple dependencies
        },
        {
            module: 'good-console'
        },
        'stdout',
        ],
    },
}
```
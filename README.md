# good-errors

Utility stream to transform errors to object literals.

[![Build Status](https://travis-ci.org/benleen/good-errors.svg?branch=master&style=flat)](https://travis-ci.org/benleen/good-errors)

Example usage as hapijs server options:

```javascript
const options = {
    reporters: {
        consoleReporter: [
            {
                module: '@hapi/good-squeeze',
                name: 'Squeeze',
                args: [{ log: '*', response: '*' }]
            },
            {
                module: '@hapi/good-errors'
            },
            {
                module: '@hapi/good-console'
            },
            'stdout'
        ]
    }
};
```

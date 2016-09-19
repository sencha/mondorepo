var configure = require('./index').configure;
configure({
    resolve: {
        alias: {
            'xyz': '/some/dir'
        }
    }
});
require('xyz');


/*let configure = require('./configure');
let assert = require('assert');

function resolve(path, alias) {
    return configure.resolve(path, {
        alias: alias
    });
}

describe('Configure', () => {
    it('Should have a configure method', () => {
        assert('configure' in require);
    });
});

describe('Resolve', () => {
    describe('Alias', () => {
        it('Module lazy match', () => {
            let result = resolve('xyz', {
                xyz: '/some/dir'
            });
            assert.equal('/some/dir', result);
        });

        it('Module exact match', () => {
            let result = resolve('xyz', {
                xyz$: '/some/dir'
            });
            assert.equal('/some/dir', result);
        });

        it('File lazy match', () => {
            let result = resolve('xyz/file.js', {
                xyz: '/some/dir'
            });
            assert.equal('/some/dir/file.js', result);
        });

        it('File exact match', () => {
            let result = resolve('xyz/file.js', {
                xyz$: '/some/dir'
            });
            assert.equal('xyz/file.js', result);
        });
    });
});
*/

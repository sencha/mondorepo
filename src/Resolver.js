"use strict";
const Path = require('path');
const deepExtend = require('deep-extend');

class Resolver {
    constructor() {
        this.config = {
            resolve: {
                alias: {}
            }
        };
    }

    alias(id) {
        let aliases = this.config.resolve.alias;
        let slash = id.indexOf('/');
        let scopeTest = id.match(/^(@.*?\/.*)/);
        let scopePathTest = id.match(/^(@.*?\/.*?)\/(.*)/);

        if (scopePathTest) {  //Scoped package with a path to a file
            let packageName = scopePathTest[1];
            let value = aliases[packageName];
            id = Path.resolve(value, scopePathTest[2]);
        } else if (slash < 0 || scopeTest) {
            let value = aliases[id] || aliases[`${id}$`];
            if (value) {
                return value;
            }
        } else {
            let packageName = id.substr(0, slash);
            let value = aliases[packageName];

            if (value) {
                id = Path.resolve(value, id.substr(slash + 1));
            }
        }
        return id;
    }


    addAliases(aliases) {
        deepExtend(this.config.resolve.alias, aliases);
    }

    resolve(id) {
        id = this.alias(id);
        return id;
    }
}

module.exports = Resolver;

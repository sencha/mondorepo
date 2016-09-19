"use strict";
let _path = require('path'),
    deepExtend = require('deep-extend'),
    config = {};

function _alias(id) {
    let aliases = config && config.resolve && config.resolve.alias;
    if (aliases) {
        let slash = id.indexOf('/');

        if (slash < 0) {
            let value = aliases[id] || aliases[`${id}$`];
            if (value) {
                return value;
            }
        } else {
            let packageName = id.substr(0, slash),
                value = aliases[packageName];

            if (value) {
                id = _path.resolve(value, id.substr(slash + 1));
            }
        }
    }
    return id;
}

module.exports = {
    configure(cfg) {
        config = deepExtend(config, cfg);
    },

    get config() {
        return config;
    },

    resolve(id) {
        id = _alias(id);
        return id;
    }
};

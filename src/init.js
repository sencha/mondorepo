"use strict";
let _require = module.constructor.prototype.require,
    path = require('path'),
    utils = require('./utils'),
    parser = require('./parser'),
    resolver = require('./resolver'),
    logger = require('./logger'),
    initialized = false;

module.exports = (cfg, root) => {
    // Run all mondo requirements first before patching the system
    // TODO: determine if we want this before or after the require patch

    logger.info('------------------------------------------');
    if (!cfg) {
        let manifestFile = utils.getManifestFile(root),
            manifest = manifestFile ? require(manifestFile) : {},
            results = parser.parse(manifest, path.dirname(manifestFile));
        cfg = results;

        logger.info(`Mondo Init with ${manifestFile}`);
    } else if (typeof cfg === 'function') {
        cfg = cfg();
        logger.info('Mondo Init with config');
    }
    logger.info('------------------------------------------');
    resolver.configure({resolve: {alias: cfg.packages}});

    if (!initialized) {
        logger.info('Patching Require for MondoRepos');
        module.constructor.prototype.require = id=> {
            // console.log(`attempted require: ${id}`);
            id = resolver.resolve(id);
            // console.log(`resolved require: ${id}`);
            return _require.call(this, id);
        };
    }
    initialized = true;

};

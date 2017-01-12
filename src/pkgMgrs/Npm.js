const chalk = require('chalk');
const spawn = require('child_process').spawn;

const PackageManager = require('./Base');
const Logger = require('../utils/Logger');

const isWindows = /^win/.test(process.platform);
const npm = `npm${isWindows ? '.cmd' : ''}`;

class Npm extends PackageManager {
    spawn(args, options) {
        return new Promise((resolve, reject) => {
            let process = spawn(npm, args, options);

            let result = '';
            process.stdout.on('data', function(data) {
                result += data.toString();
            });

            process.stderr.on('data', function(data) {
                result += data.toString();
            });

            process.on('close', (code) => {
                if (code) {
                    reject(new Error(`NPM ${args.join(' ')} exited with code: ${code}:\n${result}`));
                } else {
                    resolve(result);
                }
            });

            process.on('error', reject);
        });
    }

    install(path) {
        const me = this;
        const args = ['install'];
        const opts = {cwd: path};
        let install = '';

        if (Logger.debug.enabled) {
            opts['stdio'] = 'inherit';
            return me.spawn(args, opts);
        }

        args.push('--depth');
        args.push('0');
        return me.spawn(['set', 'progress=false'], opts)
            .then(() => {
                return me.spawn(args, opts);
            }).then(result => {
                install = result;
                Logger.debug(result.trim());
                return me.spawn(['set', 'progress=true']);
            }).then(() => {
                return install;
            });
    }

    view(name, version) {
        const pkg = name + (version !== undefined ? `@${version}` : '');
        const args = ['view', pkg, '--json'];
        return this.spawn(args);
    }

    publish(path) {
        const opts = {cwd: path};
        const args = ['publish'];
        return this.spawn(args, opts);
    }
}

module.exports = Npm;

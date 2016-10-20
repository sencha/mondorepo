require('colors');
const spawn = require('child_process').spawn;

module.exports = {
    npm: {
        install(path) {
            return new Promise((resolve, reject) => {
                let process = spawn('npm', ['install'], { cwd: path, stdio: 'inherit' });
                process.on('close', (code) => {
                    if (code) {
                        reject();
                    } else {
                        resolve();
                    }
                });

                process.on('error', reject);
            });
        }
    }
};

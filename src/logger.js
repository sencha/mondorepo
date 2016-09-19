let bunyan = require('bunyan'),
    logger = bunyan.createLogger({
        name: 'mondo',
        streams: [
            /*{
                stream: new class BrowserConsoleStream {
                    write(rec) {
                        let method = bunyan.nameFromLevel[rec.level];

                        if (typeof console[method] !== 'function') {
                            method = 'log';
                        }

                        console[method]('[%s]: %s',
                            rec.time.toISOString(),
                            rec.msg);
                    }
                },
                type: 'raw'
            },*/
            {
                stream: process.stdout,
                type: 'stream'
            }
        ]
    });

module.exports = logger;

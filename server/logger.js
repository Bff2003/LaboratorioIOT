const log4js = require('log4js'); // Logging

class Logger {

    static createLogger(name) {
        log4js.configure({
            appenders: {
                file: { type: 'file', filename: process.env.LOG_FILE || 'log.txt' },
                console: { type: 'console', layout: { type: 'basic' } }
            },
            categories: {
                default: {
                    appenders: ['file'/*, 'console'*/],
                    level: process.env.LOG_LEVEL || 'DEBUG',
                    layout: {
                        type: 'pattern',
                        pattern: process.env.LOG_FORMAT || '%d{yyyy-MM-dd hh:mm:ss} [%p] %m'
                    }
                }
            }
        });

        return log4js.getLogger(name);
    }


}

module.exports = Logger;
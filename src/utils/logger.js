const path = require('path');
const winston = require('winston');
const { format, transports } = winston;
const { combine, timestamp, printf } = format;


const myFormat = printf(({ level, message, timestamp }) => {
    return `[${timestamp}] [${level}]: ${message}`;
  });
const logger =  winston.createLogger({
        level: 'info',
        format: combine(
            timestamp(),
            myFormat
          ),
        transports: [
            new transports.File({filename: path.join('logs', 'error.log'),
            level: 'error', 
            timestamp: true,
            handleExceptions: true,
            json: true,
            maxsize: 5242880, // 5MB
            maxFiles: 5}),
            new transports.File({ filename: path.join('logs', 'info.log'), level: 'info',timestamp: true,
            handleExceptions: true,
            json: true,
            maxsize: 5242880, // 5MB
            maxFiles: 5}),
        ],
});
module.exports = logger;
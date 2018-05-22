const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');

const moment = require("moment");


const logDirectory = './logs'
const date = moment().format('YYYY-MM-DD');

// define the custom settings for each transport (file, console)
const options = {
  file: {
    // level: process.env.ENV === 'development' ? 'debug' : 'info',
    level: 'debug',
    filename: `./logs/%DATE%-dmtools.log`,
    datePattern: 'YYYY-MM-DD',
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true
  },
};

// instantiate a new Winston Logger with the settings defined above
const logger = new winston.Logger({
  transports: [
    new winston.transports.DailyRotateFile(options.file),
    new winston.transports.Console(options.console)
  ],
  exitOnError: false, // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function(message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  },
};

module.exports = logger;
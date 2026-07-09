'use strict';

const buildLog = (level, message, details = {}) => {
  const payload = {
    level,
    message,
    ...details
  };

  console.log(JSON.stringify(payload));
};

const info = (message, details) => buildLog('INFO', message, details);
const warn = (message, details) => buildLog('WARN', message, details);
const error = (message, details) => buildLog('ERROR', message, details);

module.exports = {
  info,
  warn,
  error
};

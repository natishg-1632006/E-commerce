'use strict';

const { handlePostConfirmation } = require('./src/handlers/postConfirmationHandler');

module.exports.handler = async (event) => {
  return handlePostConfirmation(event);
};

'use strict';

const { assignUserToGroup } = require('../services/cognitoService');
const { CUSTOMER } = require('../constants/groups');
const { info, warn, error } = require('../utils/logger');

const handlePostConfirmation = async (event) => {
  try {
    if (!event || !event.userName || !event.userPoolId) {
      throw new Error('Invalid Cognito post-confirmation event payload.');
    }

    const groupName = process.env.DEFAULT_GROUP || CUSTOMER;

    info('[PostConfirmation] User Confirmed', {
      username: event.userName,
      userPoolId: event.userPoolId
    });

    info('[PostConfirmation] Assigning User To Customer Group', {
      username: event.userName,
      groupName
    });

    const result = await assignUserToGroup(event.userName, groupName);

    info('[PostConfirmation] Success', {
      username: event.userName,
      groupName,
      result
    });

    return event;
  } catch (err) {
    error('[PostConfirmation] Failed To Assign Group', {
      message: err.message,
      username: event?.userName || 'unknown',
      userPoolId: event?.userPoolId || 'unknown'
    });

    return event;
  }
};

module.exports = {
  handlePostConfirmation
};

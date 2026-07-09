'use strict';

const { AdminAddUserToGroupCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { getCognitoClient } = require('../config/cognitoClient');
const { info, error } = require('../utils/logger');

const assignUserToGroup = async (username, groupName) => {
  if (!username) {
    throw new Error('Username is required to assign a Cognito group.');
  }

  if (!groupName) {
    throw new Error('Group name is required.');
  }

  const userPoolId = process.env.COGNITO_USER_POOL_ID;

  if (!userPoolId) {
    throw new Error('COGNITO_USER_POOL_ID is not configured.');
  }

  const client = getCognitoClient();

  const command = new AdminAddUserToGroupCommand({
    GroupName: groupName,
    Username: username,
    UserPoolId: userPoolId
  });

  try {
    await client.send(command);
    info('[CognitoService] User Successfully Added To Group', {
      username,
      groupName,
      userPoolId
    });

    return {
      success: true,
      message: 'User successfully assigned to group',
      username,
      groupName
    };
  } catch (err) {
    error('[CognitoService] Failed To Assign Group', {
      username,
      groupName,
      message: err.message,
      name: err.name
    });
    throw new Error(`Failed to assign user ${username} to group ${groupName}: ${err.message}`);
  }
};

module.exports = {
  assignUserToGroup
};

'use strict';

const { CognitoIdentityProviderClient } = require('@aws-sdk/client-cognito-identity-provider');

let client;

const getCognitoClient = () => {
  if (!client) {
    client = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || 'ap-southeast-1'
    });
  }

  return client;
};

module.exports = {
  getCognitoClient
};

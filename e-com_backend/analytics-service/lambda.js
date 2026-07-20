const serverless = require("serverless-http");
const app = require("./src/app");

const httpHandler = serverless(app);

module.exports.handler = async (event, context) => {
  // API Gateway event
  return httpHandler(event, context);
};

const serverless = require("serverless-http");
const app = require("./src/app");
const { handler: categoryHandler } = require("./src/handlers/categoryEventHandler");

const httpHandler = serverless(app);

module.exports.handler = async (event, context) => {
  // SQS event
  if (event.Records && event.Records[0].eventSource === "aws:sqs") {
    return categoryHandler(event, context);
  }

  // API Gateway event
  return httpHandler(event, context);
};
const { processCategoryEvent } = require("../services/productService");

exports.handler = async (event) => {
    console.log("========== EVENT ==========");
  console.log(JSON.stringify(event, null, 2));
  const batchItemFailures = [];

  if (!event || !event.Records || !event.Records.length) {
    console.log("[Product] No SQS records found");
    return { batchItemFailures };
  }

  for (const record of event.Records) {
    const { messageId, body } = record;

    try {
      const sqsBody = JSON.parse(body);
      const message = JSON.parse(sqsBody.Message);

      console.log(
        `[Product] Received ${message.eventType} for ${message.categoryId}`
      );

      await processCategoryEvent(message);

      console.log("[Product] Category event processed");
    } catch (err) {
      console.error("[Product] Failed", err);
      batchItemFailures.push({
        itemIdentifier: messageId,
      });
    }
  }

  return { batchItemFailures };
};
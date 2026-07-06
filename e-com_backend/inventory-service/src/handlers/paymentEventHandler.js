const { processPaymentEvent } = require('../services/inventoryService');

exports.handler = async (event) => {
  const batchItemFailures = [];

  if (!event || !event.Records || !event.Records.length) {
    console.log('[Inventory] No SQS records found');
    return { batchItemFailures };
  }

  for (const record of event.Records) {
    const { messageId, body } = record;
    try {
      const sqsBody = JSON.parse(body);
      const message = JSON.parse(sqsBody.Message);
      const eventType = message.eventType;
      const eventId = message.eventId || message.paymentId;

      console.log(`[Inventory] Received ${eventType}`);
      const result = await processPaymentEvent({ eventType, eventId, message });

      if (result && result.skipped) {
        console.log('[Inventory] Event already processed');
        continue;
      }

      console.log('[Inventory] Completed');
    } catch (err) {
      console.error('[Inventory] Failed', err);
      batchItemFailures.push({ itemIdentifier: messageId });
    }
  }

  return { batchItemFailures };
};

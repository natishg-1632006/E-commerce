const { processPaymentEvent } = require('../services/orderService');

exports.handler = async (event) => {
  const batchItemFailures = [];

  if (!event || !event.Records || event.Records.length === 0) {
    console.log('[Order] No SQS records found');
    return { batchItemFailures };
  }

  for (const record of event.Records) {
    const { messageId, body } = record;
    try {
      const sqsBody = JSON.parse(body);
      const message = JSON.parse(sqsBody.Message);
      const eventType = message.eventType;
      const eventId = message.eventId || message.paymentId;

      console.log(`[Order] Received ${eventType}`);
      const result = await processPaymentEvent({ eventType, eventId, message });

      if (result && result.skipped) {
        console.log('[Order] Event already processed');
      } else {
        console.log('[Order] Order updated successfully');
      }
    } catch (err) {
      console.error('[Order] Failed to process payment event', err);
      batchItemFailures.push({ itemIdentifier: messageId });
    }
  }

  return { batchItemFailures };
};

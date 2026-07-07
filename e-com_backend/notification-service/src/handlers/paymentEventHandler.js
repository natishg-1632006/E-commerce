const { sendNotification } = require('../services/notificationService');

exports.handler = async (event) => {
    const batchItemFailures = [];

    if (!event || !event.Records || event.Records.length === 0) {
        console.log('[Notification] No SQS records found');
        return { batchItemFailures };
    }

    for (const record of event.Records) {
        const { messageId, body } = record;
        try {
            const sqsBody = JSON.parse(body);

            // Supports both SNS envelope and Raw Message Delivery
            const message = sqsBody.Message
                ? JSON.parse(sqsBody.Message)
                : sqsBody;

            console.log("[Notification] Parsed Message:");
            console.log(JSON.stringify(message, null, 2));
            const eventType = message.eventType;

            if (eventType !== 'PAYMENT_SUCCESS') {
                console.log(`[Notification] Ignoring event type: ${eventType}`);
                continue;
            }

            console.log(`[Notification] Received ${eventType}`);
            await sendNotification(message);
            console.log('[Notification] Completed');
        } catch (err) {
            console.error('[Notification] Failed to process payment event', err);
            batchItemFailures.push({ itemIdentifier: messageId });
        }
    }

    return { batchItemFailures };
};

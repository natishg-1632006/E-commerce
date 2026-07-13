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

            switch (eventType) {

                case "PAYMENT_SUCCESS":

                case "ORDER_CREATED":

                case "ORDER_CONFIRMED":

                case "ORDER_PROCESSING":

                case "ORDER_PACKED":

                case "ORDER_SHIPPED":

                case "ORDER_OUT_FOR_DELIVERY":

                case "ORDER_DELIVERED":

                case "ORDER_COMPLETED":

                case "ORDER_CANCELLED":

                    console.log(`[Notification] Received ${eventType}`);

                    await sendNotification(message);

                    break;

                default:

                    console.log(
                        `[Notification] Ignoring event type: ${eventType}`
                    );

                    break;
            }
        } catch (err) {
            console.error('[Notification] Failed to process payment event', err);
            batchItemFailures.push({ itemIdentifier: messageId });
        }
    }

    return { batchItemFailures };
};

const { ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { docClient, ORDERS_TABLE } = require('../utils/fileHandler');
const { releaseStock } = require('../utils/inventoryApi');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../constants/orderConstants');

/**
 * Expire a single order:
 * 1. Release all reserved inventory.
 * 2. Set orderStatus = EXPIRED, paymentStatus = FAILED.
 *
 * This function is idempotent — if called twice for the same order,
 * the second call will find orderStatus already EXPIRED and skip.
 */
const expireOrder = async (order) => {
  const now = new Date().toISOString();

  console.log(`[Expiration] Expiring order | orderId: ${order.orderid} | userId: ${order.userId} | expiresAt: ${order.expiresAt} | timestamp: ${now}`);

  // Release reserved inventory — best-effort, log failures but do not abort
  if (order.items && order.items.length > 0) {
    const releaseResults = await Promise.allSettled(
      order.items.map((item) => releaseStock(item.productId, item.quantity, order.orderid))
    );

    releaseResults.forEach((result, idx) => {
      const item = order.items[idx];
      if (result.status === 'rejected') {
        console.error(`[Expiration] Release failed | orderId: ${order.orderid} | productId: ${item.productId} | quantity: ${item.quantity} | error: ${result.reason?.message}`);
      } else {
        console.log(`[Expiration] Released | orderId: ${order.orderid} | productId: ${item.productId} | quantity: ${item.quantity}`);
      }
    });
  }

  // Mark order as EXPIRED
  await docClient.send(
    new UpdateCommand({
      TableName: ORDERS_TABLE,
      Key: { orderid: order.orderid },
      UpdateExpression: 'SET orderStatus = :os, paymentStatus = :ps, updatedAt = :at',
      ExpressionAttributeValues: {
        ':os': ORDER_STATUS.EXPIRED,
        ':ps': PAYMENT_STATUS.FAILED,
        ':at': now,
      },
    })
  );

  console.log(`[Expiration] Order expired | orderId: ${order.orderid} | userId: ${order.userId} | timestamp: ${now}`);
};

/**
 * Scan all PENDING_PAYMENT orders and expire any whose expiresAt has passed.
 *
 * Intended to be called by:
 * - A scheduled Lambda (EventBridge rule, e.g. every 5 minutes)
 * - A manual admin trigger via POST /api/orders/expire-pending
 *
 * Returns a summary of how many orders were expired and any failures.
 */
const expirePendingOrders = async () => {
  const now = new Date().toISOString();

  const { Items = [] } = await docClient.send(
    new ScanCommand({
      TableName: ORDERS_TABLE,
      FilterExpression: 'orderStatus = :status AND expiresAt < :now',
      ExpressionAttributeValues: {
        ':status': ORDER_STATUS.PENDING_PAYMENT,
        ':now': now,
      },
    })
  );

  if (Items.length === 0) {
    console.log(`[Expiration] No expired orders found | timestamp: ${now}`);
    return { expired: 0, failed: 0 };
  }

  console.log(`[Expiration] Found ${Items.length} order(s) to expire | timestamp: ${now}`);

  const results = await Promise.allSettled(Items.map((order) => expireOrder(order)));

  const failed = results.filter((r) => r.status === 'rejected');
  failed.forEach((f) => console.error(`[Expiration] Failed to expire order | error: ${f.reason?.message}`));

  return {
    expired: results.length - failed.length,
    failed: failed.length,
  };
};

module.exports = { expirePendingOrders, expireOrder };

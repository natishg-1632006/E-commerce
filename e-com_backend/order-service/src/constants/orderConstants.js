/**
 * ORDER_STATUS — complete production lifecycle
 *
 * PENDING_PAYMENT  Order created, inventory reserved, awaiting payment.
 * PROCESSING       Payment confirmed. Order handed to fulfillment.
 * PACKED           Warehouse has packed the items.
 * SHIPPED          Order dispatched. Tracking number assigned.
 * DELIVERED        Customer received the order.
 * COMPLETED        Return window closed. Transaction fully finalized.
 * CANCELLED        Order cancelled before shipment.
 * EXPIRED          Customer never paid within the payment timeout window.
 *                  Reserved inventory was automatically released.
 */
const ORDER_STATUS = {
  PENDING_PAYMENT: "PENDING_PAYMENT",

  PAYMENT_FAILED: "PAYMENT_FAILED",

  PROCESSING: "PROCESSING",

  PACKED: "PACKED",

  SHIPPED: "SHIPPED",

  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",

  DELIVERED: "DELIVERED",

  COMPLETED: "COMPLETED",

  CANCELLED: "CANCELLED",

  EXPIRED: "EXPIRED",
};
/**
 * PAYMENT_STATUS — payment lifecycle
 *
 * PENDING   Payment record created, awaiting gateway confirmation.
 * PAID      Payment successfully received and confirmed.
 * FAILED    Payment attempt failed (declined, timeout, error).
 * REFUNDED  Payment was reversed after a successful charge.
 */
const PAYMENT_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",

  REFUND_PENDING: "REFUND_PENDING",
  REFUNDED: "REFUNDED",
};
/**
 * Statuses from which an order can be cancelled by the customer or admin.
 * Orders that are already shipped or beyond cannot be cancelled.
 */
const CANCELLABLE_STATUSES = [
  ORDER_STATUS.PENDING_PAYMENT,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.PACKED,
];

/**
 * Terminal statuses — no further status transitions are allowed.
 */
const TERMINAL_STATUSES = [
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.CANCELLED,
  ORDER_STATUS.EXPIRED,
];

const STATUS_TRANSITIONS = {
  [ORDER_STATUS.PENDING_PAYMENT]: [
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.PAYMENT_FAILED,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.EXPIRED,
  ],

  [ORDER_STATUS.PROCESSING]: [
    ORDER_STATUS.PACKED,
    ORDER_STATUS.CANCELLED,
  ],

  [ORDER_STATUS.PACKED]: [
    ORDER_STATUS.SHIPPED,
  ],

  [ORDER_STATUS.SHIPPED]: [
    ORDER_STATUS.OUT_FOR_DELIVERY,
  ],

  [ORDER_STATUS.OUT_FOR_DELIVERY]: [
    ORDER_STATUS.DELIVERED,
  ],

  [ORDER_STATUS.DELIVERED]: [
    ORDER_STATUS.COMPLETED,
  ],

  [ORDER_STATUS.COMPLETED]: [],

  [ORDER_STATUS.CANCELLED]: [],

  [ORDER_STATUS.EXPIRED]: [],

  [ORDER_STATUS.PAYMENT_FAILED]: [],
};

module.exports = { ORDER_STATUS, PAYMENT_STATUS, CANCELLABLE_STATUSES, TERMINAL_STATUSES, STATUS_TRANSITIONS };

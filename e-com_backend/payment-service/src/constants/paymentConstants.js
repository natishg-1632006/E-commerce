/**
 * PAYMENT_STATUS — payment lifecycle
 *
 * PENDING   Payment record created, awaiting gateway confirmation.
 * PAID      Payment successfully received and confirmed.
 * FAILED    Payment attempt failed (declined, timeout, error).
 * REFUNDED  Payment was reversed after a successful charge.
 */
const PAYMENT_STATUS = {
  PENDING:  'PENDING',
  PAID:     'PAID',
  FAILED:   'FAILED',
  REFUNDED: 'REFUNDED',
};

/**
 * ORDER_STATUS values that the Payment Service writes back to the Orders table.
 * Kept here so the Payment Service does not need to import from Order Service.
 */
const ORDER_STATUS = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PROCESSING:      'PROCESSING',
  PAYMENT_FAILED:  'PAYMENT_FAILED',
  CANCELLED:       'CANCELLED',
  EXPIRED:         'EXPIRED',
};

module.exports = { PAYMENT_STATUS, ORDER_STATUS };

const { sendEmail } = require('./emailService');

const buildEmailPayload = (message) => {
  const items = Array.isArray(message.items) ? message.items : [];
  const totalProducts = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const products = items
    .map((item) => `${item.name || 'Product'} x ${item.quantity || 0}`)
    .join(', ');

  const subject = 'Payment Successful - New Order Received';

  const html = `
    <h2>Payment Successful - New Order Received</h2>
    <p><strong>Order ID:</strong> ${message.orderId || 'N/A'}</p>
    <p><strong>Payment ID:</strong> ${message.paymentId || 'N/A'}</p>
    <p><strong>Customer ID:</strong> ${message.userId || 'N/A'}</p>
    <p><strong>Payment Method:</strong> ${message.paymentMethod || 'N/A'}</p>
    <p><strong>Amount:</strong> ${message.amount || 'N/A'}</p>
    <p><strong>Payment Status:</strong> ${message.paymentStatus || 'N/A'}</p>
    <p><strong>Purchase Time:</strong> ${message.timestamp || 'N/A'}</p>
    <p><strong>Products:</strong> ${products || 'N/A'}</p>
    <p><strong>Quantity:</strong> ${totalProducts}</p>
    <p><strong>Total Products:</strong> ${items.length}</p>
  `;

  const text = [
    'Payment Successful - New Order Received',
    `Order ID: ${message.orderId || 'N/A'}`,
    `Payment ID: ${message.paymentId || 'N/A'}`,
    `Customer ID: ${message.userId || 'N/A'}`,
    `Payment Method: ${message.paymentMethod || 'N/A'}`,
    `Amount: ${message.amount || 'N/A'}`,
    `Payment Status: ${message.paymentStatus || 'N/A'}`,
    `Purchase Time: ${message.timestamp || 'N/A'}`,
    `Products: ${products || 'N/A'}`,
    `Quantity: ${totalProducts}`,
    `Total Products: ${items.length}`,
  ].join('\n');

  return { subject, html, text };
};

const sendNotification = async (message) => {
  if (!message || typeof message !== 'object') {
    throw Object.assign(new Error('Notification payload is required'), { statusCode: 400 });
  }

  console.log('[Notification] Received PAYMENT_SUCCESS');
  console.log('[Notification] Preparing Email');

  const emailPayload = buildEmailPayload(message);
  const recipient = process.env.NOTIFICATION_OWNER_EMAIL;

  if (!recipient) {
    throw Object.assign(new Error('NOTIFICATION_OWNER_EMAIL is not configured'), { statusCode: 500 });
  }

  await sendEmail({
    to: recipient,
    subject: emailPayload.subject,
    html: emailPayload.html,
    text: emailPayload.text,
  });

  return { success: true, message: 'Notification sent successfully' };
};

module.exports = { sendNotification };

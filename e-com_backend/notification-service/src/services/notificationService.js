const { sendEmail } = require('./emailService');

const SUBJECTS = {
  PAYMENT_SUCCESS: "Payment Successful - New Order Received",

  ORDER_CREATED: "Your Order has been Placed",

  ORDER_CONFIRMED: "Your Payment was Successful",

  ORDER_PROCESSING: "Your Order is Being Processed",

  ORDER_PACKED: "Your Order has been Packed",

  ORDER_SHIPPED: "Your Order has been Shipped",

  ORDER_OUT_FOR_DELIVERY: "Your Order is Out for Delivery",

  ORDER_DELIVERED: "Your Order has been Delivered",

  ORDER_COMPLETED: "Thank You for Shopping With Us",

  ORDER_CANCELLED: "Your Order has been Cancelled",
};

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

const buildOrderStatusEmail = (message) => {

  const subject = SUBJECTS[message.eventType];

  // Special email for cancelled orders
  if (message.eventType === "ORDER_CANCELLED") {

    return {
      subject,

      html: `
                <h2>${subject}</h2>

                <p>Hello ${message.customerName},</p>

                <p>Your order has been cancelled successfully.</p>

                <p><strong>Order ID:</strong> ${message.orderId}</p>

                <p><strong>Status:</strong> ${message.orderStatus}</p>

                <p><strong>Payment Status:</strong> ${message.paymentStatus}</p>

                <p><strong>Total Amount:</strong> ₹${message.totalAmount}</p>

                <p><strong>Reason:</strong> ${message.reason || "Cancelled by customer"}</p>

                <br>

                <p>${message.paymentStatus === "REFUNDED"
          ? "Your refund has been processed successfully."
          : "If your payment was successful, your refund will be processed shortly."
        }</p>

                <br>

                <p>Thank you.</p>
            `,

      text: `
${subject}

Hello ${message.customerName},

Your order has been cancelled.

Order ID: ${message.orderId}
Status: ${message.orderStatus}
Payment Status: ${message.paymentStatus}
Total: ₹${message.totalAmount}
Reason: ${message.reason || "Cancelled by customer"}

${message.paymentStatus === "REFUNDED"
  ? "Your refund has been processed successfully."
  : message.paymentStatus === "REFUND_PENDING"
  ? "Your refund request has been received and will be processed shortly."
  : "No refund is applicable for this order."
}
`
    };
  }

  // Default email for all other order events
  return {
    subject,

    html: `
            <h2>${subject}</h2>

            <p>Hello ${message.customerName},</p>

            <p>Your order status has changed.</p>

            <p><strong>Order ID:</strong> ${message.orderId}</p>

            <p><strong>Status:</strong> ${message.orderStatus}</p>

            <p><strong>Total:</strong> ₹${message.totalAmount}</p>

            <br>

            <p>Thank you for shopping with us.</p>
        `,

    text: `
${subject}

Hello ${message.customerName},

Your order status has changed.

Order ID: ${message.orderId}
Status: ${message.orderStatus}
Total: ₹${message.totalAmount}

Thank you for shopping with us.
`
  };
};

const sendNotification = async (message) => {

  if (!message || typeof message !== "object") {
    throw new Error("Notification payload is required");
  }

  let recipient;
  let emailPayload;

  if (message.eventType === "PAYMENT_SUCCESS") {

    recipient = process.env.NOTIFICATION_OWNER_EMAIL;

    emailPayload = buildEmailPayload(message);

  } else {

    recipient = message.email;

    emailPayload = buildOrderStatusEmail(message);

  }

  await sendEmail({
    to: recipient,
    subject: emailPayload.subject,
    html: emailPayload.html,
    text: emailPayload.text,
  });

  console.log(
    `[Notification] Email sent to ${recipient}`
  );

  return {
    success: true,
  };
};


module.exports = { sendNotification };

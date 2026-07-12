const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { v4: uuidv4 } = require("uuid");

const sns = new SNSClient({
  region: process.env.AWS_REGION,
});

const publishOrderCreated = async (order) => {
  const message = {
    eventType: "ORDER_CREATED",
    eventId: uuidv4(),
    timestamp: new Date().toISOString(),

    orderId: order.orderid,
    userId: order.userId,

    totalAmount: order.totalAmount,

    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
  };

  await sns.send(
    new PublishCommand({
      TopicArn: process.env.ORDER_EVENTS_TOPIC_ARN,
      Subject: "ORDER_CREATED",
      Message: JSON.stringify(message),
    })
  );

  console.log(
    `[SNS] ORDER_CREATED published for ${order.orderid}`
  );
};

const publishOrderConfirmed = async (order) => {
  const message = {
    eventType: "ORDER_CONFIRMED",
    eventId: uuidv4(),
    timestamp: new Date().toISOString(),

    orderId: order.orderid,
    userId: order.userId,

    totalAmount: order.totalAmount,

    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
  };

  await sns.send(
    new PublishCommand({
      TopicArn: process.env.ORDER_EVENTS_TOPIC_ARN,
      Subject: "ORDER_CONFIRMED",
      Message: JSON.stringify(message),
    })
  );

  console.log(
    `[SNS] ORDER_CONFIRMED published for ${order.orderid}`
  );
};

module.exports = {
  publishOrderCreated,
  publishOrderConfirmed,
};
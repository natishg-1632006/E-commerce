const { createTransporter } = require('../config/mailConfig');

const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    throw Object.assign(new Error('Recipient email is required'), { statusCode: 400 });
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    text,
  };

  console.log('[Notification] Sending Email');

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Notification] Email Sent Successfully | messageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('[Notification] Email sending failed', err);
    throw err;
  }
};

module.exports = { sendEmail };

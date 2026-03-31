const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// If these are not set, email sending will not work; we fall back to logging.
const isConfigured = !!(EMAIL_USER && EMAIL_PASS);

let transporter = null;
if (isConfigured) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

/**
 * Send an OTP email.
 * Returns an object: { sent: boolean, error?: string }
 */
async function sendOtpEmail(to, otp) {
  const subject = 'PulseQueue Email Verification';
  const text = `Your verification code is:\n\n${otp}\n\nThis code will expire in 5 minutes.`;
  const html = `
    <p>Your verification code is:</p>
    <h2>${otp}</h2>
    <p>This code will expire in 5 minutes.</p>
  `;

  const mailOptions = {
    from: EMAIL_USER || 'no-reply@pulsequeue.local',
    to,
    subject,
    text,
    html,
  };

  if (!transporter) {
    console.log('Email not configured. OTP for', to, 'is', otp);
    return { sent: false, error: 'Email not configured', otp };
  }

  try {
    await transporter.sendMail(mailOptions);
    return { sent: true };
  } catch (err) {
    console.error('Failed to send OTP email:', err);
    return { sent: false, error: err.message || String(err) };
  }
}

module.exports = {
  sendOtpEmail,
};

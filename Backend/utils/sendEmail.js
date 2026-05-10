const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER || process.env.EMAIL_ADDRESS;
const EMAIL_PASS = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';
const EMAIL_FROM = process.env.EMAIL_FROM || `PulseQueue <${EMAIL_USER}>` || 'PulseQueue <no-reply@pulsequeue.local>';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';

// If these are not set, email sending will not work; we fall back to logging.
const isConfigured = !!(EMAIL_USER && EMAIL_PASS);

let transporter = null;
if (isConfigured) {
  transporter = SMTP_HOST
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      })
    : nodemailer.createTransport({
        service: EMAIL_SERVICE,
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      });

  transporter.verify((err) => {
    if (err) {
      console.error('Email transporter verification failed:', err.message || err);
    } else {
      console.log('Email transporter ready');
    }
  });
}

/**
 * Send an OTP email.
 * Returns an object: { sent: boolean, error?: string }
 */
async function sendOtpEmail(to, otp) {
  const subject = `[PulseQueue] Verify your email - Code: ${otp}`;
  const text = `Your verification code: ${otp}\n\nValid for 5 minutes.\n\nDo not share this code with anyone.\n\nPulseQueue Team`;
  
  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject,
    text,
    headers: {
      'X-Priority': '1',
      'Priority': 'urgent',
      'Importance': 'high',
      'X-MSMail-Priority': 'High',
      'X-Mailer': 'PulseQueue/1.0',
      'Auto-Submitted': 'auto-generated',
      'List-Unsubscribe': '<mailto:' + EMAIL_FROM + '?subject=unsubscribe>'
    }
  };

  if (!transporter) {
    console.log('Email not configured. OTP for', to, 'is', otp);
    return { sent: false, error: 'Email not configured', otp };
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log('✓ OTP email sent to', to);
    return { sent: true };
  } catch (err) {
    console.error('Failed to send OTP email:', err);
    return { sent: false, error: err.message || String(err) };
  }
}

module.exports = {
  sendOtpEmail,
};

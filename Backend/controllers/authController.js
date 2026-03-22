const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const util = require('util');
const db = require('../config/database');
const { sendOtpEmail } = require('../utils/sendEmail');

const JWT_SECRET = process.env.JWT_SECRET || 'pulsequeue_secret';

const query = util.promisify(db.query).bind(db);

const isValidEmail = (email) => {
  if (!email) return false;
  // Simple email regex (not RFC-perfect but sufficient for basic validation)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isStrongPassword = (password) => {
  if (!password) return false;
  // Minimum 6 characters; encourage stronger passwords in production
  return password.length >= 6;
};

const generateOtp = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

exports.sendOtp = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  try {
    const existingUsers = await query('SELECT * FROM users WHERE email = ?', [email]);

    if (existingUsers.length > 0) {
      const existing = existingUsers[0];
      if (existing.verified) {
        return res.status(409).json({ message: 'Email already verified. Please login.' });
      }

      let hashedPassword = existing.password;

      if (password) {
        if (!isStrongPassword(password)) {
          return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }
        hashedPassword = await bcrypt.hash(password, 10);
      }

      await query(
        'UPDATE users SET password = ?, password_hash = ?, otp = ?, otp_expiry = ? WHERE email = ?',
        [hashedPassword, hashedPassword, otp, otpExpiry, email]
      );
    } else {
      if (!password) {
        return res.status(400).json({ message: 'Password is required for new users.' });
      }

      if (!isStrongPassword(password)) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await query(
        'INSERT INTO users (email, password, password_hash, otp, otp_expiry) VALUES (?, ?, ?, ?, ?)',
        [email, hashedPassword, hashedPassword, otp, otpExpiry]
      );
    }

    const { sent, error } = await sendOtpEmail(email, otp);
    const response = { message: 'OTP sent to email', emailSent: sent };
    if (!sent) {
      response.warning = 'Failed to send OTP email; check server logs (or use the OTP below) for the code.';
      response.otp = otp;
    }
    if (error) {
      response.error = error;
    }

    return res.json(response);
  } catch (err) {
    console.error('sendOtp error:', err);
    return res.status(500).json({ message: 'Failed to send OTP.', error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  try {
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (!users.length) {
      return res.status(400).json({ message: 'Invalid email or OTP.' });
    }

    const user = users[0];

    if (user.verified) {
      return res.status(400).json({ message: 'Email is already verified.' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    if (!user.otp_expiry || new Date(user.otp_expiry) < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    await query('UPDATE users SET verified = TRUE, otp = NULL, otp_expiry = NULL WHERE email = ?', [email]);
    return res.json({ message: 'Email verified successfully.' });
  } catch (err) {
    console.error('verifyOtp error:', err);
    return res.status(500).json({ message: 'Failed to verify OTP.', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (!users.length) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];

    if (!user.verified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.' });
    }

    const storedHash = user.password || user.password_hash;
    const match = await bcrypt.compare(password, storedHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.user_id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h', // Short-lived access token
    });

    const refreshToken = jwt.sign({ userId: user.user_id, email: user.email }, JWT_SECRET + 'refresh', {
      expiresIn: '7d', // Longer-lived refresh token
    });

    return res.json({ 
      message: 'Login successful.', 
      token,
      refreshToken,
      expiresIn: 3600 // Token expires in 1 hour
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'Login failed.', error: err.message });
  }
};

// Refresh token endpoint
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET + 'refresh');
    
    const token = jwt.sign({ userId: decoded.userId, email: decoded.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.json({ 
      message: 'Token refreshed successfully.', 
      token,
      expiresIn: 3600
    });
  } catch (err) {
    console.error('refreshToken error:', err);
    return res.status(403).json({ message: 'Invalid or expired refresh token.' });
  }
};

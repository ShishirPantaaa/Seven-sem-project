/**
 * Input Validation Middleware
 * Validates and sanitizes user inputs
 */

const validateBookToken = (req, res, next) => {
  const { firstName, lastName, age, gender, contact, address, department, doctor } = req.body;

  // Check required fields
  if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
    return res.status(400).json({ error: 'First name is required and must be a non-empty string' });
  }
  if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
    return res.status(400).json({ error: 'Last name is required and must be a non-empty string' });
  }
  if (!age || isNaN(age) || age < 0 || age > 150) {
    return res.status(400).json({ error: 'Age must be a valid number between 0 and 150' });
  }
  if (!gender || !['Male', 'Female', 'Other'].includes(gender)) {
    return res.status(400).json({ error: 'Gender must be Male, Female, or Other' });
  }
  if (!contact || typeof contact !== 'string' || !/^[0-9]{10}$/.test(contact.trim())) {
    return res.status(400).json({ error: 'Contact must be a 10-digit number' });
  }
  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    return res.status(400).json({ error: 'Address is required' });
  }
  if (!department || typeof department !== 'string' || department.trim().length === 0) {
    return res.status(400).json({ error: 'Department is required' });
  }
  if (!doctor || typeof doctor !== 'string' || doctor.trim().length === 0) {
    return res.status(400).json({ error: 'Doctor name is required' });
  }

  // Sanitize inputs
  req.body.firstName = firstName.trim();
  req.body.lastName = lastName.trim();
  req.body.contact = contact.trim();
  req.body.address = address.trim();
  req.body.department = department.trim();
  req.body.doctor = doctor.trim();

  next();
};

const validateAuthInput = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (password && typeof password !== 'string') {
    return res.status(400).json({ error: 'Password must be a string' });
  }

  req.body.email = email.toLowerCase().trim();

  next();
};

const validateOTP = (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!otp || typeof otp !== 'string' || otp.length !== 6) {
    return res.status(400).json({ error: 'OTP must be a 6-digit string' });
  }

  req.body.email = email.toLowerCase().trim();

  next();
};

module.exports = {
  validateBookToken,
  validateAuthInput,
  validateOTP,
};

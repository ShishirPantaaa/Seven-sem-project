const db = require('../config/database');
const util = require('util');

const query = util.promisify(db.query).bind(db);

const CONSULTATION_MINUTES = 15;
const OPD_START_HOUR = 10;
const OPD_START_MINUTE = 5;
const SAME_DAY_BOOKING_CUTOFF_HOUR = 16;
const SERVICE_END_HOUR = 17;
const BOOKING_WINDOW_DAYS = 3;
const LUNCH_START_HOUR = 13;
const LUNCH_START_MINUTE = 0;
const LUNCH_END_HOUR = 14;
const LUNCH_END_MINUTE = 0;

const resolveDepartmentNameColumn = async () => {
  const columns = await query(
    `
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'departments'
        AND COLUMN_NAME IN ('department_name', 'name')
    `
  );

  const columnNames = columns.map((col) => col.COLUMN_NAME);
  if (columnNames.includes('department_name')) return 'department_name';
  return 'name';
};

// Helper function to check if a date is Saturday
const isSaturday = (date) => {
  return date.getDay() === 6; // 0 = Sunday, 6 = Saturday
};

// Helper function to get next available day (skip Saturday)
const getNextAvailableDay = (date) => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  // If next day is Saturday, skip to Sunday
  if (isSaturday(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }

  return nextDay;
};

const getDateAtTime = (baseDate, hour, minute) => {
  const date = new Date(baseDate);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const isSameLocalDate = (leftDate, rightDate) => {
  const left = new Date(leftDate);
  const right = new Date(rightDate);
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
};

const formatLocalDate = (value) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeLocalDate = (value) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const isInLunchBreak = (date) => {
  const lunchStart = getDateAtTime(date, LUNCH_START_HOUR, LUNCH_START_MINUTE);
  const lunchEnd = getDateAtTime(date, LUNCH_END_HOUR, LUNCH_END_MINUTE);
  return date >= lunchStart && date < lunchEnd;
};

const alignToWorkingTime = (date) => {
  const aligned = new Date(date);
  if (isInLunchBreak(aligned)) {
    aligned.setHours(LUNCH_END_HOUR, LUNCH_END_MINUTE, 0, 0);
  }
  return aligned;
};

const addWorkingMinutesWithLunchBreak = (startDate, minutesToAdd) => {
  let current = alignToWorkingTime(startDate);
  let remainingMinutes = Math.max(0, Number(minutesToAdd) || 0);

  while (remainingMinutes > 0) {
    current = alignToWorkingTime(current);

    const lunchStart = getDateAtTime(current, LUNCH_START_HOUR, LUNCH_START_MINUTE);
    const lunchEnd = getDateAtTime(current, LUNCH_END_HOUR, LUNCH_END_MINUTE);

    if (current < lunchStart) {
      const minutesUntilLunch = Math.floor((lunchStart.getTime() - current.getTime()) / 60000);

      if (remainingMinutes <= minutesUntilLunch) {
        current.setMinutes(current.getMinutes() + remainingMinutes);
        remainingMinutes = 0;
      } else {
        current = new Date(lunchEnd);
        remainingMinutes -= minutesUntilLunch;
      }
    } else {
      current.setMinutes(current.getMinutes() + remainingMinutes);
      remainingMinutes = 0;
    }
  }

  return alignToWorkingTime(current);
};

// Helper function to calculate appointment time (starting at 10:05 AM, includes 1:00 PM - 2:00 PM lunch break)
const calculateAppointmentTime = (appointmentDate, tokenNumber) => {
  const scheduleStart = getDateAtTime(appointmentDate, OPD_START_HOUR, OPD_START_MINUTE);
  const patientsAhead = Math.max(0, tokenNumber - 1);
  return addWorkingMinutesWithLunchBreak(scheduleStart, patientsAhead * CONSULTATION_MINUTES);
};

const calculateEstimatedWaitMinutes = (appointmentDate, patientsAhead) => {
  const scheduleStart = getDateAtTime(appointmentDate, OPD_START_HOUR, OPD_START_MINUTE);
  const etaTime = addWorkingMinutesWithLunchBreak(scheduleStart, Math.max(0, patientsAhead) * CONSULTATION_MINUTES);
  return Math.max(0, Math.round((etaTime.getTime() - scheduleStart.getTime()) / 60000));
};

// Book token
const bookToken = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      age,
      gender,
      contact,
      address,
      department,
      doctor
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !age || !gender || !contact || !address || !department || !doctor) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Get doctor details
    const departmentNameColumn = await resolveDepartmentNameColumn();
    const doctorQuery = `
      SELECT d.doctor_id, d.status, dept.${departmentNameColumn} as department_name
      FROM doctors d
      JOIN departments dept ON d.department_id = dept.department_id
      WHERE d.doctor_name = ? AND dept.${departmentNameColumn} = ?
    `;

    const [doctorResult] = await new Promise((resolve, reject) => {
      db.query(doctorQuery, [doctor, department], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (!doctorResult) {
      return res.status(404).json({ error: 'Doctor not found in the specified department' });
    }

    const { doctor_id, status, department_name } = doctorResult;

    // Check doctor availability
    if (status === 'unavailable') {
      return res.status(200).json({
        doctorUnavailable: true,
        message: 'Doctor is not available today'
      });
    }

    const now = new Date();
    const requestedAppointmentDate = req.body.appointmentDate ? new Date(req.body.appointmentDate) : new Date(now);

    if (Number.isNaN(requestedAppointmentDate.getTime())) {
      return res.status(400).json({ error: 'Invalid appointment date' });
    }

    const todayLocal = normalizeLocalDate(now);
    const requestedLocal = normalizeLocalDate(requestedAppointmentDate);
    const lastBookableLocal = new Date(todayLocal);
    lastBookableLocal.setDate(lastBookableLocal.getDate() + (BOOKING_WINDOW_DAYS - 1));

    if (requestedLocal < todayLocal) {
      return res.status(400).json({ error: 'Past date booking is not allowed' });
    }

    if (requestedLocal > lastBookableLocal) {
      return res.status(400).json({ error: `Booking is open only for ${BOOKING_WINDOW_DAYS} days` });
    }

    // If the computed appointment date falls on Saturday, reject.
    if (isSaturday(requestedLocal)) {
      return res.status(400).json({ error: 'Hospital is closed on Saturday' });
    }

    const isSameDayBooking = isSameLocalDate(requestedLocal, now);
    if (isSameDayBooking) {
      const sameDayCutoff = getDateAtTime(now, SAME_DAY_BOOKING_CUTOFF_HOUR, 0); // 4:00 PM
      if (now >= sameDayCutoff) {
        return res.status(400).json({ error: 'Booking for today is closed after 4:00 PM' });
      }
    }

    let appointmentDate = new Date(requestedLocal);

    const getWaitingTokenCount = async (appointmentDateStr) => {
      const tokenCountQuery = `
        SELECT COUNT(*) as count FROM tokens
        WHERE doctor_id = ? AND appointment_date = ? AND status = 'waiting'
      `;

      const [tokenCountResult] = await new Promise((resolve, reject) => {
        db.query(tokenCountQuery, [doctor_id, appointmentDateStr], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      return tokenCountResult.count;
    };

    const getLastTokenForDate = async (appointmentDateStr) => {
      const lastTokenQuery = `
        SELECT appointment_time FROM tokens
        WHERE doctor_id = ? AND appointment_date = ?
        ORDER BY token_number DESC
        LIMIT 1
      `;

      const [lastTokenResult] = await new Promise((resolve, reject) => {
        db.query(lastTokenQuery, [doctor_id, appointmentDateStr], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      return lastTokenResult;
    };

    // Format date for MySQL (local date, avoids UTC shift)
    let appointmentDateStr = formatLocalDate(appointmentDate);

    // Count existing tokens for this doctor on this date
    let tokenNumber = (await getWaitingTokenCount(appointmentDateStr)) + 1;

    // Real-time appointment logic
    let appointmentDateTime;
    const scheduleStart = getDateAtTime(appointmentDate, OPD_START_HOUR, OPD_START_MINUTE);

    if (tokenNumber === 1) {
      // Queue empty:
      // - today: max(now, OPD start) + 15 min
      // - future date: OPD start + 15 min
      const baseTime = isSameLocalDate(appointmentDate, now)
        ? new Date(Math.max(now.getTime(), scheduleStart.getTime()))
        : scheduleStart;

      appointmentDateTime = addWorkingMinutesWithLunchBreak(baseTime, CONSULTATION_MINUTES);
    } else {
      // Queue exists: last appointment_time + 15 min
      const lastTokenResult = await getLastTokenForDate(appointmentDateStr);

      if (lastTokenResult && lastTokenResult.appointment_time) {
        let hours = 0, minutes = 0, seconds = 0;
        const rawTime = lastTokenResult.appointment_time;

        if (rawTime instanceof Date) {
          hours = rawTime.getHours();
          minutes = rawTime.getMinutes();
          seconds = rawTime.getSeconds();
        } else {
          const [h, m, s] = String(rawTime).split(':').map(Number);
          hours = h || 0;
          minutes = m || 0;
          seconds = s || 0;
        }

        appointmentDateTime = new Date(appointmentDate);
        appointmentDateTime.setHours(hours, minutes, seconds, 0);
        appointmentDateTime = addWorkingMinutesWithLunchBreak(appointmentDateTime, CONSULTATION_MINUTES);
      } else {
        appointmentDateTime = addWorkingMinutesWithLunchBreak(scheduleStart, CONSULTATION_MINUTES);
      }
    }

    if (isSameLocalDate(appointmentDate, now)) {
      const minimumVisitTime = addWorkingMinutesWithLunchBreak(now, CONSULTATION_MINUTES);
      if (appointmentDateTime < minimumVisitTime) {
        appointmentDateTime = minimumVisitTime;
      }
    }

    // If today's calculated slot crosses 5 PM, roll this booking to the next available day.
    if (isSameDayBooking) {
      const serviceEndTime = getDateAtTime(appointmentDate, SERVICE_END_HOUR, 0);
      if (appointmentDateTime > serviceEndTime) {
        appointmentDate = getNextAvailableDay(appointmentDate);
        appointmentDateStr = formatLocalDate(appointmentDate);
        tokenNumber = (await getWaitingTokenCount(appointmentDateStr)) + 1;
        appointmentDateTime = calculateAppointmentTime(appointmentDate, tokenNumber);
      }
    }

    const appointmentTimeStr = appointmentDateTime.toTimeString().split(' ')[0]; // HH:MM:SS
    const etaTime = appointmentDateTime;

    // Insert patient
    const patientQuery = `
      INSERT INTO patients (first_name, last_name, age, gender, contact, address)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const patientResult = await new Promise((resolve, reject) => {
      db.query(patientQuery, [firstName, lastName, age, gender, contact, address], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const patientId = patientResult.insertId;

    // Insert token
    const tokenInsertQuery = `
      INSERT INTO tokens (patient_id, doctor_id, token_number, status, appointment_date, appointment_time, eta_time)
      VALUES (?, ?, ?, 'waiting', ?, ?, ?)
    `;

    await new Promise((resolve, reject) => {
      db.query(tokenInsertQuery, [patientId, doctor_id, tokenNumber, appointmentDateStr, appointmentTimeStr, etaTime], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Format ETA for responses
    const etaFormatted = etaTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const estimatedWaitMinutes = isSameLocalDate(appointmentDate, now)
      ? Math.max(0, Math.round((etaTime.getTime() - now.getTime()) / 60000))
      : calculateEstimatedWaitMinutes(appointmentDate, tokenNumber - 1);

    res.json({
      message: 'Token booked successfully',
      tokenNumber,
      appointmentDate: appointmentDateStr,
      appointmentTime: appointmentTimeStr,
      eta: etaFormatted,
      estimatedWaitMinutes
    });

  } catch (error) {
    console.error('Error booking token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all tokens for a doctor on a specific date
const getTokensByDoctor = async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    const query = `
      SELECT t.*, p.first_name, p.last_name, p.age, p.gender, p.contact
      FROM tokens t
      JOIN patients p ON t.patient_id = p.patient_id
      WHERE t.doctor_id = ? AND t.appointment_date = ?
      ORDER BY t.token_number
    `;

    const results = await new Promise((resolve, reject) => {
      db.query(query, [doctorId, date], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.json(results);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update token status
const updateTokenStatus = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { status } = req.body;

    if (!['waiting', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const query = 'UPDATE tokens SET status = ? WHERE token_id = ?';

    await new Promise((resolve, reject) => {
      db.query(query, [status, tokenId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ message: 'Token status updated successfully' });
  } catch (error) {
    console.error('Error updating token status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get doctors by department
const getDoctorsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const query = 'SELECT * FROM doctors WHERE department_id = ?';

    const results = await new Promise((resolve, reject) => {
      db.query(query, [departmentId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.json(results);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update doctor availability
const updateDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.body;

    if (!['available', 'unavailable'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const query = 'UPDATE doctors SET status = ? WHERE doctor_id = ?';

    await new Promise((resolve, reject) => {
      db.query(query, [status, doctorId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ message: 'Doctor availability updated successfully' });
  } catch (error) {
    console.error('Error updating doctor availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get real-time queue count for a doctor
const getQueueCount = async (req, res) => {
  try {
    const { doctorName, departmentName } = req.query;

    if (!doctorName || !departmentName) {
      return res.status(400).json({ error: 'doctorName and departmentName are required' });
    }

    const departmentNameColumn = await resolveDepartmentNameColumn();

    // Get doctor ID from name and department from name and department
    const doctorQuery = `
      SELECT d.doctor_id
      FROM doctors d
      JOIN departments dept ON d.department_id = dept.department_id
      WHERE d.doctor_name = ? AND dept.${departmentNameColumn} = ?
    `;

    const results = await new Promise((resolve, reject) => {
      db.query(doctorQuery, [doctorName, departmentName], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const doctorResult = results[0];

    // Get today's date, but if today is Saturday, start from tomorrow
    let targetDate = new Date();
    if (targetDate.getDay() === 6) { // Saturday is day 6
      targetDate.setDate(targetDate.getDate() + 1);
    }
    const targetDateStr = targetDate.toISOString().split('T')[0];

    // Count waiting tokens for this doctor on the target date
    const countQuery = `
      SELECT COUNT(*) as count FROM tokens
      WHERE doctor_id = ? AND appointment_date = ? AND status = 'waiting'
    `;

    const countResults = await new Promise((resolve, reject) => {
      db.query(countQuery, [doctorResult.doctor_id, targetDateStr], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    const countResult = countResults[0] || { count: 0 };
    const patientCount = countResult.count;
        
    // Wait for a newly joining patient behind current queue (includes lunch break window).
    const estimatedWaitMinutes = calculateEstimatedWaitMinutes(targetDate, patientCount);

    res.json({
      doctorName,
      departmentName,
      count: patientCount,
      estimatedWaitMinutes,
      appointmentDate: targetDateStr
    });

  } catch (error) {
    console.error('Error fetching queue count:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get recommended doctor based on minimal waiting patients today
const getRecommendedDoctor = async (req, res) => {
  try {
    const { departmentName } = req.query;

    if (!departmentName) {
      return res.status(400).json({ error: 'departmentName is required' });
    }

    const departmentNameColumn = await resolveDepartmentNameColumn();

    let targetDate = new Date();
    if (targetDate.getDay() === 6) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    const targetDateStr = targetDate.toISOString().split('T')[0];

    const query = `
      SELECT d.doctor_name, COUNT(t.token_id) as queue_count
      FROM doctors d
      JOIN departments dept ON d.department_id = dept.department_id
      LEFT JOIN tokens t ON t.doctor_id = d.doctor_id AND t.appointment_date = ? AND t.status = 'waiting'
      WHERE dept.${departmentNameColumn} = ? AND d.status = 'available'
      GROUP BY d.doctor_id
      ORDER BY queue_count ASC
      LIMIT 1
    `;

    const results = await new Promise((resolve, reject) => {
      db.query(query, [targetDateStr, departmentName], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No available doctor found for this department' });
    }

    const bestDoctor = results[0];

    res.json({
      recommendedDoctor: bestDoctor.doctor_name,
      queueCount: bestDoctor.queue_count,
      estimatedWaitMinutes: calculateEstimatedWaitMinutes(targetDate, bestDoctor.queue_count),
      appointmentDate: targetDateStr
    });
  } catch (error) {
    console.error('Error selecting recommended doctor:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get real-time token status with current queue position
const getTokenStatus = async (req, res) => {
  try {
    const { tokenId } = req.params;

    const query = `
      SELECT 
        t.token_id,
        t.token_number,
        t.status,
        t.appointment_date,
        t.appointment_time,
        t.eta_time,
        t.consultation_start_time,
        t.consultation_end_time,
        t.is_expired,
        p.first_name,
        p.last_name,
        d.doctor_name,
        dept.name as department_name,
        (SELECT COUNT(*) FROM tokens WHERE doctor_id = t.doctor_id 
         AND appointment_date = t.appointment_date 
         AND token_number < t.token_number 
         AND status = 'waiting') as patients_ahead
      FROM tokens t
      JOIN patients p ON t.patient_id = p.patient_id
      JOIN doctors d ON t.doctor_id = d.doctor_id
      JOIN departments dept ON d.department_id = dept.department_id
      WHERE t.token_id = ?
    `;

    const results = await new Promise((resolve, reject) => {
      db.query(query, [tokenId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Token not found' });
    }

    const token = results[0];
    res.json(token);
  } catch (error) {
    console.error('Error fetching token status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Start consultation - marks token as on_consultation and updates times
const startConsultation = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const now = new Date();
    const consultationEndTime = new Date(now.getTime() + CONSULTATION_MINUTES * 60000);

    const updateQuery = `
      UPDATE tokens 
      SET 
        status = 'completed',
        consultation_start_time = ?,
        consultation_end_time = ?
      WHERE token_id = ?
    `;

    await new Promise((resolve, reject) => {
      db.query(updateQuery, [now, consultationEndTime, tokenId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ message: 'Consultation started', consultationEndTime });
  } catch (error) {
    console.error('Error starting consultation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Handle appointment expiry and automatic token reschedule
const handleAppointmentExpiry = async (req, res) => {
  try {
    const { tokenId } = req.params;

    // Get token details
    const tokenQuery = `
      SELECT * FROM tokens WHERE token_id = ?
    `;

    const tokenResults = await new Promise((resolve, reject) => {
      db.query(tokenQuery, [tokenId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (!tokenResults || tokenResults.length === 0) {
      return res.status(404).json({ error: 'Token not found' });
    }

    const token = tokenResults[0];
    const appointmentDate = new Date(token.appointment_date);
    const nextAvailableDate = getNextAvailableDay(appointmentDate);

    // Mark as expired
    const expireQuery = `
      UPDATE tokens 
      SET is_expired = TRUE, status = 'waiting'
      WHERE token_id = ?
    `;

    await new Promise((resolve, reject) => {
      db.query(expireQuery, [tokenId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Get new token number for next available date
    const getWaitingTokenCount = async (appointmentDateStr) => {
      const tokenCountQuery = `
        SELECT COUNT(*) as count FROM tokens
        WHERE doctor_id = ? AND appointment_date = ? AND status = 'waiting' AND is_expired = FALSE
      `;

      const [tokenCountResult] = await new Promise((resolve, reject) => {
        db.query(tokenCountQuery, [token.doctor_id, appointmentDateStr], (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      return tokenCountResult.count;
    };

    const nextDateStr = formatLocalDate(nextAvailableDate);
    const newTokenNumber = (await getWaitingTokenCount(nextDateStr)) + 1;

    // Calculate new appointment time for next day
    const scheduleStart = getDateAtTime(nextAvailableDate, OPD_START_HOUR, OPD_START_MINUTE);
    const newAppointmentTime = calculateAppointmentTime(nextAvailableDate, newTokenNumber);
    const newAppointmentTimeStr = newAppointmentTime.toTimeString().split(' ')[0];

    // Create new token for next available date
    const newTokenQuery = `
      INSERT INTO tokens (patient_id, doctor_id, token_number, status, appointment_date, appointment_time, eta_time)
      VALUES (?, ?, ?, 'waiting', ?, ?, ?)
    `;

    await new Promise((resolve, reject) => {
      db.query(newTokenQuery, [token.patient_id, token.doctor_id, newTokenNumber, nextDateStr, newAppointmentTimeStr, newAppointmentTime], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.json({ 
      message: 'Appointment expired and rescheduled',
      newAppointmentDate: nextDateStr,
      newAppointmentTime: newAppointmentTimeStr,
      newTokenNumber
    });
  } catch (error) {
    console.error('Error handling appointment expiry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all waiting tokens for a doctor with real-time updates
const getWaitingTokensRealtime = async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    const query = `
      SELECT 
        t.token_id,
        t.token_number,
        t.status,
        t.appointment_time,
        t.eta_time,
        t.is_expired,
        p.first_name,
        p.last_name,
        p.age,
        p.gender,
        p.contact,
        (SELECT COUNT(*) FROM tokens t2 
         WHERE t2.doctor_id = ? 
         AND t2.appointment_date = ? 
         AND t2.token_number < t.token_number 
         AND t2.status = 'waiting'
         AND t2.is_expired = FALSE) as patients_ahead
      FROM tokens t
      JOIN patients p ON t.patient_id = p.patient_id
      WHERE t.doctor_id = ? AND t.appointment_date = ? AND t.status = 'waiting' AND t.is_expired = FALSE
      ORDER BY t.token_number ASC
    `;

    const results = await new Promise((resolve, reject) => {
      db.query(query, [doctorId, date, doctorId, date], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.json(results);
  } catch (error) {
    console.error('Error fetching waiting tokens:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Check and auto-expire old appointments
const autoExpireAppointments = async (req, res) => {
  try {
    const now = new Date();
    const currentDate = formatLocalDate(now);

    // Get all completed tokens from earlier today that haven't been marked as expired
    const expiredQuery = `
      SELECT t.token_id, t.appointment_time 
      FROM tokens t
      WHERE 
        t.appointment_date = ? 
        AND t.status = 'completed' 
        AND t.is_expired = FALSE
        AND TIMESTAMP(CONCAT(t.appointment_date, ' ', t.appointment_time)) < NOW()
    `;

    const expiredResults = await new Promise((resolve, reject) => {
      db.query(expiredQuery, [currentDate], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    let expiredCount = 0;

    for (const token of expiredResults) {
      await new Promise((resolve, reject) => {
        const markQuery = `UPDATE tokens SET is_expired = TRUE WHERE token_id = ?`;
        db.query(markQuery, [token.token_id], (err) => {
          if (err) reject(err);
          else {
            expiredCount++;
            resolve();
          }
        });
      });
    }

    res.json({ 
      message: `Auto-expired ${expiredCount} appointments`,
      expiredCount
    });
  } catch (error) {
    console.error('Error auto-expiring appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  bookToken,
  getTokensByDoctor,
  updateTokenStatus,
  getDoctorsByDepartment,
  updateDoctorAvailability,
  getRecommendedDoctor,
  getQueueCount,
  getTokenStatus,
  startConsultation,
  handleAppointmentExpiry,
  getWaitingTokensRealtime,
  autoExpireAppointments
};
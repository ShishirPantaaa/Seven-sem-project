const db = require('../config/database');

const CONSULTATION_MINUTES = 15;
const OPD_START_HOUR = 10;
const OPD_START_MINUTE = 5;
const LUNCH_START_HOUR = 13;
const LUNCH_START_MINUTE = 0;
const LUNCH_END_HOUR = 14;
const LUNCH_END_MINUTE = 0;

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
    const doctorQuery = `
      SELECT d.doctor_id, d.status, dept.department_name as department_name
      FROM doctors d
      JOIN departments dept ON d.department_id = dept.department_id
      WHERE d.doctor_name = ? AND dept.department_name = ?
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

    // Determine appointment date
    let appointmentDate = new Date();

    // Allow the client to explicitly specify a date (YYYY-MM-DD).
    // Fallback: use "today" (or tomorrow if today is Saturday).
    if (req.body.appointmentDate) {
      const requested = new Date(req.body.appointmentDate);
      if (isNaN(requested.getTime())) {
        return res.status(400).json({ error: 'Invalid appointment date' });
      }
      appointmentDate = requested;
    }

    const { decision } = req.body;
    if (decision === 'tomorrow') {
      appointmentDate = getNextAvailableDay(appointmentDate);
    }

    // If the computed appointment date falls on Saturday, reject.
    if (isSaturday(appointmentDate)) {
      return res.status(400).json({ error: 'Hospital is closed on Saturday' });
    }

    // Format date for MySQL
    const appointmentDateStr = appointmentDate.toISOString().split('T')[0];

    // Count existing tokens for this doctor on this date
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

    const tokenNumber = tokenCountResult.count + 1;

    // Calculate ETA
    const appointmentDateTime = calculateAppointmentTime(appointmentDate, tokenNumber);
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

    // Format ETA for response
    const etaFormatted = etaTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const appointmentTimeFormatted = appointmentTimeStr.slice(0,5); // HH:MM

    const estimatedWaitMinutes = calculateEstimatedWaitMinutes(appointmentDate, tokenNumber - 1);

    res.json({
      message: 'Token booked successfully',
      tokenNumber,
      appointmentDate: appointmentDateStr,
      appointmentTime: appointmentTimeFormatted,
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

    // Get doctor ID from name and department
    const doctorQuery = `
      SELECT d.doctor_id
      FROM doctors d
      JOIN departments dept ON d.department_id = dept.department_id
      WHERE d.doctor_name = ? AND dept.department_name = ?
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
      WHERE dept.department_name = ? AND d.status = 'available'
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

module.exports = {
  bookToken,
  getTokensByDoctor,
  updateTokenStatus,
  getDoctorsByDepartment,
  updateDoctorAvailability,
  getQueueCount,
  getRecommendedDoctor
};
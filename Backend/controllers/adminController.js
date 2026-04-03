const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const util = require('util');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'pulsequeue_secret';
const query = util.promisify(db.query).bind(db);

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

// Admin login
exports.adminLogin = async (req, res) => {
  try {
    const { adminId, password } = req.body;

    if (!adminId || !password) {
      return res.status(400).json({ message: 'Admin ID and password are required' });
    }

    // Get admin from database - query by username, not numeric ID
    const admins = await query('SELECT * FROM admin_users WHERE admin_username = ?', [adminId]);

    if (admins.length === 0) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const admin = admins[0];

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Generate tokens
    const token = jwt.sign(
      { adminId: admin.admin_id, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { adminId: admin.admin_id, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      refreshToken,
      admin: {
        adminId: admin.admin_id,
        name: admin.admin_name,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get all doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const departmentNameColumn = await resolveDepartmentNameColumn();
    const doctors = await query(`
      SELECT d.doctor_id, d.doctor_name, d.specialization, d.qualifications, d.photo_url, d.contact_no, d.status,
             dept.department_id, dept.${departmentNameColumn} as department_name,
             d.created_at
      FROM doctors d
      LEFT JOIN departments dept ON d.department_id = dept.department_id
      ORDER BY d.created_at DESC
    `);

    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Error fetching doctors' });
  }
};

// Add new doctor
exports.addDoctor = async (req, res) => {
  try {
    const {
      doctorName,
      departmentId,
      status = 'available',
      specialization,
      qualifications,
      photoUrl,
      contactNo
    } = req.body;

    if (!doctorName || !departmentId || !specialization || !photoUrl || !contactNo) {
      return res.status(400).json({ message: 'Doctor name, department, specialization, photo URL and contact are required' });
    }

    // Check if doctor already exists
    const existing = await query(
      'SELECT * FROM doctors WHERE doctor_name = ? AND department_id = ?',
      [doctorName, departmentId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Doctor already exists in this department' });
    }

    // Insert new doctor
    await query(
      `INSERT INTO doctors
       (doctor_name, department_id, specialization, qualifications, photo_url, contact_no, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [doctorName, departmentId, specialization, qualifications || null, photoUrl, contactNo, status]
    );

    res.status(201).json({ message: 'Doctor added successfully' });
  } catch (error) {
    console.error('Error adding doctor:', error);
    res.status(500).json({ message: 'Error adding doctor' });
  }
};

// Update doctor details
exports.updateDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const {
      doctorName,
      departmentId,
      status,
      specialization,
      qualifications,
      photoUrl,
      contactNo
    } = req.body;

    if (!doctorName || !departmentId || !specialization || !photoUrl || !contactNo) {
      return res.status(400).json({ message: 'Doctor name, department, specialization, photo URL and contact are required' });
    }

    // Check if doctor exists
    const existing = await query('SELECT * FROM doctors WHERE doctor_id = ?', [doctorId]);

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Update doctor
    await query(
      `UPDATE doctors
       SET doctor_name = ?,
           department_id = ?,
           specialization = ?,
           qualifications = ?,
           photo_url = ?,
           contact_no = ?,
           status = ?
       WHERE doctor_id = ?`,
      [doctorName, departmentId, specialization, qualifications || null, photoUrl, contactNo, status || 'available', doctorId]
    );

    res.json({ message: 'Doctor updated successfully' });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ message: 'Error updating doctor' });
  }
};

// Update doctor status only
exports.updateDoctorStatus = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.body;

    if (!['available', 'unavailable'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const existing = await query('SELECT * FROM doctors WHERE doctor_id = ?', [doctorId]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    await query('UPDATE doctors SET status = ? WHERE doctor_id = ?', [status, doctorId]);

    res.json({ message: 'Doctor status updated successfully' });
  } catch (error) {
    console.error('Error updating doctor status:', error);
    res.status(500).json({ message: 'Error updating doctor status' });
  }
};

// Delete doctor
exports.deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Check if doctor exists
    const existing = await query('SELECT * FROM doctors WHERE doctor_id = ?', [doctorId]);

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Delete doctor and associated tokens
    await query('DELETE FROM tokens WHERE doctor_id = ?', [doctorId]);
    await query('DELETE FROM doctors WHERE doctor_id = ?', [doctorId]);

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ message: 'Error deleting doctor' });
  }
};

// Get doctor presence/availability status
exports.getDoctorStatus = async (req, res) => {
  try {
    const departmentNameColumn = await resolveDepartmentNameColumn();
    const doctors = await query(`
      SELECT d.doctor_id, d.doctor_name, d.status, dept.${departmentNameColumn} as department_name,
             COUNT(t.token_id) as tokens_today,
             COUNT(CASE WHEN t.status = 'waiting' THEN 1 END) as waiting_tokens,
             COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tokens
      FROM doctors d
      LEFT JOIN departments dept ON d.department_id = dept.department_id
      LEFT JOIN tokens t ON d.doctor_id = t.doctor_id AND DATE(t.appointment_date) = CURDATE()
      GROUP BY d.doctor_id
      ORDER BY d.doctor_name
    `);

    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctor status:', error);
    res.status(500).json({ message: 'Error fetching doctor status' });
  }
};

// Get all departments for dropdown
exports.getAllDepartments = async (req, res) => {
  try {
    const departmentNameColumn = await resolveDepartmentNameColumn();
    const departments = await query(`
      SELECT department_id, ${departmentNameColumn} as department_name, description
      FROM departments
      ORDER BY ${departmentNameColumn}
    `);
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Error fetching departments' });
  }
};

// Get all departments with doctor details inside each department
exports.getDoctorsByEachDepartment = async (req, res) => {
  try {
    const departmentNameColumn = await resolveDepartmentNameColumn();
    const rows = await query(`
      SELECT
        dept.department_id,
        dept.${departmentNameColumn} as department_name,
        dept.description,
        d.doctor_id,
        d.doctor_name,
        d.specialization,
        d.qualifications,
        d.photo_url,
        d.contact_no,
        d.status,
        d.created_at
      FROM departments dept
      LEFT JOIN doctors d ON d.department_id = dept.department_id
      ORDER BY dept.${departmentNameColumn} ASC, d.doctor_name ASC
    `);

    const grouped = [];
    const byDepartmentId = new Map();

    for (const row of rows) {
      if (!byDepartmentId.has(row.department_id)) {
        const departmentObj = {
          department_id: row.department_id,
          department_name: row.department_name,
          description: row.description,
          doctors: []
        };
        byDepartmentId.set(row.department_id, departmentObj);
        grouped.push(departmentObj);
      }

      if (row.doctor_id) {
        byDepartmentId.get(row.department_id).doctors.push({
          doctor_id: row.doctor_id,
          doctor_name: row.doctor_name,
          specialization: row.specialization,
          qualifications: row.qualifications,
          photo_url: row.photo_url,
          contact_no: row.contact_no,
          status: row.status,
          created_at: row.created_at
        });
      }
    }

    res.json(grouped);
  } catch (error) {
    console.error('Error fetching doctors by department:', error);
    res.status(500).json({ message: 'Error fetching doctors by department' });
  }
};

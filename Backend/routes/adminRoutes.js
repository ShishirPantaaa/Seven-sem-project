const express = require('express');
const router = express.Router();
const {
  adminLogin,
  getAllDoctors,
  addDoctor,
  updateDoctor,
  updateDoctorStatus,
  deleteDoctor,
  getDoctorStatus,
  getAllDepartments,
  getDoctorsByEachDepartment
} = require('../controllers/adminController');

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Admin token required' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pulsequeue_secret');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Public route - Admin login
router.post('/login', adminLogin);

// Protected routes - Require admin authentication
router.get('/doctors', authenticateAdmin, getAllDoctors);
router.post('/doctors', authenticateAdmin, addDoctor);
router.put('/doctors/:doctorId', authenticateAdmin, updateDoctor);
router.patch('/doctors/:doctorId/status', authenticateAdmin, updateDoctorStatus);
router.delete('/doctors/:doctorId', authenticateAdmin, deleteDoctor);

// Doctor status/presence
router.get('/doctors-status', authenticateAdmin, getDoctorStatus);

// Departments (for dropdown)
router.get('/departments', authenticateAdmin, getAllDepartments);
router.get('/departments-with-doctors', authenticateAdmin, getDoctorsByEachDepartment);

module.exports = router;

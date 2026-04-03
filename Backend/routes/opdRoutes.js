const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateBookToken } = require('../middleware/validation');
const {
  bookToken,
  getTokensByDoctor,
  updateTokenStatus,
  getDoctorsByDepartment,
  updateDoctorAvailability,
  getQueueCount,
  getRecommendedDoctor,
} = require('../controllers/opdController');

// Book token (requires authentication)
router.post('/book-token', authenticateToken, validateBookToken, bookToken);

// Get tokens for a doctor on a specific date
router.get('/doctors/:doctorId/tokens/:date', getTokensByDoctor);

// Update token status
router.put('/tokens/:tokenId/status', updateTokenStatus);

// Get doctors by department
router.get('/departments/:departmentId/doctors', getDoctorsByDepartment);

// Update doctor availability (admin only - you might want to add admin middleware)
router.put('/doctors/:doctorId/availability', updateDoctorAvailability);

// Get real-time queue count for a doctor
router.get('/queue-count', getQueueCount);
router.get('/recommended-doctor', getRecommendedDoctor);

// Alternative route for testing
router.get('/test-queue-count', (req, res) => {
  res.json({ message: 'Test queue count route works' });
});

// Simple test route
router.get('/simple-test', (req, res) => {
  res.json({ message: 'Simple test route works' });
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'OPD routes working' });
});

module.exports = router;
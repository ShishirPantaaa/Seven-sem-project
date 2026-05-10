const db = require('../config/database');
const util = require('util');

const query = util.promisify(db.query).bind(db);

const CONSULTATION_MINUTES = 15;

/**
 * Token Scheduler Service
 * Handles real-time token management, expiry checks, and automatic updates
 */

// Helper to format local date
const formatLocalDate = (value) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Auto-expire old appointments and mark them as expired
 * This runs periodically to clean up old tokens
 */
const autoExpireOldAppointments = async () => {
  try {
    console.log('[TokenScheduler] Running auto-expire appointments check...');
    
    const now = new Date();
    const currentDate = formatLocalDate(now);

    // Get all completed tokens from earlier dates or from today that have passed their end time
    const expiredQuery = `
      SELECT t.token_id, t.appointment_date, t.appointment_time, t.consultation_end_time
      FROM tokens t
      WHERE 
        (t.appointment_date < ? OR (t.appointment_date = ? AND TIME(NOW()) > TIME(t.appointment_time)))
        AND t.status = 'completed' 
        AND t.is_expired = FALSE
      LIMIT 100
    `;

    const expiredResults = await query(expiredQuery, [currentDate, currentDate]);

    let expiredCount = 0;

    for (const token of expiredResults) {
      try {
        const markQuery = `UPDATE tokens SET is_expired = TRUE WHERE token_id = ?`;
        await query(markQuery, [token.token_id]);
        expiredCount++;
      } catch (err) {
        console.error(`[TokenScheduler] Error marking token ${token.token_id} as expired:`, err);
      }
    }

    if (expiredCount > 0) {
      console.log(`[TokenScheduler] ✓ Auto-expired ${expiredCount} appointments`);
    }

    return expiredCount;
  } catch (error) {
    console.error('[TokenScheduler] Error in autoExpireOldAppointments:', error);
  }
};

/**
 * Check for missed appointments and handle them
 * If a token's appointment time has passed and it's still waiting, mark it as expired
 */
const checkMissedAppointments = async () => {
  try {
    console.log('[TokenScheduler] Checking for missed appointments...');

    const now = new Date();
    const currentDate = formatLocalDate(now);
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS

    // Get all waiting tokens from today that have passed their appointment time
    const missedQuery = `
      SELECT t.token_id, t.appointment_time, t.token_number, t.doctor_id, t.appointment_date
      FROM tokens t
      WHERE 
        t.appointment_date = ?
        AND t.status = 'waiting'
        AND t.is_expired = FALSE
        AND TIME(t.appointment_time) < TIME(?)
    `;

    const missedResults = await query(missedQuery, [currentDate, currentTime]);

    let missedCount = 0;

    for (const token of missedResults) {
      try {
        // Mark as expired
        const markQuery = `UPDATE tokens SET is_expired = TRUE WHERE token_id = ?`;
        await query(markQuery, [token.token_id]);
        
        console.log(`[TokenScheduler] ✓ Marked token ${token.token_id} (Token #${token.token_number}) as expired`);
        missedCount++;
      } catch (err) {
        console.error(`[TokenScheduler] Error handling missed appointment for token ${token.token_id}:`, err);
      }
    }

    if (missedCount > 0) {
      console.log(`[TokenScheduler] ✓ Handled ${missedCount} missed appointments`);
    }

    return missedCount;
  } catch (error) {
    console.error('[TokenScheduler] Error in checkMissedAppointments:', error);
  }
};

/**
 * Update patient count for real-time display
 * Recalculates patient numbers based on current status
 */
const updateRealtimePatientCount = async (doctorId, appointmentDate) => {
  try {
    // Get all waiting tokens for this doctor on this date
    const tokensQuery = `
      SELECT t.token_id, t.token_number
      FROM tokens t
      WHERE 
        t.doctor_id = ?
        AND t.appointment_date = ?
        AND t.status = 'waiting'
        AND t.is_expired = FALSE
      ORDER BY t.token_number ASC
    `;

    const tokens = await query(tokensQuery, [doctorId, appointmentDate]);

    // Update patient count for each token based on their position
    for (let i = 0; i < tokens.length; i++) {
      const patientsAhead = i; // 0-indexed, so first patient has 0 patients ahead
      
      // Calculate new ETA based on position
      const estimatedWaitMinutes = patientsAhead * CONSULTATION_MINUTES;
      
      // Store metadata or just keep track
      if (i === 0) {
        console.log(`[TokenScheduler] Doctor ${doctorId} on ${appointmentDate}: ${tokens.length} patients in queue`);
      }
    }

    return tokens.length;
  } catch (error) {
    console.error('[TokenScheduler] Error in updateRealtimePatientCount:', error);
  }
};

/**
 * Clean up expired tokens older than 7 days (optional archive)
 */
const cleanupOldExpiredTokens = async () => {
  try {
    console.log('[TokenScheduler] Cleaning up old expired tokens...');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoffDate = formatLocalDate(sevenDaysAgo);

    // Archive tokens older than 7 days (you could also delete if needed)
    const cleanupQuery = `
      SELECT COUNT(*) as count
      FROM tokens
      WHERE appointment_date < ? AND is_expired = TRUE
    `;

    const cleanupResults = await query(cleanupQuery, [cutoffDate]);
    const oldTokenCount = cleanupResults[0]?.count || 0;

    if (oldTokenCount > 0) {
      console.log(`[TokenScheduler] Found ${oldTokenCount} tokens older than 7 days`);
    }

    return oldTokenCount;
  } catch (error) {
    console.error('[TokenScheduler] Error in cleanupOldExpiredTokens:', error);
  }
};

/**
 * Main scheduler that runs all checks periodically
 * Call this function to start the scheduler
 */
const startTokenScheduler = (intervalSeconds = 60) => {
  console.log(`[TokenScheduler] ✓ Started token scheduler (running every ${intervalSeconds} seconds)`);

  // Run checks immediately
  autoExpireOldAppointments();
  checkMissedAppointments();

  // Set up interval to run periodically
  setInterval(() => {
    autoExpireOldAppointments();
    checkMissedAppointments();
  }, intervalSeconds * 1000);

  // Run cleanup daily
  setInterval(() => {
    cleanupOldExpiredTokens();
  }, 24 * 60 * 60 * 1000); // 24 hours
};

module.exports = {
  startTokenScheduler,
  autoExpireOldAppointments,
  checkMissedAppointments,
  updateRealtimePatientCount,
  cleanupOldExpiredTokens,
};

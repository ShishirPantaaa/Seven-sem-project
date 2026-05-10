# Real-Time Token Booking System Documentation

## Overview

The real-time token booking system has been enhanced with automatic appointment expiry handling, patient number adjustment, and live queue status updates.

## Features Implemented

### 1. **Automatic Patient Number Decrease After Appointment Expiry**
   - When an appointment time expires (patient doesn't show up), the token is automatically marked as expired
   - Patient numbers for remaining waiting patients are automatically recalculated
   - New tokens can be rescheduled to the next available date

### 2. **Real-Time Token Status Tracking**
   - Patients can view their token status with real-time updates (polls every 5 seconds)
   - Shows current position in queue ("patients ahead")
   - Displays appointment time and estimated consultation time
   - Shows consultation status (waiting/completed/expired)

### 3. **Doctor/Admin Real-Time Queue Dashboard**
   - View all waiting patients in real-time (polls every 10 seconds)
   - See patient count and queue positions automatically updated
   - One-click button to start consultation
   - Visual indicators for queue position

### 4. **Automatic Appointment Expiry Scheduler**
   - Runs every 60 seconds (configurable) in the background
   - Automatically marks missed appointments as expired
   - Cleans up old tokens periodically
   - Handles token archival and maintenance

## Database Schema Changes

New columns added to `tokens` table:
- `consultation_start_time` (DATETIME) - When consultation begins
- `consultation_end_time` (DATETIME) - When consultation ends
- `is_expired` (BOOLEAN) - Whether the appointment has expired

## Backend API Endpoints

### 1. Get Real-Time Token Status
```
GET /api/opd/tokens/:tokenId/status-realtime
Headers: Authorization: Bearer <token>

Response:
{
  "token_id": 1,
  "token_number": 5,
  "status": "waiting",
  "first_name": "John",
  "last_name": "Doe",
  "doctor_name": "Dr. Smith",
  "department_name": "Cardiology",
  "appointment_date": "2024-05-10",
  "appointment_time": "10:30:00",
  "eta_time": "2024-05-10T10:30:00.000Z",
  "is_expired": false,
  "patients_ahead": 3
}
```

### 2. Start Consultation
```
POST /api/opd/tokens/:tokenId/start-consultation
Headers: Authorization: Bearer <token>

Response:
{
  "message": "Consultation started",
  "consultationEndTime": "2024-05-10T10:45:00.000Z"
}
```

### 3. Handle Appointment Expiry
```
POST /api/opd/tokens/:tokenId/expire
Headers: Authorization: Bearer <token>

Response:
{
  "message": "Appointment expired and rescheduled",
  "newAppointmentDate": "2024-05-11",
  "newAppointmentTime": "10:20:00",
  "newTokenNumber": 1
}
```

### 4. Get All Waiting Tokens (Real-Time)
```
GET /api/opd/doctors/:doctorId/waiting-tokens/:date
Headers: Authorization: Bearer <token>

Response:
[
  {
    "token_id": 1,
    "token_number": 1,
    "status": "waiting",
    "first_name": "John",
    "last_name": "Doe",
    "age": 45,
    "gender": "Male",
    "contact": "9876543210",
    "appointment_time": "10:20:00",
    "patients_ahead": 0
  },
  {
    "token_id": 2,
    "token_number": 2,
    "status": "waiting",
    "first_name": "Jane",
    "last_name": "Smith",
    "age": 32,
    "gender": "Female",
    "contact": "9876543211",
    "appointment_time": "10:35:00",
    "patients_ahead": 1
  }
]
```

### 5. Auto-Expire Appointments (Manual Trigger)
```
POST /api/opd/auto-expire-appointments

Response:
{
  "message": "Auto-expired 3 appointments",
  "expiredCount": 3
}
```

## Frontend Components

### 1. RealtimeTokenStatus Component
Display real-time token status for patients.

```jsx
import RealtimeTokenStatus from '@/components/RealtimeTokenStatus';

<RealtimeTokenStatus 
  tokenId={tokenId} 
  refreshInterval={5000}  // 5 seconds
/>
```

**Props:**
- `tokenId`: The token ID to track
- `refreshInterval`: How often to poll (in milliseconds, default: 5000)

**Features:**
- Shows token number with badge
- Displays patient name and doctor info
- Shows current status (waiting/completed/expired)
- Displays number of patients ahead
- Shows appointment date and time
- Shows consultation times if available

### 2. DoctorWaitingQueue Component
Real-time dashboard for doctors/admins to view and manage the waiting queue.

```jsx
import DoctorWaitingQueue from '@/components/DoctorWaitingQueue';

<DoctorWaitingQueue 
  doctorId={doctorId}
  appointmentDate={appointmentDate}  // Format: YYYY-MM-DD
  refreshInterval={10000}  // 10 seconds
/>
```

**Props:**
- `doctorId`: The doctor's ID
- `appointmentDate`: Date to show queue for (format: YYYY-MM-DD)
- `refreshInterval`: How often to poll (in milliseconds, default: 10000)

**Features:**
- Shows all waiting patients in order
- Displays patient information (name, age, gender, contact)
- Shows appointment time for each patient
- One-click "Start" button to begin consultation
- Shows queue position for each patient
- Auto-updates every 10 seconds
- Shows last update timestamp

## Token Scheduler Service

Located at: `Backend/services/tokenScheduler.js`

### Automatic Functions

1. **autoExpireOldAppointments**
   - Runs every check interval
   - Marks completed tokens from past dates as expired
   - Updates is_expired flag to TRUE

2. **checkMissedAppointments**
   - Runs every check interval
   - Finds waiting tokens whose appointment time has passed
   - Marks them as expired automatically
   - Prevents no-shows from blocking the queue

3. **updateRealtimePatientCount**
   - Recalculates patient positions in real-time
   - Used internally for status updates

4. **cleanupOldExpiredTokens**
   - Runs once daily
   - Archives/cleans up tokens older than 7 days
   - Maintains database performance

## How It Works

### Booking Flow
1. Patient books token → Token created with `status='waiting'`
2. Token gets `token_number` based on queue position
3. Appointment time calculated based on position in queue

### Real-Time Updates
1. Scheduler checks every 60 seconds for expired appointments
2. If appointment time passed and status still 'waiting' → marked as 'expired'
3. Patient numbers automatically adjusted for remaining patients
4. Frontend polling updates display (every 5-10 seconds based on component)

### Consultation Flow
1. Doctor clicks "Start" on patient
2. Consultation marked as 'completed'
3. `consultation_start_time` recorded
4. Scheduler eventually marks as expired if time passes
5. Frontend automatically updates queue

### Expiry Handling
1. Missed appointment detected by scheduler
2. Current token marked as expired
3. Optional: New token created for next available date
4. Patient count automatically recalculated for all remaining tokens

## Configuration

### Scheduler Interval
Edit `Backend/server.js`:
```javascript
startTokenScheduler(60);  // Change to desired seconds
```

### Polling Intervals
Adjust refresh intervals in component usage:
```jsx
<RealtimeTokenStatus refreshInterval={3000} />  // 3 seconds
<DoctorWaitingQueue refreshInterval={5000} />   // 5 seconds
```

### Consultation Duration
Edit `Backend/controllers/opdController.js`:
```javascript
const CONSULTATION_MINUTES = 15;  // Change as needed
```

## Usage Examples

### For Patients - Check Token Status
```jsx
import { useState } from 'react';
import RealtimeTokenStatus from '@/components/RealtimeTokenStatus';

export function PatientTicket({ tokenId }) {
  return (
    <RealtimeTokenStatus tokenId={tokenId} refreshInterval={5000} />
  );
}
```

### For Doctors - View Queue and Manage
```jsx
import DoctorWaitingQueue from '@/components/DoctorWaitingQueue';

export function DoctorDashboard({ doctorId, appointmentDate }) {
  return (
    <DoctorWaitingQueue 
      doctorId={doctorId}
      appointmentDate={appointmentDate}
      refreshInterval={10000}
    />
  );
}
```

### Manual API Calls
```javascript
// Get token status
const response = await fetch(
  `http://localhost:5000/api/opd/tokens/1/status-realtime`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

// Start consultation
const response = await fetch(
  `http://localhost:5000/api/opd/tokens/1/start-consultation`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);

// Expire appointment manually
const response = await fetch(
  `http://localhost:5000/api/opd/tokens/1/expire`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);
```

## Testing

### Test Automatic Expiry
1. Create a token with appointment time in the past
2. Wait 60 seconds (scheduler interval) or manually call `POST /api/opd/auto-expire-appointments`
3. Token should be marked as expired
4. Patient numbers should automatically adjust for other waiting tokens

### Test Real-Time Updates
1. Open `RealtimeTokenStatus` component for a token
2. Have doctor start consultation on another token
3. Queue should automatically update within 5 seconds

## Troubleshooting

### Queue Numbers Not Updating
- Check scheduler is running: Look for "[TokenScheduler]" logs in console
- Verify database has new columns: `consultation_start_time`, `consultation_end_time`, `is_expired`
- Check `is_expired` values in tokens table

### Real-Time Updates Not Working
- Verify backend is reachable
- Check `Authorization` header is being sent
- Ensure `refreshInterval` is not too small (min 1000ms recommended)
- Check browser console for errors

### Appointments Not Expiring
- Verify scheduler interval: Check `startTokenScheduler()` call in server.js
- Check appointment times in database
- Manual trigger: Call `POST /api/opd/auto-expire-appointments`

## Performance Considerations

- **Polling Interval**: 5-10 seconds recommended for best real-time feel without overloading
- **Scheduler Interval**: 60 seconds is good balance; can reduce to 30 for more frequent checks
- **Database**: Ensure proper indexing on `doctor_id`, `appointment_date`, `status`, `is_expired`
- **Load**: Each patient/doctor screen runs one polling request every interval

## Future Enhancements

1. **WebSocket Support**: Replace polling with WebSocket for instant updates
2. **Push Notifications**: Notify patients when queue moves
3. **SMS/Email**: Send alerts when appointment is about to start
4. **Analytics**: Track no-show rates, average wait times
5. **Rescheduling**: Allow patients to self-service reschedule missed appointments
6. **Queue Priority**: Priority-based queuing (VIP, emergency, etc.)

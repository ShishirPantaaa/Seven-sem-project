# Integration Guide - Real-Time Token System

This guide shows how to integrate the new real-time token components into your existing application.

## Quick Start

### 1. Patient Token Status Page

Create a new page component to show patient their token status:

```jsx
// pages/TokenStatus.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RealtimeTokenStatus from '../components/RealtimeTokenStatus';
import { useAuth } from '../context/AuthContext';

export default function TokenStatus() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [tokenId, setTokenId] = useState(null);

  useEffect(() => {
    // Get token ID from URL or localStorage
    const params = new URLSearchParams(window.location.search);
    const token = params.get('tokenId') || localStorage.getItem('currentTokenId');
    
    if (token) {
      setTokenId(parseInt(token));
    } else {
      navigate('/book-token');
    }
  }, [navigate]);

  if (!auth.token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Please login first</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-12">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-700 font-semibold"
        >
          ← Back to Home
        </button>
        
        {tokenId && <RealtimeTokenStatus tokenId={tokenId} refreshInterval={5000} />}
      </div>
    </div>
  );
}
```

### 2. Add Route to React Router

```jsx
// In your main App.jsx or router config
import TokenStatus from './pages/TokenStatus';

<Route path="/token-status" element={<TokenStatus />} />
```

### 3. Update BookToken to Redirect to Status Page

```jsx
// In Form.jsx or BookToken.jsx, after successful booking:
const data = await submitForm(payload);

if (data.message === 'Token booked successfully') {
  // Store token ID in localStorage
  localStorage.setItem('currentTokenId', data.tokenId);
  
  // Show success message
  setGeneratedToken(data.tokenNumber);
  
  // Redirect to status page after 2 seconds
  setTimeout(() => {
    navigate('/token-status?tokenId=' + data.tokenId);
  }, 2000);
}
```

### 4. Update AdminPanel with Doctor Queue Dashboard

```jsx
// pages/AdminPanel.jsx - Add new section
import DoctorWaitingQueue from '../components/DoctorWaitingQueue';
import { useState } from 'react';

export default function AdminPanel() {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6">
      {/* ... existing admin panel code ... */}

      {/* Add new Real-Time Queue Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Real-Time Queue Management</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-semibold mb-2">Select Doctor</label>
            <select
              value={selectedDoctor || ''}
              onChange={(e) => setSelectedDoctor(parseInt(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Choose a doctor...</option>
              {/* Populate from doctors list */}
            </select>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-semibold mb-2">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Queue Dashboard */}
        {selectedDoctor && (
          <DoctorWaitingQueue
            doctorId={selectedDoctor}
            appointmentDate={selectedDate}
            refreshInterval={10000}
          />
        )}
      </div>
    </div>
  );
}
```

### 5. Add Links to Navigation

```jsx
// In Navbar.jsx, add links for patients
{auth.token && (
  <>
    <Link to="/token-status" className="nav-link">
      My Token Status
    </Link>
  </>
)}

// For admin
{admin.token && (
  <>
    <Link to="/admin/queue" className="nav-link">
      Queue Management
    </Link>
  </>
)}
```

## Display Booking Response

Update your Form.jsx to show token info before redirecting:

```jsx
const [bookingResponse, setBookingResponse] = useState(null);

// After successful booking:
setBookingResponse(data);

// In JSX, show success screen:
{bookingResponse && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-8 max-w-md text-center">
      <h2 className="text-2xl font-bold text-green-600 mb-4">✓ Token Booked!</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-2">Your Token Number</p>
        <p className="text-5xl font-bold text-blue-600">{bookingResponse.tokenNumber}</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
        <p className="text-sm mb-2">
          <span className="font-semibold">Appointment Date:</span> {bookingResponse.appointmentDate}
        </p>
        <p className="text-sm mb-2">
          <span className="font-semibold">Time:</span> {bookingResponse.appointmentTime}
        </p>
        <p className="text-sm mb-2">
          <span className="font-semibold">ETA:</span> {bookingResponse.eta}
        </p>
        <p className="text-sm">
          <span className="font-semibold">Estimated Wait:</span> {bookingResponse.estimatedWaitMinutes} minutes
        </p>
      </div>

      <button
        onClick={() => {
          localStorage.setItem('currentTokenId', bookingResponse.tokenId);
          navigate('/token-status?tokenId=' + bookingResponse.tokenId);
        }}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
      >
        View Token Status
      </button>
    </div>
  </div>
)}
```

## Backend Integration Notes

### Database Schema
Ensure these columns exist in `tokens` table:
```sql
ALTER TABLE tokens ADD COLUMN consultation_start_time DATETIME;
ALTER TABLE tokens ADD COLUMN consultation_end_time DATETIME;
ALTER TABLE tokens ADD COLUMN is_expired BOOLEAN DEFAULT FALSE;
```

Run: `node initDb.js` in Backend folder to auto-create columns.

### Server Startup
The scheduler starts automatically when server starts. You'll see:
```
[TokenScheduler] ✓ Started token scheduler (running every 60 seconds)
```

### Environment Check
Make sure backend is running on `http://localhost:5000` (or update API URLs in components).

## Testing the Integration

### Test 1: Book a Token and Check Status
1. Book a token from the frontend
2. Navigate to `/token-status` page
3. Verify token status displays correctly
4. Watch updates happen in real-time every 5 seconds

### Test 2: Doctor Queue Management
1. Go to Admin Panel → Queue Management
2. Select a doctor and date
3. You should see waiting tokens
4. Click "Start" on a token
5. Verify queue automatically updates

### Test 3: Appointment Expiry
1. Create a token with past appointment time
2. Wait 60 seconds (scheduler runs)
3. Token should be marked as expired
4. Other token numbers should adjust automatically

## Customization

### Change Polling Speed
```jsx
<RealtimeTokenStatus refreshInterval={3000} />  // 3 seconds
<DoctorWaitingQueue refreshInterval={5000} />   // 5 seconds
```

### Change Scheduler Speed
In `Backend/server.js`:
```javascript
startTokenScheduler(30);  // Run every 30 seconds instead of 60
```

### Custom Styling
Components use Tailwind CSS classes. Modify component files to match your theme.

## Troubleshooting Integration

### Components Not Showing
- Check routes are added correctly
- Verify components are imported
- Check browser console for errors

### API Calls Failing
- Verify backend is running
- Check Authorization header is being sent
- Ensure user is logged in (auth.token exists)

### Real-Time Updates Not Working
- Verify browser network tab shows fetch requests
- Check refresh intervals aren't too small
- Look for CORS errors (should be handled)

## Next Steps

1. Add the components to your pages
2. Test the booking and status flow
3. Configure admin dashboard
4. Customize styling to match your design
5. Test with real appointment data

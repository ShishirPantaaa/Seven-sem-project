import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RealtimeTokenStatus({ tokenId, refreshInterval = 5000 }) {
  const auth = useAuth();
  const [tokenStatus, setTokenStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tokenId || !auth.token) return;

    const fetchTokenStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/opd/tokens/${tokenId}/status-realtime`, {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch token status');
        }

        const data = await response.json();
        setTokenStatus(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching token status:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchTokenStatus();

    // Set up polling
    const interval = setInterval(fetchTokenStatus, refreshInterval);

    return () => clearInterval(interval);
  }, [tokenId, auth.token, refreshInterval]);

  if (!tokenId) {
    return <div className="text-gray-500">No token ID provided</div>;
  }

  if (loading && !tokenStatus) {
    return <div className="text-center py-4">Loading token status...</div>;
  }

  if (error && !tokenStatus) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!tokenStatus) {
    return <div className="text-gray-500">No token data available</div>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status, isExpired) => {
    if (isExpired) return 'Expired';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md">
      <h3 className="text-lg font-semibold mb-4">Token Status</h3>
      
      <div className="space-y-4">
        {/* Token Number */}
        <div>
          <p className="text-gray-600 text-sm">Token Number</p>
          <p className="text-2xl font-bold text-blue-600">#{tokenStatus.token_number}</p>
        </div>

        {/* Patient Info */}
        <div>
          <p className="text-gray-600 text-sm">Patient Name</p>
          <p className="text-lg font-semibold">{tokenStatus.first_name} {tokenStatus.last_name}</p>
        </div>

        {/* Doctor Info */}
        <div>
          <p className="text-gray-600 text-sm">Doctor</p>
          <p className="text-lg">{tokenStatus.doctor_name}</p>
          <p className="text-sm text-gray-500">{tokenStatus.department_name}</p>
        </div>

        {/* Status Badge */}
        <div>
          <p className="text-gray-600 text-sm mb-2">Status</p>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(tokenStatus.status)}`}>
            {getStatusDisplay(tokenStatus.status, tokenStatus.is_expired)}
          </span>
        </div>

        {/* Queue Position */}
        {tokenStatus.patients_ahead !== undefined && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-gray-600 text-sm">Patients Ahead</p>
            <p className="text-2xl font-bold text-blue-600">{tokenStatus.patients_ahead}</p>
          </div>
        )}

        {/* Appointment Time */}
        <div className="border-t pt-4">
          <p className="text-gray-600 text-sm">Appointment Date</p>
          <p className="text-lg">{new Date(tokenStatus.appointment_date).toLocaleDateString()}</p>
          
          <p className="text-gray-600 text-sm mt-2">Scheduled Time</p>
          <p className="text-lg">{tokenStatus.appointment_time}</p>

          {tokenStatus.eta_time && (
            <>
              <p className="text-gray-600 text-sm mt-2">Estimated Time</p>
              <p className="text-lg text-blue-600">
                {new Date(tokenStatus.eta_time).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </p>
            </>
          )}
        </div>

        {/* Consultation Times */}
        {tokenStatus.consultation_start_time && (
          <div className="border-t pt-4">
            <p className="text-gray-600 text-sm">Consultation Started</p>
            <p className="text-lg">
              {new Date(tokenStatus.consultation_start_time).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </p>
          </div>
        )}

        {/* Auto-refresh indicator */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Auto-updating every {refreshInterval / 1000} seconds
        </div>
      </div>
    </div>
  );
}

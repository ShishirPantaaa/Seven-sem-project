import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function DoctorWaitingQueue({ doctorId, appointmentDate, refreshInterval = 10000 }) {
  const auth = useAuth();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (!doctorId || !appointmentDate || !auth.token) return;

    const fetchWaitingTokens = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/opd/doctors/${doctorId}/waiting-tokens/${appointmentDate}`,
          {
            headers: {
              'Authorization': `Bearer ${auth.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch waiting tokens');
        }

        const data = await response.json();
        setTokens(data);
        setLastUpdate(new Date());
        setError(null);
      } catch (err) {
        console.error('Error fetching waiting tokens:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchWaitingTokens();

    // Set up polling
    const interval = setInterval(fetchWaitingTokens, refreshInterval);

    return () => clearInterval(interval);
  }, [doctorId, appointmentDate, auth.token, refreshInterval]);

  const handleStartConsultation = async (tokenId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/opd/tokens/${tokenId}/start-consultation`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to start consultation');
      }

      // Refresh the list
      const response2 = await fetch(
        `http://localhost:5000/api/opd/doctors/${doctorId}/waiting-tokens/${appointmentDate}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
          },
        }
      );

      if (response2.ok) {
        const data = await response2.json();
        setTokens(data);
      }
    } catch (err) {
      console.error('Error starting consultation:', err);
      alert('Error starting consultation: ' + err.message);
    }
  };

  if (!doctorId || !appointmentDate) {
    return <div className="text-gray-500">Missing doctor ID or appointment date</div>;
  }

  if (loading && tokens.length === 0) {
    return <div className="text-center py-8">Loading waiting queue...</div>;
  }

  if (error && tokens.length === 0) {
    return <div className="text-red-500 p-4 bg-red-50 rounded-lg">Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Waiting Queue</h2>
        <div className="text-sm text-gray-600">
          {tokens.length} patients waiting
          {lastUpdate && (
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {tokens.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No patients in queue
        </div>
      ) : (
        <div className="space-y-3">
          {tokens.map((token, index) => (
            <div
              key={token.token_id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-r from-blue-50 to-cyan-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {/* Patient Number Badge */}
                  <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                    #{token.token_number}
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {token.first_name} {token.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Age: {token.age} | Gender: {token.gender} | Contact: {token.contact}
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      Appointment: {token.appointment_time}
                    </p>
                  </div>

                  {/* Queue Position */}
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{index}</p>
                    <p className="text-xs text-gray-600">Position</p>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleStartConsultation(token.token_id)}
                  className="ml-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Start
                </button>
              </div>

              {/* Patient Ahead Count */}
              {token.patients_ahead !== undefined && (
                <div className="mt-2 text-xs text-gray-600 flex items-center justify-between border-t pt-2">
                  <span>{token.patients_ahead} patients ahead</span>
                  <span>Status: <span className="font-semibold text-blue-600">{token.status}</span></span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Auto-refresh indicator */}
      <div className="text-xs text-gray-500 text-center mt-6 pt-4 border-t">
        🔄 Auto-updating every {refreshInterval / 1000} seconds
      </div>
    </div>
  );
}

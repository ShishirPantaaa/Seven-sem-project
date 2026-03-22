import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

export default function Verify() {
  const location = useLocation();
  const [message, setMessage] = useState("Verifying...");
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      setMessage(null);
      setError("No verification token provided.");
      return;
    }

    fetch(`http://localhost:5000/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) {
          throw new Error(text || "Verification failed");
        }
        setMessage(text);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [location.search]);

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50">
      <div className="max-w-lg p-10 mx-auto bg-white rounded-3xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-slate-900">Email Verification</h1>
        <div className="mt-6 text-center">
          {message && <p className="text-lg text-slate-700">{message}</p>}
          {error && <p className="text-lg text-red-600">{error}</p>}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-8 py-3 text-white bg-cyan-600 rounded-lg hover:bg-cyan-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

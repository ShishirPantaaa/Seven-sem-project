import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

export default function OtpVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryEmail = params.get("email") || "";
    setEmail(queryEmail);
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Email is required.");
      return;
    }

    if (!otp || otp.length !== 6) {
      setError("Enter a 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        throw new Error(data.message || "Verification failed");
      }

      setMessage(data.message || "Email verified successfully.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Email is required to resend OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "" }),
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      setMessage(data.message || "OTP resent. Check your email.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50">
      <div className="max-w-md p-8 mx-auto bg-white rounded-3xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-slate-900">Verify OTP</h1>
        <p className="mt-2 text-sm text-center text-slate-600">
          Enter the 6-digit code sent to your email.
        </p>

        {error && (
          <div className="p-3 mt-6 text-sm text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 mt-6 text-sm text-green-700 bg-green-100 rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">OTP Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
              className="w-full px-4 py-3 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 text-white transition bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Verify OTP"}
          </button>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-sm text-cyan-600 hover:underline"
            >
              Resend OTP
            </button>

            <Link to="/login" className="text-sm text-cyan-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

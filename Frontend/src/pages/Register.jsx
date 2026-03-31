import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [warning, setWarning] = useState(null);
  const [otp, setOtp] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess(data.message);
      setWarning(data.warning || null);
      setOtp(data.otp || null);

      // Navigate to OTP verification page.
      setTimeout(() => {
        navigate(`/otp-verify?email=${encodeURIComponent(email)}`);
      }, 500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50">
      <div className="max-w-md p-8 mx-auto bg-white rounded-3xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-slate-900">Register</h1>
        <p className="mt-2 text-sm text-center text-slate-600">
          Create an account to book your OPD appointment.
        </p>

        {error && (
          <div className="p-3 mt-6 text-sm text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 mt-6 text-sm text-green-700 bg-green-100 rounded">
            {success}
            {warning && (
              <div className="mt-2 text-sm text-yellow-800">
                {warning}
              </div>
            )}
          </div>
        )}


        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 text-white transition bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50"
          >
            {loading ? "Registering…" : "Register"}
          </button>

          <p className="text-sm text-center text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-600 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

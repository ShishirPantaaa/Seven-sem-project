import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminLogin() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { adminLogin } = useAdminAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminId, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      adminLogin(data.token, data.admin);
      navigate("/admin-panel");
    } catch (err) {
      setError("Error connecting to server. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md">
        <div className="p-8 border rounded-lg shadow-2xl bg-slate-800 border-slate-700">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text">
              Admin Panel
            </h1>
            <p className="mt-2 text-slate-400">Login to manage doctors and appointments</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 mb-4 text-sm text-red-300 border border-red-700 rounded-lg bg-red-900/30">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Admin ID Input */}
            <div>
              <label htmlFor="adminId" className="block mb-2 text-sm font-medium text-slate-300">
                Admin ID
              </label>
              <input
                id="adminId"
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="Enter your admin ID"
                className="w-full px-4 py-2 text-white transition border rounded-lg bg-slate-700 border-slate-600 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 text-white transition border rounded-lg bg-slate-700 border-slate-600 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                required
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-semibold text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

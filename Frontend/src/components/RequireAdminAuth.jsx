import { useAdminAuth } from "../context/AdminAuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function RequireAdminAuth({ children }) {
  const { admin, adminToken, loading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!admin || !adminToken)) {
      navigate("/admin-login");
    }
  }, [admin, adminToken, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin || !adminToken) {
    return null;
  }

  return children;
}

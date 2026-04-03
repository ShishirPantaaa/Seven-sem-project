import { createContext, useContext, useEffect, useState } from "react";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("pulsequeue_admin_token");
    const savedAdmin = localStorage.getItem("pulsequeue_admin");
    if (savedToken && savedAdmin) {
      setAdminToken(savedToken);
      setAdmin(JSON.parse(savedAdmin));
    }
    setLoading(false);
  }, []);

  const adminLogin = (tokenValue, adminData) => {
    localStorage.setItem("pulsequeue_admin_token", tokenValue);
    localStorage.setItem("pulsequeue_admin", JSON.stringify(adminData));
    setAdminToken(tokenValue);
    setAdmin(adminData);
  };

  const adminLogout = () => {
    localStorage.removeItem("pulsequeue_admin_token");
    localStorage.removeItem("pulsequeue_admin");
    setAdminToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, adminToken, adminLogin, adminLogout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

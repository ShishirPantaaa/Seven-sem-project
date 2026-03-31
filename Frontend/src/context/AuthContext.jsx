import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("pulsequeue_token");
    const savedRefreshToken = localStorage.getItem("pulsequeue_refresh_token");
    const savedEmail = localStorage.getItem("pulsequeue_user");
    if (savedToken && savedEmail) {
      setToken(savedToken);
      setRefreshToken(savedRefreshToken);
      setUser({ email: savedEmail });
    }
    setLoading(false);
  }, []);

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (!token || !refreshToken) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/refresh-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
          const data = await response.json();
          setToken(data.token);
          localStorage.setItem("pulsequeue_token", data.token);
        } else {
          logout();
        }
      } catch (err) {
        console.error("Token refresh failed:", err);
      }
    }, 50 * 60 * 1000); // Refresh every 50 minutes

    return () => clearInterval(interval);
  }, [token, refreshToken]);

  const login = (tokenValue, email, refreshTokenValue) => {
    localStorage.setItem("pulsequeue_token", tokenValue);
    localStorage.setItem("pulsequeue_refresh_token", refreshTokenValue);
    localStorage.setItem("pulsequeue_user", email);
    setToken(tokenValue);
    setRefreshToken(refreshTokenValue);
    setUser({ email });
  };

  const logout = () => {
    localStorage.removeItem("pulsequeue_token");
    localStorage.removeItem("pulsequeue_refresh_token");
    localStorage.removeItem("pulsequeue_user");
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

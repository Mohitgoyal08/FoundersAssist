// ═════════════════════════════════════════════════════════════════
//  context/AuthContext.jsx
//  Global auth state — login, register, logout, user profile
// ═════════════════════════════════════════════════════════════════

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("fa_token") || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Bootstrap: verify token on app load ────────────────────────
  useEffect(() => {
    const init = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await API.get("/auth/me");
        setUser(data.data);
      } catch {
        // Token invalid/expired — clear everything
        localStorage.removeItem("fa_token");
        localStorage.removeItem("fa_user");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [token]);

  const saveSession = (token, user) => {
    localStorage.setItem("fa_token", token);
    localStorage.setItem("fa_user", JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  // ── Register ────────────────────────────────────────────────────
  const register = async (name, email, password, role = "founder") => {
    setError(null);
    const { data } = await API.post("/auth/register", { name, email, password, role });
    return data;
  };

  // ── Verify OTP ──────────────────────────────────────────────────
  const verifyOTP = async (email, otp) => {
    setError(null);
    const { data } = await API.post("/auth/verify-email", { email, otp });
    if (data.token) saveSession(data.token, data.data);
    return data;
  };

  // ── Login ───────────────────────────────────────────────────────
  const login = async (email, password) => {
    setError(null);
    const { data } = await API.post("/auth/login", { email, password });
    if (data.token) saveSession(data.token, data.data);
    return data;
  };

  // ── Logout ──────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("fa_token");
    localStorage.removeItem("fa_user");
    setToken(null);
    setUser(null);
  }, []);

  // ── Refresh user data from server ──────────────────────────────
  const refreshUser = async () => {
    try {
      const { data } = await API.get("/auth/me");
      setUser(data.data);
      localStorage.setItem("fa_user", JSON.stringify(data.data));
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      isAuthenticated,
      register,
      verifyOTP,
      login,
      logout,
      refreshUser,
      setError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
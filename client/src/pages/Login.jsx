// ═════════════════════════════════════════════════════════════════
//  pages/Login.jsx
// ═════════════════════════════════════════════════════════════════

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ background: "var(--bg-base)" }}>

      {/* Glow blob */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 pointer-events-none"
           style={{ background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)" }} />

      <div className="w-full max-w-sm relative animate-fade-up">

        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm"
                 style={{ background: "var(--accent)", color: "white" }}>F</div>
            <span className="font-display font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              Founder Assist
            </span>
          </Link>
          <h1 className="font-display font-bold text-2xl mb-1.5" style={{ color: "var(--text-primary)" }}>
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Sign in to your account
          </p>
        </div>

        {/* Form card */}
        <div className="card p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm"
                 style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Email Address
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="you@startup.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>

            <Button type="submit" loading={loading} className="w-full justify-center py-3">
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-sm mt-4" style={{ color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <Link to="/register" className="font-medium" style={{ color: "#a5b4fc" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
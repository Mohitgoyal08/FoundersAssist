import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("founder");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, role);
      setSuccess(`Verification code sent to ${email}`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await verifyOTP(email, otp);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ background: "var(--bg-base)" }}>

      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 pointer-events-none"
           style={{ background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)" }} />

      <div className="w-full max-w-sm animate-fade-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm"
                 style={{ background: "var(--accent)", color: "white" }}>F</div>
            <span className="font-display font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              Founder Assist
            </span>
          </Link>
          <h1 className="font-display font-bold text-2xl mb-1.5" style={{ color: "var(--text-primary)" }}>
            {step === 1 ? "Create your account" : "Verify your email"}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {step === 1 ? "Start managing your startup today" : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        <div className="card p-6 space-y-4">

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm"
                 style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="px-4 py-3 rounded-xl text-sm"
                 style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#6ee7b7" }}>
              {success}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRegister} className="space-y-4">

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Mohit Goyal"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@startup.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  I am a
                </label>
                <select
                  className="input-field"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="founder">Founder</option>
                  <option value="ca">CA / Accountant</option>
                  <option value="legal_advisor">Legal Advisor</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account →"}
              </button>

            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Verification Code
                </label>
                <input
                  type="text"
                  className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Enter →"}
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setError(""); setSuccess(""); }}
                className="w-full text-center text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                ← Back to registration
              </button>
            </form>
          )}
        </div>

        {step === 1 && (
          <p className="text-center text-sm mt-4" style={{ color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" className="font-medium" style={{ color: "#a5b4fc" }}>Sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
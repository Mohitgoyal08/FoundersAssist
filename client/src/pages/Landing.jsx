// ═════════════════════════════════════════════════════════════════
//  pages/Landing.jsx — Marketing landing page
// ═════════════════════════════════════════════════════════════════

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  { icon: "✓",  title: "Task Management",      desc: "Prioritize work with smart status tracking and deadline alerts." },
  { icon: "📄", title: "Document Generator",   desc: "Generate NDAs, agreements and offer letters in seconds." },
  { icon: "🗓", title: "Board Meetings",        desc: "Record agendas, generate AI minutes, export as PDF." },
  { icon: "✦",  title: "AI Startup Mentor",    desc: "Get Gemini-powered advice tailored to your startup stage." },
  { icon: "◎",  title: "Health Score",         desc: "Diagnose your startup across 10 dimensions with a 0–100 score." },
  { icon: "⚡", title: "Founder Dashboard",    desc: "One unified view of every aspect of your startup's operations." },
];

const STAGES = ["idea", "mvp", "growth", "scaling"];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>

      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-6 md:px-12 h-16 sticky top-0 z-50 glass">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-display font-bold text-sm"
               style={{ background: "var(--accent)", color: "white" }}>F</div>
          <span className="font-display font-bold text-sm" style={{ color: "var(--text-primary)" }}>
            Founder Assist
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary text-sm px-4 py-2">Go to Dashboard →</Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm px-4 py-2">Sign In</Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center text-center px-6 pt-24 pb-20 overflow-hidden">
        {/* Glow blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
             style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8 animate-fade-up"
             style={{ background: "var(--accent-glow)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.25)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          Built for Indian Startup Founders
        </div>

        <h1 className="font-display font-bold text-4xl md:text-6xl leading-tight max-w-3xl mb-6 animate-fade-up stagger-1">
          Your Startup's
          <br />
          <span className="text-gradient">Operating System</span>
        </h1>

        <p className="text-base md:text-lg max-w-xl mb-10 animate-fade-up stagger-2"
           style={{ color: "var(--text-secondary)" }}>
          From idea to scaling — manage tasks, generate legal docs, run board meetings,
          and get AI advice, all in one platform built for founders.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 animate-fade-up stagger-3">
          <Link to="/register" className="btn-primary px-6 py-3 text-base">
            Start for Free →
          </Link>
          <Link to="/login" className="btn-ghost px-6 py-3 text-base">
            Sign In
          </Link>
        </div>

        {/* Stage pills */}
        <div className="flex items-center gap-2 mt-12 animate-fade-up stagger-4">
          {STAGES.map(s => (
            <span key={s} className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="px-6 md:px-12 pb-24 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-3">
            Everything a Founder Needs
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Six powerful modules, one unified platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon, title, desc }, i) => (
            <div
              key={title}
              className="card glow-border p-5 animate-fade-up"
              style={{ animationDelay: `${i * 0.08}s`, opacity: 0, animationFillMode: "forwards" }}
            >
              <div className="text-2xl mb-3">{icon}</div>
              <h3 className="font-semibold text-sm mb-1.5" style={{ color: "var(--text-primary)" }}>{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 pb-24 text-center">
        <div className="max-w-lg mx-auto card p-10"
             style={{ border: "1px solid rgba(99,102,241,0.25)", background: "var(--bg-card)" }}>
          <h2 className="font-display font-bold text-2xl mb-3">
            Ready to launch smarter?
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Join founders who use Founder Assist to run leaner, build faster.
          </p>
          <Link to="/register" className="btn-primary px-8 py-3 text-sm">
            Create Your Free Account →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 md:px-12 py-6 text-center"
              style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}>
        <p className="text-xs">
          © {new Date().getFullYear()} Founder Assist — Simplifying Startup Operations
        </p>
      </footer>
    </div>
  );
}
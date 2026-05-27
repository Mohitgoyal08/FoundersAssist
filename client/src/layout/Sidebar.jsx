
// ═════════════════════════════════════════════════════════════════
//  layout/Sidebar.jsx
//  Left navigation — collapsible, active link highlighting
// ═════════════════════════════════════════════════════════════════

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/dashboard", label: "Dashboard",  icon: "⚡" },
  { to: "/tasks",     label: "Tasks",       icon: "✓" },
  { to: "/documents", label: "Documents",   icon: "📄" },
  { to: "/meetings",  label: "Meetings",    icon: "🗓" },
  { to: "/ai",        label: "AI Assistant",icon: "✦" },
  { to: "/health",    label: "Health Score",icon: "◎" },
  { to: "/profile",   label: "Profile",     icon: "◉" },
];

export default function Sidebar({ open, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className="flex flex-col shrink-0 h-full overflow-hidden transition-all duration-300"
      style={{
        width: open ? "240px" : "64px",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 h-16 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-display font-bold text-sm"
          style={{ background: "var(--accent)", color: "white" }}
        >
          F
        </div>
        {open && (
          <div className="overflow-hidden animate-fade-in">
            <p className="font-display font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              Founder Assist
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Startup OS</p>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            title={!open ? label : ""}
          >
            <span className="text-base shrink-0 w-5 text-center">{icon}</span>
            {open && <span className="truncate animate-fade-in">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 space-y-1" style={{ borderTop: "1px solid var(--border)" }}>
        {open && user && (
          <div className="px-3 py-2 rounded-lg mb-1 animate-fade-in" style={{ background: "var(--bg-elevated)" }}>
            <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              {user.name}
            </p>
            <p className="text-xs truncate capitalize" style={{ color: "var(--text-muted)" }}>
              {user.role}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-link w-full"
          title={!open ? "Logout" : ""}
        >
          <span className="text-base shrink-0 w-5 text-center">↩</span>
          {open && <span className="animate-fade-in">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const PAGE_TITLES = {
  "/dashboard":        { title: "Dashboard",       sub: "Overview" },
  "/tasks":            { title: "Tasks",            sub: "Manage your work" },
  "/documents":        { title: "Documents",        sub: "Legal document generator" },
  "/meetings":         { title: "Board Meetings",   sub: "Meeting records & minutes" },
  "/ai":               { title: "AI Assistant",     sub: "Startup mentor powered by Gemini" },
  "/health":           { title: "Health Score",     sub: "Startup diagnostics" },
  "/profile":          { title: "Profile",          sub: "Account settings" },
  "/startup-settings": { title: "Team Settings",    sub: "Manage your professionals" },
};

const typeIcon = (type) => ({
  task: "✓", meeting: "🗓", document: "📄", invite: "👤", health: "◎", general: "●"
}[type] || "●");

export default function Navbar({ onToggleSidebar }) {
  const { pathname }   = useLocation();
  const { user }       = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]   = useState(0);
  const [open, setOpen]       = useState(false);
  const bellRef = useRef(null);

  const page = PAGE_TITLES[pathname] || { title: "Founder Assist", sub: "Startup OS" };

  const loadNotifications = async () => {
    try {
      const { data } = await API.get("/notifications");
      setNotifications(data.data || []);
      setUnread(data.unreadCount || 0);
    } catch { /* silent */ }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handle = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await API.patch("/notifications/read-all");
      setNotifications(n => n.map(notif => ({ ...notif, read: true })));
      setUnread(0);
    } catch { /* silent */ }
  };

  const handleMarkRead = async (id) => {
    try {
      await API.patch(`/notifications/read/${id}`);
      setNotifications(n => n.map(notif => notif._id === id ? { ...notif, read: true } : notif));
      setUnread(u => Math.max(0, u - 1));
    } catch { /* silent */ }
  };

  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const timeAgo  = (date) => {
    const diff = Date.now() - new Date(date);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{ borderBottom:"1px solid var(--border)", background:"var(--bg-surface)" }}>

      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar}
          className="w-8 h-8 flex flex-col items-center justify-center gap-1.5 rounded-lg transition-colors"
          style={{ color:"var(--text-muted)" }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <span className="w-4 h-0.5 rounded-full" style={{ background:"currentColor" }} />
          <span className="w-4 h-0.5 rounded-full" style={{ background:"currentColor" }} />
          <span className="w-3 h-0.5 rounded-full self-start" style={{ background:"currentColor" }} />
        </button>
        <div>
          <p className="font-display font-bold text-sm" style={{ color:"var(--text-primary)" }}>{page.title}</p>
          <p className="text-xs" style={{ color:"var(--text-muted)" }}>{page.sub}</p>
        </div>
      </div>

      {/* Right: startup badge + notification bell + avatar */}
      <div className="flex items-center gap-3">

        {/* Startup badge */}
        {user?.startup && (
          <Link to="/startup-settings"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ background:"var(--accent-glow)", color:"#a5b4fc", border:"1px solid rgba(99,102,241,0.2)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {user.startup.name}
          </Link>
        )}

        {/* Notification Bell */}
        <div className="relative" ref={bellRef}>
          <button onClick={() => setOpen(o => !o)}
            className="w-9 h-9 flex items-center justify-center rounded-lg relative transition-colors"
            style={{ background: open ? "var(--bg-elevated)" : "transparent", color:"var(--text-muted)", border:"1px solid transparent" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
            onMouseLeave={e => { if (!open) e.currentTarget.style.background = "transparent"; }}>
            {/* Bell SVG */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background:"#ef4444", color:"white", fontSize:"9px" }}>
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {open && (
            <div className="absolute right-0 top-12 w-80 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-up"
                 style={{ background:"var(--bg-card)", border:"1px solid var(--border)", boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3"
                   style={{ borderBottom:"1px solid var(--border)" }}>
                <p className="text-sm font-semibold" style={{ color:"var(--text-primary)" }}>
                  Notifications {unread > 0 && <span className="text-xs ml-1 px-1.5 py-0.5 rounded-full"
                    style={{ background:"rgba(239,68,68,0.15)", color:"#f87171" }}>{unread}</span>}
                </p>
                {unread > 0 && (
                  <button onClick={handleMarkAllRead}
                    className="text-xs" style={{ color:"#a5b4fc" }}>
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-2xl mb-2">🔔</p>
                    <p className="text-sm" style={{ color:"var(--text-muted)" }}>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif._id}
                      className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
                      style={{ background: notif.read ? "transparent" : "rgba(99,102,241,0.04)", borderBottom:"1px solid var(--border)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-elevated)"}
                      onMouseLeave={e => e.currentTarget.style.background = notif.read ? "transparent" : "rgba(99,102,241,0.04)"}
                      onClick={() => handleMarkRead(notif._id)}>
                      <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5"
                            style={{ background:"var(--bg-elevated)", border:"1px solid var(--border)" }}>
                        {typeIcon(notif.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs leading-relaxed" style={{ color: notif.read ? "var(--text-muted)" : "var(--text-secondary)" }}>
                          {notif.message}
                        </p>
                        <p className="text-xs mt-1" style={{ color:"var(--text-muted)" }}>{timeAgo(notif.createdAt)}</p>
                      </div>
                      {!notif.read && (
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-2" style={{ background:"var(--accent)" }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <Link to="/profile">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold cursor-pointer transition-all"
               style={{ background:"var(--accent)", color:"white" }}
               title={user?.name}>
            {initials}
          </div>
        </Link>
      </div>
    </header>
  );
}

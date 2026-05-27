import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

// ─── Shared helpers ──────────────────────────────────────────────────────────
const gradeColor = (g) => ({ "Excellent":"#10b981","Good":"#6366f1","Moderate":"#f59e0b","Needs Work":"#f97316","Critical":"#ef4444" }[g] || "#94a3b8");

const StatCard = ({ label, value, sub, icon, color, to }) => (
  <Link to={to || "#"}>
    <div className="stat-card animate-fade-up" style={{ opacity:0, animationFillMode:"forwards" }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
             style={{ background:`${color}18`, border:`1px solid ${color}30` }}>{icon}</div>
        <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background:"var(--bg-elevated)", color:"var(--text-muted)" }}>View →</span>
      </div>
      <p className="text-2xl font-display font-bold mb-0.5" style={{ color:"var(--text-primary)" }}>{value ?? "—"}</p>
      <p className="text-xs font-medium" style={{ color:"var(--text-secondary)" }}>{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color:"var(--text-muted)" }}>{sub}</p>}
    </div>
  </Link>
);

const QuickAction = ({ to, icon, label, desc }) => (
  <Link to={to} className="card glow-border flex items-start gap-3 p-4 transition-all duration-150">
    <span className="text-xl mt-0.5">{icon}</span>
    <div>
      <p className="text-sm font-medium" style={{ color:"var(--text-primary)" }}>{label}</p>
      <p className="text-xs" style={{ color:"var(--text-muted)" }}>{desc}</p>
    </div>
  </Link>
);

const ActivityItem = ({ activity }) => {
  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom:"1px solid var(--border)" }}>
      <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5"
            style={{ background:"var(--bg-elevated)", border:"1px solid var(--border)" }}>
        {activity.icon}
      </span>
      <div className="flex-1">
        <p className="text-sm" style={{ color:"var(--text-secondary)" }}>{activity.message}</p>
        <p className="text-xs mt-0.5" style={{ color:"var(--text-muted)" }}>{timeAgo(activity.createdAt)}</p>
      </div>
    </div>
  );
};

// ─── FOUNDER DASHBOARD ───────────────────────────────────────────────────────
function FounderDashboard({ user }) {
  const [stats, setStats]       = useState(null);
  const [health, setHealth]     = useState(null);
  const [activity, setActivity] = useState([]);
  const [startup, setStartup]   = useState(null); // ✅ fetched directly
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      const [tasksRes, docsRes, meetingsRes, healthRes, activityRes, startupRes] = await Promise.allSettled([
        API.get("/tasks"),
        API.get("/documents"),
        API.get("/meetings"),
        API.get("/health"),
        API.get("/startups/activity"),
        API.get("/startups/me"), // ✅ fetch directly — don't rely on user.startup from auth context
      ]);
      setStats({
        tasks:    tasksRes.status    === "fulfilled" ? tasksRes.value.data.summary                  : null,
        docs:     docsRes.status     === "fulfilled" ? docsRes.value.data.pagination?.totalDocuments : 0,
        meetings: meetingsRes.status === "fulfilled" ? meetingsRes.value.data.summary               : null,
      });
      if (healthRes.status   === "fulfilled") setHealth(healthRes.value.data.data);
      if (activityRes.status === "fulfilled") setActivity(activityRes.value.data.data || []);
      if (startupRes.status  === "fulfilled") setStartup(startupRes.value.data.data);
      setLoading(false);
    };
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 animate-spin-slow"
           style={{ borderColor:"var(--border)", borderTopColor:"var(--accent)" }} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Greeting */}
      <div className="animate-fade-up">
        <h2 className="font-display font-bold text-xl" style={{ color:"var(--text-primary)" }}>
          {greeting}, {user?.name?.split(" ")[0]} 👋
        </h2>
        <p className="text-sm mt-0.5" style={{ color:"var(--text-muted)" }}>
          {startup ? `Managing ${startup.name}` : "Welcome to Founder Assist"}
        </p>
      </div>

      {/* Startup + health banner — always shown */}
      <div className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5"
           style={{ border:"1px solid rgba(99,102,241,0.2)", background:"rgba(99,102,241,0.04)" }}>
        <div>
          <p className="text-xs font-medium mb-0.5" style={{ color:"#a5b4fc" }}>YOUR STARTUP</p>
          <p className="font-display font-bold text-lg" style={{ color:"var(--text-primary)" }}>
            {startup?.name || "No startup yet"}
          </p>
          {startup?.stage ? (
            <span className="text-xs capitalize px-2 py-0.5 rounded-full mt-1 inline-block"
                  style={{ background:"var(--bg-elevated)", color:"var(--text-secondary)" }}>
              {startup.stage} stage
            </span>
          ) : (
            <Link to="/profile" className="text-xs mt-2 inline-block" style={{ color:"#a5b4fc" }}>
              + Create your startup →
            </Link>
          )}
        </div>
        {health ? (
          <div className="text-right">
            <p className="text-xs mb-1" style={{ color:"var(--text-muted)" }}>Health Score</p>
            <p className="font-display font-bold text-3xl" style={{ color:gradeColor(health.grade) }}>
              {health.score}<span className="text-base font-normal ml-0.5" style={{ color:"var(--text-muted)" }}>/100</span>
            </p>
            <p className="text-xs font-medium" style={{ color:gradeColor(health.grade) }}>{health.grade}</p>
          </div>
        ) : (
          <Link to="/health" className="btn-ghost text-xs px-3 py-1.5">Calculate Health →</Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Tasks"  value={stats?.tasks?.pending      ?? 0} sub={`${stats?.tasks?.total ?? 0} total`} icon="✓"  color="#6366f1" to="/tasks" />
        <StatCard label="Urgent Tasks"   value={stats?.tasks?.urgent       ?? 0} sub="Need attention"                      icon="⚡" color="#ef4444" to="/tasks" />
        <StatCard label="Documents"      value={stats?.docs                ?? 0} sub="Generated"                           icon="📄" color="#10b981" to="/documents" />
        <StatCard label="Meetings"       value={stats?.meetings?.scheduled ?? 0} sub="Scheduled"                           icon="🗓" color="#f59e0b" to="/meetings" />
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color:"var(--text-secondary)" }}>Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <QuickAction to="/tasks"            icon="✓"  label="New Task"          desc="Add with priority & deadline" />
          <QuickAction to="/documents"        icon="📄" label="Generate Document" desc="NDA, agreements, offer letters" />
          <QuickAction to="/meetings"         icon="🗓" label="Schedule Meeting"  desc="Board meeting with AI minutes" />
          <QuickAction to="/ai"               icon="✦"  label="Ask AI Mentor"     desc="Get startup advice from Gemini" />
          <QuickAction to="/health"           icon="◎"  label="Health Check"      desc="Score your startup's readiness" />
          <QuickAction to="/startup-settings" icon="👥" label="Manage Team"       desc="Invite CA or Legal Advisor" />
        </div>
      </div>

      {/* Activity + suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-5">
          <p className="text-xs font-semibold mb-1" style={{ color:"var(--text-secondary)" }}>RECENT ACTIVITY</p>
          {activity.length === 0 ? (
            <p className="text-xs py-6 text-center" style={{ color:"var(--text-muted)" }}>No activity yet. Start building!</p>
          ) : (
            activity.slice(0, 8).map(a => <ActivityItem key={a._id} activity={a} />)
          )}
        </div>

        {health?.suggestions?.length > 0 && (
          <div className="card p-5">
            <p className="text-xs font-semibold mb-3" style={{ color:"var(--text-secondary)" }}>TOP SUGGESTIONS</p>
            <div className="space-y-3">
              {health.suggestions.slice(0, 4).map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background:"var(--accent-glow)", color:"#a5b4fc", border:"1px solid rgba(99,102,241,0.2)" }}>
                    {i + 1}
                  </span>
                  <p style={{ color:"var(--text-secondary)" }}>{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CA DASHBOARD ────────────────────────────────────────────────────────────
function CADashboard({ user }) {
  const [startups, setStartups] = useState([]);
  const [docs, setDocs]         = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      const [startupsRes, docsRes, tasksRes] = await Promise.allSettled([
        API.get("/startups/professional"),
        API.get("/documents"),
        API.get("/tasks"),
      ]);
      if (startupsRes.status === "fulfilled") setStartups(startupsRes.value.data.data || []);
      if (docsRes.status     === "fulfilled") setDocs(docsRes.value.data.data || []);
      if (tasksRes.status    === "fulfilled") setTasks(tasksRes.value.data.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const financialDocs = docs.filter(d => ["founder_agreement","shareholder_agreement","service_agreement"].includes(d.type));

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 animate-spin-slow"
           style={{ borderColor:"var(--border)", borderTopColor:"var(--accent)" }} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background:"rgba(16,185,129,0.1)", color:"#6ee7b7", border:"1px solid rgba(16,185,129,0.2)" }}>
            CA / Accountant
          </span>
        </div>
        <h2 className="font-display font-bold text-xl" style={{ color:"var(--text-primary)" }}>
          Welcome, {user?.name?.split(" ")[0]} 👋
        </h2>
        <p className="text-sm mt-0.5" style={{ color:"var(--text-muted)" }}>
          {startups.length > 0 ? `You are managing ${startups.length} startup(s)` : "No startups assigned yet"}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Assigned Startups"   value={startups.length}      icon="🏢" color="#6366f1" />
        <StatCard label="Financial Documents" value={financialDocs.length} icon="📊" color="#10b981" to="/documents" />
        <StatCard label="My Tasks"            value={tasks.filter(t=>t.status!=="completed").length} icon="✓" color="#f59e0b" to="/tasks" />
        <StatCard label="Completed Tasks"     value={tasks.filter(t=>t.status==="completed").length} icon="✅" color="#a855f7" to="/tasks" />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color:"var(--text-secondary)" }}>ASSIGNED STARTUPS</h3>
        {startups.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-3xl mb-3">🏢</p>
            <p className="font-medium" style={{ color:"var(--text-primary)" }}>No startups assigned</p>
            <p className="text-sm mt-1" style={{ color:"var(--text-muted)" }}>A founder needs to invite you via your email</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {startups.map(s => (
              <div key={s._id} className="card p-5 glow-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold font-display"
                       style={{ background:"var(--accent)", color:"white" }}>{s.name[0]}</div>
                  <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                        style={{ background:"var(--accent-glow)", color:"#a5b4fc" }}>{s.stage}</span>
                </div>
                <p className="font-semibold" style={{ color:"var(--text-primary)" }}>{s.name}</p>
                <p className="text-xs mt-1" style={{ color:"var(--text-muted)" }}>{s.industry || "Industry not set"}</p>
                {s.healthScore > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full" style={{ background:"var(--border)" }}>
                      <div className="h-full rounded-full" style={{ width:`${s.healthScore}%`, background:gradeColor("Good") }} />
                    </div>
                    <span className="text-xs" style={{ color:"var(--text-muted)" }}>{s.healthScore}/100</span>
                  </div>
                )}
                <p className="text-xs mt-2" style={{ color:"var(--text-muted)" }}>
                  Founders: {s.founders?.map(f => f.name).join(", ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color:"var(--text-secondary)" }}>FINANCIAL DOCUMENTS</h3>
        {financialDocs.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-sm" style={{ color:"var(--text-muted)" }}>No financial documents yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {financialDocs.slice(0, 5).map(doc => (
              <div key={doc._id} className="card flex items-center gap-3 p-3">
                <span className="text-lg">📊</span>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color:"var(--text-primary)" }}>{doc.title}</p>
                  <p className="text-xs" style={{ color:"var(--text-muted)" }}>{new Date(doc.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <Link to="/documents" className="text-xs px-2 py-1 rounded-lg"
                      style={{ background:"var(--bg-elevated)", color:"var(--text-secondary)" }}>View →</Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color:"var(--text-secondary)" }}>MY TASKS</h3>
        {tasks.filter(t => t.status !== "completed").length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-sm" style={{ color:"var(--text-muted)" }}>No pending tasks</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.filter(t => t.status !== "completed").slice(0, 5).map(task => (
              <div key={task._id} className="card flex items-center gap-3 p-3">
                <span className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: task.priority==="urgent" ? "#ef4444" : task.priority==="high" ? "#f59e0b" : "#6366f1" }} />
                <p className="text-sm flex-1" style={{ color:"var(--text-secondary)" }}>{task.title}</p>
                <span className="text-xs capitalize px-2 py-0.5 rounded-full"
                      style={{ background:"var(--bg-elevated)", color:"var(--text-muted)" }}>{task.priority}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LEGAL ADVISOR DASHBOARD ─────────────────────────────────────────────────
function LegalDashboard({ user }) {
  const [startups, setStartups] = useState([]);
  const [docs, setDocs]         = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const load = async () => {
      const [startupsRes, docsRes, tasksRes] = await Promise.allSettled([
        API.get("/startups/professional"),
        API.get("/documents"),
        API.get("/tasks"),
      ]);
      if (startupsRes.status === "fulfilled") setStartups(startupsRes.value.data.data || []);
      if (docsRes.status     === "fulfilled") setDocs(docsRes.value.data.data || []);
      if (tasksRes.status    === "fulfilled") setTasks(tasksRes.value.data.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const legalDocs = docs.filter(d => ["nda","founder_agreement","shareholder_agreement","service_agreement"].includes(d.type));

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 animate-spin-slow"
           style={{ borderColor:"var(--border)", borderTopColor:"var(--accent)" }} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background:"rgba(168,85,247,0.1)", color:"#d8b4fe", border:"1px solid rgba(168,85,247,0.2)" }}>
            Legal Advisor
          </span>
        </div>
        <h2 className="font-display font-bold text-xl" style={{ color:"var(--text-primary)" }}>
          Welcome, {user?.name?.split(" ")[0]} ⚖️
        </h2>
        <p className="text-sm mt-0.5" style={{ color:"var(--text-muted)" }}>
          {startups.length > 0 ? `Advising ${startups.length} startup(s)` : "No startups assigned yet"}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Assigned Startups" value={startups.length}  icon="🏢" color="#a855f7" />
        <StatCard label="Legal Documents"   value={legalDocs.length} icon="⚖️" color="#6366f1" to="/documents" />
        <StatCard label="NDAs Generated"    value={docs.filter(d=>d.type==="nda").length} icon="🔏" color="#10b981" to="/documents" />
        <StatCard label="Pending Tasks"     value={tasks.filter(t=>t.status!=="completed").length} icon="✓" color="#f59e0b" to="/tasks" />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color:"var(--text-secondary)" }}>ASSIGNED STARTUPS</h3>
        {startups.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-3xl mb-3">⚖️</p>
            <p className="font-medium" style={{ color:"var(--text-primary)" }}>No startups assigned</p>
            <p className="text-sm mt-1" style={{ color:"var(--text-muted)" }}>A founder needs to invite you via your email</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {startups.map(s => (
              <div key={s._id} className="card p-5 glow-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold font-display"
                       style={{ background:"rgba(168,85,247,0.2)", color:"#d8b4fe", border:"1px solid rgba(168,85,247,0.3)" }}>
                    {s.name[0]}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                        style={{ background:"rgba(168,85,247,0.1)", color:"#d8b4fe" }}>{s.stage}</span>
                </div>
                <p className="font-semibold" style={{ color:"var(--text-primary)" }}>{s.name}</p>
                <p className="text-xs mt-1" style={{ color:"var(--text-muted)" }}>{s.industry || "Industry not set"}</p>
                <p className="text-xs mt-2" style={{ color:"var(--text-muted)" }}>
                  Founders: {s.founders?.map(f => f.name).join(", ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color:"var(--text-secondary)" }}>LEGAL DOCUMENTS</h3>
        {legalDocs.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-sm" style={{ color:"var(--text-muted)" }}>No legal documents yet</p>
            <Link to="/documents" className="btn-ghost text-xs px-3 py-1.5 mt-3 inline-block">Generate Document</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {legalDocs.map(doc => (
              <div key={doc._id} className="card flex items-center gap-3 p-3">
                <span className="text-lg">⚖️</span>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color:"var(--text-primary)" }}>{doc.title}</p>
                  <p className="text-xs capitalize" style={{ color:"var(--text-muted)" }}>
                    {doc.type.replace(/_/g," ")} · {new Date(doc.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <Link to="/documents" className="text-xs px-2 py-1 rounded-lg"
                      style={{ background:"var(--bg-elevated)", color:"var(--text-secondary)" }}>View →</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD — role router ────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === "ca")            return <CADashboard user={user} />;
  if (user.role === "legal_advisor") return <LegalDashboard user={user} />;
  return <FounderDashboard user={user} />;
}
import { useState, useEffect } from "react";
import API from "../api/axios";

const PRIORITIES = ["low", "medium", "high", "urgent"];
const STATUSES   = ["pending", "in_progress", "completed"];

const priorityColor = (p) => ({
  low:    { bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.3)",  text: "#6ee7b7" },
  medium: { bg: "rgba(99,102,241,0.1)",  border: "rgba(99,102,241,0.3)",  text: "#a5b4fc" },
  high:   { bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.3)",  text: "#fcd34d" },
  urgent: { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)",   text: "#fca5a5" },
}[p] || {});

const statusColor = (s) => ({
  pending:     { bg: "rgba(99,102,241,0.1)",  text: "#a5b4fc" },
  in_progress: { bg: "rgba(245,158,11,0.1)",  text: "#fcd34d" },
  completed:   { bg: "rgba(16,185,129,0.1)",  text: "#6ee7b7" },
}[s] || {});

const EMPTY = { title: "", description: "", priority: "medium", dueDate: "" };

export default function Tasks() {
  const [tasks, setTasks]       = useState([]);
  const [summary, setSummary]   = useState({});
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/tasks");
      setTasks(data.data || []);
      setSummary(data.summary || {});
    } catch { setError("Failed to load tasks."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await API.post("/tasks", form);
      setForm(EMPTY); setShowForm(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task.");
    } finally { setSaving(false); }
  };

  const handleStatus = async (id, status) => {
    try {
      await API.patch(`/tasks/${id}/status`, { status });
      setTasks(t => t.map(task => task._id === id ? { ...task, status } : task));
    } catch { setError("Failed to update status."); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this task?")) return;
    try {
      await API.delete(`/tasks/${id}`);
      setTasks(t => t.filter(task => task._id !== id));
    } catch { setError("Failed to delete task."); }
  };

  const filtered = filterStatus === "all"
    ? tasks
    : tasks.filter(t => t.status === filterStatus);

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl" style={{ color: "var(--text-primary)" }}>Tasks</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Manage your work</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary">
          {showForm ? "✕ Cancel" : "+ New Task"}
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm"
             style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",     value: summary.total     ?? 0, color: "#6366f1" },
          { label: "Pending",   value: summary.pending   ?? 0, color: "#a5b4fc" },
          { label: "Completed", value: summary.completed ?? 0, color: "#10b981" },
          { label: "Urgent",    value: summary.urgent    ?? 0, color: "#ef4444" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center p-4">
            <p className="text-2xl font-display font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card p-5 animate-fade-up"
             style={{ border: "1px solid rgba(99,102,241,0.3)" }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>New Task</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <input type="text" className="input-field" placeholder="Task title *"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            <textarea className="input-field resize-none" rows={2} placeholder="Description (optional)"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Priority</label>
                <select className="input-field" value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Due Date</label>
                <input type="date" className="input-field" value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? "Creating..." : "Create Task"}
            </button>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
            style={{
              background: filterStatus === s ? "var(--accent-glow)" : "var(--bg-elevated)",
              color: filterStatus === s ? "#a5b4fc" : "var(--text-muted)",
              border: filterStatus === s ? "1px solid rgba(99,102,241,0.3)" : "1px solid var(--border)",
            }}>
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 animate-spin-slow"
               style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-3xl mb-3">✓</p>
          <p className="font-medium" style={{ color: "var(--text-primary)" }}>No tasks found</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {filterStatus === "all" ? "Create your first task above" : `No ${filterStatus.replace("_", " ")} tasks`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => {
            const pc = priorityColor(task.priority);
            const sc = statusColor(task.status);
            return (
              <div key={task._id} className="card flex items-start gap-4 p-4 group">
                {/* Priority bar */}
                <div className="w-1 h-12 rounded-full shrink-0 mt-1"
                     style={{ background: pc.text || "var(--border)" }} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <p className="font-medium text-sm" style={{
                      color: "var(--text-primary)",
                      textDecoration: task.status === "completed" ? "line-through" : "none",
                    }}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                            style={{ background: pc.bg, border: `1px solid ${pc.border}`, color: pc.text }}>
                        {task.priority}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                            style={{ background: sc.bg, color: sc.text }}>
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  {task.description && (
                    <p className="text-xs mt-1 truncate" style={{ color: "var(--text-muted)" }}>{task.description}</p>
                  )}
                  {task.dueDate && (
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      Due: {new Date(task.dueDate).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {task.status !== "completed" && (
                    <button onClick={() => handleStatus(task._id,
                      task.status === "pending" ? "in_progress" : "completed")}
                      className="text-xs px-2 py-1 rounded-lg transition-colors"
                      style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                      {task.status === "pending" ? "▶ Start" : "✓ Done"}
                    </button>
                  )}
                  {task.status === "completed" && (
                    <button onClick={() => handleStatus(task._id, "pending")}
                      className="text-xs px-2 py-1 rounded-lg"
                      style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                      ↩ Reopen
                    </button>
                  )}
                  <button onClick={() => handleDelete(task._id)}
                    className="text-xs px-2 py-1 rounded-lg transition-colors"
                    style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

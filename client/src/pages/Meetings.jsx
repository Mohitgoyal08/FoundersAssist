import { useState, useEffect } from "react";
import API from "../api/axios";

const statusColor = (s) => ({
  scheduled: { bg: "rgba(99,102,241,0.1)",  text: "#a5b4fc" },
  completed:  { bg: "rgba(16,185,129,0.1)",  text: "#6ee7b7" },
  cancelled:  { bg: "rgba(239,68,68,0.1)",   text: "#fca5a5" },
}[s] || {});

const EMPTY_FORM = { title: "", date: "", agenda: "", status: "scheduled" };
const EMPTY_PARTICIPANT = { name: "", role: "", email: "" };

export default function Meetings() {
  const [meetings, setMeetings]     = useState([]);
  const [summary, setSummary]       = useState({});
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [participants, setParticipants] = useState([{ ...EMPTY_PARTICIPANT }]);
  const [saving, setSaving]         = useState(false);
  const [generatingId, setGeneratingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/meetings");
      setMeetings(data.data || []);
      setSummary(data.summary || {});
    } catch { setError("Failed to load meetings."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const addParticipant = () => setParticipants(p => [...p, { ...EMPTY_PARTICIPANT }]);
  const removeParticipant = (i) => setParticipants(p => p.filter((_, idx) => idx !== i));
  const updateParticipant = (i, field, val) =>
    setParticipants(p => p.map((pt, idx) => idx === i ? { ...pt, [field]: val } : pt));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      const agenda = form.agenda.split("\n").map(s => s.trim()).filter(Boolean);
      await API.post("/meetings", {
        title: form.title,
        date: form.date,
        status: form.status,
        agenda,
        participants: participants.filter(p => p.name.trim()),
      });
      setSuccess("Meeting created successfully!");
      setForm(EMPTY_FORM);
      setParticipants([{ ...EMPTY_PARTICIPANT }]);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create meeting.");
    } finally { setSaving(false); }
  };

  const handleGenerateMinutes = async (id) => {
    setGeneratingId(id); setError(""); setSuccess("");
    try {
      const { data } = await API.post(`/meetings/${id}/minutes`);
      setSuccess(`Minutes generated using ${data.generatedBy === "ai" ? "Gemini AI ✦" : "auto-generator"}.`);
      setMeetings(m => m.map(meeting =>
        meeting._id === id ? { ...meeting, minutes: data.data.minutes, status: "completed" } : meeting
      ));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate minutes.");
    } finally { setGeneratingId(null); }
  };

  const handleDownload = async (meeting) => {
    setDownloadingId(meeting._id);
    try {
      const response = await API.get(`/meetings/${meeting._id}/download`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `Meeting_${meeting.title.replace(/\s+/g, "_")}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { setError("Download failed. Please try again."); }
    finally { setDownloadingId(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this meeting?")) return;
    try {
      await API.delete(`/meetings/${id}`);
      setMeetings(m => m.filter(meeting => meeting._id !== id));
    } catch { setError("Failed to delete meeting."); }
  };

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl" style={{ color: "var(--text-primary)" }}>Board Meetings</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Schedule, record, and generate AI minutes</p>
        </div>
        <button onClick={() => { setShowForm(s => !s); setError(""); setSuccess(""); }}
          className="btn-primary">
          {showForm ? "✕ Cancel" : "+ New Meeting"}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm"
             style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 rounded-xl text-sm"
             style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#6ee7b7" }}>
          {success}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total",     value: summary.total     ?? 0, color: "#6366f1" },
          { label: "Scheduled", value: summary.scheduled ?? 0, color: "#a5b4fc" },
          { label: "Completed", value: summary.completed ?? 0, color: "#10b981" },
          { label: "Upcoming",  value: summary.upcoming  ?? 0, color: "#f59e0b" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center p-4">
            <p className="text-2xl font-display font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card p-6 animate-fade-up" style={{ border: "1px solid rgba(99,102,241,0.3)" }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Schedule Meeting</h3>
          <form onSubmit={handleCreate} className="space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Meeting Title *</label>
                <input type="text" className="input-field" placeholder="Q1 Board Review"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Date & Time *</label>
                <input type="datetime-local" className="input-field"
                  value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
                Agenda Items (one per line)
              </label>
              <textarea className="input-field resize-none" rows={4}
                placeholder={"Review Q1 financials\nProduct roadmap\nFundraising update"}
                value={form.agenda} onChange={e => setForm(f => ({ ...f, agenda: e.target.value }))} />
            </div>

            {/* Participants */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs" style={{ color: "var(--text-secondary)" }}>Participants</label>
                <button type="button" onClick={addParticipant}
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                  + Add
                </button>
              </div>
              <div className="space-y-2">
                {participants.map((p, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2 items-center">
                    <input type="text" className="input-field py-2 text-xs" placeholder="Name"
                      value={p.name} onChange={e => updateParticipant(i, "name", e.target.value)} />
                    <input type="text" className="input-field py-2 text-xs" placeholder="Role (CEO, CTO...)"
                      value={p.role} onChange={e => updateParticipant(i, "role", e.target.value)} />
                    <div className="flex gap-1">
                      <input type="email" className="input-field py-2 text-xs flex-1" placeholder="Email"
                        value={p.email} onChange={e => updateParticipant(i, "email", e.target.value)} />
                      {participants.length > 1 && (
                        <button type="button" onClick={() => removeParticipant(i)}
                          className="px-2 rounded-lg text-xs shrink-0"
                          style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? "Creating..." : "Schedule Meeting"}
            </button>
          </form>
        </div>
      )}

      {/* Meetings list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 animate-spin-slow"
               style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
        </div>
      ) : meetings.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-3xl mb-3">🗓</p>
          <p className="font-medium" style={{ color: "var(--text-primary)" }}>No meetings yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Schedule your first board meeting above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map(meeting => {
            const sc = statusColor(meeting.status);
            const isExpanded = expandedId === meeting._id;
            return (
              <div key={meeting._id} className="card overflow-hidden">
                {/* Header row */}
                <div className="flex items-start gap-4 p-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                       style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                    🗓
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{meeting.title}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full capitalize shrink-0"
                            style={{ background: sc.bg, color: sc.text }}>
                        {meeting.status}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {new Date(meeting.date).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                      {meeting.participants?.length > 0 && ` · ${meeting.participants.length} participant(s)`}
                      {meeting.agenda?.length > 0 && ` · ${meeting.agenda.length} agenda item(s)`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setExpandedId(isExpanded ? null : meeting._id)}
                      className="text-xs px-2 py-1.5 rounded-lg transition-colors"
                      style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                      {isExpanded ? "▲" : "▼"}
                    </button>
                    <button onClick={() => handleGenerateMinutes(meeting._id)}
                      disabled={generatingId === meeting._id}
                      className="text-xs px-2 py-1.5 rounded-lg font-medium disabled:opacity-50"
                      style={{ background: "rgba(99,102,241,0.1)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.2)" }}>
                      {generatingId === meeting._id ? "..." : "✦ Minutes"}
                    </button>
                    <button onClick={() => handleDownload(meeting)}
                      disabled={downloadingId === meeting._id}
                      className="text-xs px-2 py-1.5 rounded-lg disabled:opacity-50"
                      style={{ background: "rgba(16,185,129,0.1)", color: "#6ee7b7" }}>
                      {downloadingId === meeting._id ? "..." : "↓ PDF"}
                    </button>
                    <button onClick={() => handleDelete(meeting._id)}
                      className="text-xs px-2 py-1.5 rounded-lg"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>
                      ✕
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 animate-fade-in"
                       style={{ borderTop: "1px solid var(--border)" }}>
                    {meeting.agenda?.length > 0 && (
                      <div className="pt-3">
                        <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>AGENDA</p>
                        <ol className="space-y-1">
                          {meeting.agenda.map((item, i) => (
                            <li key={i} className="text-xs flex gap-2" style={{ color: "var(--text-secondary)" }}>
                              <span style={{ color: "var(--text-muted)" }}>{i + 1}.</span> {item}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {meeting.participants?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>PARTICIPANTS</p>
                        <div className="flex flex-wrap gap-2">
                          {meeting.participants.map((p, i) => (
                            <span key={i} className="text-xs px-2 py-1 rounded-lg"
                                  style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                              {p.name}{p.role ? ` · ${p.role}` : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {meeting.minutes && (
                      <div>
                        <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>MINUTES</p>
                        <pre className="text-xs whitespace-pre-wrap leading-relaxed rounded-lg p-3"
                             style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", fontFamily: "inherit" }}>
                          {meeting.minutes}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

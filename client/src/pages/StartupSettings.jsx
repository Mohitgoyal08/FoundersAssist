import { useState, useEffect } from "react";
import API from "../api/axios";

export default function StartupSettings() {
  const [startup, setStartup]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole]   = useState("ca");
  const [inviting, setInviting]   = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/startups/me");
      setStartup(data.data);
    } catch (err) {
      if (err.response?.status !== 404) setError("Failed to load startup.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true); setError(""); setSuccess("");
    try {
      await API.post("/startups/invite-professional", { email: inviteEmail, role: inviteRole });
      setSuccess(`Professional invited successfully!`);
      setInviteEmail("");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Invite failed.");
    } finally { setInviting(false); }
  };

  const handleRemove = async (userId, name) => {
    if (!confirm(`Remove ${name} from your startup?`)) return;
    try {
      await API.delete(`/startups/remove-professional/${userId}`);
      setSuccess(`${name} removed.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove.");
    }
  };

  const roleLabel = (r) => r === "ca" ? "CA / Accountant" : "Legal Advisor";
  const roleColor = (r) => r === "ca"
    ? { bg:"rgba(16,185,129,0.1)", color:"#6ee7b7", border:"rgba(16,185,129,0.2)" }
    : { bg:"rgba(168,85,247,0.1)", color:"#d8b4fe", border:"rgba(168,85,247,0.2)" };

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-xl" style={{ color:"var(--text-primary)" }}>
          Startup Team Settings
        </h2>
        <p className="text-sm mt-0.5" style={{ color:"var(--text-muted)" }}>
          Invite CA or Legal Advisor to collaborate on your startup
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm"
             style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", color:"#f87171" }}>
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 rounded-xl text-sm"
             style={{ background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)", color:"#6ee7b7" }}>
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 animate-spin-slow"
               style={{ borderColor:"var(--border)", borderTopColor:"var(--accent)" }} />
        </div>
      ) : !startup ? (
        <div className="card text-center py-16">
          <p className="text-3xl mb-3">🏢</p>
          <p className="font-medium mb-1" style={{ color:"var(--text-primary)" }}>No startup yet</p>
          <p className="text-sm mb-4" style={{ color:"var(--text-muted)" }}>
            Create your startup first from the Profile page
          </p>
          <a href="/profile" className="btn-primary">Go to Profile →</a>
        </div>
      ) : (
        <>
          {/* Startup info */}
          <div className="card p-5 flex items-center gap-4"
               style={{ border:"1px solid rgba(99,102,241,0.2)", background:"rgba(99,102,241,0.04)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold font-display text-lg shrink-0"
                 style={{ background:"var(--accent)", color:"white" }}>
              {startup.name[0]}
            </div>
            <div>
              <p className="font-display font-bold text-lg" style={{ color:"var(--text-primary)" }}>{startup.name}</p>
              <div className="flex gap-2 mt-1 flex-wrap">
                {startup.industry && (
                  <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background:"var(--bg-elevated)", color:"var(--text-secondary)" }}>
                    {startup.industry}
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                      style={{ background:"var(--accent-glow)", color:"#a5b4fc" }}>
                  {startup.stage}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background:"var(--bg-elevated)", color:"var(--text-muted)" }}>
                  {startup.teamSize} team member{startup.teamSize !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Invite form */}
          <div className="card p-6">
            <p className="text-xs font-semibold mb-4" style={{ color:"var(--text-secondary)" }}>
              INVITE A PROFESSIONAL
            </p>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color:"var(--text-secondary)" }}>
                    Professional Email *
                  </label>
                  <input type="email" className="input-field"
                    placeholder="ca@example.com or lawyer@example.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color:"var(--text-secondary)" }}>Role *</label>
                  <select className="input-field" value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}>
                    <option value="ca">CA / Accountant</option>
                    <option value="legal_advisor">Legal Advisor</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl text-xs"
                   style={{ background:"var(--bg-elevated)", border:"1px solid var(--border)", color:"var(--text-muted)" }}>
                ⚠️ The professional must already have a Founder Assist account with the matching role before you can invite them.
              </div>

              <button type="submit" disabled={inviting} className="btn-primary disabled:opacity-50">
                {inviting ? "Inviting..." : "👤 Send Invite"}
              </button>
            </form>
          </div>

          {/* Current team */}
          <div className="card p-5">
            <p className="text-xs font-semibold mb-4" style={{ color:"var(--text-secondary)" }}>
              CURRENT TEAM ({startup.professionals?.length || 0} professional{startup.professionals?.length !== 1 ? "s" : ""})
            </p>

            {/* Founders */}
            <div className="space-y-2 mb-4">
              {startup.founders?.map(founder => (
                <div key={founder._id} className="flex items-center gap-3 p-3 rounded-xl"
                     style={{ background:"var(--bg-elevated)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                       style={{ background:"var(--accent)", color:"white" }}>
                    {founder.name?.[0] || "F"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color:"var(--text-primary)" }}>{founder.name}</p>
                    <p className="text-xs" style={{ color:"var(--text-muted)" }}>{founder.email}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background:"var(--accent-glow)", color:"#a5b4fc", border:"1px solid rgba(99,102,241,0.2)" }}>
                    Founder
                  </span>
                </div>
              ))}
            </div>

            {/* Professionals */}
            {startup.professionals?.length === 0 ? (
              <div className="text-center py-8 rounded-xl" style={{ border:"1px dashed var(--border)" }}>
                <p className="text-sm" style={{ color:"var(--text-muted)" }}>
                  No professionals linked yet. Invite your CA or Legal Advisor above.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {startup.professionals.map(p => {
                  const rc = roleColor(p.role);
                  return (
                    <div key={p.user._id} className="flex items-center gap-3 p-3 rounded-xl group"
                         style={{ background:"var(--bg-elevated)" }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                           style={{ background:`${rc.bg}`, border:`1px solid ${rc.border}`, color:rc.color }}>
                        {p.user.name?.[0] || "P"}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium" style={{ color:"var(--text-primary)" }}>{p.user.name}</p>
                        <p className="text-xs" style={{ color:"var(--text-muted)" }}>{p.user.email}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background:rc.bg, color:rc.color, border:`1px solid ${rc.border}` }}>
                        {roleLabel(p.role)}
                      </span>
                      <button onClick={() => handleRemove(p.user._id, p.user.name)}
                        className="text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background:"rgba(239,68,68,0.1)", color:"#f87171" }}>
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="card p-5" style={{ border:"1px solid rgba(99,102,241,0.15)" }}>
            <p className="text-xs font-semibold mb-3" style={{ color:"var(--text-secondary)" }}>HOW IT WORKS</p>
            <div className="space-y-3">
              {[
                { step:"1", text: "Professional registers on Founder Assist with their correct role (CA or Legal Advisor)" },
                { step:"2", text: "You enter their registered email and select their role above" },
                { step:"3", text: "They get a notification and your startup appears on their dashboard" },
                { step:"4", text: "They can view your documents, tasks, and provide services through the platform" },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-3 text-xs">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold"
                        style={{ background:"var(--accent-glow)", color:"#a5b4fc", border:"1px solid rgba(99,102,241,0.3)" }}>
                    {step}
                  </span>
                  <p style={{ color:"var(--text-secondary)" }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

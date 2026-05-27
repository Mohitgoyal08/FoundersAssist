import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const gradeColor = (g) => ({ "Excellent":"#10b981","Good":"#6366f1","Moderate":"#f59e0b","Needs Work":"#f97316","Critical":"#ef4444" }[g] || "#94a3b8");

export default function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState("info");
  const [editMode, setEditMode] = useState(false);

  const [name, setName]   = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [changingPw, setChangingPw] = useState(false);

  const [startupForm, setStartupForm] = useState({
    name: "", industry: "", stage: "idea", description: "", website: "", teamSize: 1,
  });
  const [savingStartup, setSavingStartup] = useState(false);

  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const clearAlerts = () => { setError(""); setSuccess(""); };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/profile");
      setProfile(data.data);
      setName(data.data.name || "");
      setPhone(data.data.phone || "");
      if (data.data.startup) {
        const s = data.data.startup;
        setStartupForm({
          name: s.name || "", industry: s.industry || "",
          stage: s.stage || "idea", description: s.description || "",
          website: s.website || "", teamSize: s.teamSize || 1,
        });
      }
    } catch { setError("Failed to load profile."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault(); clearAlerts(); setSaving(true);
    try {
      await API.put("/profile", { name, phone });
      await refreshUser(); await load();
      setSuccess("Profile updated!"); setEditMode(false);
    } catch (err) { setError(err.response?.data?.message || "Update failed."); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault(); clearAlerts();
    if (newPw !== confirmPw) { setError("Passwords don't match."); return; }
    if (newPw.length < 6)    { setError("Min 6 characters."); return; }
    setChangingPw(true);
    try {
      await API.put("/profile/change-password", { currentPassword: currentPw, newPassword: newPw });
      setSuccess("Password changed! Logging you out...");
      setTimeout(() => { logout(); navigate("/login"); }, 1500);
    } catch (err) { setError(err.response?.data?.message || "Failed."); }
    finally { setChangingPw(false); }
  };

  const handleSaveStartup = async (e) => {
    e.preventDefault(); clearAlerts(); setSavingStartup(true);
    try {
      if (profile?.startup) {
        // Update existing startup
        await API.put("/startups", startupForm);
        await refreshUser();
        await load();
        setSuccess("Startup updated successfully!");
      } else {
        // Create new — reload page so AuthContext re-fetches user with startup populated
        await API.post("/startups", startupForm);
        setSuccess("Startup created! Refreshing your dashboard...");
        setTimeout(() => window.location.reload(), 1200);
      }
    } catch (err) { setError(err.response?.data?.message || "Failed to save startup."); }
    finally { setSavingStartup(false); }
  };

  const initials = profile?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  const TABS = [
    { id: "info",     label: "Profile" },
    { id: "startup",  label: profile?.startup ? "My Startup" : "➕ Add Startup" },
    { id: "password", label: "Password" },
  ];

  const InfoRow = ({ label, value }) => (
    <div className="flex items-center justify-between py-3" style={{ borderBottom:"1px solid var(--border)" }}>
      <span className="text-xs font-medium" style={{ color:"var(--text-muted)" }}>{label}</span>
      <span className="text-sm" style={{ color:"var(--text-primary)" }}>{value || "—"}</span>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-display font-bold text-xl" style={{ color:"var(--text-primary)" }}>Profile</h2>
        <p className="text-sm mt-0.5" style={{ color:"var(--text-muted)" }}>Manage your account & startup</p>
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
      ) : (
        <>
          {/* Avatar card */}
          <div className="card flex items-center gap-5 p-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold font-display shrink-0"
                 style={{ background:"var(--accent)", color:"white" }}>
              {initials}
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-lg" style={{ color:"var(--text-primary)" }}>{profile?.name}</p>
              <p className="text-sm capitalize" style={{ color:"var(--text-muted)" }}>{profile?.role}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full"
                      style={{ background:profile?.isEmailVerified ? "#10b981" : "#f59e0b" }} />
                <span className="text-xs" style={{ color:profile?.isEmailVerified ? "#6ee7b7" : "#fcd34d" }}>
                  {profile?.isEmailVerified ? "Email verified" : "Not verified"}
                </span>
              </div>
            </div>
            {profile?.startup ? (
              <div className="text-right hidden sm:block">
                <p className="text-xs mb-0.5" style={{ color:"var(--text-muted)" }}>Startup</p>
                <p className="text-sm font-semibold" style={{ color:"var(--text-primary)" }}>{profile.startup.name}</p>
                <span className="text-xs capitalize px-2 py-0.5 rounded-full"
                      style={{ background:"var(--accent-glow)", color:"#a5b4fc", border:"1px solid rgba(99,102,241,0.2)" }}>
                  {profile.startup.stage}
                </span>
              </div>
            ) : (
              <button onClick={() => { setTab("startup"); clearAlerts(); }}
                className="text-xs px-3 py-1.5 rounded-xl hidden sm:block"
                style={{ background:"var(--accent-glow)", color:"#a5b4fc", border:"1px solid rgba(99,102,241,0.2)" }}>
                + Add Startup
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background:"var(--bg-elevated)" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); clearAlerts(); setEditMode(false); }}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: tab === t.id ? "var(--bg-card)" : "transparent",
                  color: tab === t.id ? "var(--text-primary)" : "var(--text-muted)",
                  border: tab === t.id ? "1px solid var(--border)" : "1px solid transparent",
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ─── PROFILE TAB ─── */}
          {tab === "info" && (
            <div className="card p-5 animate-fade-up">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold" style={{ color:"var(--text-secondary)" }}>ACCOUNT DETAILS</p>
                <button onClick={() => { setEditMode(e => !e); clearAlerts(); }}
                  className="btn-ghost text-xs px-3 py-1.5">
                  {editMode ? "Cancel" : "✎ Edit"}
                </button>
              </div>
              {!editMode ? (
                <div>
                  <InfoRow label="Full Name"    value={profile?.name} />
                  <InfoRow label="Email"        value={profile?.email} />
                  <InfoRow label="Phone"        value={profile?.phone} />
                  <InfoRow label="Role"         value={profile?.role} />
                  <InfoRow label="Member Since" value={new Date(profile?.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" })} />
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs mb-1" style={{ color:"var(--text-secondary)" }}>Full Name</label>
                    <input type="text" className="input-field" value={name}
                      onChange={e => setName(e.target.value)} required />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color:"var(--text-secondary)" }}>Phone Number</label>
                    <input type="tel" className="input-field" placeholder="+91 9876543210"
                      value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button type="button" onClick={() => setEditMode(false)} className="btn-ghost">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ─── STARTUP TAB ─── */}
          {tab === "startup" && (
            <div className="space-y-4 animate-fade-up">
              {profile?.startup && (
                <div className="card p-5"
                     style={{ border:"1px solid rgba(99,102,241,0.2)", background:"rgba(99,102,241,0.03)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold" style={{ color:"#a5b4fc" }}>CURRENT STARTUP</p>
                    {profile.startup.healthScore > 0 && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background:`${gradeColor("Good")}18`, color:gradeColor("Good") }}>
                        Health: {profile.startup.healthScore}/100
                      </span>
                    )}
                  </div>
                  <p className="font-display font-bold text-lg" style={{ color:"var(--text-primary)" }}>
                    {profile.startup.name}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.startup.industry && (
                      <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background:"var(--bg-elevated)", color:"var(--text-secondary)" }}>
                        {profile.startup.industry}
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                          style={{ background:"var(--accent-glow)", color:"#a5b4fc", border:"1px solid rgba(99,102,241,0.2)" }}>
                      {profile.startup.stage}
                    </span>
                  </div>
                  {profile.startup.description && (
                    <p className="text-xs mt-2" style={{ color:"var(--text-muted)" }}>{profile.startup.description}</p>
                  )}
                </div>
              )}

              <div className="card p-5">
                <p className="text-xs font-semibold mb-4" style={{ color:"var(--text-secondary)" }}>
                  {profile?.startup ? "UPDATE STARTUP DETAILS" : "CREATE YOUR STARTUP"}
                </p>
                <form onSubmit={handleSaveStartup} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs mb-1" style={{ color:"var(--text-secondary)" }}>Startup Name *</label>
                      <input type="text" className="input-field" placeholder="TechLaunch India"
                        value={startupForm.name}
                        onChange={e => setStartupForm(f => ({ ...f, name: e.target.value }))} required />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color:"var(--text-secondary)" }}>Industry</label>
                      <input type="text" className="input-field" placeholder="SaaS, FinTech, EdTech..."
                        value={startupForm.industry}
                        onChange={e => setStartupForm(f => ({ ...f, industry: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color:"var(--text-secondary)" }}>Stage *</label>
                      <select className="input-field" value={startupForm.stage}
                        onChange={e => setStartupForm(f => ({ ...f, stage: e.target.value }))}>
                        <option value="idea">Idea</option>
                        <option value="mvp">MVP</option>
                        <option value="growth">Growth</option>
                        <option value="scaling">Scaling</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color:"var(--text-secondary)" }}>Team Size</label>
                      <input type="number" className="input-field" min={1} max={10000}
                        value={startupForm.teamSize}
                        onChange={e => setStartupForm(f => ({ ...f, teamSize: parseInt(e.target.value) || 1 }))} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs mb-1" style={{ color:"var(--text-secondary)" }}>Website</label>
                      <input type="url" className="input-field" placeholder="https://yourstartup.com"
                        value={startupForm.website}
                        onChange={e => setStartupForm(f => ({ ...f, website: e.target.value }))} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs mb-1" style={{ color:"var(--text-secondary)" }}>Description</label>
                      <textarea className="input-field resize-none" rows={3}
                        placeholder="What problem does your startup solve?"
                        value={startupForm.description}
                        onChange={e => setStartupForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                  </div>
                  <button type="submit" disabled={savingStartup} className="btn-primary disabled:opacity-50">
                    {savingStartup
                      ? "Saving..."
                      : profile?.startup ? "Update Startup" : "🚀 Create & Link Startup"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ─── PASSWORD TAB ─── */}
          {tab === "password" && (
            <div className="card p-5 animate-fade-up">
              <p className="text-xs font-semibold mb-4" style={{ color:"var(--text-secondary)" }}>CHANGE PASSWORD</p>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs mb-1" style={{ color:"var(--text-secondary)" }}>Current Password</label>
                  <input type="password" className="input-field" placeholder="Your current password"
                    value={currentPw} onChange={e => setCurrentPw(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color:"var(--text-secondary)" }}>New Password</label>
                  <input type="password" className="input-field" placeholder="Min. 6 characters"
                    value={newPw} onChange={e => setNewPw(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color:"var(--text-secondary)" }}>Confirm New Password</label>
                  <input type="password" className="input-field" placeholder="Repeat new password"
                    value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required />
                </div>
                <button type="submit" disabled={changingPw} className="btn-primary disabled:opacity-50">
                  {changingPw ? "Changing..." : "Change Password"}
                </button>
              </form>

              <div className="mt-5 pt-5" style={{ borderTop:"1px solid var(--border)" }}>
                <p className="text-xs font-semibold mb-3" style={{ color:"#ef4444" }}>DANGER ZONE</p>
                <button onClick={() => { logout(); navigate("/login"); }}
                  className="text-sm px-4 py-2 rounded-xl"
                  style={{ background:"rgba(239,68,68,0.1)", color:"#f87171", border:"1px solid rgba(239,68,68,0.2)" }}>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
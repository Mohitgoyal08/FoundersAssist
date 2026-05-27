import { useState, useEffect } from "react";
import API from "../api/axios";

const gradeColor = (grade) => ({
  "Excellent": "#10b981",
  "Good":      "#6366f1",
  "Moderate":  "#f59e0b",
  "Needs Work":"#f97316",
  "Critical":  "#ef4444",
}[grade] || "#94a3b8");

const EMPTY_FORM = {
  teamSize: 1, stage: "idea", hasRevenue: false, productReady: false,
  marketSize: "small", competitionLevel: "high",
  hasBusinessPlan: false, hasAdvisors: false, hasFunding: false, customerCount: 0,
};

const ScoreMeter = ({ score, grade }) => {
  const color = gradeColor(grade);
  const angle = (score / 100) * 180;
  const r = 70;
  const cx = 90, cy = 90;
  const toRad = (d) => (d * Math.PI) / 180;
  const startX = cx + r * Math.cos(toRad(180));
  const startY = cy + r * Math.sin(toRad(180));
  const endX = cx + r * Math.cos(toRad(180 - angle));
  const endY = cy + r * Math.sin(toRad(180 - angle));
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="100" viewBox="0 0 180 100">
        {/* Background arc */}
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="var(--border)" strokeWidth="12" strokeLinecap="round" />
        {/* Score arc */}
        {score > 0 && (
          <path d={`M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`}
            fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" />
        )}
        {/* Score text */}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="28" fontWeight="bold" fill={color}
          fontFamily="Syne, sans-serif">
          {score}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="11" fill="var(--text-muted)">out of 100</text>
      </svg>
      <span className="text-sm font-bold mt-1 px-3 py-1 rounded-full"
            style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
        {grade}
      </span>
    </div>
  );
};

export default function Health() {
  const [latest, setLatest]   = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [calculating, setCalculating] = useState(false);
  const [error, setError]     = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [latestRes, historyRes] = await Promise.allSettled([
        API.get("/health"),
        API.get("/health/history"),
      ]);
      if (latestRes.status === "fulfilled") setLatest(latestRes.value.data.data);
      if (historyRes.status === "fulfilled") setHistory(historyRes.value.data.trend || []);
    } catch { setError("Failed to load health data."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setCalculating(true); setError("");
    try {
      const { data } = await API.post("/health/calculate", form);
      setLatest(data.data);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Calculation failed.");
    } finally { setCalculating(false); }
  };

  const Toggle = ({ label, field }) => (
    <div className="flex items-center justify-between py-3"
         style={{ borderBottom: "1px solid var(--border)" }}>
      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{label}</span>
      <button type="button" onClick={() => setForm(f => ({ ...f, [field]: !f[field] }))}
        className="w-10 h-5 rounded-full relative transition-all duration-200 shrink-0"
        style={{ background: form[field] ? "var(--accent)" : "var(--border)" }}>
        <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200"
              style={{ left: form[field] ? "calc(100% - 18px)" : "2px" }} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl" style={{ color: "var(--text-primary)" }}>Startup Health Score</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Diagnose your startup across 10 dimensions</p>
        </div>
        <button onClick={() => { setShowForm(s => !s); setError(""); }}
          className="btn-primary">
          {showForm ? "✕ Cancel" : "◎ Calculate Score"}
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm"
             style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 animate-spin-slow"
               style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
        </div>
      ) : (
        <>
          {/* Current score */}
          {latest && !showForm && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-up">

              {/* Score meter */}
              <div className="card flex flex-col items-center justify-center py-8"
                   style={{ border: `1px solid ${gradeColor(latest.grade)}30` }}>
                <ScoreMeter score={latest.score} grade={latest.grade} />
                <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>
                  Last calculated: {new Date(latest.calculatedAt || latest.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>

              {/* Score breakdown */}
              <div className="card p-5">
                <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>BREAKDOWN</p>
                <div className="space-y-2">
                  {Object.entries(latest.breakdown || {}).map(([key, val]) => {
                    const label = key.replace("Score", "").replace(/([A-Z])/g, " $1").trim();
                    const maxMap = { team: 15, stage: 15, revenue: 15, product: 15, market: 10, competition: 10, plan: 5, advisor: 5, funding: 5, customer: 5 };
                    const max = maxMap[key.replace("Score", "")] || 10;
                    const pct = (val / max) * 100;
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="capitalize" style={{ color: "var(--text-secondary)" }}>{label}</span>
                          <span style={{ color: "var(--text-muted)" }}>{val}/{max}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                          <div className="h-full rounded-full transition-all duration-500"
                               style={{ width: `${pct}%`, background: pct >= 70 ? "#10b981" : pct >= 40 ? "#6366f1" : "#ef4444" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strengths */}
              {latest.strengths?.length > 0 && (
                <div className="card p-5">
                  <p className="text-xs font-semibold mb-3" style={{ color: "#10b981" }}>✓ STRENGTHS</p>
                  <div className="space-y-2">
                    {latest.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                        <span className="text-emerald-400 mt-0.5 shrink-0">✓</span> {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {latest.suggestions?.length > 0 && (
                <div className="card p-5">
                  <p className="text-xs font-semibold mb-3" style={{ color: "#f59e0b" }}>↑ IMPROVEMENTS</p>
                  <div className="space-y-3">
                    {latest.suggestions.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                        <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs"
                              style={{ background: "rgba(245,158,11,0.15)", color: "#fcd34d" }}>
                          {i + 1}
                        </span>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No score yet */}
          {!latest && !showForm && (
            <div className="card text-center py-16">
              <p className="text-3xl mb-3">◎</p>
              <p className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>No health score yet</p>
              <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>Calculate your startup's health score to get insights</p>
              <button onClick={() => setShowForm(true)} className="btn-primary">Calculate Now</button>
            </div>
          )}

          {/* Calculate form */}
          {showForm && (
            <div className="card p-6 animate-fade-up" style={{ border: "1px solid rgba(99,102,241,0.3)" }}>
              <h3 className="font-semibold text-sm mb-5" style={{ color: "var(--text-primary)" }}>
                Startup Health Calculator
              </h3>
              <form onSubmit={handleCalculate} className="space-y-5">

                {/* Stage + Team */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Startup Stage *</label>
                    <select className="input-field" value={form.stage}
                      onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
                      <option value="idea">Idea</option>
                      <option value="mvp">MVP</option>
                      <option value="growth">Growth</option>
                      <option value="scaling">Scaling</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Team Size</label>
                    <input type="number" className="input-field" min={1} max={500}
                      value={form.teamSize} onChange={e => setForm(f => ({ ...f, teamSize: parseInt(e.target.value) || 1 }))} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Market Size</label>
                    <select className="input-field" value={form.marketSize}
                      onChange={e => setForm(f => ({ ...f, marketSize: e.target.value }))}>
                      <option value="small">Small (niche)</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large (mass market)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Competition Level</label>
                    <select className="input-field" value={form.competitionLevel}
                      onChange={e => setForm(f => ({ ...f, competitionLevel: e.target.value }))}>
                      <option value="low">Low (few competitors)</option>
                      <option value="medium">Medium</option>
                      <option value="high">High (crowded market)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Customer Count</label>
                    <input type="number" className="input-field" min={0}
                      value={form.customerCount} onChange={e => setForm(f => ({ ...f, customerCount: parseInt(e.target.value) || 0 }))} />
                  </div>
                </div>

                {/* Toggles */}
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  <div className="px-4" style={{ background: "var(--bg-elevated)" }}>
                    <Toggle label="Has Revenue"       field="hasRevenue" />
                    <Toggle label="Product Ready"     field="productReady" />
                    <Toggle label="Has Business Plan" field="hasBusinessPlan" />
                    <Toggle label="Has Advisors"      field="hasAdvisors" />
                    <Toggle label="Has External Funding" field="hasFunding" />
                  </div>
                </div>

                <button type="submit" disabled={calculating} className="btn-primary disabled:opacity-50">
                  {calculating ? "Calculating..." : "◎ Calculate Health Score"}
                </button>
              </form>
            </div>
          )}

          {/* Score history */}
          {history.length > 1 && (
            <div className="animate-fade-up">
              <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>Score History</h3>
              <div className="card p-4">
                <div className="flex items-end gap-2 h-24">
                  {history.map((record, i) => {
                    const color = gradeColor(record.grade);
                    const heightPct = (record.score / 100) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <div className="relative w-full">
                          <div className="hidden group-hover:block absolute -top-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap px-1.5 py-0.5 rounded"
                               style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
                            {record.score}
                          </div>
                          <div className="w-full rounded-t-sm transition-all"
                               style={{ height: `${heightPct * 0.8}px`, background: color, minHeight: "4px" }} />
                        </div>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {new Date(record.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

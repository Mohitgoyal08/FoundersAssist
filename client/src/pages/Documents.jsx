import { useState, useEffect } from "react";
import API from "../api/axios";

const DOC_TYPES = [
  { value: "founder_agreement",    label: "Founder Agreement" },
  { value: "nda",                  label: "NDA" },
  { value: "shareholder_agreement",label: "Shareholder Agreement" },
  { value: "service_agreement",    label: "Service Agreement" },
  { value: "offer_letter",         label: "Offer Letter" },
];

const FIELDS = {
  founder_agreement:     ["companyName","founder1Name","founder2Name","founder1Equity","founder2Equity","vestingPeriod","cliffPeriod"],
  nda:                   ["companyName","disclosingParty","receivingParty","purpose","confidentialityPeriod","governingLaw"],
  shareholder_agreement: ["companyName","shareholder1Name","shareholder2Name","shareholder1Shares","totalShares"],
  service_agreement:     ["companyName","clientName","serviceProviderName","serviceDescription","paymentAmount","contractDuration"],
  offer_letter:          ["companyName","candidateName","position","department","salary","startDate","hrName"],
};

const fieldLabel = (f) => f.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());

export default function Documents() {
  const [docs, setDocs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [docType, setDocType]   = useState("nda");
  const [formData, setFormData] = useState({});
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/documents");
      setDocs(data.data || []);
    } catch { setError("Failed to load documents."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // Reset form when doc type changes
  useEffect(() => { setFormData({}); }, [docType]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true); setError(""); setSuccess("");
    try {
      await API.post("/documents/generate", { type: docType, formData });
      setSuccess("Document generated successfully!");
      setShowForm(false); setFormData({});
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate document.");
    } finally { setGenerating(false); }
  };

  const handleDownload = async (doc) => {
    setDownloading(doc._id);
    try {
      const response = await API.get(`/documents/${doc._id}/download`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.title}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { setError("Download failed. Please try again."); }
    finally { setDownloading(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this document permanently?")) return;
    try {
      await API.delete(`/documents/${id}`);
      setDocs(d => d.filter(doc => doc._id !== id));
    } catch { setError("Failed to delete document."); }
  };

  const typeLabel = (t) => DOC_TYPES.find(d => d.value === t)?.label || t;

  const typeColor = (t) => ({
    founder_agreement:     "#6366f1",
    nda:                   "#10b981",
    shareholder_agreement: "#f59e0b",
    service_agreement:     "#a855f7",
    offer_letter:          "#06b6d4",
  }[t] || "#94a3b8");

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl" style={{ color: "var(--text-primary)" }}>Documents</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Generate legal documents instantly</p>
        </div>
        <button onClick={() => { setShowForm(s => !s); setError(""); setSuccess(""); }}
          className="btn-primary">
          {showForm ? "✕ Cancel" : "+ Generate Document"}
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

      {/* Generate form */}
      {showForm && (
        <div className="card p-6 animate-fade-up" style={{ border: "1px solid rgba(99,102,241,0.3)" }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>Generate New Document</h3>

          {/* Type selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
            {DOC_TYPES.map(({ value, label }) => (
              <button key={value} type="button" onClick={() => setDocType(value)}
                className="p-3 rounded-xl text-xs font-medium text-left transition-all"
                style={{
                  background: docType === value ? `${typeColor(value)}18` : "var(--bg-elevated)",
                  border: `1px solid ${docType === value ? typeColor(value) : "var(--border)"}`,
                  color: docType === value ? typeColor(value) : "var(--text-secondary)",
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Dynamic form fields */}
          <form onSubmit={handleGenerate} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FIELDS[docType]?.map(field => (
                <div key={field}>
                  <label className="block text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
                    {fieldLabel(field)}
                  </label>
                  <input type="text" className="input-field"
                    placeholder={fieldLabel(field)}
                    value={formData[field] || ""}
                    onChange={e => setFormData(f => ({ ...f, [field]: e.target.value }))}
                    required
                  />
                </div>
              ))}
            </div>
            <button type="submit" disabled={generating} className="btn-primary mt-2 disabled:opacity-50">
              {generating ? "Generating..." : `⚡ Generate ${typeLabel(docType)}`}
            </button>
          </form>
        </div>
      )}

      {/* Document list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-7 h-7 rounded-full border-2 animate-spin-slow"
               style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
        </div>
      ) : docs.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-3xl mb-3">📄</p>
          <p className="font-medium" style={{ color: "var(--text-primary)" }}>No documents yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Generate your first legal document above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map(doc => {
            const color = typeColor(doc.type);
            return (
              <div key={doc._id} className="card flex items-center gap-4 p-4 group">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                     style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  📄
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>{doc.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
                      {typeLabel(doc.type)}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(doc.createdAt).toLocaleDateString("en-IN")}
                    </span>
                    {doc.fileSize > 0 && (
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {(doc.fileSize / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDownload(doc)} disabled={downloading === doc._id}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                    style={{ background: "rgba(99,102,241,0.1)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.2)" }}>
                    {downloading === doc._id ? "..." : "↓ PDF"}
                  </button>
                  <button onClick={() => handleDelete(doc._id)}
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors"
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

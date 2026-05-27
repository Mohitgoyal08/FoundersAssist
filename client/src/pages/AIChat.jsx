import { useState, useEffect, useRef } from "react";
import API from "../api/axios";

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [sending, setSending]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data } = await API.get("/ai/history");
        setMessages(data.data || []);
      } catch { /* silent fail */ }
      finally { setLoading(false); }
    };
    loadHistory();
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setInput(""); setError("");

    // Optimistically add user message
    const tempUser = { _id: `temp-${Date.now()}`, role: "user", message: text, timestamp: new Date() };
    setMessages(m => [...m, tempUser]);

    setSending(true);
    try {
      const { data } = await API.post("/ai/chat", { message: text });
      setMessages(m => [...m, data.data]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send message. Try again.");
      // Remove the optimistic message on failure
      setMessages(m => m.filter(msg => msg._id !== tempUser._id));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleClear = async () => {
    if (!confirm("Clear all chat history?")) return;
    try {
      await API.post("/ai/clear");
      setMessages([]);
    } catch { setError("Failed to clear history."); }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  // Format message text with basic markdown-like rendering
  const formatMessage = (text) => {
    return text
      .split("\n")
      .map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**")) {
          return <p key={i} className="font-semibold mt-2 mb-1" style={{ color: "var(--text-primary)" }}>{line.slice(2, -2)}</p>;
        }
        if (line.match(/^\d+\./)) {
          return <p key={i} className="ml-2 my-0.5">{line}</p>;
        }
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return <p key={i} className="ml-2 my-0.5">• {line.slice(2)}</p>;
        }
        if (!line.trim()) return <br key={i} />;
        return <p key={i} className="my-0.5">{line}</p>;
      });
  };

  const STARTERS = [
    "How do I validate my startup idea?",
    "Help me write a pitch deck outline",
    "How do I raise seed funding in India?",
    "What metrics should I track for SaaS?",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="font-display font-bold text-xl" style={{ color: "var(--text-primary)" }}>
            AI Startup Mentor
          </h2>
          <p className="text-sm mt-0.5 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            Powered by Gemini AI
          </p>
        </div>
        {messages.length > 0 && (
          <button onClick={handleClear} className="btn-ghost text-xs px-3 py-1.5">
            Clear history
          </button>
        )}
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm mb-3 shrink-0"
             style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          {error}
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4 pb-4">

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 rounded-full border-2 animate-spin-slow"
                 style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
          </div>
        ) : messages.length === 0 ? (
          /* Welcome screen */
          <div className="flex flex-col items-center justify-center h-full gap-6 py-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                 style={{ background: "var(--accent-glow)", border: "1px solid rgba(99,102,241,0.3)" }}>
              ✦
            </div>
            <div className="text-center">
              <h3 className="font-display font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>
                Your AI Startup Mentor
              </h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Ask me anything about building, funding, or growing your startup.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {STARTERS.map((s, i) => (
                <button key={i} onClick={() => { setInput(s); inputRef.current?.focus(); }}
                  className="text-left text-xs p-3 rounded-xl transition-all"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message list */
          messages.map((msg) => (
            <div key={msg._id}
              className={`flex gap-3 animate-fade-up ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>

              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-1`}
                   style={{
                     background: msg.role === "user" ? "var(--accent)" : "var(--bg-elevated)",
                     border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                     color: msg.role === "user" ? "white" : "#a5b4fc",
                   }}>
                {msg.role === "user" ? "U" : "✦"}
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed`}
                   style={{
                     background: msg.role === "user" ? "var(--accent)" : "var(--bg-card)",
                     border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                     color: msg.role === "user" ? "white" : "var(--text-secondary)",
                     borderRadius: msg.role === "user" ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                   }}>
                {msg.role === "assistant" ? formatMessage(msg.message) : msg.message}
                <p className="text-xs mt-2 opacity-50">
                  {new Date(msg.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {sending && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs"
                 style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "#a5b4fc" }}>
              ✦
            </div>
            <div className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
                 style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                     style={{ background: "var(--text-muted)", animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
        <form onSubmit={handleSend} className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              className="input-field resize-none pr-4"
              rows={1}
              placeholder="Ask me about funding, pitch decks, go-to-market..."
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
          </div>
          <button type="submit" disabled={sending || !input.trim()}
            className="btn-primary px-4 py-3 shrink-0 disabled:opacity-40"
            style={{ height: "48px" }}>
            {sending ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-slow" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </button>
        </form>
        <p className="text-xs mt-2 text-center" style={{ color: "var(--text-muted)" }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

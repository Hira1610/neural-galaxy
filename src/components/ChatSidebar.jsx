import { useEffect, useRef, useState } from "react";
import Logo from "./Logo.jsx";
import MessageBubble from "./MessageBubble.jsx";

export default function ChatSidebar({
  user,
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onSendMessage,
  onLogout,
  loading,
  error,
  palette,
}) {
  const [value, setValue] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const threadRef = useRef(null);

  const active = conversations.find((c) => c.id === activeConversationId);
  const messages = active?.messages || [];

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    setValue("");
    onSendMessage(trimmed);
  };

  return (
    <div
      style={{
        width: 400,
        minWidth: 400,
        height: "100vh",
        background: "var(--panel)",
        borderRight: "1px solid var(--panel-border)",
        backdropFilter: "blur(14px)",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        zIndex: 5,
      }}
    >
      {/* Top bar: logo + new chat + history toggle */}
      <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Logo size={24} />
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 17,
                fontWeight: 600,
                margin: 0,
                color: "var(--ink)",
              }}
            >
              Neural Galaxy
            </h1>
          </div>
          <button
            onClick={() => setShowHistory((s) => !s)}
            title="Conversation history"
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              color: "var(--ink-dim)",
              fontSize: 11,
              padding: "5px 9px",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
            }}
          >
            {showHistory ? "✕" : "☰"}
          </button>
        </div>

        <button
          onClick={onNewChat}
          style={{
            marginTop: 12,
            width: "100%",
            background: "rgba(139,127,255,0.14)",
            border: "1px solid rgba(139,127,255,0.35)",
            borderRadius: 10,
            color: "var(--ink)",
            fontSize: 12.5,
            padding: "8px 0",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
          }}
        >
          + New chat
        </button>
      </div>

      {showHistory ? (
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.06em",
              color: "var(--ink-dim)",
              textTransform: "uppercase",
              margin: "6px 0 10px",
            }}
          >
            Conversations
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelectConversation(c.id);
                  setShowHistory(false);
                }}
                style={{
                  background: c.id === activeConversationId ? "rgba(139,127,255,0.16)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${c.id === activeConversationId ? "rgba(139,127,255,0.4)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 10,
                  color: c.id === activeConversationId ? "var(--ink)" : "var(--ink-dim)",
                  fontSize: 12.5,
                  padding: "9px 12px",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  textAlign: "left",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {c.title}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Message thread */}
          <div ref={threadRef} style={{ flex: 1, overflowY: "auto", padding: "18px 16px" }}>
            {messages.length === 0 && (
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--ink-dim)",
                  textAlign: "center",
                  marginTop: 40,
                  lineHeight: 1.7,
                }}
              >
                Say anything — the reply shows up here,
                <br />
                and its "thought graph" forms in the brain view.
              </p>
            )}
            {messages.map((m, i) => (
              <MessageBubble key={i} role={m.role} content={m.content} palette={palette} />
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "14px 14px 14px 4px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--ink-dim)",
                  }}
                >
                  thinking…
                </div>
              </div>
            )}
          </div>

          {error && (
            <p style={{ color: "#ff8a8a", fontSize: 12, padding: "0 16px", marginBottom: 8 }}>{error}</p>
          )}

          {/* Input */}
          <div style={{ padding: "14px 16px 18px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Message Neural Galaxy…"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  outline: "none",
                  color: "var(--ink)",
                  fontFamily: "var(--font-body)",
                  fontSize: 13.5,
                  padding: "10px 12px",
                  resize: "none",
                  maxHeight: 100,
                }}
              />
              <button
                onClick={submit}
                disabled={loading}
                style={{
                  background: loading ? "rgba(139,127,255,0.25)" : "var(--violet)",
                  border: "none",
                  borderRadius: 12,
                  color: "#05060a",
                  fontWeight: 600,
                  fontSize: 13,
                  padding: "0 16px",
                  cursor: loading ? "wait" : "pointer",
                }}
              >
                ↑
              </button>
            </div>
          </div>
        </>
      )}

      {/* User footer */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--cyan), var(--violet))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
              color: "#05060a",
              flexShrink: 0,
            }}
          >
            {user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12.5,
              color: "var(--ink-dim)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user?.name || user?.email}
          </span>
        </div>
        <button
          onClick={onLogout}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--ink-dim)",
            fontSize: 11,
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}

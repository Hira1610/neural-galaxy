export default function MessageBubble({ role, content, palette }) {
  const isUser = role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 12 }}>
      <div
        style={{
          maxWidth: "82%",
          padding: "10px 14px",
          borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
          background: isUser ? "rgba(139,127,255,0.16)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${isUser ? "rgba(139,127,255,0.3)" : "rgba(255,255,255,0.08)"}`,
          color: "var(--ink)",
          fontSize: 13.5,
          lineHeight: 1.55,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {content}
      </div>
    </div>
  );
}

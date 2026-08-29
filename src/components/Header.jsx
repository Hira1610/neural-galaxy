export default function Header({ mode }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "flex-start",
        padding: "24px 28px",
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.08em",
          padding: "7px 12px",
          borderRadius: "999px",
          border: `1px solid ${mode === "live" ? "rgba(94,234,212,0.4)" : "rgba(255,211,122,0.4)"}`,
          color: mode === "live" ? "var(--cyan)" : "var(--gold)",
          background: "rgba(10,13,22,0.5)",
          backdropFilter: "blur(6px)",
        }}
      >
        {mode === "live" ? "● NEURAL LINK ACTIVE" : "○ OFFLINE DEMO"}
      </div>
    </div>
  );
}

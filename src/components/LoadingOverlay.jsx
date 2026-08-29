export default function LoadingOverlay({ visible }) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 4,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          letterSpacing: "0.12em",
          color: "var(--cyan)",
          textTransform: "uppercase",
          animation: "pulse 1.4s ease-in-out infinite",
        }}
      >
        forming constellation…
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

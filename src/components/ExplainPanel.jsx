import { useEffect, useMemo, useState } from "react";
import { requestNodeExplanation } from "../api/graphService.js";
import { buildNodeNumberMap } from "../utils/graphOrder.js";

export default function ExplainPanel({ node, graph, context, onClose, onSelectRelated, palette }) {
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const nodeNumbers = useMemo(() => buildNodeNumberMap(graph), [graph]);

  const connections = useMemo(() => {
    if (!node || !graph) return [];
    return graph.edges
      .filter((e) => e.source === node.id || e.target === node.id)
      .map((e) => {
        const otherId = e.source === node.id ? e.target : e.source;
        const otherNode = graph.nodes.find((n) => n.id === otherId);
        if (!otherNode) return null;
        return { node: otherNode, number: nodeNumbers.get(otherId) };
      })
      .filter(Boolean);
  }, [node, graph, nodeNumbers]);

  useEffect(() => {
    if (!node) return;
    let cancelled = false;
    setLoading(true);
    setExplanation("");
    requestNodeExplanation(node.label, context).then((text) => {
      if (!cancelled) {
        setExplanation(text);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [node, context]);

  if (!node) return null;

  return (
    // Absolutely positioned WITHIN the graph pane only — this is what keeps
    // the 3D scene's true center fixed. The canvas underneath never resizes
    // when this opens or closes, it just gets partially covered on the right.
    <div
      style={{
        position: "absolute",
        top: 70,
        right: 20,
        bottom: 20,
        width: 320,
        maxWidth: "36%",
        zIndex: 6,
        background: "var(--panel)",
        border: "1px solid var(--panel-border)",
        borderRadius: 16,
        backdropFilter: "blur(14px)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 20px",
        boxSizing: "border-box",
        overflowY: "auto",
        animation: "slideIn 0.25s ease-out",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.08em",
            color: "var(--ink-dim)",
            textTransform: "uppercase",
          }}
        >
          Concept #{nodeNumbers.get(node.id)}
        </span>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--ink-dim)",
            fontSize: 16,
            cursor: "pointer",
            lineHeight: 1,
            padding: 2,
          }}
        >
          ✕
        </button>
      </div>

      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 20,
          fontWeight: 600,
          margin: "6px 0 14px",
          color: node.id === "root" ? palette.root : palette.leafA,
          wordBreak: "break-word",
        }}
      >
        {node.label}
      </h2>

      <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 14 }} />

      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13.5,
          lineHeight: 1.6,
          color: loading ? "var(--ink-dim)" : "var(--ink)",
          margin: 0,
          marginBottom: 18,
          whiteSpace: "pre-wrap",
        }}
      >
        {loading ? "Asking the model…" : explanation}
      </p>

      {connections.length > 0 && (
        <>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.06em",
              color: "var(--ink-dim)",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Connected to
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {connections.map(({ node: otherNode, number }) => (
              <button
                key={otherNode.id}
                onClick={() => onSelectRelated?.(otherNode)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  color: "var(--ink)",
                  fontSize: 12.5,
                  padding: "7px 10px",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "var(--font-body)",
                }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: palette.leafA, minWidth: 20 }}>
                  #{number}
                </span>
                <span>{otherNode.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

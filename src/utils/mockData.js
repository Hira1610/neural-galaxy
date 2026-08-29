// Deterministic-ish offline fallback so the app is fully demoable
// even with zero API key configured (judges can try it instantly).

const STOPWORDS = new Set([
  "the", "a", "an", "of", "to", "in", "on", "for", "and", "or", "is", "are",
  "was", "were", "with", "that", "this", "it", "as", "by", "at", "be", "how",
  "what", "why", "does", "do", "can", "about",
]);

export function generateMockGraph(prompt) {
  const words = (prompt || "neural galaxy")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));

  const unique = Array.from(new Set(words)).slice(0, 12);
  const base = unique.length ? unique : ["concept", "idea", "thought"];

  const central = { id: "root", label: base[0], importance: 1 };
  const nodes = [central];
  const edges = [];

  base.slice(1).forEach((word, i) => {
    const id = `n${i}`;
    nodes.push({
      id,
      label: word,
      importance: Math.max(0.35, 1 - i * 0.09),
    });
    edges.push({
      source: "root",
      target: id,
      weight: Math.max(0.3, 1 - i * 0.1),
    });
    // occasional cross-links so it doesn't look like a plain star
    if (i > 1 && i % 3 === 0) {
      edges.push({ source: `n${i - 2}`, target: id, weight: 0.4 });
    }
  });

  return { nodes, edges, source: "offline" };
}

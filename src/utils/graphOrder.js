// Breadth-first order starting from root — this is what makes progressive
// reveal feel like "the thought forming outward" instead of a random pop-in,
// and it doubles as a stable numbering scheme (#1 is always root, etc.)
// so the same node always gets the same number across the app.

export function computeRevealOrder(graph) {
  if (!graph?.nodes?.length) return [];

  const adjacency = new Map();
  graph.nodes.forEach((n) => adjacency.set(n.id, []));
  graph.edges.forEach((e) => {
    adjacency.get(e.source)?.push(e.target);
    adjacency.get(e.target)?.push(e.source);
  });

  const root = graph.nodes.find((n) => n.id === "root") || graph.nodes[0];
  const visited = new Set([root.id]);
  const queue = [root];
  const order = [root];

  while (queue.length) {
    const current = queue.shift();
    const neighbors = adjacency.get(current.id) || [];
    for (const nid of neighbors) {
      if (!visited.has(nid)) {
        visited.add(nid);
        const n = graph.nodes.find((x) => x.id === nid);
        if (n) {
          order.push(n);
          queue.push(n);
        }
      }
    }
  }
  graph.nodes.forEach((n) => {
    if (!visited.has(n.id)) order.push(n);
  });
  return order;
}

export function buildNodeNumberMap(graph) {
  const order = computeRevealOrder(graph);
  const map = new Map();
  order.forEach((n, i) => map.set(n.id, i + 1));
  return map;
}

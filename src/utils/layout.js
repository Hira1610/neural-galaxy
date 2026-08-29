// Lightweight 3D force-directed layout. No external physics library needed —
// this keeps the demo dependency-light and fast for a hackathon build.
//
// Nodes repel each other (so the graph breathes and doesn't collapse),
// connected nodes attract along edges (so related concepts cluster),
// and everything is pulled gently toward the origin (so it stays framed).

export function layoutGraph(nodes, edges, { iterations = 220, spread = 6 } = {}) {
  const positions = new Map();

  // Start on a fibonacci sphere so the initial state already looks intentional,
  // not like a random cloud snapping into place.
  const n = nodes.length || 1;
  nodes.forEach((node, i) => {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = spread * (0.6 + Math.random() * 0.4);
    positions.set(node.id, {
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi),
    });
  });

  const idIndex = new Map(nodes.map((n, i) => [n.id, i]));
  const velocities = nodes.map(() => ({ x: 0, y: 0, z: 0 }));
  const arr = nodes.map((node) => positions.get(node.id));

  const repelStrength = 2.2;
  const springStrength = 0.02;
  const centerPull = 0.01;
  const damping = 0.86;

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion between every pair (fine for small graphs, which this always is)
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const dx = arr[i].x - arr[j].x;
        const dy = arr[i].y - arr[j].y;
        const dz = arr[i].z - arr[j].z;
        let distSq = dx * dx + dy * dy + dz * dz;
        if (distSq < 0.01) distSq = 0.01;
        const dist = Math.sqrt(distSq);
        const force = repelStrength / distSq;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        const fz = (dz / dist) * force;
        velocities[i].x += fx;
        velocities[i].y += fy;
        velocities[i].z += fz;
        velocities[j].x -= fx;
        velocities[j].y -= fy;
        velocities[j].z -= fz;
      }
    }

    // Spring attraction along edges, scaled by edge weight
    for (const edge of edges) {
      const a = idIndex.get(edge.source);
      const b = idIndex.get(edge.target);
      if (a === undefined || b === undefined || a === b) continue;
      const dx = arr[b].x - arr[a].x;
      const dy = arr[b].y - arr[a].y;
      const dz = arr[b].z - arr[a].z;
      const weight = edge.weight ?? 0.5;
      velocities[a].x += dx * springStrength * (0.4 + weight);
      velocities[a].y += dy * springStrength * (0.4 + weight);
      velocities[a].z += dz * springStrength * (0.4 + weight);
      velocities[b].x -= dx * springStrength * (0.4 + weight);
      velocities[b].y -= dy * springStrength * (0.4 + weight);
      velocities[b].z -= dz * springStrength * (0.4 + weight);
    }

    // Gentle pull toward center so the graph stays framed in view
    for (let i = 0; i < arr.length; i++) {
      velocities[i].x += -arr[i].x * centerPull;
      velocities[i].y += -arr[i].y * centerPull;
      velocities[i].z += -arr[i].z * centerPull;
    }

    // Integrate + damp
    for (let i = 0; i < arr.length; i++) {
      velocities[i].x *= damping;
      velocities[i].y *= damping;
      velocities[i].z *= damping;
      arr[i].x += velocities[i].x;
      arr[i].y += velocities[i].y;
      arr[i].z += velocities[i].z;
    }
  }

  const result = new Map();
  nodes.forEach((node, i) => result.set(node.id, arr[i]));
  return result;
}

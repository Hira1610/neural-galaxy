import { useMemo, useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import NodeMesh from "./NodeMesh.jsx";
import EdgeLine from "./EdgeLine.jsx";
import { layoutGraph } from "../utils/layout.js";
import { computeRevealOrder, buildNodeNumberMap } from "../utils/graphOrder.js";

export default function GalaxyGraph({ graph, onNodeSelect, selectedNodeId, palette }) {
  const groupRef = useRef();
  const [revealCount, setRevealCount] = useState(0);

  const positions = useMemo(() => {
    if (!graph) return new Map();
    return layoutGraph(graph.nodes, graph.edges);
  }, [graph]);

  const orderedNodes = useMemo(() => computeRevealOrder(graph), [graph]);
  const nodeNumbers = useMemo(() => buildNodeNumberMap(graph), [graph]);

  // Reveal one node roughly every 90ms so the whole graph forms in under ~1.3s
  useEffect(() => {
    setRevealCount(0);
    if (!orderedNodes.length) return;
    const interval = setInterval(() => {
      setRevealCount((c) => {
        if (c >= orderedNodes.length) {
          clearInterval(interval);
          return c;
        }
        return c + 1;
      });
    }, 90);
    return () => clearInterval(interval);
  }, [orderedNodes]);

  const revealedIds = useMemo(
    () => new Set(orderedNodes.slice(0, revealCount).map((n) => n.id)),
    [orderedNodes, revealCount]
  );

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  if (!graph) return null;

  return (
    <group ref={groupRef}>
      {graph.edges.map((edge, i) => {
        if (!revealedIds.has(edge.source) || !revealedIds.has(edge.target)) return null;
        const a = positions.get(edge.source);
        const b = positions.get(edge.target);
        if (!a || !b) return null;
        const highlighted =
          selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId);
        return (
          <EdgeLine
            key={`${edge.source}-${edge.target}-${i}`}
            start={[a.x, a.y, a.z]}
            end={[b.x, b.y, b.z]}
            weight={edge.weight ?? 0.5}
            highlighted={highlighted}
            palette={palette}
          />
        );
      })}

      {graph.nodes.map((node) => {
        if (!revealedIds.has(node.id)) return null;
        const p = positions.get(node.id);
        if (!p) return null;
        return (
          <NodeMesh
            key={node.id}
            position={[p.x, p.y, p.z]}
            label={node.label}
            number={nodeNumbers.get(node.id)}
            importance={node.importance ?? 0.5}
            isRoot={node.id === "root"}
            isActive={selectedNodeId === node.id}
            onSelect={() => onNodeSelect?.(node)}
            palette={palette}
          />
        );
      })}
    </group>
  );
}

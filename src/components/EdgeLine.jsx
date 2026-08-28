import { useMemo } from "react";
import { QuadraticBezierLine } from "@react-three/drei";
import * as THREE from "three";

export default function EdgeLine({ start, end, weight = 0.5, highlighted, palette }) {
  const mid = useMemo(() => {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);
    const midpoint = a.clone().add(b).multiplyScalar(0.5);
    // slight outward bow so overlapping edges are visually distinguishable
    const bow = midpoint.clone().normalize().multiplyScalar(0.6);
    return midpoint.add(bow);
  }, [start, end]);

  return (
    <QuadraticBezierLine
      start={start}
      end={end}
      mid={mid}
      color={highlighted ? palette.highlight : palette.edge}
      lineWidth={highlighted ? 2.2 : 0.6 + weight * 1.4}
      transparent
      opacity={highlighted ? 0.9 : 0.28 + weight * 0.3}
    />
  );
}

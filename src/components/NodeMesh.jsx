import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

export default function NodeMesh({ position, label, number, importance, isRoot, onSelect, isActive, palette }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const mountTime = useRef(null);

  const color = useMemo(() => {
    if (isRoot) return new THREE.Color(palette.root);
    return new THREE.Color(palette.leafA).lerp(new THREE.Color(palette.leafB), 1 - importance);
  }, [importance, isRoot, palette]);

  const baseScale = isRoot ? 0.62 : 0.22 + importance * 0.34;

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    if (mountTime.current === null) mountTime.current = t;

    // Pop-in: ease from 0 to full scale over ~0.4s from first render,
    // so newly revealed nodes bloom into existence instead of snapping in.
    const age = t - mountTime.current;
    const popIn = Math.min(1, age / 0.4);
    const eased = 1 - Math.pow(1 - popIn, 3);

    const pulse = isRoot
      ? 1 + Math.sin(t * 1.1) * 0.05
      : 1 + Math.sin(t * 1.6 + position[0]) * 0.04;
    const targetScale = baseScale * pulse * (hovered || isActive ? 1.28 : 1) * eased;
    meshRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.35
    );
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isRoot ? 1.6 : hovered || isActive ? 1.4 : 0.85}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>

      {(hovered || isActive || isRoot) && (
        <Html distanceFactor={9} position={[0, baseScale + 0.5, 0]} center occlude style={{ pointerEvents: "none" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              padding: "4px 9px",
              borderRadius: "999px",
              background: "rgba(10, 13, 22, 0.85)",
              border: `1px solid ${isRoot ? palette.root : palette.leafB}`,
              color: isRoot ? palette.root : "#e9ecf5",
              whiteSpace: "nowrap",
              letterSpacing: "0.02em",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span style={{ opacity: 0.65 }}>#{number}</span>
            <span>{label}</span>
          </div>
        </Html>
      )}

      {/* Always-visible tiny number chip, so nodes stay referenceable even
          when not hovered — this is what lets the explain panel's
          "connected to #3, #7" list actually mean something at a glance. */}
      {!hovered && !isActive && !isRoot && (
        <Html distanceFactor={11} position={[0, 0, 0]} center occlude style={{ pointerEvents: "none" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              color: "rgba(233,236,245,0.75)",
              textShadow: "0 0 4px rgba(0,0,0,0.9)",
            }}
          >
            {number}
          </div>
        </Html>
      )}
    </group>
  );
}

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import GalaxyGraph from "./GalaxyGraph.jsx";

export default function Scene({ graph, onNodeSelect, selectedNodeId, palette }) {
  const controlsRef = useRef();

  return (
    <Canvas
      camera={{ position: [0, 1.5, 11], fov: 50 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 2]}
    >
      <color attach="background" args={["#05060a"]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.6} color="#8b7fff" />
      <pointLight position={[-10, -6, -10]} intensity={0.4} color="#5eead4" />

      <Stars radius={80} depth={50} count={2500} factor={2.4} fade speed={0.4} />

      <Suspense fallback={null}>
        <GalaxyGraph graph={graph} onNodeSelect={onNodeSelect} selectedNodeId={selectedNodeId} palette={palette} />
      </Suspense>

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={4}
        maxDistance={22}
        autoRotate={false}
        enableDamping
        dampingFactor={0.06}
      />

      <EffectComposer>
        <Bloom
          intensity={0.9}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}

"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function WaveParticles() {
  const ref = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const count = 2000;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = 0;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, []);

  const basePositions = useMemo(() => new Float32Array(positions), [positions]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const geo = ref.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      const x = basePositions[i * 3];
      const z = basePositions[i * 3 + 2];
      pos[i * 3 + 1] = Math.sin(x * 0.5 + t * 0.8) * 0.3 + Math.cos(z * 0.4 + t * 0.6) * 0.2;
    }
    geo.attributes.position.needsUpdate = true;

    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.5, 0.06);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -pointer.y * 0.3, 0.06);
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, pointer.x * 1.0, 0.04);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, pointer.y * 0.5, 0.04);
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.025} color="#00e5ff" transparent opacity={0.35} sizeAttenuation />
      </points>
    </group>
  );
}

export default function CtaScene() {
  return (
    <Canvas
      camera={{ position: [0, 3, 5], fov: 50 }}
      gl={{ antialias: false, alpha: true }}
      dpr={1}
      style={{ background: "transparent" }}
    >
      <WaveParticles />
    </Canvas>
  );
}

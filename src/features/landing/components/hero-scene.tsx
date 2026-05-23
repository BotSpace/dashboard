"use client";
import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float, Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";

function DistortSphere() {
  return (
    <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh>
        <sphereGeometry args={[1.4, 64, 64]} />
        <MeshDistortMaterial
          color="#0ea5e9"
          emissive="#7c3aed"
          emissiveIntensity={0.15}
          distort={0.3}
          speed={2}
          roughness={0}
          metalness={0.1}
          transparent
          opacity={0.55}
        />
      </mesh>
    </Float>
  );
}

const ORBIT_COLORS: [number, string][] = [
  [0, "#0ea5e9"],
  [1, "#7c3aed"],
  [2, "#06b6d4"],
  [3, "#8b5cf6"],
];

function OrbitingBox({ index, color }: { index: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const radius = 2.6;
  const speed = 0.4 + index * 0.15;
  const phaseOffset = (index / 4) * Math.PI * 2;
  const yOffset = Math.sin((index / 4) * Math.PI * 2) * 0.6;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed + phaseOffset;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius;
    ref.current.position.y = yOffset + Math.sin(t * 0.7) * 0.3;
    ref.current.rotation.x += 0.015;
    ref.current.rotation.y += 0.02;
  });

  const emissiveColor = new THREE.Color(color);

  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.22, 0.22, 0.22]} />
      <meshStandardMaterial
        color={color}
        emissive={emissiveColor}
        emissiveIntensity={1.2}
        roughness={0.1}
        metalness={0.6}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[4, 4, 2]} color="#0ea5e9" intensity={3} distance={12} />
      <pointLight position={[-4, -3, -2]} color="#7c3aed" intensity={2.5} distance={12} />

      <Stars radius={80} depth={60} count={3000} factor={4} saturation={0} fade speed={0.8} />

      <DistortSphere />

      <Sparkles
        count={300}
        size={2}
        scale={12}
        speed={0.3}
        opacity={0.7}
        color="#06b6d4"
      />

      {ORBIT_COLORS.map(([idx, color]) => (
        <OrbitingBox key={idx} index={idx as number} color={color} />
      ))}
    </>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <Scene />
    </Canvas>
  );
}

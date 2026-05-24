"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float, Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";

function EnergyCore() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.15;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={ref} scale={1.8}>
        <icosahedronGeometry args={[1, 12]} />
        <MeshDistortMaterial
          color="#00c8ff"
          emissive="#6d28d9"
          emissiveIntensity={0.4}
          distort={0.4}
          speed={2}
          roughness={0.1}
          metalness={0.3}
          transparent
          opacity={0.55}
        />
      </mesh>
      <mesh scale={1.2}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.06} />
      </mesh>
    </Float>
  );
}

function OrbitalRing({ radius, speed, tilt, color }: {
  radius: number; speed: number; tilt: number; color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.getElapsedTime() * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.008, 8, 128]} />
      <meshBasicMaterial color={color} transparent opacity={0.2} />
    </mesh>
  );
}

const CRYSTALS = [
  { dist: 2.8, speed: 0.35, phase: 0, tilt: 0.2, color: "#00e5ff", scale: 0.12 },
  { dist: 3.2, speed: -0.25, phase: 1.5, tilt: -0.3, color: "#8b5cf6", scale: 0.15 },
  { dist: 2.5, speed: 0.45, phase: 3.0, tilt: 0.5, color: "#06b6d4", scale: 0.1 },
  { dist: 3.6, speed: -0.18, phase: 4.2, tilt: -0.15, color: "#a78bfa", scale: 0.13 },
  { dist: 2.2, speed: 0.55, phase: 2.1, tilt: 0.4, color: "#22d3ee", scale: 0.09 },
  { dist: 3.9, speed: 0.2, phase: 5.5, tilt: -0.6, color: "#7c3aed", scale: 0.14 },
];

function Crystal({ dist, speed, phase, tilt, color, scale }: typeof CRYSTALS[0]) {
  const ref = useRef<THREE.Mesh>(null);
  const emissive = useMemo(() => new THREE.Color(color), [color]);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed + phase;
    ref.current.position.x = Math.cos(t) * dist;
    ref.current.position.z = Math.sin(t) * dist;
    ref.current.position.y = Math.sin(t * 0.7 + phase) * tilt * 2;
    ref.current.rotation.x += 0.02;
    ref.current.rotation.y += 0.03;
  });
  return (
    <mesh ref={ref} scale={scale}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={2} roughness={0.05} metalness={0.8} transparent opacity={0.9} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <fog attach="fog" args={["#030308", 8, 28]} />
      <ambientLight intensity={0.15} />
      <pointLight position={[5, 4, 3]} color="#00e5ff" intensity={4} distance={20} decay={2} />
      <pointLight position={[-4, -3, 2]} color="#8b5cf6" intensity={3} distance={18} decay={2} />
      <pointLight position={[0, 5, -3]} color="#06b6d4" intensity={2} distance={15} decay={2} />
      <Stars radius={100} depth={80} count={5000} factor={3} saturation={0.1} fade speed={0.5} />
      <EnergyCore />
      <OrbitalRing radius={2.6} speed={0.3} tilt={1.1} color="#00e5ff" />
      <OrbitalRing radius={3.4} speed={-0.2} tilt={0.4} color="#8b5cf6" />
      <OrbitalRing radius={4.0} speed={0.15} tilt={0.7} color="#06b6d4" />
      {CRYSTALS.map((c, i) => <Crystal key={i} {...c} />)}
      <Sparkles count={200} size={1.5} scale={15} speed={0.2} opacity={0.4} color="#00e5ff" />
      <Sparkles count={100} size={2} scale={12} speed={0.15} opacity={0.3} color="#8b5cf6" />
    </>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 7], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      style={{ background: "transparent" }}
    >
      <Scene />
    </Canvas>
  );
}

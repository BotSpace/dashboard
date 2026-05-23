"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  MeshDistortMaterial,
  Float,
  Sparkles,
  Stars,
} from "@react-three/drei";
import * as THREE from "three";

/* ── Central energy sphere ─────────────────────────────────── */
function EnergyCore() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.15;
    meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.1;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} scale={1.8}>
        <icosahedronGeometry args={[1, 12]} />
        <MeshDistortMaterial
          color="#00c8ff"
          emissive="#6d28d9"
          emissiveIntensity={0.4}
          distort={0.45}
          speed={1.8}
          roughness={0.1}
          metalness={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Inner glow core */}
      <mesh scale={1.1}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.08} />
      </mesh>
    </Float>
  );
}

/* ── Orbital rings ─────────────────────────────────────────── */
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
      <meshBasicMaterial color={color} transparent opacity={0.25} />
    </mesh>
  );
}

/* ── Orbiting crystals ─────────────────────────────────────── */
const CRYSTAL_DATA = [
  { dist: 2.8, speed: 0.35, phase: 0, tilt: 0.2, color: "#00e5ff", scale: 0.12 },
  { dist: 3.2, speed: -0.25, phase: 1.5, tilt: -0.3, color: "#8b5cf6", scale: 0.15 },
  { dist: 2.5, speed: 0.45, phase: 3.0, tilt: 0.5, color: "#06b6d4", scale: 0.1 },
  { dist: 3.6, speed: -0.18, phase: 4.2, tilt: -0.15, color: "#a78bfa", scale: 0.13 },
  { dist: 2.2, speed: 0.55, phase: 2.1, tilt: 0.4, color: "#22d3ee", scale: 0.09 },
  { dist: 3.9, speed: 0.2, phase: 5.5, tilt: -0.6, color: "#7c3aed", scale: 0.14 },
];

function OrbitingCrystal({ dist, speed, phase, tilt, color, scale }: typeof CRYSTAL_DATA[0]) {
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
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={2}
        roughness={0.05}
        metalness={0.8}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

/* ── Particle field ────────────────────────────────────────── */
function ParticleField() {
  const count = 600;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.01;
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.005) * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#00e5ff"
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Mouse-reactive camera ─────────────────────────────────── */
function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useFrame(() => {
    if (typeof window === "undefined") return;
    const targetX = mouse.current.x * 0.3;
    const targetY = mouse.current.y * 0.2;
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (targetY - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });

  if (typeof window !== "undefined") {
    window.addEventListener("mousemove", (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  return null;
}

/* ── Main scene ────────────────────────────────────────────── */
function Scene() {
  return (
    <>
      <fog attach="fog" args={["#030308", 8, 30]} />
      <ambientLight intensity={0.15} />
      <pointLight position={[5, 4, 3]} color="#00e5ff" intensity={4} distance={20} decay={2} />
      <pointLight position={[-4, -3, 2]} color="#8b5cf6" intensity={3} distance={18} decay={2} />
      <pointLight position={[0, 5, -3]} color="#06b6d4" intensity={2} distance={15} decay={2} />

      <Stars radius={100} depth={80} count={5000} factor={3} saturation={0.1} fade speed={0.5} />

      <EnergyCore />

      <OrbitalRing radius={2.6} speed={0.3} tilt={1.2} color="#00e5ff" />
      <OrbitalRing radius={3.4} speed={-0.2} tilt={0.8} color="#8b5cf6" />
      <OrbitalRing radius={4.0} speed={0.15} tilt={1.5} color="#06b6d4" />

      {CRYSTAL_DATA.map((c, i) => (
        <OrbitingCrystal key={i} {...c} />
      ))}

      <Sparkles count={200} size={1.5} scale={15} speed={0.2} opacity={0.4} color="#00e5ff" />
      <Sparkles count={100} size={2} scale={12} speed={0.15} opacity={0.3} color="#8b5cf6" />

      <ParticleField />
      <CameraRig />
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

"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";

/* ── Central Telegram-style bot head ─────────────────────── */
function BotHead() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.15;
    groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Head — rounded box */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.6, 1.4, 1.2, 4, 4, 4]} />
          <meshStandardMaterial
            color="#0c4a6e"
            emissive="#0ea5e9"
            emissiveIntensity={0.15}
            roughness={0.3}
            metalness={0.7}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.35, 0.15, 0.61]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={2} />
        </mesh>
        <mesh position={[0.35, 0.15, 0.61]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={2} />
        </mesh>

        {/* Antenna */}
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 8]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={3} />
        </mesh>

        {/* Mouth — smile line */}
        <mesh position={[0, -0.2, 0.61]}>
          <boxGeometry args={[0.5, 0.06, 0.02]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1} />
        </mesh>
      </group>
    </Float>
  );
}

/* ── Floating flow nodes orbiting the bot ─────────────────── */
const NODE_DATA = [
  { label: "/start", color: "#00e5ff", dist: 2.8, speed: 0.3, phase: 0, y: 0.5 },
  { label: "Message", color: "#8b5cf6", dist: 3.2, speed: -0.22, phase: 1.8, y: -0.3 },
  { label: "AI", color: "#06b6d4", dist: 2.5, speed: 0.4, phase: 3.5, y: 0.8 },
  { label: "Menu", color: "#a78bfa", dist: 3.5, speed: -0.18, phase: 5.0, y: -0.6 },
  { label: "State", color: "#22d3ee", dist: 2.9, speed: 0.35, phase: 2.2, y: 0.2 },
];

function FlowNode({ label, color, dist, speed, phase, y }: typeof NODE_DATA[0]) {
  const groupRef = useRef<THREE.Group>(null);
  const emissive = useMemo(() => new THREE.Color(color), [color]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime() * speed + phase;
    groupRef.current.position.x = Math.cos(t) * dist;
    groupRef.current.position.z = Math.sin(t) * dist;
    groupRef.current.position.y = y + Math.sin(t * 0.7) * 0.3;
    groupRef.current.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef}>
      {/* Node card */}
      <mesh>
        <boxGeometry args={[0.8, 0.4, 0.05]} />
        <meshStandardMaterial
          color="#0a0a12"
          emissive={emissive}
          emissiveIntensity={0.08}
          roughness={0.5}
          metalness={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Indicator dot */}
      <mesh position={[-0.3, 0.08, 0.03]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={3} />
      </mesh>
      {/* Label indicator bar */}
      <mesh position={[0.05, 0, 0.03]}>
        <boxGeometry args={[0.3, 0.04, 0.01]} />
        <meshBasicMaterial color="white" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

/* ── Connection beams between bot and nodes ───────────────── */
function ConnectionBeams() {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.05;
  });

  return (
    <group ref={ref}>
      {[0, 1.2, 2.4, 3.6, 5.0].map((angle, i) => (
        <mesh key={i} position={[0, 0, 0]} rotation={[0, angle, 0]}>
          <cylinderGeometry args={[0.003, 0.003, 3, 4]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? "#00e5ff" : "#8b5cf6"}
            transparent
            opacity={0.08}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Data stream particles ───────────────────────────────── */
function DataStream() {
  const count = 80;
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 2 + Math.random() * 2;
      arr[i * 3] = Math.cos(angle) * r;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 2;
      arr[i * 3 + 2] = Math.sin(angle) * r;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      const baseAngle = (i / count) * Math.PI * 2;
      const r = 2 + Math.sin(t * 0.5 + i * 0.1) * 0.5;
      pos[i * 3] = Math.cos(baseAngle + t * 0.2) * r;
      pos[i * 3 + 1] = Math.sin(t * 0.8 + i * 0.3) * 0.8;
      pos[i * 3 + 2] = Math.sin(baseAngle + t * 0.2) * r;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#00e5ff" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

/* ── Mouse camera rig ────────────────────────────────────── */
function CameraRig() {
  const { camera } = useThree();
  const target = useRef({ x: 0, y: 0.8 });

  useFrame(({ pointer }) => {
    target.current.x = pointer.x * 0.4;
    target.current.y = pointer.y * 0.25 + 0.8;
    camera.position.x += (target.current.x - camera.position.x) * 0.02;
    camera.position.y += (target.current.y - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ── Main scene ──────────────────────────────────────────── */
function Scene() {
  return (
    <>
      <fog attach="fog" args={["#030308", 8, 28]} />
      <ambientLight intensity={0.12} />
      <pointLight position={[4, 4, 3]} color="#00e5ff" intensity={3} distance={18} decay={2} />
      <pointLight position={[-3, -2, 2]} color="#8b5cf6" intensity={2.5} distance={16} decay={2} />
      <pointLight position={[0, 3, -3]} color="#06b6d4" intensity={1.5} distance={14} decay={2} />

      <Stars radius={100} depth={80} count={4000} factor={3} saturation={0.1} fade speed={0.4} />

      <BotHead />
      <ConnectionBeams />
      <DataStream />

      {NODE_DATA.map((n, i) => (
        <FlowNode key={i} {...n} />
      ))}

      <Sparkles count={150} size={1.5} scale={14} speed={0.15} opacity={0.3} color="#00e5ff" />
      <Sparkles count={80} size={2} scale={10} speed={0.1} opacity={0.2} color="#8b5cf6" />

      <CameraRig />
    </>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.8, 6.5], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      style={{ background: "transparent" }}
    >
      <Scene />
    </Canvas>
  );
}

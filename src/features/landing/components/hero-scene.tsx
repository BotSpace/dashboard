"use client";
import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Sparkles, Stars } from "@react-three/drei";
import { clone as cloneWithSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";

function KitchenRobot() {
  const { scene, animations } = useGLTF("/models/ai-kitchen.glb");
  const clonedScene = useMemo(() => cloneWithSkeleton(scene), [scene]);
  const mixer = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (!animations.length) return;
    mixer.current = new THREE.AnimationMixer(clonedScene);
    const action = mixer.current.clipAction(animations[0]);
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.play();
    return () => {
      mixer.current?.stopAllAction();
    };
  }, [animations, clonedScene]);

  useFrame((_, delta) => {
    mixer.current?.update(delta);
  });

  return <primitive object={clonedScene} scale={1.2} position={[1.2, -1.0, 0]} />;
}

function GlowRing({ radius, speed, tilt, color }: { radius: number; speed: number; tilt: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.getElapsedTime() * speed;
  });
  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.006, 8, 128]} />
      <meshBasicMaterial color={color} transparent opacity={0.15} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 5]} intensity={3} color="#ffffff" />
      <pointLight position={[3, 2, 4]} color="#00e5ff" intensity={6} distance={20} decay={2} />
      <pointLight position={[-3, 3, 2]} color="#8b5cf6" intensity={5} distance={20} decay={2} />
      <pointLight position={[0, -2, 3]} color="#06b6d4" intensity={3} distance={15} decay={2} />
      <Stars radius={100} depth={80} count={4000} factor={3} saturation={0.1} fade speed={0.5} />
      <KitchenRobot />
      <GlowRing radius={3.0} speed={0.2} tilt={1.2} color="#00e5ff" />
      <GlowRing radius={3.8} speed={-0.15} tilt={0.5} color="#8b5cf6" />
      <Sparkles count={150} size={1.5} scale={12} speed={0.2} opacity={0.35} color="#00e5ff" />
      <Sparkles count={80} size={2} scale={10} speed={0.15} opacity={0.25} color="#8b5cf6" />
    </>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 1, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.5]}
      style={{ background: "transparent" }}
    >
      <Scene />
    </Canvas>
  );
}

useGLTF.preload("/models/ai-kitchen.glb");

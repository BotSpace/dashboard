"use client";
import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Float } from "@react-three/drei";
import { clone as cloneWithSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import * as THREE from "three";

function FlyingRobot() {
  const { scene, animations } = useGLTF("/models/flying-robot.glb");
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

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.4}>
      <primitive object={clonedScene} scale={2.5} position={[0, -1.2, 0]} />
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 5]} intensity={2} color="#ffffff" />
      <pointLight position={[2, 2, 3]} color="#8b5cf6" intensity={4} distance={15} decay={2} />
      <pointLight position={[-2, 1, 2]} color="#00e5ff" intensity={3} distance={12} decay={2} />
      <FlyingRobot />
    </>
  );
}

export default function AIKitchenScene() {
  return (
    <Canvas
      camera={{ position: [0, 1, 4], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
      style={{ background: "transparent" }}
    >
      <Scene />
    </Canvas>
  );
}

useGLTF.preload("/models/flying-robot.glb");

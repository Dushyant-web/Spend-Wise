"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial, Stars } from "@react-three/drei";
import { Suspense, useRef, useMemo } from "react";
import * as THREE from "three";

function NeuralNode({ position, color, size = 0.06 }: {
  position: [number, number, number];
  color: string;
  size?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.getElapsedTime();
    (ref.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
      0.4 + Math.sin(t * 2 + offset) * 0.35;
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 12, 12]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
    </mesh>
  );
}

function NeuralNetwork() {
  const nodes: [number, number, number][] = [
    [0, 0, 0],
    [0.8, 0.6, 0.2], [-0.7, 0.5, 0.1], [0.3, -0.8, 0.3],
    [-0.4, -0.7, -0.2], [1.1, -0.2, -0.3], [-1.0, 0.1, 0.4],
    [0.6, 1.0, -0.3], [-0.2, 1.1, 0.5], [0.9, 0.2, 0.8],
  ];
  const colors = ["#7C5CFF", "#10C98F", "#F0A429", "#F05672", "#A78BFA"];

  return (
    <Float floatIntensity={0.5} speed={1.3}>
      {/* Central orb */}
      <Sphere args={[0.55, 48, 48]}>
        <MeshDistortMaterial
          color="#7C5CFF"
          emissive="#4A2FCC"
          emissiveIntensity={0.45}
          distort={0.35}
          speed={2}
          roughness={0.1}
          metalness={0.5}
          transparent
          opacity={0.85}
        />
      </Sphere>
      {/* Neural nodes */}
      {nodes.slice(1).map((pos, i) => (
        <NeuralNode
          key={i}
          position={pos}
          color={colors[i % colors.length]}
          size={0.07 + (i % 3) * 0.02}
        />
      ))}
      {/* Connection lines */}
      {nodes.slice(1).map((pos, i) => {
        const start = new THREE.Vector3(0, 0, 0);
        const end = new THREE.Vector3(...pos);
        const mid = start.clone().lerp(end, 0.5);
        const len = start.distanceTo(end);
        return (
          <mesh key={`line-${i}`} position={[mid.x, mid.y, mid.z]}
            rotation={[
              0,
              Math.atan2(pos[2], pos[0]),
              -Math.atan2(pos[1], Math.sqrt(pos[0] ** 2 + pos[2] ** 2)),
            ]}>
            <cylinderGeometry args={[0.008, 0.008, len, 4]} />
            <meshBasicMaterial color={colors[i % colors.length]} transparent opacity={0.25} />
          </mesh>
        );
      })}
      {/* Orbit ring */}
      <mesh rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[1.4, 0.012, 16, 100]} />
        <meshBasicMaterial color="#A78BFA" transparent opacity={0.35} />
      </mesh>
    </Float>
  );
}

export default function BrainGlow() {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 42 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <pointLight position={[2, 3, 2]} intensity={1.8} color="#7C5CFF" />
        <pointLight position={[-2, -1, 1]} intensity={0.9} color="#10C98F" />
        <NeuralNetwork />
        <Stars radius={16} depth={5} count={180} factor={1.3} fade speed={0.5} />
      </Suspense>
    </Canvas>
  );
}

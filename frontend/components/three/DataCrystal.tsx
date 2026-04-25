"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Stars } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function Crystal({ position, color, emissive, scale = 1, speed = 1 }: {
  position: [number, number, number];
  color: string;
  emissive: string;
  scale?: number;
  speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.getElapsedTime() * speed;
    ref.current.rotation.x = t * 0.3;
    ref.current.rotation.y = t * 0.5;
    ref.current.rotation.z = t * 0.2;
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <octahedronGeometry args={[0.55, 0]} />
      <meshPhysicalMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.5}
        metalness={0.3}
        roughness={0.05}
        transparent
        opacity={0.82}
        clearcoat={1}
        clearcoatRoughness={0.05}
      />
    </mesh>
  );
}

function BarChart3D() {
  const bars = [
    { h: 0.6, x: -1.2, color: "#7C5CFF" },
    { h: 1.1, x: -0.6, color: "#10C98F" },
    { h: 0.8, x:  0.0, color: "#F0A429" },
    { h: 1.4, x:  0.6, color: "#7C5CFF" },
    { h: 0.9, x:  1.2, color: "#F05672" },
  ];
  const group = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(s.clock.getElapsedTime() * 0.2) * 0.3;
  });
  return (
    <group ref={group} position={[0, -0.5, 0]}>
      {bars.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2 - 0.9, 0]}>
          <boxGeometry args={[0.38, b.h, 0.38]} />
          <meshPhysicalMaterial
            color={b.color}
            emissive={b.color}
            emissiveIntensity={0.25}
            metalness={0.4}
            roughness={0.2}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
      {/* Base plane */}
      <mesh position={[0, -0.91, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 0.8]} />
        <meshBasicMaterial color="#7C5CFF" transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

export default function DataCrystal() {
  return (
    <Canvas camera={{ position: [0, 0.5, 4.5], fov: 42 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <pointLight position={[3, 3, 3]} intensity={1.6} color="#7C5CFF" />
        <pointLight position={[-2, 1, 2]} intensity={0.9} color="#10C98F" />
        <Float floatIntensity={0.4} speed={1.0}>
          <BarChart3D />
        </Float>
        <Crystal position={[2.0, 0.8, -0.5]} color="#7C5CFF" emissive="#4A2FCC" scale={0.6} speed={0.8} />
        <Crystal position={[-1.8, 0.6, -0.5]} color="#10C98F" emissive="#0DAB78" scale={0.5} speed={1.1} />
        <Crystal position={[0.5, 1.5, -1]} color="#F0A429" emissive="#CC7A00" scale={0.35} speed={1.4} />
        <Stars radius={18} depth={6} count={200} factor={1.2} fade speed={0.4} />
      </Suspense>
    </Canvas>
  );
}

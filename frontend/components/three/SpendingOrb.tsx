"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float, Stars } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function Orb() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.12;
    meshRef.current.rotation.y = t * 0.18;
  });
  return (
    <Float floatIntensity={0.8} rotationIntensity={0.2} speed={1.2}>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial
          color="#7C5CFF"
          emissive="#4A2FCC"
          emissiveIntensity={0.4}
          distort={0.45}
          speed={2.5}
          roughness={0.15}
          metalness={0.6}
          transparent
          opacity={0.88}
        />
      </Sphere>
      {/* Inner glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.35, 0.018, 16, 120]} />
        <meshBasicMaterial color="#10C98F" transparent opacity={0.55} />
      </mesh>
      <mesh rotation={[Math.PI / 2.4, 0.4, 0]}>
        <torusGeometry args={[1.6, 0.01, 16, 120]} />
        <meshBasicMaterial color="#7C5CFF" transparent opacity={0.3} />
      </mesh>
    </Float>
  );
}

function FloatingParticles({ count = 60 }) {
  const ref = useRef<THREE.Points>(null);
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 2.2 + Math.random() * 1.8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi) * 0.7;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  useFrame((s) => {
    if (ref.current) ref.current.rotation.y = s.clock.getElapsedTime() * 0.06;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#A78BFA" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export default function SpendingOrb() {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 40 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 3, 3]} intensity={1.5} color="#7C5CFF" />
        <pointLight position={[-3, -2, 2]} intensity={0.8} color="#10C98F" />
        <Orb />
        <FloatingParticles />
        <Stars radius={15} depth={5} count={200} factor={1.5} fade speed={0.5} />
      </Suspense>
    </Canvas>
  );
}

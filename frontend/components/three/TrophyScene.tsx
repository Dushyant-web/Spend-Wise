"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Torus, Stars } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function Trophy() {
  const group = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!group.current) return;
    const t = s.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t * 0.25) * 0.35;
  });

  const gold = { color: "#FFB347", emissive: "#FF8C00", emissiveIntensity: 0.35, metalness: 0.95, roughness: 0.05 };

  return (
    <group ref={group}>
      <Float floatIntensity={0.7} speed={1.4}>
        {/* Cup body */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.55, 0.35, 1.1, 32]} />
          <meshPhysicalMaterial {...gold} clearcoat={1} />
        </mesh>
        {/* Cup rim */}
        <mesh position={[0, 1.05, 0]}>
          <torusGeometry args={[0.55, 0.06, 16, 64]} />
          <meshPhysicalMaterial {...gold} clearcoat={1} />
        </mesh>
        {/* Handles */}
        {([-1, 1] as const).map((side) => (
          <mesh key={side} position={[side * 0.72, 0.5, 0]} rotation={[0, 0, side * Math.PI / 2]}>
            <torusGeometry args={[0.22, 0.045, 12, 32, Math.PI]} />
            <meshPhysicalMaterial {...gold} clearcoat={1} />
          </mesh>
        ))}
        {/* Stem */}
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.12, 0.2, 0.7, 16]} />
          <meshPhysicalMaterial {...gold} clearcoat={1} />
        </mesh>
        {/* Base */}
        <RoundedBox args={[1.1, 0.2, 0.5]} radius={0.05} position={[0, -0.7, 0]}>
          <meshPhysicalMaterial {...gold} clearcoat={1} />
        </RoundedBox>
        {/* Star on cup */}
        <mesh position={[0, 0.5, 0.38]}>
          <octahedronGeometry args={[0.18, 0]} />
          <meshStandardMaterial color="#FBBF24" emissive="#FBBF24" emissiveIntensity={0.8} />
        </mesh>
        {/* Orbiting gem */}
        <mesh position={[1.1, 0.5, 0]}>
          <octahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial color="#A78BFA" emissive="#7C5CFF" emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[-1.1, 0.3, 0]}>
          <octahedronGeometry args={[0.1, 0]} />
          <meshStandardMaterial color="#10C98F" emissive="#10C98F" emissiveIntensity={0.9} />
        </mesh>
        {/* Glow ring at base */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.65, 0]}>
          <torusGeometry args={[0.7, 0.012, 16, 80]} />
          <meshBasicMaterial color="#FFB347" transparent opacity={0.45} />
        </mesh>
      </Float>
    </group>
  );
}

export default function TrophyScene() {
  return (
    <Canvas camera={{ position: [0, 0, 4.5], fov: 38 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 4, 3]} intensity={2.0} color="#FFB347" />
        <pointLight position={[-2, 0, 2]} intensity={0.8} color="#A78BFA" />
        <Trophy />
        <Stars radius={20} depth={8} count={250} factor={1.2} fade speed={0.4} />
      </Suspense>
    </Canvas>
  );
}

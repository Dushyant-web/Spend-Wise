"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Torus, Stars } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function GearRing({ radius, tube, speed, color, opacity = 0.7 }: {
  radius: number; tube: number; speed: number; color: string; opacity?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.z = s.clock.getElapsedTime() * speed;
    ref.current.rotation.x = 0.3;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, tube, 6, 28]} />
      <meshPhysicalMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        metalness={0.8}
        roughness={0.15}
        transparent
        opacity={opacity}
        wireframe={false}
      />
    </mesh>
  );
}

function SettingsRings() {
  const group = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(s.clock.getElapsedTime() * 0.2) * 0.4;
  });
  return (
    <Float floatIntensity={0.5} speed={1.2}>
      <group ref={group}>
        {/* Core sphere */}
        <mesh>
          <sphereGeometry args={[0.45, 32, 32]} />
          <meshPhysicalMaterial
            color="#7C5CFF"
            emissive="#4A2FCC"
            emissiveIntensity={0.5}
            metalness={0.7}
            roughness={0.1}
            clearcoat={1}
          />
        </mesh>
        {/* Gear rings */}
        <GearRing radius={0.85} tube={0.06} speed={0.4}  color="#7C5CFF" opacity={0.75} />
        <GearRing radius={1.2}  tube={0.04} speed={-0.28} color="#10C98F" opacity={0.55} />
        <GearRing radius={1.55} tube={0.03} speed={0.18}  color="#F0A429" opacity={0.4} />
        {/* Nodes on rings */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i / 6) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 0.85, Math.sin(angle) * 0.85, 0]}>
              <sphereGeometry args={[0.065, 8, 8]} />
              <meshStandardMaterial color="#A78BFA" emissive="#A78BFA" emissiveIntensity={0.8} />
            </mesh>
          );
        })}
      </group>
    </Float>
  );
}

export default function SettingsOrb() {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 40 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <pointLight position={[2, 3, 2]} intensity={1.6} color="#7C5CFF" />
        <pointLight position={[-2, -1, 1]} intensity={0.7} color="#10C98F" />
        <SettingsRings />
        <Stars radius={16} depth={5} count={160} factor={1.2} fade speed={0.4} />
      </Suspense>
    </Canvas>
  );
}

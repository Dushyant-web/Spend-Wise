"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Stars } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function Receipt({ y, rotation, color }: { y: number; rotation: number; color: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.getElapsedTime();
    ref.current.position.y = y + Math.sin(t * 0.6 + y) * 0.05;
  });
  return (
    <group ref={ref} rotation={[0, rotation, 0]}>
      <RoundedBox args={[1.1, 1.5, 0.05]} radius={0.06}>
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.12}
          metalness={0.2}
          roughness={0.5}
          transparent
          opacity={0.88}
        />
      </RoundedBox>
      {/* Lines on receipt */}
      {[-0.4, -0.15, 0.1, 0.35, 0.55].map((lineY, i) => (
        <mesh key={i} position={[0, lineY, 0.03]}>
          <boxGeometry args={[0.7 - i * 0.05, 0.04, 0.01]} />
          <meshBasicMaterial color="rgba(255,255,255,0.15)" transparent opacity={0.15} />
        </mesh>
      ))}
    </group>
  );
}

function Stack() {
  const group = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(s.clock.getElapsedTime() * 0.2) * 0.4;
  });
  return (
    <Float floatIntensity={0.6} speed={1.2}>
      <group ref={group}>
        <Receipt y={-0.4} rotation={0.3}  color="#242930" />
        <Receipt y={-0.15} rotation={-0.15} color="#1E232B" />
        <Receipt y={0.05}  rotation={0.08}  color="#181C22" />
        {/* Accent cards */}
        <mesh position={[0.6, 0.3, 0.15]} rotation={[0, -0.4, 0.1]}>
          <RoundedBox args={[0.55, 0.35, 0.04]} radius={0.04}>
            <meshPhysicalMaterial color="#7C5CFF" emissive="#7C5CFF" emissiveIntensity={0.4} metalness={0.7} roughness={0.1} />
          </RoundedBox>
        </mesh>
        <mesh position={[-0.55, 0.1, 0.1]} rotation={[0, 0.35, -0.05]}>
          <RoundedBox args={[0.5, 0.32, 0.04]} radius={0.04}>
            <meshPhysicalMaterial color="#10C98F" emissive="#10C98F" emissiveIntensity={0.4} metalness={0.7} roughness={0.1} />
          </RoundedBox>
        </mesh>
        {/* Plus icon floating */}
        <mesh position={[0, 1.1, 0.3]}>
          <octahedronGeometry args={[0.14, 0]} />
          <meshStandardMaterial color="#F0A429" emissive="#F0A429" emissiveIntensity={1.0} />
        </mesh>
      </group>
    </Float>
  );
}

export default function ReceiptStack() {
  return (
    <Canvas camera={{ position: [0, 0, 3.8], fov: 44 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.45} />
        <pointLight position={[2, 3, 2]} intensity={1.5} color="#7C5CFF" />
        <pointLight position={[-2, -1, 1]} intensity={0.8} color="#10C98F" />
        <Stack />
        <Stars radius={16} depth={5} count={180} factor={1.2} fade speed={0.4} />
      </Suspense>
    </Canvas>
  );
}

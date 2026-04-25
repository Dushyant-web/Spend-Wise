"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Environment } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function Coin({ y, color, emissive, delay = 0 }: { y: number; color: string; emissive: string; delay?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.getElapsedTime() + delay;
    ref.current.rotation.y = t * 0.6;
    ref.current.position.y = y + Math.sin(t * 0.8) * 0.06;
  });
  return (
    <mesh ref={ref} position={[0, y, 0]}>
      <cylinderGeometry args={[0.6, 0.6, 0.14, 48]} />
      <meshPhysicalMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.3}
        metalness={0.9}
        roughness={0.1}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}

function PiggyBank() {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.getElapsedTime();
    ref.current.rotation.y = Math.sin(t * 0.3) * 0.25;
  });
  return (
    <group ref={ref}>
      <Float floatIntensity={0.5} speed={1.5}>
        <Coin y={-0.6}  color="#FFB347" emissive="#FF8C00" delay={0} />
        <Coin y={-0.3} color="#7C5CFF" emissive="#4A2FCC" delay={0.8} />
        <Coin y={0}    color="#10C98F" emissive="#0DAB78" delay={1.6} />
        <Coin y={0.3}  color="#FFB347" emissive="#FF8C00" delay={2.4} />
        <Coin y={0.6}  color="#7C5CFF" emissive="#4A2FCC" delay={3.2} />
        {/* Glow ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <torusGeometry args={[0.95, 0.015, 16, 80]} />
          <meshBasicMaterial color="#10C98F" transparent opacity={0.4} />
        </mesh>
      </Float>
    </group>
  );
}

export default function CoinStack3D() {
  return (
    <Canvas camera={{ position: [0, 0, 3.5], fov: 42 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <pointLight position={[2, 3, 2]} intensity={1.8} color="#FFB347" />
        <pointLight position={[-2, -1, 2]} intensity={1.0} color="#7C5CFF" />
        <PiggyBank />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}

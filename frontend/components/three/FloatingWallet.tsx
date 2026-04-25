"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, RoundedBox, Sphere, Torus } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";

function Wallet() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t * 0.4) * 0.2;
    group.current.rotation.x = Math.cos(t * 0.3) * 0.08;
  });

  return (
    <group ref={group}>
      {/* Wallet body */}
      <RoundedBox args={[2.4, 1.6, 0.45]} radius={0.18} smoothness={6} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#1a1a2e"
          metalness={0.55}
          roughness={0.25}
          clearcoat={0.9}
          clearcoatRoughness={0.25}
        />
      </RoundedBox>

      {/* Wallet flap accent */}
      <mesh position={[0, 0.05, 0.226]}>
        <RoundedBox args={[2.36, 1.0, 0.02]} radius={0.1} smoothness={6}>
          <meshPhysicalMaterial
            color="#6C63FF"
            emissive="#6C63FF"
            emissiveIntensity={0.55}
            metalness={0.4}
            roughness={0.3}
          />
        </RoundedBox>
      </mesh>

      {/* SpendWise logo bolt */}
      <mesh position={[0, 0.05, 0.245]}>
        <torusGeometry args={[0.18, 0.04, 16, 32]} />
        <meshStandardMaterial color="#00D4AA" emissive="#00D4AA" emissiveIntensity={0.7} />
      </mesh>

      {/* Card peek */}
      <mesh position={[0.4, -0.55, 0.18]} rotation={[0, 0, -0.05]}>
        <RoundedBox args={[1.8, 0.7, 0.04]} radius={0.08} smoothness={4}>
          <meshPhysicalMaterial
            color="#00D4AA"
            metalness={0.7}
            roughness={0.2}
            emissive="#00D4AA"
            emissiveIntensity={0.15}
          />
        </RoundedBox>
      </mesh>

      {/* Glow ring */}
      <Torus args={[1.7, 0.02, 16, 80]} rotation={[Math.PI / 2.2, 0, 0]} position={[0, -0.02, 0]}>
        <meshBasicMaterial color="#A78BFA" transparent opacity={0.5} />
      </Torus>
    </group>
  );
}

function Coin({ radius, speed, phase, color }: { radius: number; speed: number; phase: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * speed + phase;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius;
    ref.current.position.y = Math.sin(t * 1.3) * 0.3;
    ref.current.rotation.y += 0.04;
  });

  return (
    <mesh ref={ref}>
      <cylinderGeometry args={[0.18, 0.18, 0.05, 32]} />
      <meshStandardMaterial color={color} metalness={0.85} roughness={0.2} emissive={color} emissiveIntensity={0.25} />
    </mesh>
  );
}

function Particles({ count = 80 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 3 + Math.random() * 2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi) * 0.6;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#A78BFA" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 2, -3]} intensity={0.6} color="#6C63FF" />
      <pointLight position={[0, -3, 2]} intensity={1.2} color="#00D4AA" distance={6} />

      <Float floatIntensity={0.6} rotationIntensity={0.3} speed={1.4}>
        <Wallet />
      </Float>

      <Coin radius={2.0} speed={0.6} phase={0} color="#FFB347" />
      <Coin radius={2.3} speed={0.45} phase={Math.PI * 0.7} color="#6C63FF" />
      <Coin radius={2.6} speed={0.55} phase={Math.PI * 1.4} color="#00D4AA" />

      <Particles />

      <Environment preset="city" />
    </>
  );
}

export default function FloatingWallet() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0.5, 5.2], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

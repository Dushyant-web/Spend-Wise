"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, Stars } from "@react-three/drei";
import { Suspense, useRef, useMemo } from "react";
import * as THREE from "three";

function Globe() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = s.clock.getElapsedTime() * 0.15;
  });

  // Latitude/longitude grid lines
  const gridLines = useMemo(() => {
    const lines: THREE.BufferGeometry[] = [];
    const r = 1.02;
    // Latitude circles
    for (let lat = -75; lat <= 75; lat += 30) {
      const pts: THREE.Vector3[] = [];
      const phi = (90 - lat) * (Math.PI / 180);
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        pts.push(new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta),
        ));
      }
      lines.push(new THREE.BufferGeometry().setFromPoints(pts));
    }
    // Longitude lines
    for (let lng = 0; lng < 360; lng += 30) {
      const pts: THREE.Vector3[] = [];
      const theta = lng * (Math.PI / 180);
      for (let i = 0; i <= 64; i++) {
        const phi = (i / 64) * Math.PI;
        pts.push(new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta),
        ));
      }
      lines.push(new THREE.BufferGeometry().setFromPoints(pts));
    }
    return lines;
  }, []);

  return (
    <Float floatIntensity={0.4} speed={1.1}>
      <mesh ref={ref}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshPhysicalMaterial
          color="#111828"
          emissive="#0C1020"
          roughness={0.8}
          metalness={0.1}
          transparent
          opacity={0.95}
        />
      </mesh>
      {/* Grid overlay */}
      <group ref={ref}>
        {gridLines.map((geo, i) => (
          <line key={i}>
            <primitive object={geo} />
            <lineBasicMaterial color="#7C5CFF" transparent opacity={0.18} />
          </line>
        ))}
      </group>
      {/* Hotspot dots */}
      {[
        [0.72, 0.6, 0.3], [-0.5, 0.8, 0.6], [0.3, -0.7, 0.7],
        [-0.8, -0.3, 0.5], [0.9, 0.2, -0.4], [0.1, 0.95, 0.3],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x * 1.04, y * 1.04, z * 1.04]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#10C98F" : "#7C5CFF"}
            emissive={i % 2 === 0 ? "#10C98F" : "#7C5CFF"}
            emissiveIntensity={1.2}
          />
        </mesh>
      ))}
      {/* Equator glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.05, 0.015, 16, 100]} />
        <meshBasicMaterial color="#10C98F" transparent opacity={0.4} />
      </mesh>
    </Float>
  );
}

export default function AdminGlobe() {
  return (
    <Canvas camera={{ position: [0, 0.5, 3.5], fov: 40 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.35} />
        <pointLight position={[3, 3, 3]} intensity={1.5} color="#7C5CFF" />
        <pointLight position={[-3, 0, 1]} intensity={0.8} color="#10C98F" />
        <Globe />
        <Stars radius={20} depth={6} count={220} factor={1.2} fade speed={0.35} />
      </Suspense>
    </Canvas>
  );
}

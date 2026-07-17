"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { world } from "@/lib/world";

/**
 * Iluminação cinematográfica: key spot + rim frio + ambiente, luz
 * pontual que segue o cursor, poeira metálica em suspensão e um
 * feixe volumétrico discreto. Intensidades dirigidas pelo roteiro.
 */

function Dust() {
  const pts = useRef<THREE.Points>(null);
  const mat = useRef<THREE.PointsMaterial>(null);

  const geo = useMemo(() => {
    const N = 320;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame(({ clock }, dt) => {
    if (pts.current) {
      pts.current.rotation.y = clock.elapsedTime * 0.012;
      pts.current.position.y = Math.sin(clock.elapsedTime * 0.08) * 0.3;
    }
    if (mat.current) {
      const target = world.goal.dust * (world.quality.mobile ? 0.16 : 0.3);
      mat.current.opacity += (target - mat.current.opacity) * Math.min(dt * 3, 1);
    }
  });

  return (
    <points ref={pts} geometry={geo}>
      <pointsMaterial
        ref={mat}
        size={0.016}
        color="#d8c9a4"
        transparent
        opacity={0.2}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/** feixe "volumétrico": cone aditivo quase invisível, atrás do relógio */
function Beam() {
  return (
    <mesh position={[-2.6, 3.2, -2.4]} rotation={[0.5, 0.2, 0.8]}>
      <coneGeometry args={[2.6, 9, 24, 1, true]} />
      <meshBasicMaterial
        color="#e8cf9a"
        transparent
        opacity={0.016}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function Stage() {
  const key = useRef<THREE.SpotLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const cursor = useRef<THREE.PointLight>(null);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const k = 1 - Math.exp(-4 * dt);
    const g = world.goal;

    if (key.current) key.current.intensity += (g.key * 110 - key.current.intensity) * k;
    if (rim.current) rim.current.intensity += (g.rim * 2.2 - rim.current.intensity) * k;
    if (amb.current) amb.current.intensity += (g.amb * 1.1 - amb.current.intensity) * k;

    // a iluminação acompanha o cursor
    if (cursor.current) {
      const tx = world.pointer.x * 3.4;
      const ty = -world.pointer.y * 2.2;
      cursor.current.position.x += (tx - cursor.current.position.x) * k;
      cursor.current.position.y += (ty - cursor.current.position.y) * k;
      cursor.current.intensity += ((world.quality.mobile ? 0 : 6) - cursor.current.intensity) * k;
    }
  });

  return (
    <>
      <color attach="background" args={["#060708"]} />
      <fog attach="fog" args={["#060708", 7.5, 20]} />

      {/* key quente vindo de cima-esquerda */}
      <spotLight
        ref={key}
        position={[-4.5, 5.5, 4.5]}
        angle={0.5}
        penumbra={1}
        decay={1.6}
        intensity={200}
        color="#f3e2bd"
      />
      {/* rim frio por trás-direita — recorta a silhueta metálica */}
      <directionalLight ref={rim} position={[5, 2.5, -5]} intensity={2.2} color="#9fb6d8" />
      <ambientLight ref={amb} intensity={0.35} color="#c8ccd2" />
      {/* luz que segue o ponteiro */}
      <pointLight ref={cursor} position={[0, 0, 4.4]} intensity={6} distance={11} decay={2} color="#e8cf9a" />

      {/* reflexos metálicos — estúdio de Lightformers (PMREM pequeno) */}
      <Environment resolution={32} frames={1}>
        <Lightformer
          intensity={2.4}
          position={[0, 4, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[9, 1.2, 1]}
        />
        <Lightformer intensity={1.1} position={[-5, 1, 3]} scale={[3.2, 0.7, 1]} color="#e8cf9a" />
        <Lightformer intensity={0.9} position={[5, -1, -3]} scale={[3.2, 0.9, 1]} color="#9fb6d8" />
        <Lightformer intensity={0.5} position={[0, -4, 2]} scale={[6, 0.8, 1]} color="#c8ccd2" />
      </Environment>

      <Dust />
      <Beam />
    </>
  );
}

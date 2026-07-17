"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { world } from "@/lib/world";
import Watch from "./watch";
import Stage from "./stage";
import CameraRig from "./camera-rig";

/**
 * Canvas fixo atrás de todo o conteúdo — o relógio nunca sai de cena.
 * DPR adaptativo; pós-processamento (Bloom/Vignette) só em desktop.
 */
export default function CanvasRoot() {
  const [dpr, setDpr] = useState(1.5);
  const [mobile, setMobile] = useState(false);
  // o canvas monta depois que a thread respira (TBT) — o loader segura
  // a cortina até o ax:ready, ninguém percebe
  const [mount3d, setMount3d] = useState(false);
  // pós-processamento entra só depois do intro (compilação de shaders
  // do composer fora da janela crítica de carregamento)
  const [post, setPost] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setMount3d(true), 1400);
    const onIntro = () => setPost(true);
    window.addEventListener("ax:intro-done", onIntro);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("ax:intro-done", onIntro);
    };
  }, []);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    world.quality.mobile = coarse;
    world.quality.reduced = reduced;
    setMobile(coarse);
    if (coarse) setDpr(1.2);

    const onMove = (e: PointerEvent) => {
      world.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      world.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  if (!mount3d) return <div id="main-canvas" className="fixed inset-0 z-0" aria-hidden />;

  return (
    <div id="main-canvas" className="fixed inset-0 z-0" aria-hidden>
      <Canvas
        dpr={dpr}
        camera={{ position: [0.6, 0.4, 6.8], fov: 34 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={(state) => {
          // handle de debug/validação (screenshots headless)
          (window as unknown as { __ax?: unknown }).__ax = state;
          window.dispatchEvent(new CustomEvent("ax:ready"));
        }}
      >
        <PerformanceMonitor
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(mobile ? 1.2 : 1.6)}
        >
          <Suspense fallback={null}>
            <Stage />
            <Watch />
            <CameraRig />
            {!mobile && post && (
              <EffectComposer multisampling={0}>
                <Bloom luminanceThreshold={1.12} intensity={0.5} mipmapBlur />
                <Vignette darkness={0.62} offset={0.28} />
              </EffectComposer>
            )}
          </Suspense>
        </PerformanceMonitor>
      </Canvas>
    </div>
  );
}

"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";
import Watch from "@/components/scene/watch";
import { world } from "@/lib/world";

const SLOT = 6;

const VARIANTS = [
  { caseIdx: 0, dialIdx: 0, handsIdx: 0, line: "AX-01 Origin", spec: "Aço · mostrador preto" },
  { caseIdx: 1, dialIdx: 1, handsIdx: 1, line: "AX-01 Boreal", spec: "Titânio · azul meia-noite" },
  { caseIdx: 2, dialIdx: 2, handsIdx: 0, line: "AX-01 Solaire", spec: "Ouro · prata gelo" },
  { caseIdx: 3, dialIdx: 3, handsIdx: 2, line: "AX-01 Umbra", spec: "Cerâmica · verde floresta" },
] as const;

/* palco compartilhado da vitrine */
function ShowroomStage() {
  return (
    <>
      <color attach="background" args={["#07080a"]} />
      <fog attach="fog" args={["#07080a", 7, 18]} />
      <ambientLight intensity={0.4} />
      <spotLight position={[3, 5, 4]} angle={0.5} penumbra={1} decay={1.4} intensity={160} color="#f3e2bd" />
      <directionalLight position={[-4, 2, -4]} intensity={1.6} color="#9fb6d8" />
      <Environment resolution={64} frames={1}>
        <Lightformer intensity={2.2} position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 1.2, 1]} />
        <Lightformer intensity={1} position={[-4, 1, 3]} scale={[3, 0.7, 1]} color="#e8cf9a" />
      </Environment>
    </>
  );
}

function ShowroomCamera() {
  const camera = useThree((s) => s.camera);
  const look = useRef(new THREE.Vector3());
  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const k = 1 - Math.exp(-4 * dt);
    const x = world.t * SLOT * (VARIANTS.length - 1);
    camera.position.x += (x - camera.position.x) * k;
    camera.position.y += (0.25 - camera.position.y) * k;
    camera.position.z += (5.6 - camera.position.z) * k;
    look.current.set(x, 0, 0);
    camera.lookAt(look.current);
  });
  return null;
}

/* 360°: arrasto com inércia */
function DragWatch({ variant }: { variant: (typeof VARIANTS)[number] }) {
  const g = useRef<THREE.Group>(null);
  const vel = useRef(0.35);
  const dragging = useRef(false);

  useEffect(() => {
    let lastX = 0;
    const down = (e: PointerEvent) => {
      dragging.current = true;
      lastX = e.clientX;
    };
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      vel.current = dx * 0.14;
    };
    const up = () => {
      dragging.current = false;
    };
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    if (g.current) g.current.rotation.y += vel.current * dt * 6;
    if (!dragging.current) vel.current += (0.35 - vel.current) * dt * 1.4;
  });

  return (
    <group ref={g}>
      <group rotation={[0.15, 0, 0]}>
        <Watch configOverride={variant} spinOnly={false} galleryStatic />
      </group>
    </group>
  );
}

export default function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);

  // monta cedo, pausa o loop fora da tela — segundo canvas não pode
  // queimar GPU atrás das outras seções
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const mountIo = new IntersectionObserver(([e]) => e.isIntersecting && setMounted(true), {
      rootMargin: "180% 0px",
    });
    const viewIo = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: "12% 0px",
    });
    mountIo.observe(el);
    viewIo.observe(el);
    return () => {
      mountIo.disconnect();
      viewIo.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const loop = () => {
      if (track.current && world.scene === "gallery") {
        const x = world.t * (VARIANTS.length - 1) * 100;
        track.current.style.transform = `translate3d(${-x}vw, 0, 0)`;
        const idx = Math.round(world.t * (VARIANTS.length - 1));
        setActive((a) => (a === idx ? a : idx));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  useEffect(() => {
    if (open === null) return;
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <section ref={section} id="collection" data-scene="gallery" className="relative z-10 h-[360vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-void/60">
        {mounted && (
          <Canvas
            className="!absolute inset-0"
            frameloop={inView && open === null ? "always" : "never"}
            dpr={[1, 1.5]}
            camera={{ position: [0, 0.25, 5.6], fov: 35 }}
            gl={{ antialias: true }}
          >
            <Suspense fallback={null}>
              <ShowroomStage />
              {VARIANTS.map((v, i) => (
                <group key={v.line} position={[i * SLOT, 0, 0]}>
                  <Watch configOverride={v} spinOnly />
                </group>
              ))}
              <ShowroomCamera />
            </Suspense>
          </Canvas>
        )}

        {/* legendas deslizantes */}
        <div ref={track} className="pointer-events-none absolute inset-0 flex will-change-transform">
          {VARIANTS.map((v, i) => (
            <div
              key={v.line}
              className="flex w-screen shrink-0 items-end justify-between px-6 pb-20 md:px-14"
            >
              <div>
                <p className="eyebrow mb-2">
                  A coleção <span className="text-gold-bright">/ 0{i + 1}</span>
                </p>
                <h3 className="display text-4xl text-pearl md:text-6xl">{v.line}</h3>
                <p className="mt-3 text-[0.65rem] uppercase tracking-[0.3em] text-silver/60">
                  {v.spec}
                </p>
              </div>
              <button
                onClick={() => setOpen(i)}
                data-cursor="360°"
                className="btn btn-gold pointer-events-auto hidden md:inline-flex"
              >
                <span>Examinar</span>
              </button>
            </div>
          ))}
        </div>

        {/* header + progresso */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-6 pt-24 md:px-14">
          <p className="eyebrow">Quatro expressões do mesmo calibre</p>
          <div className="flex gap-2">
            {VARIANTS.map((v, i) => (
              <span
                key={v.line}
                className={`block h-1 w-8 rounded-full transition-colors duration-500 ${
                  i === active ? "bg-gold" : "bg-silver/15"
                }`}
              />
            ))}
          </div>
        </div>

        {/* mobile: examinar */}
        <button
          onClick={() => setOpen(active)}
          data-cursor="360°"
          className="btn btn-gold !absolute bottom-8 right-6 md:!hidden"
        >
          <span>Examinar</span>
        </button>
      </div>

      {/* fullscreen 360° */}
      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-[85] bg-void"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
          >
            <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.2, 4.6], fov: 36 }} gl={{ antialias: true }}>
              <Suspense fallback={null}>
                <ShowroomStage />
                <DragWatch variant={VARIANTS[open]} />
              </Suspense>
            </Canvas>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-8 md:p-14">
              <div className="scrim-b absolute inset-0" />
              <div className="relative">
                <p className="eyebrow mb-2">{VARIANTS[open].spec} · arraste para girar</p>
                <h3 className="display text-4xl text-pearl md:text-6xl">{VARIANTS[open].line}</h3>
              </div>
            </div>

            <button
              onClick={() => setOpen(null)}
              data-cursor="fechar"
              className="btn btn-ghost absolute right-6 top-6 z-10 md:right-12 md:top-8"
            >
              <span>Fechar ✕</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

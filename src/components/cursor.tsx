"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor personalizado: ponto dourado + anel metálico. Sobre alvos
 * interativos ([data-cursor]) vira um círculo metálico maior com
 * rótulo; no clique emite um pulso de brilho elegante.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.documentElement.classList.add("ax-cursor");
    if (dot.current) dot.current.style.opacity = "1";
    if (ring.current) ring.current.style.opacity = "1";

    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let scale = 1;
    let targetScale = 1;
    let raf = 0;
    let last = performance.now();

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
    };

    const onOver = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>("a, button, [data-cursor]");
      const kind = t?.dataset.cursor;
      if (kind && label.current) {
        label.current.textContent = kind;
        targetScale = 3.6;
      } else if (t) {
        if (label.current) label.current.textContent = "";
        targetScale = 1.9;
      } else {
        if (label.current) label.current.textContent = "";
        targetScale = 1;
      }
    };

    // pulso de brilho no clique
    const onDown = (e: PointerEvent) => {
      const pulse = document.createElement("div");
      pulse.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;z-index:99;pointer-events:none;width:12px;height:12px;border-radius:9999px;transform:translate(-50%,-50%);background:radial-gradient(circle, rgba(232,207,154,0.9), rgba(201,169,98,0) 70%);`;
      document.body.appendChild(pulse);
      pulse.animate(
        [
          { opacity: 1, transform: "translate(-50%,-50%) scale(1)" },
          { opacity: 0, transform: "translate(-50%,-50%) scale(7)" },
        ],
        { duration: 620, easing: "cubic-bezier(0.22,1,0.36,1)" }
      ).onfinish = () => pulse.remove();
    };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const k = 1 - Math.exp(-13 * dt);
      ringPos.x += (pos.x - ringPos.x) * k;
      ringPos.y += (pos.y - ringPos.y) * k;
      scale += (targetScale - scale) * k;

      if (dot.current)
        dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%,-50%)`;
      if (ring.current)
        ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%,-50%) scale(${scale})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      document.documentElement.classList.remove("ax-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={dot}
        className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 rounded-full bg-gold-bright opacity-0"
        aria-hidden
      />
      <div
        ref={ring}
        className="pointer-events-none fixed left-0 top-0 z-[100] flex h-9 w-9 items-center justify-center rounded-full border border-silver/50 opacity-0"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, rgba(200,204,210,0.14), rgba(20,22,26,0.08) 60%)",
          boxShadow: "inset 0 0 6px rgba(200,204,210,0.18)",
        }}
        aria-hidden
      >
        <span
          ref={label}
          className="text-[5px] font-medium uppercase tracking-[0.22em] text-gold-bright"
        />
      </div>
    </>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * A luz sobe, o ponteiro de segundos ganha vida (roteiro da cena),
 * a tela escurece e resta apenas: MASTERING TIME.
 */
export default function Finale() {
  const root = useRef<HTMLElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const closing = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !veil.current || !closing.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      gsap.set(veil.current, { opacity: 1 });
      gsap.set(closing.current, { opacity: 1, y: 0 });
      return;
    }

    const veilAnim = gsap.fromTo(
      veil.current,
      { opacity: 0 },
      {
        opacity: 1,
        ease: "none",
        scrollTrigger: { trigger: el, start: "45% bottom", end: "78% bottom", scrub: true },
      }
    );

    const closingAnim = gsap.fromTo(
      closing.current,
      { opacity: 0, y: 54 },
      {
        opacity: 1,
        y: 0,
        ease: "none",
        scrollTrigger: { trigger: el, start: "72% bottom", end: "94% bottom", scrub: true },
      }
    );

    return () => {
      veilAnim.scrollTrigger?.kill();
      veilAnim.kill();
      closingAnim.scrollTrigger?.kill();
      closingAnim.kill();
    };
  }, []);

  return (
    <section ref={root} id="finale" data-scene="finale" className="relative h-[280vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* véu final */}
        <div ref={veil} className="absolute inset-0 bg-void opacity-0" />

        <div ref={closing} className="relative z-10 px-6 text-center opacity-0">
          <p className="eyebrow mb-6">Calibre AX-01 · Tourbillon</p>
          <h2 className="display text-[clamp(2.6rem,8vw,7rem)] text-pearl">
            MASTERING&nbsp;TIME<span className="text-gold-bright">.</span>
          </h2>
          <p className="lead mx-auto mt-6 max-w-md text-sm">
            88 peças por ano. Cada uma montada, regulada e assinada por um
            único mestre relojoeiro.
          </p>
          <a
            href="mailto:atelier@aurextimepieces.ch?subject=AX-01%20—%20Discover%20the%20Collection"
            className="btn btn-gold mt-10"
            data-cursor="reservar"
          >
            <span>Discover the Collection</span>
          </a>
        </div>
      </div>
    </section>
  );
}

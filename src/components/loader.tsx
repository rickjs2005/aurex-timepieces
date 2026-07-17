"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { world } from "@/lib/world";

/**
 * Intro: escuridão total → logotipo → uma linha luminosa desenha o
 * contorno do relógio → as engrenagens surgem deslocadas e deslizam
 * até se encaixarem → ponteiros → pulso de brilho: montado. A cortina
 * só levanta quando o canvas 3D avisa que está pronto (ax:ready).
 */
export default function Loader() {
  const [gone, setGone] = useState(false);
  const overlay = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const word = useRef<HTMLParagraphElement>(null);
  const tag = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let ready = false;
    let minDone = false;
    let finished = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tryFinish = () => {
      if (finished || !ready || !minDone) return;
      finished = true;
      gsap.to(overlay.current, {
        opacity: 0,
        duration: reduced ? 0.01 : 1.0,
        ease: "power2.inOut",
        onComplete: () => {
          world.introDone = true;
          window.dispatchEvent(new CustomEvent("ax:intro-done"));
          setGone(true);
        },
      });
    };

    const onReady = () => {
      ready = true;
      tryFinish();
    };
    window.addEventListener("ax:ready", onReady);
    const fallback = window.setTimeout(onReady, 4200);

    const el = svg.current;
    const outline = el?.querySelectorAll<SVGElement>("[data-outline]");
    const gears = el?.querySelectorAll<SVGElement>("[data-gear]");
    const hands = el?.querySelectorAll<SVGElement>("[data-hand]");

    const tl = gsap.timeline();

    if (reduced) {
      minDone = true;
      tryFinish();
    } else {
      tl.fromTo(
        word.current,
        { opacity: 0, letterSpacing: "0.75em" },
        { opacity: 1, letterSpacing: "0.42em", duration: 1.0, ease: "power3.out" },
        0.15
      )
        .fromTo(
          tag.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.6, ease: "power2.out" },
          0.6
        )
        // linha luminosa desenha o contorno
        .fromTo(
          outline ?? [],
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1.35, ease: "power2.inOut", stagger: 0.08 },
          0.5
        )
        // engrenagens surgem e deslizam até o encaixe
        .fromTo(
          gears ?? [],
          { strokeDashoffset: 1, opacity: 0, x: -26, y: 18 },
          {
            strokeDashoffset: 0,
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
            stagger: 0.14,
          },
          "-=0.5"
        )
        // ponteiros
        .fromTo(
          hands ?? [],
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 0.5, ease: "power2.out", stagger: 0.1 },
          "-=0.2"
        )
        // pulso: montado
        .to(
          el ?? {},
          {
            filter: "drop-shadow(0 0 22px rgba(232,207,154,0.5))",
            duration: 0.55,
            ease: "power2.out",
          },
          ">-0.1"
        )
        .call(() => {
          minDone = true;
          tryFinish();
        }, [], "+=0.3");
    }

    return () => {
      window.removeEventListener("ax:ready", onReady);
      window.clearTimeout(fallback);
      tl.kill();
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={overlay}
      className="fixed inset-0 z-[95] flex flex-col items-center justify-center bg-void"
      aria-hidden
    >
      <p
        ref={word}
        className="display text-[clamp(1.05rem,2.8vw,1.7rem)] tracking-[0.42em] text-pearl"
        style={{ opacity: 0 }}
      >
        AUREX&nbsp;TIMEPIECES
      </p>
      <p ref={tag} className="eyebrow mt-3" style={{ opacity: 0 }}>
        Manufacture d&apos;Horlogerie
      </p>

      <svg
        ref={svg}
        viewBox="0 0 400 400"
        className="mt-10 w-[min(60vw,320px)]"
        fill="none"
        strokeLinecap="round"
      >
        {/* contorno do relógio */}
        <circle data-outline cx="200" cy="200" r="122" stroke="#e8cf9a" strokeWidth="1.6" pathLength={1} strokeDasharray={1} strokeDashoffset={1} />
        <circle data-outline cx="200" cy="200" r="104" stroke="rgba(200,204,210,0.5)" strokeWidth="1" pathLength={1} strokeDasharray={1} strokeDashoffset={1} />
        {/* coroa */}
        <path data-outline d="M 326 192 h 14 v 16 h -14" stroke="#e8cf9a" strokeWidth="1.6" pathLength={1} strokeDasharray={1} strokeDashoffset={1} />
        {/* alças */}
        <path data-outline d="M 168 82 v -18 M 232 82 v -18 M 168 318 v 18 M 232 318 v 18" stroke="rgba(200,204,210,0.6)" strokeWidth="1.4" pathLength={1} strokeDasharray={1} strokeDashoffset={1} />

        {/* engrenagens: aro dentado = círculo tracejado grosso */}
        <g data-gear style={{ opacity: 0 }}>
          <circle cx="168" cy="186" r="34" stroke="#c9a962" strokeWidth="9" strokeDasharray="5 7" pathLength={0.999} strokeDashoffset={1} />
          <circle cx="168" cy="186" r="22" stroke="#c9a962" strokeWidth="1.2" />
          <circle cx="168" cy="186" r="4" fill="#8a1220" />
        </g>
        <g data-gear style={{ opacity: 0 }}>
          <circle cx="222" cy="152" r="24" stroke="rgba(200,204,210,0.85)" strokeWidth="7" strokeDasharray="4.4 6" pathLength={0.999} strokeDashoffset={1} />
          <circle cx="222" cy="152" r="15" stroke="rgba(200,204,210,0.7)" strokeWidth="1" />
          <circle cx="222" cy="152" r="3.4" fill="#8a1220" />
        </g>
        <g data-gear style={{ opacity: 0 }}>
          <circle cx="238" cy="216" r="17" stroke="#c9a962" strokeWidth="6" strokeDasharray="3.6 5.2" pathLength={0.999} strokeDashoffset={1} />
          <circle cx="238" cy="216" r="10" stroke="#c9a962" strokeWidth="1" />
          <circle cx="238" cy="216" r="3" fill="#8a1220" />
        </g>
        {/* turbilhão sugerido às 6h */}
        <g data-gear style={{ opacity: 0 }}>
          <circle cx="200" cy="262" r="20" stroke="#e8cf9a" strokeWidth="1.6" pathLength={0.999} strokeDashoffset={1} />
          <path d="M 184 262 h 32 M 200 246 v 32" stroke="#e8cf9a" strokeWidth="1.2" />
        </g>

        {/* ponteiros */}
        <path data-hand d="M 200 200 L 200 128" stroke="#e8cf9a" strokeWidth="2.4" pathLength={1} strokeDasharray={1} strokeDashoffset={1} />
        <path data-hand d="M 200 200 L 246 236" stroke="#e8cf9a" strokeWidth="2" pathLength={1} strokeDasharray={1} strokeDashoffset={1} />
      </svg>

      <div className="absolute bottom-10 flex flex-col items-center gap-3">
        <p className="eyebrow">Calibre AX-01 · montagem</p>
        <span className="block h-px w-10 animate-pulse bg-gold" aria-hidden />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lines = el.querySelectorAll<HTMLElement>(".reveal-line > span");
    const rest = el.querySelectorAll<HTMLElement>("[data-hero-rest]");

    const play = () => {
      if (reduced) {
        gsap.set(lines, { y: 0 });
        gsap.set(rest, { opacity: 1, y: 0 });
        return;
      }
      gsap
        .timeline()
        .to(lines, { y: 0, duration: 1.3, ease: "power4.out", stagger: 0.14 }, 0.15)
        .to(rest, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.15 }, "-=0.7");
    };

    let played = false;
    const onDone = () => {
      if (played) return;
      played = true;
      play();
    };
    window.addEventListener("ax:intro-done", onDone);
    const t = window.setTimeout(onDone, 6200);

    let st: ScrollTrigger | undefined;
    if (!reduced && content.current) {
      const anim = gsap.to(content.current, {
        opacity: 0,
        y: -60,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "70% top", scrub: true },
      });
      st = anim.scrollTrigger;
    }

    return () => {
      window.removeEventListener("ax:intro-done", onDone);
      window.clearTimeout(t);
      st?.kill();
    };
  }, []);

  return (
    <section ref={root} data-scene="hero" className="relative h-[190vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center px-6">
        <div ref={content} className="flex flex-col items-center text-center">
          <p data-hero-rest className="eyebrow mb-8 translate-y-4 opacity-0">
            Manufacture d&apos;Horlogerie · Calibre AX-01
          </p>

          <h1 className="display text-[clamp(2.8rem,9vw,7.5rem)] text-pearl">
            <span className="reveal-line">
              <span>TIME&nbsp;PERFECTED</span>
            </span>
          </h1>

          <p
            data-hero-rest
            className="lead mt-7 max-w-md translate-y-4 text-base opacity-0 md:text-lg"
          >
            Precision engineered for eternity.
          </p>

          <div data-hero-rest className="mt-12 translate-y-4 opacity-0">
            <button
              onClick={() =>
                document.querySelector("#calibre")?.scrollIntoView({ behavior: "smooth" })
              }
              className="btn btn-gold"
              data-cursor="descer"
            >
              <span>Discover</span>
            </button>
          </div>
        </div>

        <div
          data-hero-rest
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 translate-y-4 flex-col items-center gap-3 opacity-0"
        >
          <span className="text-[0.58rem] uppercase tracking-[0.32em] text-silver/50">
            O filme começa no scroll
          </span>
          <span className="block h-10 w-px animate-pulse bg-gold/50" />
        </div>
      </div>
    </section>
  );
}

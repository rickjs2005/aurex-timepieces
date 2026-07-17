"use client";

import { createElement, useEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Título com text-reveal por linha: cada linha sobe de dentro de uma
 * máscara overflow-hidden quando entra na viewport.
 */
export function RevealTitle({
  lines,
  as = "h2",
  className = "",
  delay = 0,
}: {
  lines: string[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
}) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const spans = el.querySelectorAll<HTMLElement>(".reveal-line > span");
    if (reduced || !spans.length) return;

    const anim = gsap.to(spans, {
      y: 0,
      duration: 1.15,
      ease: "power4.out",
      stagger: 0.09,
      delay,
      paused: true,
    });

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter: () => anim.play(),
    });

    return () => {
      st.kill();
      anim.kill();
    };
  }, [delay]);

  return createElement(
    as,
    { ref: root, className },
    lines.map((line, i) => (
      <span key={i} className="reveal-line">
        <span>{line}</span>
      </span>
    ))
  );
}

/**
 * Fade-up genérico: aplica em qualquer bloco com stagger entre filhos [data-fade].
 */
export function FadeIn({
  children,
  className = "",
  stagger = 0.1,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = el.querySelectorAll<HTMLElement>("[data-fade]");
    if (reduced || !targets.length) return;

    const anim = gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: "power3.out",
      stagger,
      paused: true,
    });

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 86%",
      once: true,
      onEnter: () => anim.play(),
    });

    return () => {
      st.kill();
      anim.kill();
    };
  }, [stagger]);

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}

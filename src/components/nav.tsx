"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { href: "#calibre", label: "Calibre" },
  { href: "#specs", label: "Especificações" },
  { href: "#configure", label: "Configurar" },
  { href: "#collection", label: "Coleção" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const onIntro = () => setShown(true);
    window.addEventListener("ax:intro-done", onIntro);
    const t = window.setTimeout(() => setShown(true), 5600);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("ax:intro-done", onIntro);
      window.clearTimeout(t);
    };
  }, []);

  const go = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[80] transition-all duration-700 ${
        shown ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      } ${scrolled ? "bg-void/70 backdrop-blur-md shadow-[0_1px_0_rgba(200,204,210,0.07)]" : ""}`}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5 md:px-12">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="display text-[0.95rem] tracking-[0.34em] text-pearl"
        >
          AUREX<span className="text-gold">&nbsp;TIMEPIECES</span>
        </button>

        <nav className="hidden items-center gap-9 lg:flex">
          {LINKS.map((l) => (
            <button
              key={l.href}
              onClick={() => go(l.href)}
              className="group relative text-[0.65rem] font-medium uppercase tracking-[0.26em] text-silver/70 transition-colors duration-300 hover:text-pearl"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-gold transition-transform duration-500 ease-out group-hover:origin-left group-hover:scale-x-100" />
            </button>
          ))}
          <button onClick={() => go("#finale")} className="btn btn-gold !px-6 !py-3 !text-[0.58rem]">
            <span>Reservar</span>
          </button>
        </nav>

        {/* mobile: só a marca + reservar */}
        <button onClick={() => go("#finale")} className="btn btn-gold !px-5 !py-2.5 !text-[0.55rem] lg:hidden">
          <span>Reservar</span>
        </button>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import { world, CASES, DIALS, HANDS, WatchConfig } from "@/lib/world";
import { FadeIn } from "@/components/reveal";

/**
 * O painel escreve direto em world.config; o relógio no canvas fixo
 * faz lerp dos materiais a cada frame — a troca é líquida, sem
 * re-render da árvore 3D.
 */
export default function Configurator() {
  const [cfg, setCfg] = useState<WatchConfig>({ ...world.config });

  const update = (patch: Partial<WatchConfig>) => {
    const next = { ...cfg, ...patch };
    setCfg(next);
    Object.assign(world.config, next);
  };

  return (
    <section id="configure" data-scene="config" className="relative h-[260vh]">
      <div className="pointer-events-none sticky top-0 flex h-screen items-center">
        <div className="w-full px-6 md:px-14">
          <FadeIn className="pointer-events-auto">
            <div className="glass w-full max-w-sm p-8">
              <p className="eyebrow mb-1">Atelier</p>
              <h3 className="display text-3xl text-pearl">Componha o seu AX-01</h3>

              {/* caixa */}
              <p className="mb-3 mt-8 text-[0.6rem] uppercase tracking-[0.3em] text-silver/60">
                Caixa — {CASES[cfg.caseIdx].name}
              </p>
              <div className="flex gap-3">
                {CASES.map((c, i) => (
                  <button
                    key={c.name}
                    className="swatch"
                    style={{ background: c.hex }}
                    data-active={cfg.caseIdx === i}
                    aria-label={c.name}
                    onClick={() => update({ caseIdx: i })}
                  />
                ))}
              </div>

              {/* mostrador */}
              <p className="mb-3 mt-7 text-[0.6rem] uppercase tracking-[0.3em] text-silver/60">
                Mostrador — {DIALS[cfg.dialIdx].name}
              </p>
              <div className="flex gap-3">
                {DIALS.map((d, i) => (
                  <button
                    key={d.name}
                    className="swatch"
                    style={{ background: d.hex }}
                    data-active={cfg.dialIdx === i}
                    aria-label={d.name}
                    onClick={() => update({ dialIdx: i })}
                  />
                ))}
              </div>

              {/* ponteiros */}
              <p className="mb-3 mt-7 text-[0.6rem] uppercase tracking-[0.3em] text-silver/60">
                Ponteiros — {HANDS[cfg.handsIdx].name}
              </p>
              <div className="flex gap-3">
                {HANDS.map((h, i) => (
                  <button
                    key={h.name}
                    className="swatch !h-8 !w-8"
                    style={{ background: h.hex }}
                    data-active={cfg.handsIdx === i}
                    aria-label={h.name}
                    onClick={() => update({ handsIdx: i })}
                  />
                ))}
              </div>

              {/* pulseira */}
              <p className="mb-3 mt-7 text-[0.6rem] uppercase tracking-[0.3em] text-silver/60">
                Pulseira
              </p>
              <div className="flex gap-3">
                {(["Elos metálicos", "Couro premium"] as const).map((label, i) => (
                  <button
                    key={label}
                    onClick={() => update({ strap: i as 0 | 1 })}
                    className={`border px-4 py-2 text-[0.6rem] uppercase tracking-[0.22em] transition-colors duration-300 ${
                      cfg.strap === i
                        ? "border-gold text-pearl"
                        : "border-silver/20 text-silver/60 hover:border-silver/50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* acabamento */}
              <p className="mb-3 mt-7 text-[0.6rem] uppercase tracking-[0.3em] text-silver/60">
                Acabamento
              </p>
              <div className="flex gap-3">
                {(["Escovado", "Polido espelho"] as const).map((label, i) => (
                  <button
                    key={label}
                    onClick={() => update({ finish: i as 0 | 1 })}
                    className={`border px-4 py-2 text-[0.6rem] uppercase tracking-[0.22em] transition-colors duration-300 ${
                      cfg.finish === i
                        ? "border-gold text-pearl"
                        : "border-silver/20 text-silver/60 hover:border-silver/50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-8 flex items-end justify-between border-t border-silver/10 pt-6">
                <div>
                  <p className="text-[0.58rem] uppercase tracking-[0.3em] text-silver/60">
                    Edição
                  </p>
                  <p className="display mt-1 text-xl text-pearl">1 de 88 peças</p>
                </div>
                <p className="display text-lg text-gold-bright">Sob consulta</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

import Counter from "@/components/counter";
import { FadeIn, RevealTitle } from "@/components/reveal";

const STATS = [
  { value: 72, decimals: 0, unit: "h", label: "Power Reserve" },
  { value: 100, decimals: 0, unit: "m", label: "Water Resistance" },
  { value: 31, decimals: 0, unit: "", label: "Jewels" },
  { value: 28800, decimals: 0, unit: "vph", label: "Frequency" },
  { value: 41.5, decimals: 1, unit: "mm", label: "Case Diameter" },
  { value: 243, decimals: 0, unit: "", label: "Movement · componentes" },
  { value: 2, decimals: 0, unit: "s/dia", label: "Accuracy · desvio máx." },
];

export default function Specs() {
  return (
    <section id="specs" data-scene="specs" className="relative h-[230vh]">
      <div className="pointer-events-none sticky top-0 flex h-screen flex-col justify-center">
        <div className="relative z-10 px-6 md:px-14">
          <FadeIn>
            <p data-fade className="eyebrow mb-4">
              Ficha técnica
            </p>
          </FadeIn>
          <RevealTitle
            lines={["Números que dispensam", "adjetivos."]}
            className="display max-w-3xl text-[clamp(1.9rem,4.6vw,4rem)] text-pearl"
          />

          <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 md:mt-16 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <FadeIn key={s.label} stagger={0}>
                <div data-fade style={{ transitionDelay: `${i * 40}ms` }}>
                  <div className="display text-[clamp(2rem,4.6vw,4.2rem)] leading-none text-pearl">
                    <Counter value={s.value} decimals={s.decimals} />
                    {s.unit && (
                      <span className="ml-1 align-top text-[0.34em] font-light tracking-wide text-gold">
                        {s.unit}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-[0.62rem] uppercase tracking-[0.3em] text-silver/60">
                    {s.label}
                  </p>
                  <div className="rule-gold mt-4 w-24" />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
        <div className="scrim-b pointer-events-none absolute inset-x-0 bottom-0 h-[30vh]" />
      </div>
    </section>
  );
}

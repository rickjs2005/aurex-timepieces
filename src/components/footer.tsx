import { SITE } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-silver/10 bg-void">
      <div className="mx-auto max-w-[1600px] px-6 py-16 md:px-12 md:py-24">
        <p className="display text-[clamp(2rem,6.5vw,5.5rem)] leading-none tracking-[0.1em] text-pearl">
          AUREX<span className="text-gold">&nbsp;TIMEPIECES</span>
        </p>

        <div className="mt-12 grid gap-10 md:grid-cols-3">
          <div>
            <p className="eyebrow mb-4">Manufatura</p>
            <p className="text-sm font-light leading-relaxed text-silver/60">
              Vallée de Joux, Suíça
              <br />
              atelier@aurextimepieces.ch
            </p>
          </div>
          <div>
            <p className="eyebrow mb-4">Calibre AX-01</p>
            <p className="text-sm font-light leading-relaxed text-silver/60">
              Turbilhão manufatura · 72h de reserva
              <br />
              Certificado cronômetro
            </p>
          </div>
          <div>
            <p className="eyebrow mb-4">Atendimento</p>
            <p className="text-sm font-light leading-relaxed text-silver/60">
              Por indicação e agendamento
              <br />
              Boutiques: Genebra · Dubai · Singapura
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-silver/10 pt-8 text-[0.62rem] uppercase tracking-[0.22em] text-silver/75 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name} — Todos os direitos reservados</p>
          <p>Manufatura fictícia — estudo de design cinematográfico</p>
        </div>
      </div>
    </footer>
  );
}

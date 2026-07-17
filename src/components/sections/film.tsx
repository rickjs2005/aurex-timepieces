import { FadeIn } from "@/components/reveal";
import type { SceneName } from "@/lib/world";

/**
 * Beats do filme: cada seção é uma cena do roteiro 3D; a legenda fica
 * sticky como subtítulo de cinema. O conteúdo não interage — o palco
 * é o canvas fixo atrás.
 */
function Beat({
  scene,
  index,
  title,
  copy,
  align = "left",
  h = "h-[135vh]",
}: {
  scene: SceneName;
  index: string;
  title: string;
  copy: string;
  align?: "left" | "right" | "center";
  h?: string;
}) {
  const alignCls =
    align === "right"
      ? "items-end text-right"
      : align === "center"
        ? "items-center text-center"
        : "items-start text-left";

  return (
    <section data-scene={scene} className={`relative ${h}`}>
      <div className="pointer-events-none sticky top-0 flex h-screen items-end">
        <div className={`relative z-10 flex w-full flex-col px-6 pb-24 md:px-14 ${alignCls}`}>
          <FadeIn>
            <p data-fade className="eyebrow mb-4">
              {index}
            </p>
            <h2 data-fade className="display max-w-xl text-[clamp(1.7rem,4vw,3.3rem)] text-pearl">
              {title}
            </h2>
            <p
              data-fade
              className={`lead mt-4 max-w-sm text-sm ${align === "right" ? "ml-auto" : ""} ${align === "center" ? "mx-auto" : ""}`}
            >
              {copy}
            </p>
            <div data-fade className={`rule-gold mt-6 w-40 ${align === "right" ? "ml-auto" : ""} ${align === "center" ? "mx-auto" : ""}`} />
          </FadeIn>
        </div>
        <div className="scrim-b pointer-events-none absolute inset-x-0 bottom-0 h-[38vh]" />
      </div>
    </section>
  );
}

export default function Film() {
  return (
    <div id="calibre">
      {/* ---- closes ---- */}
      <Beat
        scene="crown"
        index="I · A coroa"
        title="Sete gramas de ouro, lapidados à mão."
        copy="Quarenta estrias talhadas uma a uma. O clique da coroa AUREX é calibrado para 220 gramas de força — o peso exato da intenção."
      />
      <Beat
        scene="dial"
        index="II · O mostrador"
        title="Um céu preto profundo."
        copy="Doze camadas de laca, polidas até o espelho absoluto. Índices aplicados em ouro maciço flutuam sobre a superfície."
        align="right"
      />
      <Beat
        scene="hands"
        index="III · Os ponteiros"
        title="Finos como um fio de seda."
        copy="Facetados à mão para capturar a luz em qualquer ângulo. O lume interno respira no escuro."
      />
      <Beat
        scene="glass"
        index="IV · O vidro safira"
        title="Nove vezes mais duro que o aço."
        copy="Uma varredura de luz atravessa a safira com dupla camada antirreflexo — e desaparece. Você não vê o vidro; vê o tempo."
        align="right"
      />

      {/* ---- desmontagem ---- */}
      <Beat
        scene="open-1"
        index="V · A abertura"
        title="O relógio respira."
        copy="Safira, bezel e ponteiros levantam em silêncio. Nenhum corte de câmera: apenas o scroll, e a engenharia se revelando."
        h="h-[165vh]"
        align="center"
      />
      <Beat
        scene="open-2"
        index="VI · O coração exposto"
        title="243 componentes. Nenhum supérfluo."
        copy="O mostrador desliza e o calibre AX-01 aparece: pontes escovadas, rubis, e o trem de engrenagens que nunca dorme."
        h="h-[165vh]"
      />
      <Beat
        scene="through"
        index="VII · A travessia"
        title="Atravesse o mecanismo."
        copy="A câmera mergulha entre as peças em suspensão. As engrenagens continuam girando — o tempo não para para ninguém."
        h="h-[180vh]"
        align="center"
      />
      <Beat
        scene="rotor"
        index="VIII · O rotor"
        title="Ouro 22k em movimento perpétuo."
        copy="Cada gesto do pulso arma a mola principal. O rotor esqueletizado gira em rolamento cerâmico, inaudível."
        align="right"
      />
      <Beat
        scene="tourbillon"
        index="IX · O turbilhão"
        title="A gravidade, anulada."
        copy="A gaiola completa uma revolução por minuto, compensando a gravidade em todas as posições. Hipnótico por definição."
      />
      <Beat
        scene="reassemble"
        index="X · A remontagem"
        title="Cada peça sabe seu lugar."
        copy="Em câmera lenta, 243 componentes retornam à posição exata — a coreografia inversa, perfeita, digna de manufatura."
        h="h-[185vh]"
        align="center"
      />
    </div>
  );
}

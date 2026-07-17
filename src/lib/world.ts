/**
 * Estado mutável compartilhado entre o DOM (scroll, ponteiro, UI) e o
 * mundo 3D (câmera, relógio, palco). Lido apenas em useFrame — scroll
 * e ponteiro nunca re-renderizam React.
 */

export type SceneName =
  | "hero"
  | "crown"
  | "dial"
  | "hands"
  | "glass"
  | "open-1"
  | "open-2"
  | "through"
  | "rotor"
  | "tourbillon"
  | "reassemble"
  | "specs"
  | "config"
  | "gallery"
  | "finale";

export const CASES = [
  { name: "Aço escovado", hex: "#b8bcc2", rough: 0.34, metal: 0.95 },
  { name: "Titânio", hex: "#8b9097", rough: 0.42, metal: 0.9 },
  { name: "Ouro champanhe", hex: "#c9a962", rough: 0.22, metal: 1.0 },
  { name: "Cerâmica preta", hex: "#1c1e22", rough: 0.18, metal: 0.55 },
] as const;

export const DIALS = [
  { name: "Preto profundo", hex: "#0b0d10" },
  { name: "Azul meia-noite", hex: "#101a2e" },
  { name: "Prata gelo", hex: "#c9cdd3" },
  { name: "Verde floresta", hex: "#0e211a" },
] as const;

export const HANDS = [
  { name: "Ouro", hex: "#d8b878" },
  { name: "Prata", hex: "#d7dbe0" },
  { name: "Azulado", hex: "#4f79c8" },
] as const;

export interface WatchConfig {
  /** índice em CASES */
  caseIdx: number;
  /** índice em DIALS */
  dialIdx: number;
  /** índice em HANDS */
  handsIdx: number;
  /** 0 = pulseira metálica, 1 = couro premium */
  strap: 0 | 1;
  /** 0 = escovado, 1 = polido */
  finish: 0 | 1;
}

/** pose-alvo amostrada do roteiro a cada frame */
export interface Goal {
  cam: [number, number, number];
  look: [number, number, number];
  fov: number;
  /** rotação Y do relógio */
  rotY: number;
  /** rotação X do relógio (tombar pra close de mostrador etc.) */
  rotX: number;
  /** fator de desmontagem 0..1 */
  explode: number;
  /** intensidades 0..1 */
  key: number;
  rim: number;
  amb: number;
  /** velocidade do ponteiro de segundos (0..1, 1 = vivo) */
  seconds: number;
  /** multiplicador do maquinário (engrenagens/rotor/turbilhão) */
  spin: number;
  /** opacidade das partículas */
  dust: number;
}

export const world = {
  scene: "hero" as SceneName,
  /** progresso local 0..1 dentro da cena ativa */
  t: 0,
  /** ponteiro normalizado -1..1 */
  pointer: { x: 0, y: 0 },
  introDone: false,
  config: {
    caseIdx: 0,
    dialIdx: 0,
    handsIdx: 0,
    strap: 0,
    finish: 0,
  } as WatchConfig,
  quality: {
    mobile: false,
    reduced: false,
  },
  goal: {
    cam: [0, 0.3, 6.4],
    look: [0, 0, 0],
    fov: 34,
    rotY: -0.4,
    rotX: 0,
    explode: 0,
    key: 0.8,
    rim: 0.7,
    amb: 0.4,
    seconds: 0.15,
    spin: 1,
    dust: 0.5,
  } as Goal,
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
export const smooth = (t: number) => {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
};

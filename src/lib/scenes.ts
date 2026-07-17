import { Goal, SceneName, lerp, easeInOut } from "./world";

type V3 = [number, number, number];

/** keyframe [de, até] interpolado pelo progresso local suavizado */
interface SceneDef {
  cam: [V3, V3];
  look: [V3, V3];
  fov: [number, number];
  rotY: [number, number];
  rotX?: [number, number];
  explode: [number, number];
  key: [number, number];
  rim: [number, number];
  amb: [number, number];
  seconds?: [number, number];
  spin?: [number, number];
  dust?: [number, number];
}

/**
 * O roteiro do filme. O relógio (raio ~1.5) fica na origem, mostrador
 * voltado pra +z. A câmera dá cortes-dolly entre cenas (damping do rig)
 * e o fator explode desmonta/remonta as peças.
 */
export const SCENES: Record<SceneName, SceneDef> = {
  // flutuando montado, respiração lenta
  hero: {
    cam: [
      [0.6, 0.4, 6.8],
      [0.2, 0.25, 6.2],
    ],
    look: [
      [0, 0, 0],
      [0, 0, 0],
    ],
    fov: [34, 33],
    rotY: [-0.5, -0.22],
    explode: [0, 0],
    key: [0.75, 0.85],
    rim: [0.8, 0.9],
    amb: [0.35, 0.4],
    seconds: [0.12, 0.12],
    dust: [0.6, 0.6],
  },

  // close na coroa (lado +x)
  crown: {
    cam: [
      [3.4, 0.4, 3.4],
      [2.5, 0.15, 2.2],
    ],
    look: [
      [1.35, 0, 0.1],
      [1.5, 0, 0],
    ],
    fov: [30, 26],
    rotY: [-0.22, 0.12],
    explode: [0, 0],
    key: [0.7, 0.8],
    rim: [1, 1],
    amb: [0.3, 0.3],
  },

  // mostrador frontal, leve mergulho
  dial: {
    cam: [
      [0.4, 1.6, 4.2],
      [0.1, 0.7, 3.0],
    ],
    look: [
      [0, 0.1, 0],
      [0, 0.05, 0],
    ],
    fov: [30, 27],
    rotY: [0.12, 0.02],
    rotX: [0.08, 0.16],
    explode: [0, 0],
    key: [0.85, 0.95],
    rim: [0.7, 0.7],
    amb: [0.4, 0.45],
  },

  // macro nos ponteiros
  hands: {
    cam: [
      [-1.1, 0.7, 2.6],
      [-0.5, 0.4, 1.9],
    ],
    look: [
      [0.1, 0.15, 0.2],
      [0.15, 0.1, 0.2],
    ],
    fov: [26, 24],
    rotY: [0.02, -0.14],
    rotX: [0.16, 0.1],
    explode: [0, 0],
    key: [0.9, 1],
    rim: [0.8, 0.9],
    amb: [0.3, 0.3],
  },

  // vidro safira de raspão — varredura de luz
  glass: {
    cam: [
      [-2.6, 1.5, 3.2],
      [-3.2, 0.6, 1.6],
    ],
    look: [
      [0, 0.1, 0.1],
      [0, 0, 0.15],
    ],
    fov: [28, 30],
    rotY: [-0.14, -0.5],
    rotX: [0.1, 0.02],
    explode: [0, 0],
    key: [0.5, 0.6],
    rim: [1, 1],
    amb: [0.25, 0.25],
  },

  // ato 1: vidro, bezel e ponteiros levantam
  "open-1": {
    cam: [
      [-1.8, 1.3, 5.8],
      [1.4, 1.0, 5.4],
    ],
    look: [
      [0, 0.25, 0.3],
      [0, 0.4, 0.4],
    ],
    fov: [32, 34],
    rotY: [-0.5, -0.1],
    rotX: [0.02, -0.06],
    explode: [0, 0.42],
    key: [0.8, 0.85],
    rim: [0.9, 1],
    amb: [0.35, 0.4],
    dust: [0.6, 0.8],
  },

  // ato 2: mostrador sai, movimento aparece
  "open-2": {
    cam: [
      [1.2, 0.6, 4.2],
      [-0.8, 0.2, 3.2],
    ],
    look: [
      [0, 0.3, 0.4],
      [0, 0.15, 0.1],
    ],
    fov: [34, 33],
    rotY: [-0.1, 0.35],
    rotX: [-0.06, 0.04],
    explode: [0.42, 0.78],
    key: [0.85, 0.9],
    rim: [1, 1],
    amb: [0.4, 0.45],
    dust: [0.8, 0.9],
  },

  // a câmera ATRAVESSA o mecanismo flutuando (rotY zera: espaço
  // local do relógio = mundo, os alvos exploded ficam previsíveis)
  through: {
    cam: [
      [-1.0, 0.3, 3.6],
      [0.1, -0.05, 1.7],
    ],
    look: [
      [0, 0, 0.3],
      [0, -0.43, 1.36],
    ],
    fov: [33, 40],
    rotY: [0.35, 0.05],
    explode: [0.78, 1],
    key: [0.9, 1],
    rim: [1, 1],
    amb: [0.45, 0.55],
    spin: [1, 1.6],
    dust: [0.9, 1],
  },

  // close no rotor exploded: local (0.1,-0.35,-2.26), frontal por trás —
  // a meia-lua esqueletizada inteira no quadro, oscilando
  rotor: {
    cam: [
      [0.6, -0.1, -5.2],
      [0.25, -0.3, -4.4],
    ],
    look: [
      [0.1, -0.3, -2.26],
      [0.1, -0.35, -2.26],
    ],
    fov: [36, 33],
    rotY: [0.05, 0],
    explode: [1, 1],
    key: [0.9, 0.95],
    rim: [1.9, 1.9],
    amb: [0.8, 0.8],
    spin: [1.6, 1.2],
  },

  // close no turbilhão exploded: local (0,-0.43,1.36)
  tourbillon: {
    cam: [
      [-1.1, 0.05, 3.2],
      [-0.45, -0.25, 2.5],
    ],
    look: [
      [0, -0.43, 1.36],
      [0, -0.43, 1.36],
    ],
    fov: [26, 22],
    rotY: [0, 0],
    explode: [1, 1],
    key: [1, 1],
    rim: [0.9, 1],
    amb: [0.35, 0.35],
    spin: [1.2, 1.2],
  },

  // tudo volta pro lugar — engenharia em câmera lenta
  reassemble: {
    cam: [
      [-0.5, 0.4, 3.8],
      [0.5, 0.3, 5.4],
    ],
    look: [
      [0, -0.2, 0.6],
      [0, 0, 0],
    ],
    fov: [30, 33],
    rotY: [0, -0.15],
    explode: [1, 0],
    key: [0.85, 0.9],
    rim: [1, 0.9],
    amb: [0.4, 0.4],
    dust: [1, 0.5],
  },

  // números gigantes por cima, relógio recua elegante
  specs: {
    cam: [
      [0.5, 0.3, 5.4],
      [2.2, 0.6, 8.6],
    ],
    look: [
      [0, 0, 0],
      [-0.5, 0.05, 0],
    ],
    fov: [33, 34],
    rotY: [-0.15, -0.55],
    explode: [0, 0],
    key: [0.55, 0.5],
    rim: [0.7, 0.6],
    amb: [0.3, 0.28],
    dust: [0.5, 0.4],
  },

  // estúdio claro, órbita lenta enquanto o painel troca materiais
  config: {
    cam: [
      [1.6, 0.5, 6.6],
      [-2.4, 0.7, 5.6],
    ],
    look: [
      [-0.4, 0.05, 0],
      [0.3, 0, 0],
    ],
    fov: [34, 33],
    rotY: [-0.55, 0.4],
    explode: [0, 0],
    key: [0.95, 1],
    rim: [0.8, 0.85],
    amb: [0.55, 0.6],
    seconds: [0.15, 0.15],
    dust: [0.35, 0.35],
  },

  // canvas principal esmaece — a galeria tem palco próprio
  gallery: {
    cam: [
      [-2.4, 0.7, 5.6],
      [-2.4, 0.7, 5.8],
    ],
    look: [
      [0.3, 0, 0],
      [0.3, 0, 0],
    ],
    fov: [33, 33],
    rotY: [0.4, 0.4],
    explode: [0, 0],
    key: [0.4, 0.4],
    rim: [0.5, 0.5],
    amb: [0.25, 0.25],
    dust: [0.2, 0.2],
  },

  // luz sobe, segundos ganham vida, órbita final
  finale: {
    cam: [
      [2.2, 0.6, 5.6],
      [-1.6, 0.35, 4.6],
    ],
    look: [
      [0, 0, 0],
      [0, 0, 0],
    ],
    fov: [33, 30],
    rotY: [0.4, 1.35],
    explode: [0, 0],
    key: [0.7, 1],
    rim: [0.8, 1],
    amb: [0.35, 0.6],
    seconds: [0.15, 1],
    spin: [1, 1.3],
    dust: [0.4, 0.7],
  },
};

const v = (pair: [V3, V3], t: number): V3 => [
  lerp(pair[0][0], pair[1][0], t),
  lerp(pair[0][1], pair[1][1], t),
  lerp(pair[0][2], pair[1][2], t),
];

export function sampleScene(scene: SceneName, rawT: number): Goal {
  const s = SCENES[scene] ?? SCENES.hero;
  const t = easeInOut(Math.min(1, Math.max(0, rawT)));
  return {
    cam: v(s.cam, t),
    look: v(s.look, t),
    fov: lerp(s.fov[0], s.fov[1], t),
    rotY: lerp(s.rotY[0], s.rotY[1], t),
    rotX: s.rotX ? lerp(s.rotX[0], s.rotX[1], t) : 0,
    explode: lerp(s.explode[0], s.explode[1], t),
    key: lerp(s.key[0], s.key[1], t),
    rim: lerp(s.rim[0], s.rim[1], t),
    amb: lerp(s.amb[0], s.amb[1], t),
    seconds: s.seconds ? lerp(s.seconds[0], s.seconds[1], t) : 0.15,
    spin: s.spin ? lerp(s.spin[0], s.spin[1], t) : 1,
    dust: s.dust ? lerp(s.dust[0], s.dust[1], t) : 0.5,
  };
}

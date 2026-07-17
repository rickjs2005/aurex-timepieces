"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { world, CASES, DIALS, HANDS, lerp, clamp01 } from "@/lib/world";

/**
 * Calibre AX-01 — relógio 100% procedural.
 *
 * Cada peça é um <Part> com posição de repouso (home) e um offset de
 * desmontagem; o fator global world.goal.explode (0..1) percorre os
 * delays individuais, então as peças saem/voltam em cascata — a
 * remontagem é o mesmo caminho ao contrário, com precisão total.
 * O maquinário nunca para: engrenagens, rotor, escape e turbilhão
 * têm movimento contínuo multiplicado por goal.spin.
 */

/* ---------------- fator local de explosão ---------------- */
const partLocal = (delay: number, span: number) => {
  const e = world.goal.explode;
  const c = clamp01((e - delay) / span);
  return c * c * (3 - 2 * c); // smoothstep
};

/* ---------------- Part: wrapper com home + offset ---------------- */
function Part({
  home,
  off,
  rotOff = [0, 0, 0],
  delay = 0,
  span = 0.4,
  children,
}: {
  home: [number, number, number];
  off: [number, number, number];
  rotOff?: [number, number, number];
  delay?: number;
  span?: number;
  children: React.ReactNode;
}) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    const k = partLocal(delay, span);
    const el = g.current;
    if (!el) return;
    el.position.set(home[0] + off[0] * k, home[1] + off[1] * k, home[2] + off[2] * k);
    el.rotation.set(rotOff[0] * k, rotOff[1] * k, rotOff[2] * k);
  });
  return (
    <group ref={g} position={home}>
      {children}
    </group>
  );
}

/* ---------------- engrenagem paramétrica ---------------- */
function Gear({
  r,
  th = 0.045,
  teeth,
  speed,
  material,
  axle = true,
}: {
  r: number;
  th?: number;
  teeth: number;
  speed: number; // rad/s (sinal = direção)
  material: THREE.Material;
  axle?: boolean;
}) {
  const g = useRef<THREE.Group>(null);
  const inst = useRef<THREE.InstancedMesh>(null);

  const toothW = ((2 * Math.PI * r) / teeth) * 0.42;

  // escreve as matrizes dos dentes nos primeiros frames — imune a
  // qualquer recriação do buffer por re-render do canvas
  const warm = useRef(0);
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.z += speed * world.goal.spin * Math.min(dt, 1 / 30);
    if (warm.current < 10) {
      warm.current++;
      const m = inst.current;
      if (m) {
        const M = new THREE.Matrix4();
        const q = new THREE.Quaternion();
        const eu = new THREE.Euler();
        for (let i = 0; i < teeth; i++) {
          const a = (i / teeth) * Math.PI * 2;
          eu.set(0, 0, a);
          q.setFromEuler(eu);
          M.compose(
            new THREE.Vector3(Math.cos(a) * (r + 0.028), Math.sin(a) * (r + 0.028), 0),
            q,
            new THREE.Vector3(1, 1, 1)
          );
          m.setMatrixAt(i, M);
        }
        m.instanceMatrix.needsUpdate = true;
        m.frustumCulled = false;
      }
    }
  });

  return (
    <group ref={g}>
      {/* corpo no plano XY (disco de frente pra câmera) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={material}>
        <cylinderGeometry args={[r, r, th, 28]} />
      </mesh>
      {/* raios */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]} material={material}>
          <boxGeometry args={[r * 1.7, 0.05, th * 0.85]} />
        </mesh>
      ))}
      {/* dentes radiais no plano XY */}
      <instancedMesh ref={inst} args={[undefined, undefined, teeth]} material={material}>
        <boxGeometry args={[0.056, toothW, th * 0.95]} />
      </instancedMesh>
      {axle && (
        <mesh rotation={[Math.PI / 2, 0, 0]} material={material}>
          <cylinderGeometry args={[0.035, 0.035, th * 3, 10]} />
        </mesh>
      )}
      {/* rubi no eixo */}
      <mesh position={[0, 0, th * 1.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 0.015, 10]} />
        <meshStandardMaterial color="#8a1220" emissive="#5a0a14" emissiveIntensity={0.5} roughness={0.2} />
      </mesh>
    </group>
  );
}

/** alias mantido: as engrenagens já vivem no plano XY */
const FlatGear = Gear;

/* ---------------- turbilhão ---------------- */
function Tourbillon({ gold, steel }: { gold: THREE.Material; steel: THREE.Material }) {
  const cage = useRef<THREE.Group>(null);
  const balance = useRef<THREE.Group>(null);

  useFrame(({ clock }, dt) => {
    const d = Math.min(dt, 1 / 30);
    if (cage.current) cage.current.rotation.z += 0.9 * world.goal.spin * d;
    if (balance.current)
      balance.current.rotation.z = Math.sin(clock.elapsedTime * 7) * 1.15;
  });

  return (
    <group>
      {/* aro externo da gaiola */}
      <mesh rotation={[0, 0, 0]} material={gold}>
        <torusGeometry args={[0.34, 0.022, 10, 40]} />
      </mesh>
      <group ref={cage}>
        {/* barras cruzadas */}
        <mesh material={gold}>
          <boxGeometry args={[0.66, 0.028, 0.028]} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]} material={gold}>
          <boxGeometry args={[0.66, 0.028, 0.028]} />
        </mesh>
        {/* roda de balanço */}
        <group ref={balance} position={[0, 0, 0.05]}>
          <mesh material={steel}>
            <torusGeometry args={[0.22, 0.018, 8, 32]} />
          </mesh>
          {[0, 1].map((i) => (
            <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} material={steel}>
              <boxGeometry args={[0.42, 0.016, 0.016]} />
            </mesh>
          ))}
          {/* espiral sugerida */}
          <mesh position={[0, 0, 0.02]} material={gold}>
            <torusGeometry args={[0.1, 0.006, 6, 24]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ---------------- mola principal (espiral) ---------------- */
function Mainspring({ material }: { material: THREE.Material }) {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const turns = 3.2;
    const steps = 90;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = t * turns * Math.PI * 2;
      const r = 0.05 + t * 0.24;
      pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 120, 0.014, 6, false);
  }, []);
  return <mesh geometry={geo} material={material} />;
}

/* ---------------- relógio completo ---------------- */
export default function Watch({
  configOverride,
  spinOnly = false,
  galleryStatic = false,
}: {
  /** galeria: variação fixa em vez do world.config */
  configOverride?: { caseIdx: number; dialIdx: number; handsIdx: number };
  /** galeria: giro contínuo próprio, ignora o roteiro */
  spinOnly?: boolean;
  /** 360°: o pai controla a rotação (arrasto) */
  galleryStatic?: boolean;
}) {
  const root = useRef<THREE.Group>(null);

  /* --- materiais vivos (lerp por frame em direção ao config) --- */
  const caseMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#b8bcc2", metalness: 0.95, roughness: 0.34 }),
    []
  );
  const dialMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0a0c0f",
        metalness: 0.05,
        roughness: 0.88,
        envMapIntensity: 0.12,
      }),
    []
  );
  const handsMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#d8b878", metalness: 0.95, roughness: 0.2 }),
    []
  );
  const strapMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#b8bcc2", metalness: 0.95, roughness: 0.38 }),
    []
  );
  const goldMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#c9a962", metalness: 0.98, roughness: 0.24 }),
    []
  );
  const steelMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#aeb3ba", metalness: 0.92, roughness: 0.3 }),
    []
  );
  const plateMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#8d939b", metalness: 0.88, roughness: 0.48 }),
    []
  );
  const darkMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#15171b", metalness: 0.7, roughness: 0.5 }),
    []
  );
  const glassMat = useMemo(
    () =>
      // safira "com AR coating": tint constante, imune a Fresnel rasante
      // que virava véu leitoso sobre o mostrador em ângulos abertos
      new THREE.MeshBasicMaterial({
        color: "#cfe0ee",
        transparent: true,
        opacity: 0.045,
        depthWrite: false,
      }),
    []
  );
  const lumeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#dfe6ea",
        emissive: new THREE.Color("#9fd8cf"),
        emissiveIntensity: 0.32,
      }),
    []
  );

  const tmpColor = useMemo(() => new THREE.Color(), []);

  /* --- refs do maquinário vivo --- */
  const hourRef = useRef<THREE.Group>(null);
  const minRef = useRef<THREE.Group>(null);
  const secRef = useRef<THREE.Group>(null);
  const rotorRef = useRef<THREE.Group>(null);
  const anchorRef = useRef<THREE.Group>(null);
  const crownRef = useRef<THREE.Group>(null);
  const linksTop = useRef<THREE.InstancedMesh>(null);
  const linksBot = useRef<THREE.InstancedMesh>(null);
  const capsTop = useRef<THREE.InstancedMesh>(null);
  const capsBot = useRef<THREE.InstancedMesh>(null);

  /* --- índices do mostrador (instanciados) --- */
  const idxRef = useRef<THREE.InstancedMesh>(null);
  const idxWarm = useRef(0);

  /* --- geometria base dos elos da pulseira --- */
  const linkBase = useMemo(() => {
    const arr: { y: number; z: number; rx: number }[] = [];
    let y = 1.78;
    let z = 0;
    let rx = 0;
    for (let i = 0; i < 8; i++) {
      arr.push({ y, z, rx });
      rx += 0.16;
      y += Math.cos(rx) * 0.3;
      z -= Math.sin(rx) * 0.3;
    }
    return arr;
  }, []);

  /* impressão do mostrador: trilha de minutos + marca, desenhadas em
     canvas 2D → CanvasTexture. Camada Basic transparente sobre o dial
     (a cor do dial continua lerpável por baixo). */
  const printTex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 1024;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    const CX = 512;
    const S = 403; // px por unidade de cena (dial r 1.27 ≈ 512px)

    // trilha de minutos
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const major = i % 5 === 0;
      const r0 = 1.1 * S;
      const r1 = (major ? 1.155 : 1.135) * S;
      ctx.strokeStyle = major ? "rgba(216,184,120,0.95)" : "rgba(200,204,210,0.55)";
      ctx.lineWidth = major ? 5 : 2.5;
      ctx.beginPath();
      ctx.moveTo(CX + Math.cos(a) * r0, CX + Math.sin(a) * r0);
      ctx.lineTo(CX + Math.cos(a) * r1, CX + Math.sin(a) * r1);
      ctx.stroke();
    }

    // numerais aplicados 12 / 9 (3h recebe a janela de data; 6h, o turbilhão)
    ctx.fillStyle = "rgba(216,184,120,0.95)";
    ctx.textAlign = "center";
    ctx.font = "500 104px Georgia, serif";
    ctx.fillText("12", CX, CX - 0.98 * S + 36);
    ctx.fillText("9", CX - 0.98 * S, CX + 38);

    // janela de data às 3h — moldura rebaixada + placa creme + numeral
    const dx = CX + 0.86 * S;
    ctx.fillStyle = "rgba(20,22,26,0.9)";
    ctx.fillRect(dx - 52, CX - 40, 104, 80);
    ctx.strokeStyle = "rgba(216,184,120,0.85)";
    ctx.lineWidth = 4;
    ctx.strokeRect(dx - 52, CX - 40, 104, 80);
    ctx.fillStyle = "#e8e6df";
    ctx.fillRect(dx - 42, CX - 30, 84, 60);
    ctx.fillStyle = "#1a1c20";
    ctx.font = "600 52px Georgia, serif";
    ctx.fillText("28", dx, CX + 18);

    // marca
    ctx.fillStyle = "rgba(232,207,154,0.98)";
    ctx.textAlign = "center";
    ctx.font = "600 58px Georgia, serif";
    ctx.fillText("A U R E X", CX, CX - 148);
    ctx.font = "300 24px Georgia, serif";
    ctx.fillStyle = "rgba(200,204,210,0.75)";
    ctx.fillText("A U T O M A T I Q U E", CX, CX - 112);
    // assinatura do calibre acima da abertura do turbilhão
    ctx.font = "300 22px Georgia, serif";
    ctx.fillStyle = "rgba(216,184,120,0.8)";
    ctx.fillText("T O U R B I L L O N", CX, CX + 118);

    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 8;
    // o canvas 2D tem Y pra baixo; o plane em XY tem Y pra cima
    t.flipY = true;
    return t;
  }, []);

  /* ponteiro dauphine: losango facetado extrudado com bevel */
  const dauphine = useMemo(() => {
    const make = (len: number, w: number, tail: number) => {
      const s = new THREE.Shape();
      s.moveTo(0, -tail);
      s.lineTo(w / 2, 0);
      s.lineTo(0, len);
      s.lineTo(-w / 2, 0);
      s.closePath();
      return new THREE.ExtrudeGeometry(s, {
        depth: 0.01,
        bevelEnabled: true,
        bevelThickness: 0.006,
        bevelSize: 0.012,
        bevelSegments: 1,
      });
    };
    return { hour: make(0.62, 0.1, 0.12), minute: make(0.98, 0.075, 0.14) };
  }, []);

  /* rotor esqueletizado: meia-coroa com recortes circulares */
  const rotorGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.absarc(0, 0, 1.05, 0, Math.PI, false);
    s.lineTo(-0.34, 0);
    s.absarc(0, 0, 0.34, Math.PI, 0, true);
    s.closePath();
    // recortes
    [[-0.62, 0.42], [0, 0.72], [0.62, 0.42]].forEach(([x, y]) => {
      const h = new THREE.Path();
      h.absarc(x, y, 0.15, 0, Math.PI * 2, true);
      s.holes.push(h);
    });
    return new THREE.ExtrudeGeometry(s, {
      depth: 0.03,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.008,
      bevelSegments: 1,
      curveSegments: 40,
    });
  }, []);

  /* geometrias arredondadas — elos, elo central e lugs (caixas chapadas
     eram o maior "cheiro de procedural" do modelo) */
  const linkGeo = useMemo(() => new RoundedBoxGeometry(0.86, 0.27, 0.14, 3, 0.05), []);
  const capGeo = useMemo(() => new RoundedBoxGeometry(0.32, 0.28, 0.16, 3, 0.055), []);
  const lugGeo = useMemo(() => new RoundedBoxGeometry(0.26, 0.48, 0.26, 3, 0.07), []);

  /* anel da caixa: extrusão de coroa circular (um cilindro sólido
     tapava o mostrador — a caixa é um TUBO, não um disco) */
  const caseRingGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 1.5, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 1.36, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 0.44,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
      curveSegments: 48,
    });
    g.translate(0, 0, -0.22);
    return g;
  }, []);

  const M4 = useMemo(() => new THREE.Matrix4(), []);
  const Q = useMemo(() => new THREE.Quaternion(), []);
  const EU = useMemo(() => new THREE.Euler(), []);
  const V3 = useMemo(() => new THREE.Vector3(), []);
  const SC = useMemo(() => new THREE.Vector3(1, 1, 1), []);

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const t = clock.elapsedTime;
    const g = world.goal;
    const cfg = configOverride ?? world.config;

    /* pose do conjunto */
    if (root.current) {
      if (galleryStatic) {
        // o pai (arrasto 360°) manda na rotação
      } else if (spinOnly) {
        root.current.rotation.y += dt * 0.35;
      } else {
        root.current.rotation.y = g.rotY + Math.sin(t * 0.3) * 0.02;
        root.current.rotation.x = g.rotX + Math.sin(t * 0.23) * 0.012;
        root.current.position.y = Math.sin(t * 0.5) * 0.045;
      }
    }

    /* materiais vivos (config) */
    const cs = CASES[cfg.caseIdx];
    const finishMul = ("finish" in cfg ? (cfg as typeof world.config).finish : 0) === 1 ? 0.45 : 1;
    caseMat.color.lerp(tmpColor.set(cs.hex), 0.08);
    caseMat.roughness = lerp(caseMat.roughness, cs.rough * finishMul, 0.08);
    caseMat.metalness = lerp(caseMat.metalness, cs.metal, 0.08);

    dialMat.color.lerp(tmpColor.set(DIALS[cfg.dialIdx].hex), 0.08);
    handsMat.color.lerp(tmpColor.set(HANDS[cfg.handsIdx].hex), 0.08);

    const strap = "strap" in cfg ? (cfg as typeof world.config).strap : 0;
    if (strap === 1) {
      strapMat.color.lerp(tmpColor.set("#43301f"), 0.08);
      strapMat.roughness = lerp(strapMat.roughness, 0.92, 0.08);
      strapMat.metalness = lerp(strapMat.metalness, 0.05, 0.08);
    } else {
      strapMat.color.lerp(tmpColor.set(cs.hex), 0.08);
      strapMat.roughness = lerp(strapMat.roughness, cs.rough, 0.08);
      strapMat.metalness = lerp(strapMat.metalness, cs.metal, 0.08);
    }

    /* maquinário vivo */
    const spin = g.spin;
    if (hourRef.current) hourRef.current.rotation.z -= dt * 0.0009 * spin;
    if (minRef.current) minRef.current.rotation.z -= dt * 0.011 * spin;
    if (secRef.current) secRef.current.rotation.z -= dt * (0.02 + g.seconds * 0.42);
    if (rotorRef.current)
      rotorRef.current.rotation.z = Math.sin(t * 0.55) * 0.9 + t * 0.05 * spin;
    if (anchorRef.current) anchorRef.current.rotation.z = Math.sin(t * 9) * 0.22;
    if (crownRef.current) crownRef.current.rotation.x += dt * 0.25 * spin;

    /* índices do mostrador — matrizes nos primeiros frames */
    if (idxWarm.current < 10) {
      idxWarm.current++;
      const m = idxRef.current;
      if (m) {
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          EU.set(0, 0, a);
          Q.setFromEuler(EU);
          // 3h/12h/9h têm numerais impressos — índice some
          const numeral = i === 0 || i === 3 || i === 6;
          V3.set(Math.cos(a) * 1.05, Math.sin(a) * 1.05, 0);
          if (numeral) SC.set(0.001, 0.001, 0.001);
          else SC.set(1, 1, 1);
          M4.compose(V3, Q, SC);
          m.setMatrixAt(i, M4);
        }
        SC.set(1, 1, 1);
        m.instanceMatrix.needsUpdate = true;
        m.frustumCulled = false;
      }
    }

    /* elos da pulseira (espalham no explode) */
    const spread = partLocal(0.18, 0.45);
    const place = (
      mesh: THREE.InstancedMesh | null,
      caps: THREE.InstancedMesh | null,
      sign: 1 | -1
    ) => {
      if (!mesh) return;
      for (let i = 0; i < 8; i++) {
        const b = linkBase[i];
        V3.set(0, sign * (b.y + spread * (1.5 + i * 0.34)), b.z - spread * (0.3 + i * 0.12));
        EU.set(sign * b.rx + spread * sign * (0.2 + i * 0.08), 0, 0);
        Q.setFromEuler(EU);
        // pulseira afila conforme se afasta da caixa
        SC.set(1 - i * 0.042, 1, 1);
        M4.compose(V3, Q, SC);
        mesh.setMatrixAt(i, M4);
        caps?.setMatrixAt(i, M4);
      }
      SC.set(1, 1, 1);
      mesh.instanceMatrix.needsUpdate = true;
      mesh.frustumCulled = false;
      if (caps) {
        // elo central polido só na pulseira metálica
        caps.visible = strap === 0;
        caps.instanceMatrix.needsUpdate = true;
        caps.frustumCulled = false;
      }
    };
    place(linksTop.current, capsTop.current, 1);
    place(linksBot.current, capsBot.current, -1);
  });

  return (
    <group ref={root}>
      {/* ================= CAIXA ================= */}
      <Part home={[0, 0, 0]} off={[0, -1.3, -0.7]} rotOff={[-0.35, 0, 0]} delay={0.46} span={0.4}>
        {/* corpo da caixa — anel extrudado (aberto no centro) */}
        <mesh geometry={caseRingGeo} material={caseMat} />
        {/* lugs (alças) — arredondados e levemente convergentes */}
        {([1, -1] as const).map((sy) =>
          ([1, -1] as const).map((sx) => (
            <mesh
              key={`${sy}${sx}`}
              position={[sx * 0.6, sy * 1.5, -0.02]}
              rotation={[sy * -0.18, 0, sx * sy * 0.08]}
              material={caseMat}
              geometry={lugGeo}
            />
          ))
        )}
      </Part>

      {/* fundo da caixa */}
      <Part home={[0, 0, -0.3]} off={[0, 1.15, -0.9]} rotOff={[0.5, 0, 0]} delay={0.36} span={0.38}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={caseMat}>
          <cylinderGeometry args={[1.34, 1.34, 0.07, 48]} />
        </mesh>
        <mesh position={[0, 0, -0.045]} rotation={[Math.PI / 2, 0, 0]} material={glassMat}>
          <cylinderGeometry args={[1.05, 1.05, 0.03, 40]} />
        </mesh>
      </Part>

      {/* ================= COROA ================= */}
      <Part home={[1.56, 0, 0]} off={[1.7, 0.12, 0.25]} delay={0.4} span={0.35}>
        <group ref={crownRef}>
          <mesh rotation={[0, 0, Math.PI / 2]} material={goldMat}>
            <cylinderGeometry args={[0.17, 0.17, 0.16, 20]} />
          </mesh>
          {/* serrilhado */}
          {Array.from({ length: 14 }).map((_, i) => {
            const a = (i / 14) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[0, Math.cos(a) * 0.17, Math.sin(a) * 0.17]}
                rotation={[a, 0, 0]}
                material={goldMat}
              >
                <boxGeometry args={[0.17, 0.035, 0.035]} />
              </mesh>
            );
          })}
          {/* haste */}
          <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.14, 0, 0]} material={steelMat}>
            <cylinderGeometry args={[0.045, 0.045, 0.3, 10]} />
          </mesh>
        </group>
      </Part>

      {/* ================= BEZEL + VIDRO ================= */}
      <Part home={[0, 0, 0.24]} off={[0, 0.15, 1.75]} rotOff={[0.22, 0, 0]} delay={0.05} span={0.35}>
        <mesh material={caseMat}>
          <torusGeometry args={[1.37, 0.13, 14, 56]} />
        </mesh>
        {/* parafusos do bezel */}
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2 + 0.26;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 1.37, Math.sin(a) * 1.37, 0.1]}
              rotation={[Math.PI / 2, 0, 0]}
              material={steelMat}
            >
              <cylinderGeometry args={[0.045, 0.045, 0.05, 10]} />
            </mesh>
          );
        })}
      </Part>

      <Part home={[0, 0, 0.33]} off={[0, 0.3, 2.5]} rotOff={[0.35, 0, 0]} delay={0} span={0.32}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={glassMat}>
          <cylinderGeometry args={[1.28, 1.24, 0.07, 48]} />
        </mesh>
      </Part>

      {/* ================= MOSTRADOR ================= */}
      <Part home={[0, 0, 0.15]} off={[0, 0.45, 1.1]} rotOff={[0.3, 0, 0.06]} delay={0.24} span={0.34}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={dialMat}>
          <cylinderGeometry args={[1.27, 1.27, 0.025, 48]} />
        </mesh>
        {/* anel rehaut */}
        <mesh position={[0, 0, 0.02]} material={goldMat}>
          <torusGeometry args={[1.18, 0.022, 8, 56]} />
        </mesh>
        {/* impressão: trilha de minutos + marca */}
        {printTex && (
          <mesh position={[0, 0, 0.024]}>
            <circleGeometry args={[1.24, 48]} />
            <meshBasicMaterial map={printTex} transparent depthWrite={false} />
          </mesh>
        )}
        {/* índices aplicados */}
        <instancedMesh ref={idxRef} args={[undefined, undefined, 12]} material={handsMat} position={[0, 0, 0.035]}>
          <boxGeometry args={[0.2, 0.06, 0.028]} />
        </instancedMesh>
        {/* placa da marca ao norte */}
        <mesh position={[0, 0.55, 0.025]} material={goldMat}>
          <boxGeometry args={[0.42, 0.05, 0.01]} />
        </mesh>
        {/* abertura do turbilhão às 6h (aro) */}
        <mesh position={[0, -0.55, 0.02]} material={goldMat}>
          <torusGeometry args={[0.4, 0.018, 8, 40]} />
        </mesh>
      </Part>

      {/* ================= PONTEIROS ================= */}
      <Part home={[0, 0, 0.2]} off={[0.5, 0.45, 1.3]} rotOff={[0, 0.2, 0]} delay={0.1} span={0.3}>
        <group ref={hourRef} rotation={[0, 0, 0.8]}>
          <mesh geometry={dauphine.hour} material={handsMat} />
          <mesh position={[0, 0.32, 0.018]} material={lumeMat}>
            <boxGeometry args={[0.02, 0.26, 0.005]} />
          </mesh>
        </group>
      </Part>
      <Part home={[0, 0, 0.22]} off={[-0.45, 0.55, 1.5]} rotOff={[0, -0.2, 0]} delay={0.13} span={0.3}>
        <group ref={minRef} rotation={[0, 0, -0.6]}>
          <mesh geometry={dauphine.minute} material={handsMat} />
          <mesh position={[0, 0.55, 0.018]} material={lumeMat}>
            <boxGeometry args={[0.016, 0.4, 0.005]} />
          </mesh>
        </group>
      </Part>
      <Part home={[0, 0, 0.24]} off={[0.25, -0.35, 1.7]} rotOff={[0.15, 0, 0]} delay={0.16} span={0.3}>
        <group ref={secRef} rotation={[0, 0, 2.1]}>
          <mesh position={[0, 0.5, 0]} material={goldMat}>
            <boxGeometry args={[0.016, 1.15, 0.008]} />
          </mesh>
          {/* contrapeso */}
          <mesh position={[0, -0.18, 0]} material={goldMat}>
            <cylinderGeometry args={[0.05, 0.05, 0.012, 12]} />
          </mesh>
        </group>
        {/* canhão central */}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={goldMat}>
          <cylinderGeometry args={[0.055, 0.055, 0.09, 14]} />
        </mesh>
      </Part>

      {/* ================= MOVIMENTO ================= */}
      {/* platina principal — âncora da explosão */}
      <Part home={[0, 0, -0.05]} off={[0, 0, -0.18]} delay={0.85} span={0.15}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={plateMat}>
          <cylinderGeometry args={[1.24, 1.24, 0.06, 48]} />
        </mesh>
        {/* pontes */}
        <mesh position={[-0.45, 0.5, 0.05]} rotation={[0, 0, 0.5]} material={steelMat}>
          <boxGeometry args={[1.1, 0.3, 0.04]} />
        </mesh>
        <mesh position={[0.55, 0.25, 0.05]} rotation={[0, 0, -0.4]} material={steelMat}>
          <boxGeometry args={[0.9, 0.26, 0.04]} />
        </mesh>
        {/* rubis na platina */}
        {[
          [-0.7, -0.15],
          [0.3, 0.75],
          [0.85, -0.35],
        ].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.02, 10]} />
            <meshStandardMaterial color="#8a1220" emissive="#5a0a14" emissiveIntensity={0.5} roughness={0.2} />
          </mesh>
        ))}
      </Part>

      {/* trem de engrenagens — cada uma flutua numa direção */}
      <Part home={[-0.35, 0.35, 0.02]} off={[-1.15, 0.75, 0.55]} delay={0.52} span={0.34}>
        <FlatGear r={0.42} teeth={22} speed={0.5} material={goldMat} />
      </Part>
      <Part home={[0.42, 0.5, 0.02]} off={[1.05, 1.05, 0.4]} delay={0.56} span={0.34}>
        <FlatGear r={0.3} teeth={16} speed={-0.75} material={steelMat} />
      </Part>
      <Part home={[0.72, -0.2, 0.02]} off={[1.5, -0.35, 0.7]} delay={0.6} span={0.34}>
        <FlatGear r={0.24} teeth={14} speed={1.1} material={goldMat} />
      </Part>
      <Part home={[-0.75, -0.35, 0.02]} off={[-1.55, -0.75, 0.35]} delay={0.63} span={0.34}>
        <FlatGear r={0.2} teeth={12} speed={-1.5} material={steelMat} />
      </Part>
      <Part home={[0.12, -0.12, -0.02]} off={[0.45, 0.2, -0.5]} delay={0.66} span={0.32}>
        <FlatGear r={0.34} teeth={18} speed={0.62} material={steelMat} />
      </Part>

      {/* tambor + mola principal */}
      <Part home={[-0.5, 0.62, -0.04]} off={[-1.6, 1.05, 0.5]} rotOff={[0, 0, 1.2]} delay={0.58} span={0.36}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={goldMat}>
          <cylinderGeometry args={[0.44, 0.44, 0.05, 32]} />
        </mesh>
        <group position={[0, 0, 0.045]}>
          <Mainspring material={steelMat} />
        </group>
      </Part>

      {/* escape + âncora */}
      <Part home={[0.55, -0.6, 0.0]} off={[1.35, -1.05, 0.65]} delay={0.62} span={0.34}>
        <FlatGear r={0.16} teeth={15} speed={2.2} material={goldMat} axle={false} />
        <group ref={anchorRef} position={[0.22, 0.16, 0.03]}>
          <mesh rotation={[0, 0, -0.7]} material={steelMat}>
            <boxGeometry args={[0.3, 0.03, 0.02]} />
          </mesh>
          <mesh position={[-0.1, -0.08, 0]} rotation={[0, 0, 0.6]} material={steelMat}>
            <boxGeometry args={[0.18, 0.03, 0.02]} />
          </mesh>
        </group>
      </Part>

      {/* rotor (verso) */}
      <Part home={[0, 0, -0.16]} off={[0.1, -0.35, -2.1]} rotOff={[-0.35, 0, 0]} delay={0.48} span={0.36}>
        <group ref={rotorRef}>
          {/* massa oscilante esqueletizada em ouro */}
          <mesh geometry={rotorGeo} material={goldMat} />
          {/* meia-lua interna escura (contraste) */}
          <mesh position={[0, 0.17, -0.005]} rotation={[Math.PI / 2, 0, 0]} material={darkMat}>
            <cylinderGeometry args={[0.3, 0.3, 0.02, 24, 1, false, 0, Math.PI]} />
          </mesh>
          {/* cubo central */}
          <mesh rotation={[Math.PI / 2, 0, 0]} material={steelMat}>
            <cylinderGeometry args={[0.12, 0.12, 0.07, 16]} />
          </mesh>
        </group>
      </Part>

      {/* turbilhão às 6h */}
      <Part home={[0, -0.55, 0.06]} off={[0, 0.12, 1.3]} delay={0.68} span={0.32}>
        <Tourbillon gold={goldMat} steel={steelMat} />
      </Part>

      {/* ================= PULSEIRA (3 elos, two-tone) ================= */}
      <group>
        <instancedMesh ref={linksTop} args={[undefined, undefined, 8]} geometry={linkGeo} material={strapMat} />
        <instancedMesh ref={linksBot} args={[undefined, undefined, 8]} geometry={linkGeo} material={strapMat} />
        {/* elo central polido */}
        <instancedMesh ref={capsTop} args={[undefined, undefined, 8]} geometry={capGeo} material={goldMat} />
        <instancedMesh ref={capsBot} args={[undefined, undefined, 8]} geometry={capGeo} material={goldMat} />
      </group>
    </group>
  );
}

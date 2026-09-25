# AUREX TIMEPIECES

Site conceito de uma marca de alta relojoaria fictícia. O relógio (Calibre AX-01 Tourbillon) é modelado em código com Three.js e desmonta e remonta peça por peça conforme o scroll. Projeto de portfólio da [MilWeb](https://milweb.com.br).

## O que tem

- Relógio 3D 100% procedural (`src/components/scene/watch.tsx`), sem modelos ou texturas externas. Engrenagens, rotor e turbilhão ficam em movimento contínuo.
- Roteiro de câmera por cena (`src/lib/scenes.ts`): cada seção marcada com `data-scene` move a câmera e controla a desmontagem.
- Configurador de caixa, mostrador e ponteiros, com troca de material sem re-render da cena 3D.
- Galeria, ficha técnica e finale, com animações no scroll (GSAP) e rolagem suave (Lenis).
- `sitemap` e `robots` gerados pelo App Router.

## Stack

Next.js 15 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4, Three.js com React Three Fiber, drei e postprocessing, GSAP, Lenis, Framer Motion.

## Arquitetura

- `src/lib/world.ts`: estado mutável compartilhado entre DOM e cena 3D (scroll, ponteiro, configuração). É lido dentro de `useFrame`, então o scroll não re-renderiza o React.
- `src/components/scene-tracker.tsx`: registra um ScrollTrigger por seção e escreve cena e progresso no `world`.
- `src/components/scene/camera-rig.tsx`: interpola o roteiro de câmera com amortecimento.

## Como rodar

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção
npm run start    # serve o build
npm run lint
```

Não há variáveis de ambiente. Nome e URL do site ficam em `src/lib/site.ts`.

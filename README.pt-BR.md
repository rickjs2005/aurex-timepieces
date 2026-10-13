[English](README.md) · **Português**

# AUREX TIMEPIECES

Site conceito de uma marca de alta relojoaria **fictícia**. O relógio (Calibre AX-01 Tourbillon) é modelado em código com Three.js e desmonta e remonta peça por peça conforme o scroll. Projeto de portfólio da [MilWeb](https://milweb.com.br).

> **Tipo:** conceito (marca fictícia, sem vínculo com relojoarias reais) · **Demo:** https://aurex-timepieces.vercel.app

![Hero do AUREX TIMEPIECES com o relógio 3D procedural](docs/screenshots/hero.webp)

## O que tem

- Relógio 3D 100% procedural (`src/components/scene/watch.tsx`), sem modelos ou texturas externas. Engrenagens, rotor e turbilhão ficam em movimento contínuo.
- Roteiro de câmera por cena (`src/lib/scenes.ts`): cada seção marcada com `data-scene` move a câmera e controla a desmontagem.
- Configurador de caixa, mostrador e ponteiros, com troca de material sem re-render da cena 3D.
- Galeria, ficha técnica e finale, com animações no scroll (GSAP) e rolagem suave (Lenis).
- Respeita `prefers-reduced-motion` nas animações de texto e no finale.
- `sitemap` e `robots` gerados pelo App Router.

## Stack

Next.js 15 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS 4, Three.js com React Three Fiber, drei e postprocessing, GSAP, Lenis, Framer Motion. Fontes Marcellus e Jost via `next/font/google`.

## Arquitetura

- `src/lib/world.ts`: estado mutável compartilhado entre DOM e cena 3D (scroll, ponteiro, configuração). É lido dentro de `useFrame`, então o scroll não re-renderiza o React.
- `src/components/scene-tracker.tsx`: registra um ScrollTrigger por seção e escreve cena e progresso no `world`.
- `src/components/scene/camera-rig.tsx`: interpola o roteiro de câmera com amortecimento.
- `src/components/sections/`: seções da página (hero, filme, especificações, configurador, galeria, finale).

## Como rodar

Pré-requisitos: Node.js 18.18+ (CI usa Node 22) e npm.

```bash
npm ci
npm run dev      # servidor de desenvolvimento (Turbopack)
npm run build    # build de produção
npm run start    # serve o build
npm run lint     # ESLint
npx tsc --noEmit # checagem de tipos
```

Não há variáveis de ambiente. Nome e URL do site ficam em `src/lib/site.ts`.

## Limitações

- Conteúdo, contato (`atelier@aurextimepieces.example`) e boutiques são fictícios; o botão de contato só abre um `mailto:`.
- Interface em português; títulos de destaque em inglês.
- A cena 3D exige WebGL e é pesada em aparelhos modestos.
- Sem testes automatizados; o CI roda lint, typecheck e build.

## Segurança

Veja [SECURITY.md](SECURITY.md).

## Licença

Ainda não há licença definida; todos os direitos reservados ao autor.

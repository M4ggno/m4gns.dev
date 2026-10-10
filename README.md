# M4GNS.DEV

Landing page comercial do `m4gns.dev` — venda de serviços de engenharia de software (landing pages, sistemas full-stack, integrações). Headline: **Your Idea. My Code. Live Production.** SPA Angular 22 estática, deploy **100% Vercel, sem Next.js**.

## Stack

- **Framework:** Angular 22 (standalone, signals, `OnPush`, zero `@angular/router`)
- **3D:** Three.js (núcleo galáctico: horizonte de eventos + anel de fótons, disco de acreção com rotação diferencial e braços espirais, halo estelar, anéis orbitais + cometas) — **reativo ao mouse e ao giroscópio do celular**
- **Motion:** GSAP + ScrollTrigger + Lenis (tudo fora da `NgZone`, via `MotionService`)
- **Estilo:** Tailwind CSS v4 + design tokens `@theme` (Space Grotesk / Syne / JetBrains Mono)
- **Conversão:** contato direto — `mailto:contato@m4gns.dev` + Instagram `@m4gns.dev` + GitHub. Zero formulário, zero serverless.

## Desenvolvimento

```bash
ng serve          # http://localhost:4200
```

## Build e testes

```bash
ng build          # produção em dist/
ng test           # Vitest
```

## Estrutura

```
src/app/
├── core/          # site.config, attack-mode, motion, orbital-scene (Three puro)
├── features/      # background-canvas, hero, services, stack, work, contact, footer
└── shared/        # section-heading, reveal.directive
```

## Segurança (borda)

A defesa acontece **na borda da Vercel**, não no navegador:

1. **`vercel.json`** → headers de segurança (HSTS/CSP/nosniff/COOP/CORP), cache imutável, rewrites de bloqueio (`/.env`, `/.git/*`, `/wp-*`) e fallback SPA.
2. **Vercel Firewall** (painel) → rate limiting (ex. 100 req/10s/IP), Attack Challenge Mode e WAF.
3. **`AttackModeService`** (client-side) → autodefesa do navegador sob telemetria anômala (congela animações, nunca a borda).

> `middleware.ts` não roda em SPA Angular (é runtime do Next.js) — por isso não existe neste projeto.

Mais detalhes em [`stack.md`](./stack.md).
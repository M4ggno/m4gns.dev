# M4GNS.DEV // Tech Stack & Architecture

Documento técnico do `m4gns.dev` — landing page comercial que vende **serviços de engenharia de software** (landing pages, sistemas full-stack, integrações) com funil de conversão direto (sem carrinho, sem formulário, sem serverless).

Estética: **Orbital Infrastructure / Cyber-Noir** — redes interconectadas, anéis orbitais, poeira cósmica com profundidade de campo, terminais de comunicação criptografada, logs de sistema em tempo real.

> **Decisão de arquitetura (importante):** deploy **100% Vercel, estático, sem Next.js**. A proteção de borda é feita por `vercel.json` (headers/rewrites) **+ Vercel Firewall** (WAF/rate limiting). Não existe `middleware.ts` / Vercel Edge Middleware (esse runtime só executa em Next.js — em SPA Angular é ignorado silenciosamente; a alternativa equivalente era migrar o projeto inteiro para Next.js, fora do escopo).

---

## 1. Core Framework: Angular 22 (Standalone, Signals, Zoneless-Ready)

| Recurso | Implementação |
|---------|---------------|
| **Standalone Components** | 100% standalone, zero `NgModules`. Cada feature é autossuficiente. Sem `@angular/router` (landing de seção única, sem rotas). |
| **Signals** | Estado reativo sem overhead de `Zone.js`. Usado em `StackComponent` (acordeão), `AttackModeService`, `MotionService.ready`, `BackgroundCanvasComponent`. |
| **Control Flow (`@for`, `@if`)** | Sintaxe nativa compilada no lugar de `*ngFor`/`*ngIf`. |
| **`inject()` + `DestroyRef`** | DI funcional; `DestroyRef.onDestroy()` para cleanup de GSAP contexts, ScrollTriggers, Three.js e intervalos. |
| **`afterNextRender` + `runOutsideAngular`** | Toda inicialização de navegador (Lenis, GSAP, Three.js, typing) roda fora da NgZone. |
| **`viewChild`/`viewChildren` (signal-based)** | API signal-ized de referências. |
| **`ChangeDetectionStrategy.OnPush`** | Em todos os componentes — requisição crítica de 60fps. |
| **Zoneless explícito** | `provideZonelessChangeDetection()` no `app.config.ts` — sem `zone.js` no bundle, change detection só via signals/eventos. |
| **Path aliases** | `@core`, `@features`, `@shared` mapeados no `tsconfig.json`. |

---

## 2. Estrutura de Pastas (Clean Architecture)

```
src/
├── main.ts
├── index.html                     # Meta/SEO/OG + CSP + JSON-LD (ProfessionalService)
├── styles/
│   ├── tailwind.css               # Design tokens (fonts, cores, tracking) via @theme
│   └── global.scss                # Reset, Lenis states, scrollbar, reduced-motion
└── app/
    ├── app.ts                     # Shell: composição das features + AttackMode ⇄ Motion
    ├── app.config.ts              # Providers (sem router)
    ├── core/                      # Lógica transversal, sem UI
    │   ├── site.config.ts         # Fonte única de verdade (email, instagram, github)
    │   ├── security/attack-mode.service.ts
    │   ├── motion/motion.service.ts   # Lenis + GSAP ticker + ScrollTrigger
    │   └── three/orbital-scene.ts     # Classe pura de Three.js (4 camadas)
    ├── features/                  # Seções do funil de conversão
    │   ├── background-canvas/     # Host do <canvas> + scanlines
    │   ├── hero/                  # Boot sequence + nav
    │   ├── services/              # Oferta (3 cards) + credibilidade
    │   ├── stack/                 # Acordeão de ferramentas (signal)
    │   ├── work/                  # Casos reais vendidos (parallax scrub)
    │   ├── contact/               # Terminal criptografado + 3 protocolos
    │   └── footer/                # CTA agressiva Instagram + legal
    └── shared/                    # UI reutilizável
        ├── ui/section-heading.ts
        └── directives/reveal.directive.ts
```

---

## 3. Estilização: Tailwind CSS v4 — Design System Industrial

| Decisão | Detalhe |
|---------|---------|
| **Fontes (Anti-Clichê, inegociável)** | **Display:** `Syne` — títulos.<br>**Corpo:** `Space Grotesk` — UI/parágrafos.<br>**Mono/Dados:** `JetBrains Mono` — terminais, logs, metadados.<br>**Proibido:** Roboto, Montserrat, Open Sans, Inter, Poppins. |
| **Tokens (`@theme`)** | `--color-void/ink/panel/elevated`, `--color-line`, `--color-text/muted/meta/dim`, `--color-signal` (#10B981), `--color-alert` (#F59E0B), `--color-uplink` (#38BDF8). |
| **Dark-only** | `color-scheme: dark`; `prefers-reduced-motion` reduz animações a ~0s. |
| **Grid transitions** | Acordeão animado via `grid-template-rows: 0fr → 1fr` puro CSS. |

---

## 4. Renderização 3D: Three.js (Orbital Infrastructure Engine)

`OrbitalScene` é uma **classe pura de Three.js** (sem Angular) hospedada por `BackgroundCanvasComponent` (ciclo de vida + eventos apenas).

### Camadas

| Camada | Técnica |
|--------|---------|
| **1. Event Horizon + Aura** | Horizonte **ampliado** (4.5u) + anel de fótons quente colado na sombra (5.1u, âmbar) + **aura radial** (`CanvasTexture` em donut — centro vazado preserva a silhueta, `THREE.Sprite` aditivo) + halo de "lente gravitacional". |
| **2. Accretion Disk** | 9.000 partículas em disco (raio 4.8–40u, squash vertical + flare), **rotação diferencial Kepleriana** no vertex shader, **3 braços espirais co-rotantes**, brilho assimétrico de acreção (doppler) e **anel denso colado no fóton-ring**. Paleta **Gargantua**: âmbar → creme ardente. `THREE.ShaderMaterial`. |
| **3. Stellar Halo** | 2.400 estrelas em casca esférica rarefeita ao redor do disco, cintilação e tamanho variável — fica **frio** (azul-pálido) para contrastar com o núcleo quente. |
| **4. Orbital Rings + Comets** | 2 anéis finos **fora do disco** (raio 36/47 — leitura de órbita externa da infra) + 3 cometas em órbitas elípticas inclinadas no halo (sem trilha). |

Enquadramento: câmera **mais perto** (`z=27`, FOV 48) + conjunto em escala 1.18 — o núcleo ocupa presença de tela em vez de ficar distante. Anti-feedback: a malha de Bézier continua cortada; a riqueza vem de brilho, não de traços.

Interação com o **ponteiro sobre as partículas**: o cursor é projetado do NDC no plano do disco (ray-plane em `y=0` → `worldToLocal`) e injetado como `uMouse` no shader do disco. Partículas num raio de `uMouseRadius` (4.5u local) são **empurradas para fora** no plano + leve arremesso vertical com cintilação, e ganham brilho extra (leitura de "perturbação"). Tudo via GPU no vertex shader — zero custo de CPU. O efeito desliga em `blur` (`clearPointer()`) e não atua antes do primeiro movimento, evitando um buraco estático no centro.

### Performance

- RAF apenas; `renderer.setPixelRatio(min(dpr, 2))`; `ACESFilmicToneMapping`.
- **Interação reativa**: parallax de **ponteiro** (`pointermove` no window — o canvas segue `pointer-events-none`, conteúdo clicável) e **giroscópio** (`deviceorientation`; no iOS o `requestPermission` é pedido no primeiro gesto — `pointerdown`/`touchend`/`click` —, e o tilt é **calibrado na primeira leitura** para medir o delta em relação à posição de uso, não à mesa). `setPointer()`/`setTilt()` guardam offsets; o tick aplica damping (inércia suave) na rotação da galáxia e da câmera.
- Dispose rigoroso: geometrias, materiais, renderer, `cancelAnimationFrame` e remoção de listeners de interação.
- Pausa em `document.hidden`; pausa no modo de proteção; frame único se `prefers-reduced-motion` (sem interação).
- Fallback: sem `webgl2`, nada renderiza (site permanece utilizável).

---

## 5. Motion: GSAP + ScrollTrigger + Lenis (via `MotionService`)

- `MotionService` (root) registra ScrollTrigger, instancia Lenis e adiciona o `raf` ao `gsap.ticker` — tudo fora da NgZone.
- `RevealDirective` (`appReveal`/`[appRevealDelay]`): `gsap.context` + ScrollTrigger `play none none reverse`, cleanup via `DestroyRef`.
- Parallax dos cases de trabalho: `ScrollTrigger.create({ scrub: true, animation: fromTo(yPercent −15 → 15) })`.
- Hero: timeline (boot overlay → header → logo → título → tagline digitada → indicador).
- `AttackModeService` congela tudo (Lenis stop + `gsap.ticker.sleep`) e `App` orquestra via `effect`.

---

## 6. Segurança (Defense in Depth, 100% Vercel, sem next.js)

> Zero formulários, zero serverless, zero API exposta. Contato é **handoff direto** (`mailto:` + Instagram + GitHub). Superfície de ataque mínima.

### 6.1 Vercel Project Configuration (`vercel.json`) — a camada de código

| Frente | Configuração |
|--------|--------------|
| **Security Headers (toda rota)** | HSTS (preload), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `COOP: same-origin`, `CORP: same-origin`, CSP estrita (sem `unsafe-eval`), `X-DNS-Prefetch-Control: off`. |
| **Cache estático** | `public, max-age=31536000, immutable` para js/css/svg/png/jpg/webp/woff2/webmanifest. HTML segue o default Vercel (`max-age=0, must-revalidate`). Brotli + gzip. |
| **Assets (otimização)** | `logo.svg`/`favicon.svg` recém-otimizados: embute **uma única cópia** do raster (recorte branco-sobre-preto com alpha) — 206 KB → 57 KB / 17 KB. Gestão de ícones: `apple-touch-icon.png` (180), `icon-512.png` (manifest) e `og-card.png` 1200×630 — PNG verdadeiro porque crawlers de OG/WhatsApp **não renderizam SVG**. |
| **Bloqueio de varredura** | Rewrites de `/.well-known/acme-challenge/*`, `/.env`, `/.git/*`, `/wp-admin/*`, `/wp-login.php` → `/404`. |
| **SPA fallback** | `/(.*)` → `index.html` (deep links/anclas). |

### 6.2 Vercel Firewall (no painel — a camada de borda)

- **Rate Limiting**: ex. 100 req/10s por IP (foco: ser com 403/429 em picos).
- **Attack Challenge Mode**: ativável via dashboard ou API `PATCH /v9/projects/<id>` `{"firewall":{"attackMode":true}}`.
- **Managed Rules / Custom Rules**: ofuscação em picos. Logs de WAF no dashboard.
- **WAF**: bot management para travas de bots conhecidos.

> **Por que não `middleware.ts`?** Edge Middleware é runtime exclusivo do Next.js. Num build Angular estático ele é ignorado — uma falsa sensação de segurança. O equivalente Vercel-nativo está todo em `vercel.json` + Firewall acima. (Fonte: docs Vercel — Edge Middleware roda em projetos Next.js; projetos não-Next usam `vercel.json` e Firewall.)

### 6.3 SSL/TLS & Domínio

- Domínio `.dev` → HSTS obrigatório no registro; SSL automático via Vercel.
- `CAA Records` restritos a Let's Encrypt/ZeroSSL/Vercel.

### 6.4 E-mail (canal primário de conversão)

MX → Google Workspace; SPF `v=spf1 include:_spf.google.com ~all`; DKIM 2048b; DMARC `p=reject`; MTA-STS. DKIM+DMARC asseguram que `mailto:contato@m4gns.dev` não caia em spam.

### 6.5 Autodefesa do frontend (`AttackModeService`)

| Gatilho (client-side) | Limiar | Ação |
|-----------------------|--------|------|
| Falhas de sub-recurso (0/400/403/429) em janela 10s | ≥ 15 | `active = true` |
| `visibilitychange` frenético (30s) | ≥ 20 | `active = true` |

Quando ativo: Lenis para, `gsap.ticker.sleep()`, canvas pausa, banner fixo com `RETOMAR`. Não substitui a borda — impede que o **próprio visitante** congele o navegador.

---

## 7. Funil de Conversão (Contato Direto)

| Prioridade | Canal | Implementação |
|------------|-------|---------------|
| **PRIMARY** | `contato@m4gns.dev` | `mailto:` com assunto sugerido `[PROJETO] Escopo & Prazo`. Resposta ≤ 48h. |
| **SECONDARY** | Instagram `@m4gns.dev` | `https://www.instagram.com/m4gns.dev` — feed técnico não curado (bastidores, arquitetura, falhas). Promovido **agressivamente** no rodapé. |
| **ARCHIVE** | GitHub `github.com/m4gns` | Repositórios públicos, transparência. |

**UI:** terminal de "uplink criptografado" com log digitando (TLS/DNS/CSP/WAF/MAIL), relógio UTC, 3 protocol cards (emerald/amber/dim) e footer com CTA Instagram + e-mail.

---

## 8. Copywriting (Anti-Clichê)

| ❌ Proibido | ✅ Usado |
|-------------|----------|
| "Bem-vindo ao futuro" | "Estabelecer ligação direta." |
| "Soluções inovadoras" | "O que entra em produção." |
| "Transforme sua ideia" | **"YOUR IDEA. MY CODE. LIVE PRODUCTION."** (headline do hero) |
| "Tecnologias de ponta" | "Angular 22. Three.js. Spring Boot. Django. PostgreSQL." |
| "Paixão por código" | "Código revisado antes da entrega." |
| "Entre em contato" | "Protocolo 01: CANAL OFICIAL → contato@m4gns.dev" |

Headline (hero): *"YOUR IDEA. MY CODE. LIVE PRODUCTION."* com eyebrow mono `// ENGENHARIA WEB PARA QUEM EXIGE RESULTADO` e tagline digitada `FRONTEND // BACKEND // INFRA — SEM RUÍDO`. Inglês de slogan sobre linguagem técnica intencional — resto da página permanece PT-BR.

Tom: seco, técnico, orientado a resultado, imperativo de engenharia.

---

## 9. Infraestrutura & Deploy

| Camada | Tecnologia |
|--------|------------|
| Origin | GitHub (main) → Vercel deploy atômico |
| Build | `@angular/build` (esbuild), `outputHashing: all`, budgets 1MB/1.2MB |
| Assets | Cache imutável (1 ano) + Brotli; ícones PNG (`apple-touch-icon`, `icon-512`) + `og-card.png` |
| Fontes | Space Grotesk / Syne / JetBrains Mono via Google Fonts (`display=swap`, preconnect) |
| Analytics | Vercel Speed Insights (zero cookies) |
| Monitoring | Vercel Firewall Logs + Attack Mode dashboard |

---

## 10. Checklist de Produção (Go/No-Go)

- [ ] `vercel.json` validado: `curl -I https://m4gns.dev` mostra HSTS/CSP/nosniff
- [ ] Firewall ativo no painel: rate limit 100r/10s/IP + Attack Challenge Mode
- [ ] Confirmar ausência de `middleware.ts` no output — o deploy é estático puro (sem runtime de servidor)
- [ ] CSP em enforce após 48h report-free
- [ ] Domínio `m4gns.dev` → Vercel (CNAME `cname.vercel-dns.com`)
- [ ] HSTS preload submetido
- [ ] `contato@m4gns.dev` operacional (MX/DKIM/DMARC/MTA-STS)
- [ ] Instagram `@m4gns.dev` no footer + `og:image`
- [ ] `AttackModeService` testado (20+ falhas via DevTools)
- [ ] `prefers-reduced-motion` testado
- [ ] Lighthouse ≥ 95 perf/acc/bp, ≥ 90 SEO; bundle main < 250KB gz

---

**Versão**: 2.2 (clean rebuild — Vercel-only, otimização de assets & copy)
**Última atualização**: 2026-10-10
**Classificação**: Internal — Technical Architecture
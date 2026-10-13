import { ChangeDetectionStrategy, Component, ElementRef, NgZone, afterNextRender, inject, signal, viewChild } from '@angular/core';
import { gsap } from 'gsap';
import { SITE } from '@core/site.config';
import { MotionService } from '@core/motion/motion.service';

/**
 * Hero + navegação. Responsável apenas pela sequência de abertura e pelo
 * encaminhamento de âncoras para o MotionService (scroll suave).
 */
@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <header #headerBar
      class="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-white/5 bg-[#050505]/40 px-5 py-5 font-mono text-[11px] text-[#8A8A8A] backdrop-blur-md md:px-16 md:text-xs"
      [class.opacity-100]="visible()" [class.opacity-0]="!visible()">
      <a href="#top" class="flex items-center gap-3 text-[#F5F5F5] tracking-[0.25em] transition-colors hover:text-white" (click)="go($event, '#top')">
        <span class="h-2 w-2 rounded-full bg-[#10B981]"></span>
        M4GNS.DEV
      </a>

      <span class="text-[10px] tracking-widest text-[#666666]">VERCEL EDGE // SÃO PAULO</span>
    </header>

    <section id="top" class="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-24 text-center">
      <!-- Boot overlay: limpa a tela antes do conteúdo entrar. A frase é datilografada
           no cliente (service render mostra completa); o cursor de bloco pisca via CSS
           — anima até no HTML pré-renderizado, antes do JS carregar. -->
      <div #bootOverlay class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[#050505]">
        <div class="flex items-center gap-3 font-mono text-xs tracking-[0.4em] text-[#8A8A8A] md:text-sm">
          <span class="boot-cursor inline-block h-2.5 w-2.5 rounded-[2px] bg-[#10B981]" aria-hidden="true"></span>
          <span aria-hidden="true">{{ bootLabel() }}</span>
        </div>
      </div>

      <div class="my-auto flex max-w-5xl flex-col items-center gap-6 md:gap-8">
        <div #logoWrapper class="opacity-0">
          <img src="logo.svg" alt="M4GNS.DEV" width="144" height="144"
             fetchpriority="high" decoding="async"
             class="mx-auto h-auto w-28 drop-shadow-[0_0_35px_rgba(255,255,255,0.18)] md:w-36" />
        </div>

        <p #eyebrow class="font-mono text-[10px] uppercase tracking-[0.45em] text-[#8A8A8A] opacity-0 -translate-y-4 md:text-xs">
          // ENGENHARIA WEB PARA QUEM EXIGE RESULTADO
        </p>

        <h1 #mainTitle
            class="max-w-5xl text-4xl font-display font-light leading-[0.98] tracking-tight text-[#F5F5F5] opacity-0 translate-y-8 sm:text-6xl md:text-7xl lg:text-8xl">
          YOUR IDEA.<br />
          <span class="italic text-white">MY CODE. LIVE PRODUCTION.</span>
        </h1>

        <p #tagline class="font-mono text-xs uppercase tracking-[0.35em] text-[#8A8A8A] opacity-0 md:text-sm" aria-live="polite">
          {{ typed() }}<span class="animate-pulse">_</span>
        </p>

        <a #cta [href]="mailtoHref"
           class="mt-2 inline-flex items-center gap-3 border border-white/15 bg-white/[0.04] px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.3em] text-white opacity-0 translate-y-4 transition-colors hover:border-emerald-400/70 hover:text-emerald-300 md:text-xs">
          <span class="h-1.5 w-1.5 rounded-full bg-[#10B981]"></span>
          {{ SITE.email.address }}
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div #scrollIndicator class="pointer-events-none absolute bottom-6 flex flex-col items-center opacity-0 md:bottom-10">
        <span class="mb-2 font-mono text-[10px] tracking-[0.25em] text-[#8A8A8A]">ROLE PARA EXPLORAR</span>
        <span class="h-8 w-px bg-gradient-to-b from-white/60 to-transparent md:h-10"></span>
      </div>
    </section>
  `,
})
export class HeroComponent {
  private readonly ngZone = inject(NgZone);
  private readonly motion = inject(MotionService);

  private readonly bootOverlay = viewChild<ElementRef<HTMLElement>>('bootOverlay');
  private readonly logoWrapper = viewChild<ElementRef<HTMLElement>>('logoWrapper');
  private readonly eyebrow = viewChild<ElementRef<HTMLElement>>('eyebrow');
  private readonly mainTitle = viewChild<ElementRef<HTMLElement>>('mainTitle');
  private readonly tagline = viewChild<ElementRef<HTMLElement>>('tagline');
  private readonly scrollIndicator = viewChild<ElementRef<HTMLElement>>('scrollIndicator');
  private readonly cta = viewChild<ElementRef<HTMLElement>>('cta');

  // Signals: mudança reativa funciona no zoneless (propriedade comum + ngZone.run não re-renderiza).
  visible = signal(false);
  typed = signal('');
  bootLabel = signal('ESTABELECENDO LIGAÇÃO DIRETA...');
  readonly mailtoHref = `mailto:${SITE.email.address}?subject=${encodeURIComponent(SITE.email.subject)}`;

  protected readonly SITE = SITE;

  private readonly taglineText = 'FRONTEND // BACKEND // INFRA — SEM RUÍDO';
  private readonly bootLabelFull = 'ESTABELECENDO LIGAÇÃO DIRETA...';

  constructor() {
    afterNextRender(() => this.ngZone.runOutsideAngular(() => this.playIntro()));
  }

  go(event: Event, target: string): void {
    event.preventDefault();
    this.motion.scrollTo(target);
  }

  private playIntro(): void {
    const overlay = this.bootOverlay()?.nativeElement ?? null;
    const logo = this.logoWrapper()?.nativeElement ?? null;
    const eyebrow = this.eyebrow()?.nativeElement ?? null;
    const title = this.mainTitle()?.nativeElement ?? null;
    const indicator = this.scrollIndicator()?.nativeElement ?? null;
    const ctaLink = this.cta()?.nativeElement ?? null;

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      this.visible.set(true);
      this.typed.set(this.taglineText);
      if (overlay) overlay.style.display = 'none';
      if (logo) logo.style.opacity = '1';
      if (eyebrow) {
        eyebrow.style.opacity = '1';
        eyebrow.style.transform = 'none';
      }
      if (title) {
        title.style.opacity = '1';
        title.style.transform = 'none';
      }
      if (indicator) indicator.style.opacity = '1';
      if (ctaLink) {
        ctaLink.style.opacity = '1';
        ctaLink.style.transform = 'none';
      }
      return;
    }

    // Boot com datilografia real. No servidor/prerender a frase sai completa;
    // no cliente ela é redatilografada e a timeline de abertura dispara no fim.
    this.bootLabel.set('');
    const bootTicker = (n: number) => {
      if (n < this.bootLabelFull.length) {
        this.bootLabel.set(this.bootLabelFull.slice(0, n + 1));
        setTimeout(() => bootTicker(n + 1), 20);
        return;
      }
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .to(overlay, {
          opacity: 0,
          duration: 0.6,
          delay: 0.35,
          onComplete: () => overlay?.style.setProperty('display', 'none'),
        })
        .call(() => this.visible.set(true))
        .to(logo, { opacity: 1, scale: 1, duration: 0.9 }, '-=0.35')
        .to(eyebrow, { opacity: 1, y: 0, duration: 0.7 }, '-=0.7')
        .to(title, { opacity: 1, y: 0, duration: 1 }, '-=0.55')
        .call(() => this.typeTagline())
        .to(ctaLink, { opacity: 1, y: 0, duration: 0.6 }, '-=0.15')
        .to(indicator, { opacity: 1, duration: 0.7 }, '-=0.2');
    };
    setTimeout(() => bootTicker(0), 60);
  }

  private typeTagline(): void {
    let i = 0;
    const step = () => {
      this.typed.set(this.taglineText.slice(0, ++i));
      if (i < this.taglineText.length) setTimeout(step, 34);
    };
    step();
  }
}
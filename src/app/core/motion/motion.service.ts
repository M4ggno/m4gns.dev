import { DestroyRef, Injectable, NgZone, inject, signal } from '@angular/core';
import { afterNextRender } from '@angular/core';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Orquestra o movimento da página: smooth scroll (Lenis) sincronizado com o
 * ticker do GSAP/ScrollTrigger.
 *
 * Toda a animação roda FORA da NgZone — o Angular nunca é notificado por frame,
 * então o loop não dispara change detection desnecessária. O serviço é a única
 * porta de entrada para tocar no Lenis/GSAP, o que evita acoplamento espalhado
 * pela UI.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  readonly ready = signal(false);

  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  private lenis?: Lenis;
  private tickerFn?: (time: number) => void;
  private paused = false;

  constructor() {
    if (typeof window === 'undefined') return;

    afterNextRender(() => this.bootstrap());
  }

  /**
   * Rola até um elemento/offset com o mesmo easing do scroll suave.
   * Se o scroll suave estiver desativado, cai para o comportamento nativo.
   */
  scrollTo(target: string | number): void {
    if (this.lenis && !this.paused) {
      this.lenis.scrollTo(target, { duration: 1.1 });
      return;
    }
    if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' });
    else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
  }

  /** Congela o movimento (modo de proteção / aba oculta). */
  pause(): void {
    if (this.paused) return;
    this.paused = true;
    this.lenis?.stop();
    gsap.ticker.sleep();
  }

  /** Retoma o movimento normal. */
  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    this.lenis?.start();
    gsap.ticker.wake();
  }

  private bootstrap(): void {
    this.ngZone.runOutsideAngular(() => {
      if (!this.respectsReducedMotion()) {
        this.lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });

        this.lenis.on('scroll', ScrollTrigger.update);

        this.tickerFn = (time: number) => this.lenis?.raf(time * 1000);
        gsap.ticker.add(this.tickerFn);
        gsap.ticker.lagSmoothing(0);
      }

      this.ready.set(true);
    });

    this.destroyRef.onDestroy(() => this.teardown());
  }

  private respectsReducedMotion(): boolean {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }

  private teardown(): void {
    if (this.tickerFn) gsap.ticker.remove(this.tickerFn);
    this.lenis?.destroy();
    this.lenis = undefined;
    this.tickerFn = undefined;
  }
}
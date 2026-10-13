import { AfterViewInit, Directive, DestroyRef, ElementRef, NgZone, inject, input } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Revela o elemento na primeira entrada na viewport.
 *
 * - Roda fora da NgZone (não dispara change detection por frame).
 * - Respeita `prefers-reduced-motion`.
 * - `gsap.context` + `DestroyRef` garantem cleanup completo (sem vazamento).
 *
 * Uso: <div appReveal> ... </div>  |  <div [appRevealDelay]="0.15">
 */
@Directive({ selector: '[appReveal]' })
export class RevealDirective implements AfterViewInit {
  readonly delay = input(0, { alias: 'appRevealDelay' });
  readonly y = input(40);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    // No prerender (SSG) este hook roda no servidor, onde não existe `window`.
    // Sem o guard, o acesso a matchMedia/GSAP quebraria o build.
    if (typeof window === 'undefined') return;

    this.ngZone.runOutsideAngular(() => {
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

      const el = this.host.nativeElement;
      const ctx = gsap.context(() => {
        gsap.from(el, {
          opacity: 0,
          y: this.y(),
          duration: 1,
          delay: this.delay(),
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        });
      });

      this.destroyRef.onDestroy(() => ctx.revert());
    });
  }
}
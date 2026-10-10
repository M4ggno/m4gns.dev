import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, NgZone, afterNextRender, inject, viewChildren } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SectionHeadingComponent } from '@shared/ui/section-heading';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { WORK_DATA } from './work.data';

/**
 * Trabalho — casos reais de clientes pagos, em produção hoje (prova social factual).
 * O paralaxe não é decorativo: é o ScrollTrigger com scrub girando a imagem
 * dentro do container do cartão. Cada case abre o site do cliente em nova aba.
 */
@Component({
  selector: 'app-work',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionHeadingComponent, RevealDirective],
  template: `
    <section id="work" class="relative z-10 w-full border-t border-white/5 bg-[#050505]/80 px-5 py-24 md:px-16 lg:px-24 md:py-32">
      <div class="mx-auto w-full max-w-7xl">
        <app-section-heading
          appReveal
          index="03"
          label="TRABALHO"
          title="Casos"
          accent="entregues."
          description="Seleção factual de sistemas em produção hoje. Cada caso lista stack, escopo e a métrica mais honesta disponível."
        />

        <div class="flex flex-col gap-12 md:gap-24">
          @for (work of items; track work.id; let i = $index) {
            <article appReveal class="group relative flex w-full flex-col overflow-hidden border border-white/10 bg-[#0a0a0a] md:block md:h-[78vh]">
              <div class="relative aspect-[16/10] w-full shrink-0 overflow-hidden md:absolute md:inset-0 md:aspect-auto md:h-full">
                <div
                  #parallaxImage
                  class="absolute left-0 top-0 h-full w-full bg-cover bg-center bg-no-repeat opacity-60 transition-opacity duration-500 group-hover:opacity-90 md:-top-[15%] md:h-[130%]"
                  [style.background-image]="'url(' + work.image + ')'"
                ></div>
                <div class="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent"></div>
                <div class="absolute inset-0 bg-gradient-to-r from-[#050505]/70 to-transparent"></div>
              </div>
              <div class="relative z-10 flex w-full flex-col justify-end p-6 md:pointer-events-none md:absolute md:inset-0 md:p-14">
                <div class="md:pointer-events-auto md:max-w-2xl">
                  <span class="mb-3 block font-mono text-xs tracking-[0.3em] text-[#8A8A8A]">
                    CAPÍTULO 0{{ i + 1 }} &bull; {{ work.category }}
                  </span>
                  <h3 class="mb-4 font-display text-4xl font-light tracking-tight text-white md:text-6xl">{{ work.title }}</h3>
                  <p class="mb-6 max-w-xl text-sm leading-relaxed text-[#A3A3A3] md:text-base">{{ work.description }}</p>

                  <div class="mb-8 flex flex-wrap gap-2">
                    @for (tech of work.tech; track tech) {
                      <span class="border border-white/15 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase text-[#C2C2C2] backdrop-blur-md md:text-xs">
                        {{ tech }}
                      </span>
                    }
                  </div>

                  <div class="flex flex-wrap items-center gap-5">
                    <a
                      [href]="work.link"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="group/btn inline-flex w-max items-center gap-3 border border-white/40 bg-white/[0.08] px-5 py-3 font-mono text-xs tracking-widest text-white backdrop-blur-md transition-colors duration-300 hover:border-white hover:bg-white hover:text-black"
                    >
                      VER PROJETO
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"
                           class="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5">
                        <path d="M5 11 11 5M6 5h5v5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </a>
                    <span class="font-mono text-[10px] tracking-widest text-[#666666]">{{ work.metrics }}</span>
                  </div>
                </div>
              </div>

              <span class="pointer-events-none absolute right-6 top-5 font-mono text-[10px] tracking-widest text-[#666666] md:right-8">
                REGISTRO_0{{ i + 1 }} // ARQUIVADO
              </span>
            </article>
          }
        </div>
      </div>
    </section>
  `,
})
export class WorkComponent {
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  private readonly parallaxImages = viewChildren<ElementRef<HTMLElement>>('parallaxImage');
  readonly items = WORK_DATA;

  constructor() {
    afterNextRender(() => this.ngZone.runOutsideAngular(() => this.initParallax()));
  }

  private initParallax(): void {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    // Parallax apenas em telas md+: no mobile a imagem cobre exatamente a tira
    // 16:10 (sem folga vertical para deslocar sem abrir gap).
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      const ctx = gsap.context(() => {
        for (const imageRef of this.parallaxImages()) {
          const image = imageRef.nativeElement;
          const parent = image.parentElement?.parentElement;
          if (!parent) continue;

          ScrollTrigger.create({
            trigger: parent,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            animation: gsap.fromTo(image, { yPercent: -15 }, { yPercent: 15, ease: 'none' }),
          });
        }
      });
      return () => ctx.revert();
    });

    this.destroyRef.onDestroy(() => mm.revert());
  }
}
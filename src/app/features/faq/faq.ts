import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionHeadingComponent } from '@shared/ui/section-heading';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { FAQ_DATA } from './faq.data';

/**
 * FAQ — quebra os bloqueios de decisão (preço, prazo, processo) antes do
 * terminal de contato. Pergunta em <h3> e resposta em texto corrido, tudo no
 * DOM: com o prerender (SSG) o conteúdo sai no HTML cru e fica legível por
 * crawlers sem JavaScript (GPTBot, PerplexityBot, ClaudeBot).
 */
@Component({
  selector: 'app-faq',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionHeadingComponent, RevealDirective],
  template: `
    <section id="faq" class="relative z-10 w-full border-t border-white/5 bg-[#050505]/70 px-5 py-24 md:px-16 lg:px-24 md:py-32">
      <div class="mx-auto w-full max-w-7xl">
        <app-section-heading
          appReveal
          index="04"
          label="FAQ"
          title="Antes de"
          accent="fechar."
          description="Respostas diretas sobre preço, prazo e processo — o que sustenta a decisão sem reunião de venda."
        />

        <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
          @for (item of faqs; track item.question; let i = $index) {
            <article
              appReveal
              [appRevealDelay]="i * 0.05"
              class="border border-white/10 bg-[#080808] p-6 transition-colors hover:border-white/25 md:p-8"
            >
              <div class="font-mono text-xs tracking-[0.3em] text-[#38BDF8]">// Q0{{ i + 1 }}</div>
              <h3 class="mt-4 font-display text-xl font-light leading-snug tracking-tight text-white md:text-2xl">{{ item.question }}</h3>
              <p class="mt-4 text-sm leading-relaxed text-[#8A8A8A] md:text-base">{{ item.answer }}</p>
            </article>
          }
        </div>
      </div>
    </section>
  `,
})
export class FaqComponent {
  protected readonly faqs = FAQ_DATA;
}
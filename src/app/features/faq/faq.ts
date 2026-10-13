import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SectionHeadingComponent } from '@shared/ui/section-heading';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { FAQ_DATA } from './faq.data';

/**
 * FAQ — terminal interativo no lugar do mural de cartões.
 *
 * Cada pergunta vira uma linha de comando (`$ ./m4gns --flag`); clicar
 * "executa" a consulta e imprime a resposta com prompt ->. Uma por vez,
 * primeira aberta por padrão — menos parede de texto, mais brincadeira.
 *
 * As respostas ficam SEMPRE no DOM (escondidas por classe, não removidas):
 * prerender (SSG) + FAQPage JSON-LD mantêm a camada AEO/GEO intacta.
 */
@Component({
  selector: 'app-faq',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionHeadingComponent, RevealDirective],
  template: `
    <section
      id="faq"
      class="relative z-10 w-full border-t border-white/5 bg-[#050505]/70 px-5 py-24 md:px-16 lg:px-24 md:py-32"
    >
      <div class="mx-auto w-full max-w-7xl">
        <app-section-heading
          appReveal
          index="04"
          label="FAQ"
          title="Antes de"
          accent="fechar."
          description="Clique numa linha para executar a consulta. Respostas diretas sobre preço, prazo e processo — sem reunião de venda."
        />

        <!-- Terminal -->
        <div appReveal class="overflow-hidden rounded-lg border border-white/10 bg-[#080808]">
          <div class="flex items-center justify-between border-b border-white/10 bg-[#0a0a0a] px-4 py-3 md:px-5">
            <div class="flex items-center gap-2.5">
              <span class="h-3 w-3 rounded-full bg-red-500/50"></span>
              <span class="h-3 w-3 rounded-full bg-amber-500/50"></span>
              <span class="h-3 w-3 rounded-full bg-emerald-500/50"></span>
              <span class="ml-2 font-mono text-xs text-[#666666]">m4gns_help --interactive</span>
            </div>
            <span class="font-mono text-[10px] tracking-widest text-[#444444]">faq --v=4.5.2</span>
          </div>

          <ul class="divide-y divide-white/5">
            @for (item of faqs; track item.question; let i = $index) {
              <li>
                <button
                  type="button"
                  (click)="toggle(i)"
                  [id]="'faq-q-' + i"
                  [attr.aria-expanded]="isOpen(i)"
                  [attr.aria-controls]="'faq-a-' + i"
                  class="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.04] md:px-6"
                >
                  <span class="flex items-baseline gap-2.5 overflow-hidden font-mono text-xs tracking-wider md:text-sm">
                    <span class="select-none text-[#444444]">$</span>
                    <span class="truncate text-[#38BDF8] transition-colors group-hover:text-white">
                      ./m4gns {{ item.command }}
                    </span>
                  </span>

                  <span class="flex shrink-0 items-center gap-3">
                    <span
                      [class]="
                        isOpen(i)
                          ? 'font-mono text-[10px] tracking-widest text-[#10B981]'
                          : 'font-mono text-[10px] tracking-widest text-[#444444]'
                      "
                    >
                      {{ isOpen(i) ? '[OK]' : '[--]' }}
                    </span>
                    <span
                      aria-hidden="true"
                      [class]="
                        'text-[#8A8A8A] transition-transform duration-200 ' + (isOpen(i) ? 'rotate-90' : '')
                      "
                    >›</span>
                  </span>
                </button>

                <div
                  [id]="'faq-a-' + i"
                  role="region"
                  [attr.aria-labelledby]="'faq-q-' + i"
                  class="border-t border-white/5 bg-[#0a0a0a] px-5 pb-5 pt-4 md:px-6"
                  [class.hidden]="!isOpen(i)"
                >
                  <p class="border-l-2 border-[#10B981]/40 pl-3 font-mono text-[13px] leading-relaxed text-[#A3A3A3] md:text-sm">
                    <span class="text-[#10B981]">→</span>&nbsp;{{ item.answer }}
                  </p>
                  <p class="mt-3 font-mono text-[10px] tracking-widest text-[#444444]" aria-hidden="true">
                    {{ item.question }}
                  </p>
                </div>
              </li>
            }
          </ul>
        </div>
      </div>
    </section>
  `,
})
export class FaqComponent {
  protected readonly faqs = FAQ_DATA;

  /** Qual pergunta está aberta. `-1` = nenhuma. Primeira aberta por padrão. */
  private readonly openIndex = signal(0);

  isOpen(index: number): boolean {
    return this.openIndex() === index;
  }

  toggle(index: number): void {
    this.openIndex.set(this.openIndex() === index ? -1 : index);
  }
}
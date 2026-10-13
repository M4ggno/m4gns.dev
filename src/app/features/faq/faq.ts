import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  NgZone,
  inject,
  signal,
} from '@angular/core';
import { SectionHeadingComponent } from '@shared/ui/section-heading';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { FAQ_DATA } from './faq.data';

/**
 * FAQ — terminal interativo.
 *
 * Cada pergunta vira uma linha de comando (`$ ./m4gns --flag`); clicar
 * "executa" a consulta e a resposta é datilografada com prompt ->.
 * `./m4gns --help` no rodapé imprime o manual com todos os flags clicáveis.
 *
 * Datilografia acontece só no cliente e respeita prefers-reduced-motion.
 * No servidor (prerender SSG) o texto completo já sai no HTML — a camada
 * AEO/GEO não depende de JavaScript.
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
          description="Clique num comando para executar a consulta. Respostas diretas sobre preço, prazo e processo — sem reunião de venda."
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
                    <span class="text-[#10B981]">→</span>&nbsp;<span>{{ typeFor(i) }}</span>
                    @if (isTyping(i)) {
                      <span class="ml-0.5 animate-pulse text-[#10B981]" aria-hidden="true">▌</span>
                    }
                  </p>
                  <p class="mt-3 font-mono text-[10px] tracking-widest text-[#444444]">
                    {{ item.question }}
                  </p>
                </div>
              </li>
            }
          </ul>

          <!-- Comando --help -->
          <div class="border-t border-white/10 bg-[#0a0a0a]">
            <button
              type="button"
              (click)="toggleHelp()"
              [attr.aria-expanded]="helpOpen()"
              aria-controls="faq-help"
              class="group flex w-full items-center justify-between gap-4 px-5 py-3 text-left transition-colors hover:bg-white/[0.04] md:px-6"
            >
              <span class="flex items-baseline gap-2.5 overflow-hidden font-mono text-xs tracking-wider md:text-sm">
                <span class="select-none text-[#444444]">$</span>
                <span class="truncate text-[#8A8A8A] transition-colors group-hover:text-white">
                  ./m4gns --help&nbsp;<span class="text-[#666666]"># veja os comandos</span>
                </span>
              </span>
              <span
                [class]="
                  helpOpen()
                    ? 'shrink-0 font-mono text-[10px] tracking-widest text-[#10B981]'
                    : 'shrink-0 font-mono text-[10px] tracking-widest text-[#444444]'
                "
              >
                {{ helpOpen() ? '[OK]' : '[--]' }}
              </span>
            </button>

            <div
              id="faq-help"
              role="region"
              class="border-t border-white/5 bg-[#070707] px-5 py-5 md:px-6"
              [class.hidden]="!helpOpen()"
            >
              <p class="font-mono text-[10px] tracking-widest text-[#444444]">===== help(1) m4gns =====</p>
              <p class="mt-1 font-mono text-xs text-[#8A8A8A]">
                usage: ./m4gns &lt;flag&gt; — executa a consulta e imprime a resposta
              </p>
              <ul class="mt-4 space-y-1.5">
                @for (item of faqs; track item.command; let i = $index) {
                  <li>
                    <button
                      type="button"
                      (click)="runFromHelp(i)"
                      class="group flex w-full items-baseline gap-3 text-left font-mono text-xs text-[#A3A3A3] transition-colors hover:text-white"
                    >
                      <span class="w-28 shrink-0 text-[#38BDF8]">{{ item.command }}</span>
                      <span class="text-[#666666] transition-colors group-hover:text-[#A3A3A3]">
                        {{ item.hint }}
                      </span>
                    </button>
                  </li>
                }
              </ul>
              <p class="mt-4 font-mono text-[10px] text-[#444444]">
                dica: cada flag acima também abre a consulta correspondente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class FaqComponent {
  protected readonly faqs = FAQ_DATA;

  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  /** Qual pergunta está aberta. `-1` = nenhuma. Primeira aberta por padrão. */
  private readonly openIndex = signal(0);
  /** Texto já datilografado por item (ausente = mostra o texto completo). */
  private readonly typed = signal<Record<number, string>>({});
  /** Quais itens estão com datilografia em andamento. */
  private readonly typingState = signal<Record<number, boolean>>({});

  protected readonly helpOpen = signal(false);

  private readonly timers = new Set<ReturnType<typeof setTimeout>>();

  constructor() {
    this.destroyRef.onDestroy(() => this.timers.forEach(clearTimeout));
  }

  isOpen(index: number): boolean {
    return this.openIndex() === index;
  }

  isTyping(index: number): boolean {
    return !!this.typingState()[index];
  }

  typeFor(index: number): string {
    return this.typed()[index] ?? this.faqs[index].answer;
  }

  toggle(index: number): void {
    this.openIndex.set(this.openIndex() === index ? -1 : index);
    if (this.openIndex() === index) this.type(index);
  }

  toggleHelp(): void {
    this.helpOpen.update((open) => !open);
  }

  /** Executa uma consulta a partir do manual --help. */
  runFromHelp(index: number): void {
    this.openIndex.set(index);
    this.helpOpen.set(false);
    this.type(index);
  }

  /** Datilografia a resposta — só no cliente, fora da NgZone (stack.md §1) e com reduced-motion respeitado. */
  private type(index: number): void {
    if (typeof window === 'undefined') return;

    const full = this.faqs[index].answer;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      this.typed.update((map) => ({ ...map, [index]: full }));
      return;
    }

    // Datilografia roda fora da NgZone (padrão do contact terminal): os updates
    // são por signal — o agendamento de change detection independe de zone.
    this.ngZone.runOutsideAngular(() => {
      this.typingState.update((map) => ({ ...map, [index]: true }));
      this.typed.update((map) => ({ ...map, [index]: '' }));

      let n = 0;
      const tick = () => {
        n += 1;
        this.typed.update((map) => ({ ...map, [index]: full.slice(0, n) }));
        if (n < full.length) {
          const id = setTimeout(tick, 12 + Math.random() * 18);
          this.timers.add(id);
        } else {
          this.typingState.update((map) => ({ ...map, [index]: false }));
        }
      };
      const id = setTimeout(tick, 40);
      this.timers.add(id);
    });
  }
}
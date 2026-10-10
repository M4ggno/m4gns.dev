import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { SectionHeadingComponent } from '@shared/ui/section-heading';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { STACK_DATA } from './stack.data';

/**
 * Stack — acordeão controlado por signal. Mostra capacidade técnica sem
 * lista infinita de logos; o detalhe abre apenas sob demanda.
 */
@Component({
  selector: 'app-stack',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionHeadingComponent, RevealDirective],
  template: `
    <section id="stack" class="relative z-10 w-full border-t border-white/5 bg-[#050505]/70 px-5 py-24 md:px-16 lg:px-24 md:py-32">
      <div class="mx-auto w-full max-w-7xl">
        <app-section-heading
          appReveal
          index="02"
          label="STACK"
          title="Ferramentas de"
          accent="produção."
          description="Tecnologia escolhida por consequência — o que resolve o problema, não o que está na moda."
        />

        <div appReveal class="w-full max-w-5xl border-t border-white/10">
          @for (item of items; track item.name; let i = $index) {
            <div class="border-b border-white/10" [class.border-white/30]="expandedIndex() === i">
              <button
                type="button"
                class="flex w-full select-none items-center justify-between gap-6 py-7 text-left"
                (click)="toggle(i)"
                [attr.aria-expanded]="expandedIndex() === i"
              >
                <div class="flex items-center gap-4 md:gap-8">
                  <span class="font-mono text-xs tabular-nums text-[#8A8A8A]">0{{ i + 1 }}</span>
                  <img
                    [src]="item.icon"
                    [alt]="item.name"
                    width="32"
                    height="32"
                    class="h-7 w-7 object-contain grayscale transition-all duration-300 md:h-8 md:w-8"
                    [class.opacity-100]="expandedIndex() === i"
                    [class.grayscale-0]="expandedIndex() === i"
                    [class.opacity-40]="expandedIndex() !== i"
                  />
                  <span
                    class="font-display text-2xl font-light tracking-tight text-[#8A8A8A] transition-colors md:text-4xl"
                    [class.text-white]="expandedIndex() === i"
                  >
                    {{ item.name }}
                  </span>
                </div>

                <div class="flex shrink-0 items-center gap-6 md:gap-10">
                  <span
                    class="hidden font-mono text-[10px] uppercase tracking-widest text-[#8A8A8A] md:inline"
                    [class.opacity-100]="expandedIndex() === i"
                    [class.opacity-0]="expandedIndex() !== i"
                  >
                    {{ item.strength }}
                  </span>
                  <span class="font-mono text-2xl font-light transition-transform duration-300" [class.rotate-45]="expandedIndex() === i">
                    +
                  </span>
                </div>
              </button>

              <div
                class="grid transition-[grid-template-rows] duration-500 ease-out"
                [class.grid-rows-[1fr]]="expandedIndex() === i"
                [class.grid-rows-[0fr]]="expandedIndex() !== i"
              >
                <div class="overflow-hidden">
                  <div class="max-w-3xl pb-8 pl-10 leading-relaxed text-sm text-[#8A8A8A] md:pl-24">
                    <div class="mb-4 h-px w-8 bg-white/20"></div>
                    <p>{{ item.description }}</p>
                    <div class="mt-4 font-mono text-[11px] text-[#666666]">
                      <span>// {{ item.category }}</span>
                      <span class="mx-2">•</span>
                      <span>{{ item.strength }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class StackComponent {
  readonly items = STACK_DATA;
  readonly expandedIndex = signal<number | null>(null);

  toggle(index: number): void {
    this.expandedIndex.update((current) => (current === index ? null : index));
  }
}
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Cabeçalho padrão de seção: índice técnico (`// 02 — STACK`), título display
 * e opcionalmente uma linha descritiva. Um único ponto de manutenção para a
 * tipografia das aberturas de seção.
 */
@Component({
  selector: 'app-section-heading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="mb-12 md:mb-16">
      <span class="block font-mono text-xs uppercase text-[#8A8A8A] tracking-[0.3em]">
        // {{ index() }} — {{ label() }}
      </span>

      <h2 class="mt-3 font-display text-3xl font-light leading-[1.1] tracking-tight text-white md:text-5xl">
        @if (accent()) {
          {{ title() }} <span class="italic">{{ accent() }}</span>
        } @else {
          {{ title() }}
        }
      </h2>

      @if (description(); as desc) {
        <p class="mt-5 max-w-2xl text-sm leading-relaxed text-[#8A8A8A] md:text-base">{{ desc }}</p>
      }
    </header>
  `,
})
export class SectionHeadingComponent {
  readonly index = input.required<string>();
  readonly label = input.required<string>();
  readonly title = input.required<string>();
  /** Última palavra/frase em itálico (recorte editorial). */
  readonly accent = input<string>('');
  readonly description = input<string>('');
}
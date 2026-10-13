import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { SITE } from '@core/site.config';
import { MotionService } from '@core/motion/motion.service';

/**
 * Rodapé — segunda CTA de conversão, agressiva no Instagram.
 * Depois do terminal de contato, o visitante que não escreveu ainda tem uma
 * âncora de conversão: seguir o processo de trabalho em público.
 */
@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <footer class="relative z-10 w-full border-t border-white/10 bg-[#050505]">
      <div class="mx-auto w-full max-w-7xl px-5 pb-8 pt-16 md:px-16 lg:px-24 md:pt-24">
        <!-- Âncora de conversão: Instagram -->
        <div
          appReveal
          class="mb-16 flex flex-col items-start justify-between gap-8 border border-white/10 bg-[#080808] p-8 transition-colors hover:border-amber-400/40 md:mb-24 md:flex-row md:items-center md:p-12"
        >
          <div>
            <p class="mb-3 font-mono text-xs tracking-[0.3em] text-amber-400">// CANAL ABERTO</p>
            <h2 class="font-display text-3xl font-light leading-[1.05] tracking-tight text-white md:text-5xl">
              Acompanhe o processo<br />
              <span class="italic">antes de fechar comigo.</span>
            </h2>
            <p class="mt-4 max-w-md text-sm leading-relaxed text-[#8A8A8A]">
              Raciocínio, decisões de arquitetura e resultados no ar todos os dias. A melhor pré-venda é o trabalho — não este site.
            </p>
          </div>

          <div class="flex w-full flex-col gap-3 md:w-auto">
            <a
              [href]="SITE.social.instagram.url"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex w-full items-center justify-between gap-4 bg-white px-6 py-4 font-mono text-sm font-semibold tracking-widest text-black transition-colors hover:bg-amber-400 md:w-80"
            >
              <span>{{ SITE.social.instagram.handle }}</span>
              <span class="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">↗</span>
            </a>
            <a
              [href]="mailtoHref"
              class="flex w-full items-center justify-between gap-4 border border-white/20 px-6 py-4 font-mono text-sm tracking-widest text-white transition-colors hover:border-white hover:bg-white/5 md:w-80"
            >
              <span>{{ SITE.email.address }}</span>
              <span class="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <!-- Grade informativa -->
        <div class="grid grid-cols-1 gap-10 border-t border-white/10 pt-12 md:grid-cols-12">
          <div class="md:col-span-5">
            <a href="#top" (click)="goTop($event)" class="inline-flex items-center gap-3 font-display text-lg tracking-[0.25em] text-white">
              <span class="h-2 w-2 rounded-full bg-[#10B981]"></span>
              M4GNS.DEV
            </a>
            <p class="mt-4 max-w-xs text-sm leading-relaxed text-[#666666]">
              Landing pages e sistemas em produção, do contrato ao deploy na edge. Sem vitrine, sem ruído.
            </p>
          </div>

          <nav class="md:col-span-3" aria-label="Rodapé — navegação">
            <p class="mb-4 font-mono text-[10px] tracking-[0.3em] text-[#444444]">// ÍNDICE</p>
            <ul class="space-y-2.5">
              @for (link of nav; track link.target) {
                <li>
                  <a [href]="link.target" (click)="goTop($event)" class="font-mono text-xs tracking-widest text-[#8A8A8A] transition-colors hover:text-white">
                    [ {{ link.label }} ]
                  </a>
                </li>
              }
            </ul>
          </nav>

          <div class="md:col-span-4">
            <p class="mb-4 font-mono text-[10px] tracking-[0.3em] text-[#444444]">// OPERADOR</p>
            <p class="font-mono text-xs leading-relaxed text-[#8A8A8A]">
              {{ SITE.operator }}<br />
              {{ SITE.domain }} &bull; UTC-03<br />
              Resposta ≤48h &bull; PT-BR / EN
            </p>
            <div class="mt-5 flex gap-3 font-mono text-[10px] tracking-widest text-[#666666]">
              <span class="border border-white/10 px-2 py-1">HSTS</span>
              <span class="border border-white/10 px-2 py-1">CSP</span>
              <span class="border border-white/10 px-2 py-1 text-emerald-500">EDGE</span>
            </div>
          </div>
        </div>

        <!-- Barra legal -->
        <div class="mt-14 flex flex-col items-start justify-between gap-3 border-t border-white/5 pt-6 font-mono text-[10px] tracking-widest text-[#444444] md:flex-row md:items-center">
          <span>© 2026 {{ SITE.domain }} — {{ SITE.operator }}</span>
          <span>FEITO NO BRASIL // RODANDO NA EDGE // SEM COOKIES DE RASTREAMENTO</span>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly SITE = SITE;
  private readonly motion = inject(MotionService);

  protected readonly mailtoHref = `mailto:${SITE.email.address}?subject=${encodeURIComponent(SITE.email.subject)}`;

  protected readonly nav = [
    { label: 'SERVIÇOS', target: '#services' },
    { label: 'STACK', target: '#stack' },
    { label: 'TRABALHO', target: '#work' },
    { label: 'FAQ', target: '#faq' },
    { label: 'CONTATO', target: '#contact' },
  ];

  goTop(event: Event): void {
    event.preventDefault();
    const target = (event.currentTarget as HTMLAnchorElement | null)?.getAttribute('href') ?? '#top';
    this.motion.scrollTo(target);
  }
}
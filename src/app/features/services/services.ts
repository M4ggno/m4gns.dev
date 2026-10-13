import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SectionHeadingComponent } from '@shared/ui/section-heading';
import { RevealDirective } from '@shared/directives/reveal.directive';

interface Service {
  id: string;
  code: string;
  title: string;
  description: string;
  deliverables: string[];
}

/**
 * Funil de conversão — oferta principal. Vende o que entra em produção,
 * com linguagem seca e promessas verificáveis (prazo, contrato, core web vitals).
 */
@Component({
  selector: 'app-services',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectionHeadingComponent, RevealDirective],
  template: `
    <section id="services" class="relative z-10 w-full border-t border-white/5 bg-[#050505]/70 px-5 py-24 md:px-16 lg:px-24 md:py-32">
      <div class="mx-auto w-full max-w-7xl">
        <app-section-heading
          appReveal
          index="01"
          label="SERVIÇOS"
          title="O que entra"
          accent="em produção."
          description="Sem vitrine, sem promessa de vendedor. Escopo fechado por escrito, prazo cumprido e código revisado antes da entrega."
        />

        <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
          @for (service of services; track service.id; let i = $index) {
            <article appReveal [appRevealDelay]="i * 0.08"
              class="group flex flex-col justify-between border border-white/10 bg-[#080808] p-6 transition-colors hover:border-[#38BDF8]/40 md:p-8">
              <div>
                <div class="mb-6 flex items-center justify-between font-mono text-xs">
                  <span class="text-[#38BDF8] tracking-[0.3em]">{{ service.code }}</span>
                  <span class="text-[#444444]">0{{ i + 1 }}</span>
                </div>

                <h3 class="font-display text-2xl font-light tracking-tight text-white md:text-3xl">
                  {{ service.title }}
                </h3>

                <p class="mt-4 text-sm leading-relaxed text-[#8A8A8A]">{{ service.description }}</p>
              </div>

              <ul class="mt-8 space-y-2 border-t border-white/10 pt-5 font-mono text-[11px] text-[#A3A3A3]">
                @for (item of service.deliverables; track item) {
                  <li class="flex gap-2">
                    <span class="text-emerald-500">▸</span>{{ item }}
                  </li>
                }
              </ul>
            </article>
          }
        </div>

        <!-- Credibilidade operacional compacta -->
        <div appReveal class="mt-10 flex flex-col gap-4 border border-white/10 bg-[#080808] p-6 font-mono text-xs text-[#8A8A8A] md:flex-row md:items-center md:justify-between md:p-5">
          <span class="tracking-[0.2em]">OPERADOR: MAGNO FILHO // ENG. DE SOFTWARE</span>
          <span class="flex flex-wrap gap-x-6 gap-y-2">
            <span>IFPB — TÉC. INFORMÁTICA</span>
            <span>UNIFIP — A.D.S. (EM ANDAMENTO)</span>
            <span>UTC-03 // RESPOSTA ≤48H</span>
          </span>
        </div>
      </div>
    </section>
  `,
})
export class ServicesComponent {
  readonly services: Service[] = [
    {
      id: 'landing-pages',
      code: 'MOD_01 // INTEGRAÇÃO',
      title: 'Landing Pages de retenção',
      description:
        'Página única de alta conversão em Angular 22: animação autoral, tipografia editorial e Core Web Vitals no verde. Sem template genérico, sem popup agressivo.',
      deliverables: ['Design system próprio', 'Acessibilidade (WCAG AA)', 'SEO técnico + Open Graph'],
    },
    {
      id: 'aplicacoes',
      code: 'MOD_02 // PROCESSAMENTO',
      title: 'Sistemas e painéis web',
      description:
        'SPAs, fluxos internos e CRMs sob medida. Backend em Spring Boot ou Django, API tipada, filas e relatórios que não mentem.',
      deliverables: ['Contrato de API versionado', 'Autenticação + RBAC', 'Deploy com rollback em 1 clique'],
    },
    {
      id: 'integracao',
      code: 'MOD_03 // PERÍMETRO',
      title: 'Integrações e performance',
      description:
        'CMS headless, gateways de pagamento, webhooks e auditoria de performance em apps existentes. Otimização com base em dados, não em achismo.',
      deliverables: ['Lighthouse ≥ 95', 'Cache e CDN strategy', 'Monitoramento e alertas'],
    },
  ];
}